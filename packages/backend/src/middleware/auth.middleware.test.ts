import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware, requireVerified } from './auth.middleware.js';
import { UnauthorizedError, EmailNotVerifiedError } from '../utils/errors.js';

vi.mock('../config/supabase.js', () => ({
  createAnonClient: vi.fn(),
}));

import { createAnonClient } from '../config/supabase.js';

const mockCreateAnonClient = vi.mocked(createAnonClient);

function makeRequest(authHeader?: string): FastifyRequest {
  return {
    headers: {
      authorization: authHeader,
    },
    user: undefined as unknown,
  } as unknown as FastifyRequest;
}

const mockReply = {} as FastifyReply;

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws UnauthorizedError when no authorization header', async () => {
    const request = makeRequest();
    await expect(authMiddleware(request, mockReply)).rejects.toThrow(
      UnauthorizedError
    );
  });

  it('throws UnauthorizedError when header is not Bearer', async () => {
    const request = makeRequest('Basic abc123');
    await expect(authMiddleware(request, mockReply)).rejects.toThrow(
      UnauthorizedError
    );
  });

  it('throws UnauthorizedError when supabase returns error', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid token' },
        }),
      },
    } as unknown as ReturnType<typeof createAnonClient>);

    const request = makeRequest('Bearer invalid-token');
    await expect(authMiddleware(request, mockReply)).rejects.toThrow(
      UnauthorizedError
    );
  });

  it('attaches user to request on valid token', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
              email_confirmed_at: '2024-01-01T00:00:00Z',
            },
          },
          error: null,
        }),
      },
    } as unknown as ReturnType<typeof createAnonClient>);

    const request = makeRequest('Bearer valid-token');
    await authMiddleware(request, mockReply);

    expect(request.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      email_verified: true,
    });
  });

  it('sets email_verified to false when email not confirmed', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
              email_confirmed_at: null,
            },
          },
          error: null,
        }),
      },
    } as unknown as ReturnType<typeof createAnonClient>);

    const request = makeRequest('Bearer valid-token');
    await authMiddleware(request, mockReply);

    expect(request.user.email_verified).toBe(false);
  });
});

describe('requireVerified', () => {
  it('passes when email is verified', async () => {
    const request = {
      user: { id: 'user-123', email: 'test@example.com', email_verified: true },
    } as FastifyRequest;

    await expect(requireVerified(request, mockReply)).resolves.toBeUndefined();
  });

  it('throws EmailNotVerifiedError when email is not verified', async () => {
    const request = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        email_verified: false,
      },
    } as FastifyRequest;

    await expect(requireVerified(request, mockReply)).rejects.toThrow(
      EmailNotVerifiedError
    );
  });
});
