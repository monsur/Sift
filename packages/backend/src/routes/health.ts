import type { FastifyInstance } from 'fastify';
import type { ApiResponse } from 'shared';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (): Promise<ApiResponse<HealthStatus>> => {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.0.1',
      },
    };
  });
}
