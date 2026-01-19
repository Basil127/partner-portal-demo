import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './infrastructure/config/config.js';
import { setupRoutes } from './infrastructure/adapters/http/routes.js';
import { createDatabaseAdapter } from './infrastructure/adapters/database.js';
import { initializeDatabase } from './infrastructure/config/database-init.js';

async function start() {
  const fastify = Fastify({
    logger: {
      level: config.logLevel,
      transport:
        config.nodeEnv === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Initialize database
  const dbAdapter = createDatabaseAdapter();
  await initializeDatabase(dbAdapter);

  // Register plugins
  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(helmet);

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Partner Portal API',
        description: 'API for Partner Portal booking management',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${config.host}:${config.port}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'health', description: 'Health check endpoints' },
        { name: 'bookings', description: 'Booking management endpoints' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Setup routes
  setupRoutes(fastify);

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  try {
    await fastify.listen({ port: config.port, host: config.host });
    console.log(`Server listening on http://${config.host}:${config.port}`);
    console.log(`API documentation available at http://${config.host}:${config.port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
