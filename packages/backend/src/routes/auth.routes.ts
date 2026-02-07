import type { FastifyInstance } from 'fastify';
import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from 'shared/schemas';
import { authService } from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { ValidationError } from '../utils/errors.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /signup
  app.post('/signup', async (request, reply) => {
    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    const result = await authService.signup(parsed.data.email, parsed.data.password);
    return reply.status(201).send({ success: true, data: result });
  });

  // POST /login
  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    const result = await authService.login(parsed.data.email, parsed.data.password);
    return reply.send({ success: true, data: result });
  });

  // POST /logout
  app.post('/logout', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const token = request.headers.authorization!.slice(7);
    await authService.logout(token);
    return reply.send({ success: true });
  });

  // POST /refresh
  app.post('/refresh', async (request, reply) => {
    const body = request.body as Record<string, unknown> | null;
    const refreshToken = body?.refresh_token;
    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new ValidationError('refresh_token is required');
    }

    const tokens = await authService.refreshToken(refreshToken);
    return reply.send({ success: true, data: tokens });
  });

  // POST /verify-email
  app.post('/verify-email', async (request, reply) => {
    const parsed = verifyEmailSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    await authService.verifyEmail(parsed.data.token);
    return reply.send({ success: true });
  });

  // POST /resend-verification
  app.post('/resend-verification', async (request, reply) => {
    const parsed = resendVerificationSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    await authService.resendVerification(parsed.data.email);
    return reply.send({ success: true });
  });

  // POST /forgot-password
  app.post('/forgot-password', async (request, reply) => {
    const parsed = forgotPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    await authService.forgotPassword(parsed.data.email);
    return reply.send({ success: true });
  });

  // POST /reset-password
  app.post('/reset-password', async (request, reply) => {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    await authService.resetPassword(parsed.data.token, parsed.data.password);
    return reply.send({ success: true });
  });

  // POST /change-password
  app.post('/change-password', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const parsed = changePasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    const token = request.headers.authorization!.slice(7);
    await authService.changePassword(
      token,
      parsed.data.current_password,
      parsed.data.new_password
    );
    return reply.send({ success: true });
  });
}
