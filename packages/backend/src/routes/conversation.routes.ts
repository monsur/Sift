import type { FastifyInstance } from 'fastify';
import { conversationStartSchema, conversationMessageSchema } from 'shared/schemas';
import type { AIMessage } from 'shared/types';
import { authMiddleware, requireVerified } from '../middleware/auth.middleware.js';
import { entryService } from '../services/entry.service.js';
import { getRecentEntries } from '../services/context.service.js';
import {
  startConversation,
  continueConversation,
} from '../services/conversation.service.js';
import { ValidationError } from '../utils/errors.js';

export async function conversationRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);
  app.addHook('preHandler', requireVerified);

  // POST /start — Start conversation for an entry
  app.post('/start', async (request, reply) => {
    const parsed = conversationStartSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    const entry = await entryService.getById(
      request.user.id,
      parsed.data.entry_id
    );
    const recentEntries = await getRecentEntries(request.user.id);

    const result = await startConversation(entry.raw_entry, recentEntries);

    // Save initial transcript
    const now = new Date().toISOString();
    await entryService.saveTranscript(request.user.id, entry.id, [
      { role: 'user', content: entry.raw_entry, timestamp: now },
      { role: 'assistant', content: result.message, timestamp: now },
    ]);

    return reply.send({
      success: true,
      data: {
        message: result.message,
        is_done: result.is_done,
        token_usage: result.token_usage,
      },
    });
  });

  // POST /message — Continue conversation
  app.post('/message', async (request, reply) => {
    const parsed = conversationMessageSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    const entry = await entryService.getById(
      request.user.id,
      parsed.data.entry_id
    );
    const recentEntries = await getRecentEntries(request.user.id);

    // Build AIMessage history from stored transcript (strip timestamps)
    const transcript = entry.conversation_transcript ?? [];
    const history: AIMessage[] = transcript
      .slice(1) // skip the initial raw_entry user message
      .map((m) => ({ role: m.role, content: m.content }));

    const result = await continueConversation(
      entry.raw_entry,
      history,
      parsed.data.message,
      recentEntries
    );

    // Append new messages to transcript
    const now = new Date().toISOString();
    const updatedTranscript = [
      ...transcript,
      { role: 'user' as const, content: parsed.data.message, timestamp: now },
      { role: 'assistant' as const, content: result.message, timestamp: now },
    ];

    await entryService.saveTranscript(
      request.user.id,
      entry.id,
      updatedTranscript
    );

    return reply.send({
      success: true,
      data: {
        message: result.message,
        is_done: result.is_done,
        token_usage: result.token_usage,
      },
    });
  });
}
