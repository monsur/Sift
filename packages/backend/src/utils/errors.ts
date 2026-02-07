export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds: number) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED', {
      retry_after_seconds: retryAfterSeconds,
    });
    this.name = 'RateLimitError';
  }
}

export class EmailNotVerifiedError extends AppError {
  constructor() {
    super('Email not verified', 403, 'EMAIL_NOT_VERIFIED');
    this.name = 'EmailNotVerifiedError';
  }
}

export class AccountLockedError extends AppError {
  constructor(lockedUntil: Date) {
    super('Account temporarily locked', 423, 'ACCOUNT_LOCKED', {
      locked_until: lockedUntil.toISOString(),
    });
    this.name = 'AccountLockedError';
  }
}
