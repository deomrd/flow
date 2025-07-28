export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public details?: any[]
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(details: any[]) {
    super("Erreur de validation", 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor() {
    super("Authentification requise", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super("Accès refusé", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Ressource") {
    super(`${resource} non trouvé(e)`, 404);
  }
}

export class InsufficientBalanceError extends AppError {
  constructor() {
    super("Solde insuffisant", 400);
  }
}

export class InvalidWithdrawalCodeError extends AppError {
  constructor() {
    super("Code de retrait invalide", 400);
  }
}

export class ExpiredWithdrawalError extends AppError {
  constructor() {
    super("Code de retrait expiré", 400);
  }
}

export class InvalidPinError extends AppError {
  constructor() {
    super("PIN incorrect", 401);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Requête invalide", details?: any[]) {
    super(message, 400, details);
  }
}


// Utility type for API error responses
export type ApiErrorResponse = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any[];
  };
};

// Helper function to standardize error responses
export const formatError = (error: unknown): ApiErrorResponse => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        details: error.details,
        code: error.constructor.name
      }
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        message: error.message,
        code: 'INTERNAL_ERROR'
      }
    };
  }

  return {
    success: false,
    error: {
      message: 'Une erreur inconnue est survenue',
      code: 'UNKNOWN_ERROR'
    }
  };
};