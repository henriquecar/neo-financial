import express from 'express';
import swaggerUi from 'swagger-ui-express';
import characterRoutes from './routes/characters';
import jobRoutes from './routes/jobs';
import battleRoutes from './routes/battle';
import swaggerSpecs from './config/swagger';
import { configureSecurity } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';
import { correlationIdMiddleware, requestLoggingMiddleware, enhancedLoggingMiddleware, errorLoggingMiddleware } from './middleware/logging';
import { ConfigService } from './config/config';
import { logger } from './utils/logger';

const app = express();

// Graceful shutdown state
let isShuttingDown = false;

// Logging middleware (first, before other middleware)
app.use(correlationIdMiddleware);
app.use(requestLoggingMiddleware);
app.use(enhancedLoggingMiddleware);

// Security middleware
configureSecurity(app);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// API routes with versioning
const API_BASE = `/api/${ConfigService.API_VERSION}`;
app.use(`${API_BASE}/characters`, characterRoutes);
app.use(`${API_BASE}/jobs`, jobRoutes);
app.use(`${API_BASE}/battle`, battleRoutes);

// Enhanced health check endpoint
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: isShuttingDown ? 'SHUTTING_DOWN' : 'OK',
    message: isShuttingDown ? 'API is shutting down' : 'RPG Character Management API is running',
    version: ConfigService.API_VERSION,
    environment: ConfigService.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    },
    services: {
      api: 'healthy',
      // Add more service health checks here as needed
      // database: 'healthy',
      // cache: 'healthy'
    }
  };

  const statusCode = isShuttingDown ? 503 : 200;
  res.status(statusCode).json(healthStatus);
});

// Error logging middleware (before error handler)
app.use(errorLoggingMiddleware);

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found',
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
});

const PORT = ConfigService.PORT;

const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: ConfigService.NODE_ENV,
    apiVersion: ConfigService.API_VERSION,
    docsUrl: `http://localhost:${PORT}/api-docs`
  });
});

// Graceful shutdown handling
function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    logger.warn('Force shutdown initiated');
    process.exit(1);
  }
  
  isShuttingDown = true;
  logger.info(`Received ${signal}, starting graceful shutdown`);

  // Stop accepting new requests
  server.close((err) => {
    if (err) {
      logger.error('Error during server close', { error: err.message });
      process.exit(1);
    }

    logger.info('Server closed successfully');
    
    // Close any database connections, cleanup resources here
    // For now, we'll just exit gracefully
    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { 
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  });
  gracefulShutdown('unhandledRejection');
});