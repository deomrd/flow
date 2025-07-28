import { Request, Response, NextFunction } from 'express';
import { AppError, ApiErrorResponse, formatError } from '../errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    const errorResponse: ApiErrorResponse = formatError(err);
    return res.status(err.statusCode).json(errorResponse);
  }

  console.error('Unhandled error:', err);
  
  const errorResponse: ApiErrorResponse = formatError(err);
  res.status(500).json(errorResponse);
};

export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };