import type {
  AuthResponse,
  AuthTokens,
  User,
  UserProfile,
} from 'shared/types';
import { createAnonClient, getServiceClient } from '../config/supabase.js';
import {
  AppError,
  UnauthorizedError,
  AccountLockedError,
} from '../utils/errors.js';
import {
  checkRateLimit,
  resetRateLimit,
  RATE_LIMITS,
} from '../middleware/rate-limiter.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export class AuthService {
  async signup(email: string, password: string): Promise<AuthResponse> {
    const supabase = getServiceClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
      }
      throw new AppError(error.message, 400, 'SIGNUP_FAILED');
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: data.user.id,
      email_verified: false,
      settings: { theme: 'system', default_refine_enabled: true },
    });

    if (profileError) {
      // Clean up created user if profile creation fails
      await supabase.auth.admin.deleteUser(data.user.id);
      throw new AppError('Failed to create profile', 500, 'PROFILE_CREATE_FAILED');
    }

    // Sign in to get tokens
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !signInData.session) {
      throw new AppError('Signup succeeded but login failed', 500, 'LOGIN_FAILED');
    }

    // Send verification email
    const anonClient = createAnonClient(signInData.session.access_token);
    await anonClient.auth.resend({ type: 'signup', email });

    const user = this.mapUser(data.user);
    const profile = await this.getProfile(data.user.id);
    const tokens = this.mapTokens(signInData.session);

    return { user, profile, tokens };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    checkRateLimit('login', email, RATE_LIMITS.login);

    const supabase = getServiceClient();

    // Check if account is locked
    const { data: profileData } = await supabase
      .from('profiles')
      .select('locked_until, failed_login_attempts, user_id')
      .eq('email', email)
      .single();

    if (profileData?.locked_until) {
      const lockedUntil = new Date(profileData.locked_until as string);
      if (lockedUntil > new Date()) {
        throw new AccountLockedError(lockedUntil);
      }
      // Lock expired, reset
      await supabase
        .from('profiles')
        .update({ locked_until: null, failed_login_attempts: 0 })
        .eq('user_id', profileData.user_id);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Increment failed attempts
      if (profileData) {
        const attempts = ((profileData.failed_login_attempts as number) ?? 0) + 1;
        const updates: Record<string, unknown> = {
          failed_login_attempts: attempts,
        };
        if (attempts >= MAX_FAILED_ATTEMPTS) {
          updates.locked_until = new Date(
            Date.now() + LOCK_DURATION_MS
          ).toISOString();
        }
        await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', profileData.user_id);
      }

      throw new UnauthorizedError('Invalid email or password');
    }

    if (!data.session) {
      throw new AppError('Login failed', 500, 'LOGIN_FAILED');
    }

    // Reset failed attempts on successful login
    if (profileData?.user_id) {
      await supabase
        .from('profiles')
        .update({
          failed_login_attempts: 0,
          locked_until: null,
          last_login_at: new Date().toISOString(),
        })
        .eq('user_id', profileData.user_id);
    }

    resetRateLimit('login', email);

    const user = this.mapUser(data.user);
    const profile = await this.getProfile(data.user.id);
    const tokens = this.mapTokens(data.session);

    return { user, profile, tokens };
  }

  async logout(accessToken: string): Promise<void> {
    const supabase = createAnonClient(accessToken);
    await supabase.auth.signOut();
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const supabase = createAnonClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    return this.mapTokens(data.session);
  }

  async verifyEmail(token: string): Promise<void> {
    const supabase = createAnonClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) {
      throw new AppError(
        'Invalid or expired verification token',
        400,
        'VERIFICATION_FAILED'
      );
    }
  }

  async resendVerification(email: string): Promise<void> {
    checkRateLimit('verification', email, RATE_LIMITS.verification);

    const supabase = createAnonClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      // Don't reveal if email exists or not
      return;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    checkRateLimit('passwordReset', email, RATE_LIMITS.passwordReset);

    const supabase = createAnonClient();
    await supabase.auth.resetPasswordForEmail(email);
    // Always succeed silently (don't reveal if email exists)
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const supabase = createAnonClient();

    // Verify the OTP token first
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });

    if (verifyError || !data.session) {
      throw new AppError(
        'Invalid or expired reset token',
        400,
        'RESET_TOKEN_INVALID'
      );
    }

    // Update password with the session
    const authedClient = createAnonClient(data.session.access_token);
    const { error: updateError } = await authedClient.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new AppError('Failed to reset password', 500, 'RESET_FAILED');
    }
  }

  async changePassword(
    accessToken: string,
    _currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const supabase = createAnonClient(accessToken);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new AppError(
        'Failed to change password',
        400,
        'PASSWORD_CHANGE_FAILED'
      );
    }
  }

  private async getProfile(userId: string): Promise<UserProfile> {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    return {
      id: data.id as string,
      user_id: data.user_id as string,
      email_verified: data.email_verified as boolean,
      email_verified_at: (data.email_verified_at as string) ?? null,
      settings: data.settings as UserProfile['settings'],
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
    };
  }

  private mapUser(supabaseUser: {
    id: string;
    email?: string;
    created_at?: string;
    updated_at?: string;
  }): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      created_at: supabaseUser.created_at ?? new Date().toISOString(),
      updated_at: supabaseUser.updated_at ?? new Date().toISOString(),
    };
  }

  private mapTokens(session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }): AuthTokens {
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
    };
  }
}

export const authService = new AuthService();
