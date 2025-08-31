export class ConfigService {
  static get PORT(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  static get NODE_ENV(): string {
    return process.env.NODE_ENV || 'development';
  }

  static get API_VERSION(): string {
    return process.env.API_VERSION || 'v1';
  }

  static get ALLOWED_ORIGINS(): string[] {
    return process.env.ALLOWED_ORIGINS?.split(',') || [];
  }

  static get RATE_LIMIT_MAX(): number {
    return parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
  }

  static get RATE_LIMIT_WINDOW_MS(): number {
    return parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
  }

  static get MAX_BATTLE_ROUNDS(): number {
    return parseInt(process.env.MAX_BATTLE_ROUNDS || '1000', 10);
  }

  static get MAX_PAGINATION_LIMIT(): number {
    return parseInt(process.env.MAX_PAGINATION_LIMIT || '100', 10);
  }

  static get DEFAULT_PAGINATION_LIMIT(): number {
    return parseInt(process.env.DEFAULT_PAGINATION_LIMIT || '10', 10);
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
}