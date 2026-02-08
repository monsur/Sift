import type { FastifyInstance } from 'fastify';
import { dashboardTimelineQuerySchema } from 'shared/schemas';
import { authMiddleware, requireVerified } from '../middleware/auth.middleware.js';
import { dashboardService } from '../services/dashboard.service.js';
import { ValidationError } from '../utils/errors.js';

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);
  app.addHook('preHandler', requireVerified);

  // GET /stats — Dashboard stats
  app.get('/stats', async (request, reply) => {
    const stats = await dashboardService.getStats(request.user.id);
    return reply.send({ success: true, data: stats });
  });

  // GET /timeline — Score timeline
  app.get('/timeline', async (request, reply) => {
    const parsed = dashboardTimelineQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ValidationError('Invalid query parameters', {
        issues: parsed.error.issues,
      });
    }

    const timeline = await dashboardService.getTimeline(request.user.id, parsed.data.period);
    return reply.send({ success: true, data: timeline });
  });
}
