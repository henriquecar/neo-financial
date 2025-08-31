import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { ValidationError } from '../errors/CustomErrors';

export function validateBody(schema: ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false, // Collect all errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const details = error.details.map(detail => detail.message);
      throw new ValidationError('Validation failed', details);
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
}

export function validateQuery(schema: ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true // Convert string query params to appropriate types
    });

    if (error) {
      const details = error.details.map(detail => detail.message);
      throw new ValidationError('Validation failed', details);
    }

    // Replace req.query with validated and sanitized data
    req.query = value;
    next();
  };
}

export function validateParams(schema: ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => detail.message);
      throw new ValidationError('Validation failed', details);
    }

    // Replace req.params with validated data
    req.params = value;
    next();
  };
}