import type { FastifyInstance } from 'fastify';
import { updateProfileSchema } from 'shared/schemas';
import type { ProfileResponse } from 'shared/types';
import { authMiddleware, requireVerified } from '../middleware/auth.middleware.js';
import { getServiceClient } from '../config/supabase.js';
import { AppError, ValidationError } from '../utils/errors.js';

export async function profileRoutes(app: FastifyInstance): Promise<void> {
  // All profile routes require auth + verified email
  app.addHook('preHandler', authMiddleware);
  app.addHook('preHandler', requireVerified);

  // GET /
  app.get('/', async (request, reply) => {
    const supabase = getServiceClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', request.user.id)
      .single();

    if (error || !profile) {
      throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const response: ProfileResponse = {
      user: {
        id: request.user.id,
        email: request.user.email,
        created_at: profile.created_at as string,
        updated_at: profile.updated_at as string,
      },
      profile: {
        id: profile.id as string,
        user_id: profile.user_id as string,
        email_verified: profile.email_verified as boolean,
        email_verified_at: (profile.email_verified_at as string) ?? null,
        settings: profile.settings as ProfileResponse['profile']['settings'],
        created_at: profile.created_at as string,
        updated_at: profile.updated_at as string,
      },
    };

    return reply.send({ success: true, data: response });
  });

  // PATCH /
  app.patch('/', async (request, reply) => {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    const supabase = getServiceClient();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.settings) {
      // Merge with existing settings
      const { data: existing } = await supabase
        .from('profiles')
        .select('settings')
        .eq('user_id', request.user.id)
        .single();

      updates.settings = {
        ...(existing?.settings as Record<string, unknown> | undefined),
        ...parsed.data.settings,
      };
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', request.user.id)
      .select()
      .single();

    if (error || !profile) {
      throw new AppError('Failed to update profile', 500, 'PROFILE_UPDATE_FAILED');
    }

    const response: ProfileResponse = {
      user: {
        id: request.user.id,
        email: request.user.email,
        created_at: profile.created_at as string,
        updated_at: profile.updated_at as string,
      },
      profile: {
        id: profile.id as string,
        user_id: profile.user_id as string,
        email_verified: profile.email_verified as boolean,
        email_verified_at: (profile.email_verified_at as string) ?? null,
        settings: profile.settings as ProfileResponse['profile']['settings'],
        created_at: profile.created_at as string,
        updated_at: profile.updated_at as string,
      },
    };

    return reply.send({ success: true, data: response });
  });
}
