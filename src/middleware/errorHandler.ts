import { Request, Response, NextFunction } from 'express';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  BattleError,
  ApiErrorResponse,
} from '../errors/CustomErrors';

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  const path = req.path;

  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';
  let details: any[] | undefined;

  // Handle specific error types
  if (error instanceof ValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = error.message;
    details = error.details;
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = error.message;
  } else if (error instanceof ConflictError) {
    statusCode = 409;
    code = 'CONFLICT';
    message = error.message;
  } else if (error instanceof BattleError) {
    statusCode = 400;
    code = 'BATTLE_ERROR';
    message = error.message;
  }

  // Log error for debugging (but not in production or test)
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.error(`[${timestamp}] ${error.name}: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  }

  // Send structured error response
  const errorResponse: ApiErrorResponse = {
    error: {
      code,
      message,
      details,
      timestamp,
      path,
    },
  };

  res.status(statusCode).json(errorResponse);
}
