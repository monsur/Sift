import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env } from './config/env.js';
import { AppError } from './utils/errors.js';
import { authRoutes } from './routes/auth.routes.js';
import { profileRoutes } from './routes/profile.routes.js';
import { entryRoutes } from './routes/entry.routes.js';
import { conversationRoutes } from './routes/conversation.routes.js';
import { summaryRoutes } from './routes/summary.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const isDev = env.NODE_ENV === 'development';

  const app = Fastify({
    logger: isDev
      ? {
          level: 'debug',
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
        }
      : {
          level: 'info',
        },
  });

  // Register plugins
  await app.register(cors, {
    origin: isDev ? true : false,
    credentials: true,
  });

  if (isDev) {
    await app.register(helmet, {
      contentSecurityPolicy: false,
    });
  } else {
    await app.register(helmet);
  }

  // Global error handler
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
    }

    // Fastify validation errors
    if (error instanceof Error && 'validation' in error) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });

  // Health check endpoint
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes placeholder
  app.get('/api', async () => {
    return { message: 'Sift API v1' };
  });

  // Auth routes
  await app.register(authRoutes, { prefix: '/api/auth' });

  // Profile routes
  await app.register(profileRoutes, { prefix: '/api/profile' });

  // Entry routes
  await app.register(entryRoutes, { prefix: '/api/entries' });

  // Conversation routes
  await app.register(conversationRoutes, { prefix: '/api/conversation' });

  // Summary routes
  await app.register(summaryRoutes, { prefix: '/api/summary' });

  return app;
}
