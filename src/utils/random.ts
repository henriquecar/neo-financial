export interface RandomNumberGenerator {
  generateRandomInt(max: number): number;
}

export class DefaultRandomNumberGenerator implements RandomNumberGenerator {
  generateRandomInt(max: number): number {
    return Math.floor(Math.random() * (max + 1));
  }
}

export class TestableRandomNumberGenerator implements RandomNumberGenerator {
  constructor(private values: number[] = []) {}

  generateRandomInt(max: number): number {
    if (this.values.length === 0) {
      return Math.floor(Math.random() * (max + 1));
    }
    return this.values.shift() || 0;
  }

  setNextValues(values: number[]): void {
    this.values = [...values];
  }
}

export const defaultRNG = new DefaultRandomNumberGenerator();