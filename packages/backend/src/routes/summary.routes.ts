import type { FastifyInstance } from 'fastify';
import { summaryGenerateSchema, summaryFinalizeSchema } from 'shared/schemas';
import type { AIMessage } from 'shared/types';
import { authMiddleware, requireVerified } from '../middleware/auth.middleware.js';
import { entryService } from '../services/entry.service.js';
import { getRecentEntries } from '../services/context.service.js';
import {
  generateSummary,
  estimateTotalCost,
} from '../services/summary.service.js';
import { AppError, ValidationError } from '../utils/errors.js';

export async function summaryRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);
  app.addHook('preHandler', requireVerified);

  // POST /generate — Generate summary from entry + conversation
  app.post('/generate', async (request, reply) => {
    const parsed = summaryGenerateSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    const entry = await entryService.getById(
      request.user.id,
      parsed.data.entry_id
    );

    if (!entry.conversation_transcript?.length) {
      throw new AppError(
        'No conversation transcript found. Start a conversation first.',
        400,
        'NO_TRANSCRIPT'
      );
    }

    const recentEntries = await getRecentEntries(request.user.id);

    // Convert transcript to AIMessage format (strip timestamps)
    const transcript: AIMessage[] = entry.conversation_transcript.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const result = await generateSummary(
      entry.raw_entry,
      transcript,
      recentEntries
    );

    return reply.send({
      success: true,
      data: {
        summary: result.summary,
        token_usage: result.token_usage,
      },
    });
  });

  // POST /finalize — Save summary and finalize entry
  app.post('/finalize', async (request, reply) => {
    const parsed = summaryFinalizeSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', {
        issues: parsed.error.issues,
      });
    }

    const entry = await entryService.getById(
      request.user.id,
      parsed.data.entry_id
    );

    if (!entry.conversation_transcript?.length) {
      throw new AppError(
        'No conversation transcript found',
        400,
        'NO_TRANSCRIPT'
      );
    }

    const recentEntries = await getRecentEntries(request.user.id);

    const transcript: AIMessage[] = entry.conversation_transcript.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const result = await generateSummary(
      entry.raw_entry,
      transcript,
      recentEntries
    );

    // Calculate cost
    const totalCost = estimateTotalCost(
      { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
      result.token_usage
    );

    const totalTokens = entry.token_count
      ? entry.token_count + result.token_usage.total_tokens
      : result.token_usage.total_tokens;

    const updatedEntry = await entryService.saveRefinement(
      request.user.id,
      entry.id,
      {
        refined_entry: result.summary.refined_entry,
        tldr: result.summary.tldr,
        key_moments: result.summary.key_moments,
        ai_suggested_score: result.summary.ai_suggested_score,
        score_justification: result.summary.score_justification,
        ...(parsed.data.score != null ? { score: parsed.data.score } : {}),
        token_count: totalTokens,
        estimated_cost: totalCost,
      }
    );

    return reply.send({ success: true, data: updatedEntry });
  });
}
