export class ValidationError extends Error {
  constructor(
    message: string,
    public details: string[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with id ${id} not found` : `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class BattleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BattleError';
  }
}

export class BattleTimeoutError extends BattleError {
  constructor(message: string = 'Battle exceeded maximum rounds') {
    super(message);
    this.name = 'BattleTimeoutError';
  }
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any[];
    timestamp: string;
    path: string;
  };
}
