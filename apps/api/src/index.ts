import dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import { taskRoutes } from './routes/tasks.js';
import { tagRoutes } from './routes/tags.js';
import { envSchema } from './config/env.js';

const env = envSchema.parse(process.env);

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    transport: env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    } : undefined
  }
});

// Initialize Prisma
const prisma = new PrismaClient();

// Register plugins
await fastify.register(helmet, {
  contentSecurityPolicy: false
});

await fastify.register(cors, {
  origin: env.CORS_ORIGIN || true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
});

await fastify.register(rateLimit, {
  max: env.RATE_LIMIT_MAX || 100,
  timeWindow: env.RATE_LIMIT_WINDOW || 60000
});

// Add Prisma to request context
fastify.decorate('prisma', prisma);

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

// Root route
fastify.get('/', async () => {
  return { 
    message: 'Todo App API', 
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      tasks: '/api/v1/tasks',
      tags: '/api/v1/tags'
    }
  };
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API routes
await fastify.register(taskRoutes, { prefix: '/api/v1' });
await fastify.register(tagRoutes, { prefix: '/api/v1' });

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  if (error.validation) {
    reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation
    });
    return;
  }

  reply.status(error.statusCode || 500).send({
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred'
  });
});

// Graceful shutdown
const shutdown = async () => {
  try {
    await prisma.$disconnect();
    await fastify.close();
    process.exit(0);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const start = async () => {
  try {
    await fastify.listen({ 
      port: env.PORT || 3001, 
      host: '0.0.0.0' 
    });
    fastify.log.info(`Server listening on port ${env.PORT || 3001}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
