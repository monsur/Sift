import type { FastifyRequest, FastifyReply } from 'fastify';
import { createAnonClient } from '../config/supabase.js';
import {
  UnauthorizedError,
  EmailNotVerifiedError,
} from '../utils/errors.js';

export interface AuthUser {
  id: string;
  email: string;
  email_verified: boolean;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser;
  }
}

/**
 * Validates the JWT from the Authorization header via Supabase.
 * Attaches `request.user` with id, email, and email_verified.
 */
export async function authMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  const supabase = createAnonClient(token);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  request.user = {
    id: user.id,
    email: user.email ?? '',
    email_verified: user.email_confirmed_at != null,
  };
}

/**
 * Requires the authenticated user to have a verified email.
 * Must be used after authMiddleware.
 */
export async function requireVerified(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  if (!request.user.email_verified) {
    throw new EmailNotVerifiedError();
  }
}
