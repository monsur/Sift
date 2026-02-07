import type { FastifyInstance } from 'fastify';
import { createEntrySchema, updateEntrySchema, entryListParamsSchema } from 'shared/schemas';
import { authMiddleware, requireVerified } from '../middleware/auth.middleware.js';
import { entryService } from '../services/entry.service.js';
import { ValidationError } from '../utils/errors.js';

export async function entryRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);
  app.addHook('preHandler', requireVerified);

  // POST / — Create entry
  app.post('/', async (request, reply) => {
    const parsed = createEntrySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    const entry = await entryService.create(request.user.id, parsed.data);
    return reply.status(201).send({ success: true, data: entry });
  });

  // GET / — List entries
  app.get('/', async (request, reply) => {
    const parsed = entryListParamsSchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ValidationError('Invalid query parameters', {
        issues: parsed.error.issues,
      });
    }

    const result = await entryService.list(request.user.id, parsed.data);
    return reply.send({ success: true, data: result });
  });

  // GET /:id — Get single entry
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const entry = await entryService.getById(request.user.id, id);
    return reply.send({ success: true, data: entry });
  });

  // PATCH /:id — Update entry (score/justification)
  app.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const parsed = updateEntrySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    const entry = await entryService.update(request.user.id, id, parsed.data);
    return reply.send({ success: true, data: entry });
  });

  // DELETE /:id — Delete entry
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await entryService.delete(request.user.id, id);
    return reply.status(204).send();
  });
}
