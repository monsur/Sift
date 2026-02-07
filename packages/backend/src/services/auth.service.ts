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


export class AuthService {
  async signup(email: string, password: string): Promise<AuthResponse> {
    const supabase = getServiceClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
      }
      throw new AppError(error.message, 400, 'SIGNUP_FAILED');
    }

    // Profile is auto-created by database trigger (handle_new_user)
    // Mark as verified immediately (email verification deferred to later phase)
    await supabase
      .from('user_profiles')
      .update({ email_verified: true, email_verified_at: new Date().toISOString() })
      .eq('user_id', data.user.id);

    const profile = await this.getProfile(data.user.id);

    // Sign in to get tokens
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !signInData.session) {
      throw new AppError('Signup succeeded but login failed', 500, 'LOGIN_FAILED');
    }

    const user = this.mapUser(data.user);
    const tokens = this.mapTokens(signInData.session);

    return { user, profile, tokens };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    checkRateLimit('login', email, RATE_LIMITS.login);

    const supabase = getServiceClient();

    // Attempt sign in first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Rate limiter handles brute force protection by email
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!data.session) {
      throw new AppError('Login failed', 500, 'LOGIN_FAILED');
    }

    const userId = data.user.id;

    // Check if account is locked (user_profiles has no email column, so we use user_id)
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('locked_until, failed_login_attempts')
      .eq('user_id', userId)
      .single();

    if (profileData?.locked_until) {
      const lockedUntil = new Date(profileData.locked_until as string);
      if (lockedUntil > new Date()) {
        // Account is locked - invalidate the session we just created
        const anonClient = createAnonClient(data.session.access_token);
        await anonClient.auth.signOut();
        throw new AccountLockedError(lockedUntil);
      }
    }

    // Reset failed attempts and update login stats
    await supabase
      .from('user_profiles')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    resetRateLimit('login', email);

    const user = this.mapUser(data.user);
    const profile = await this.getProfile(userId);
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
      .from('user_profiles')
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
