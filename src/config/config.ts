interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;
  ALLOWED_ORIGINS: string;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW_MS: number;
  MAX_BATTLE_ROUNDS: number;
  MAX_PAGINATION_LIMIT: number;
  DEFAULT_PAGINATION_LIMIT: number;
}

function parseEnvironment(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const validNodeEnvs = ['development', 'production', 'test'];
  
  if (!validNodeEnvs.includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}. Must be one of: ${validNodeEnvs.join(', ')}`);
  }

  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}. Must be a valid port number (1-65535)`);
  }

  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
  if (isNaN(rateLimitMax) || rateLimitMax <= 0) {
    throw new Error(`Invalid RATE_LIMIT_MAX: ${process.env.RATE_LIMIT_MAX}. Must be a positive number`);
  }

  const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
  if (isNaN(rateLimitWindowMs) || rateLimitWindowMs <= 0) {
    throw new Error(`Invalid RATE_LIMIT_WINDOW_MS: ${process.env.RATE_LIMIT_WINDOW_MS}. Must be a positive number`);
  }

  const maxBattleRounds = parseInt(process.env.MAX_BATTLE_ROUNDS || '1000', 10);
  if (isNaN(maxBattleRounds) || maxBattleRounds <= 0) {
    throw new Error(`Invalid MAX_BATTLE_ROUNDS: ${process.env.MAX_BATTLE_ROUNDS}. Must be a positive number`);
  }

  const maxPaginationLimit = parseInt(process.env.MAX_PAGINATION_LIMIT || '100', 10);
  if (isNaN(maxPaginationLimit) || maxPaginationLimit <= 0) {
    throw new Error(`Invalid MAX_PAGINATION_LIMIT: ${process.env.MAX_PAGINATION_LIMIT}. Must be a positive number`);
  }

  const defaultPaginationLimit = parseInt(process.env.DEFAULT_PAGINATION_LIMIT || '10', 10);
  if (isNaN(defaultPaginationLimit) || defaultPaginationLimit <= 0 || defaultPaginationLimit > maxPaginationLimit) {
    throw new Error(`Invalid DEFAULT_PAGINATION_LIMIT: ${process.env.DEFAULT_PAGINATION_LIMIT}. Must be a positive number not exceeding MAX_PAGINATION_LIMIT`);
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    API_VERSION: process.env.API_VERSION || 'v1',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '',
    RATE_LIMIT_MAX: rateLimitMax,
    RATE_LIMIT_WINDOW_MS: rateLimitWindowMs,
    MAX_BATTLE_ROUNDS: maxBattleRounds,
    MAX_PAGINATION_LIMIT: maxPaginationLimit,
    DEFAULT_PAGINATION_LIMIT: defaultPaginationLimit,
  };
}

const env = parseEnvironment();

export class ConfigService {
  static get PORT(): number {
    return env.PORT;
  }

  static get NODE_ENV(): string {
    return env.NODE_ENV;
  }

  static get API_VERSION(): string {
    return env.API_VERSION;
  }

  static get ALLOWED_ORIGINS(): string[] {
    return env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : [];
  }

  static get RATE_LIMIT_MAX(): number {
    return env.RATE_LIMIT_MAX;
  }

  static get RATE_LIMIT_WINDOW_MS(): number {
    return env.RATE_LIMIT_WINDOW_MS;
  }

  static get MAX_BATTLE_ROUNDS(): number {
    return env.MAX_BATTLE_ROUNDS;
  }

  static get MAX_PAGINATION_LIMIT(): number {
    return env.MAX_PAGINATION_LIMIT;
  }

  static get DEFAULT_PAGINATION_LIMIT(): number {
    return env.DEFAULT_PAGINATION_LIMIT;
  }

  static get IS_DEVELOPMENT(): boolean {
    return this.NODE_ENV === 'development';
  }

  static get IS_PRODUCTION(): boolean {
    return this.NODE_ENV === 'production';
  }

  static get IS_TEST(): boolean {
    return this.NODE_ENV === 'test';
  }

  static validateConfig(): void {
    // Validation already happens during parseEnvironment() call
    // This method exists for explicit validation calls if needed
    parseEnvironment();
  }
}