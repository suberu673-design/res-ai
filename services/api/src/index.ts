import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { HealthStatus, VersionInfo, Environment } from '@forex-platform/types';

const app: Express = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.API_PORT || 3001;
const API_VERSION = '0.1.0';
const APP_ENV = (process.env.APP_ENV || 'development') as Environment;

// Routes

/**
 * Health check endpoint
 * Returns the health status of the service and database
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    const latency = Date.now() - startTime;

    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date(),
      database: {
        status: 'connected',
        latency,
      },
    };

    res.json(health);
  } catch (error) {
    const health: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date(),
      database: {
        status: 'disconnected',
      },
    };

    res.status(503).json(health);
  }
});

/**
 * API version endpoint
 */
app.get('/api/version', (req: Request, res: Response) => {
  const version: VersionInfo = {
    version: API_VERSION,
    environment: APP_ENV,
    timestamp: new Date(),
  };

  res.json(version);
});

/**
 * Root endpoint
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'AI Forex Platform API',
    version: API_VERSION,
    endpoints: {
      health: '/health',
      version: '/api/version',
    },
  });
});

/**
 * Error handling middleware
 */
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
    timestamp: new Date(),
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.path} not found`,
    },
    timestamp: new Date(),
  });
});

// Start server
async function start() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection successful');

    app.listen(PORT, () => {
      console.log(`✓ API server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${APP_ENV}`);
      console.log(`✓ API Version: ${API_VERSION}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
