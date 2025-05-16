// src/utils/errors.ts
export class BadRequestError extends Error {
    statusCode = 400;
    
    constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

export class UnauthorizedError extends Error {
    statusCode = 401;
    
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class InternalServerError extends Error {
    statusCode = 500;
    
    constructor(message: string) {
        super(message);
        this.name = 'InternalServerError';
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}