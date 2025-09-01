import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Extend Request interface to include correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      startTime?: number;
    }
  }
}

// Correlation ID middleware
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.correlationId = req.get('X-Correlation-ID') || uuidv4();
  req.startTime = Date.now();

  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', req.correlationId);

  next();
}

// Custom morgan format with correlation ID
const morganFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Request logging middleware using morgan
export const requestLoggingMiddleware = morgan(morganFormat, {
  stream: {
    write: (message: string) => {
      // Remove the newline that morgan adds
      logger.info(message.trim(), { type: 'http-access' });
    },
  },
});

// Enhanced request/response logging middleware
export function enhancedLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { method, url, headers, body, query, params } = req;
  const correlationId = req.correlationId;

  // Log incoming request
  logger.info('Incoming request', {
    correlationId,
    type: 'http-request',
    method,
    url,
    userAgent: headers['user-agent'],
    contentType: headers['content-type'],
    bodySize: (JSON.stringify(body) || '').length,
    hasQuery: Object.keys(query).length > 0,
    hasParams: Object.keys(params).length > 0,
    ip: req.ip || req.socket.remoteAddress,
  });

  // Capture the original end function
  const originalEnd = res.end;

  // Override the end function to log response
  res.end = function (chunk?: any, encoding?: any): any {
    const duration = req.startTime ? Date.now() - req.startTime : 0;

    // Log outgoing response
    logger.info('Outgoing response', {
      correlationId,
      type: 'http-response',
      method,
      url,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration,
      contentLength: res.getHeader('content-length') || (chunk ? chunk.length : 0),
      contentType: res.getHeader('content-type'),
    });

    // Call the original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

// Error logging middleware
export function errorLoggingMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { method, url } = req;
  const correlationId = req.correlationId;

  logger.error('Request error', {
    correlationId,
    type: 'http-error',
    method,
    url,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    statusCode: res.statusCode,
  });

  next(error);
}
