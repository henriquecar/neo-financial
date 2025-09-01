import { JobType } from '../models/Character';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateCharacterName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || typeof name !== 'string') {
    errors.push('Name is required');
    return { isValid: false, errors };
  }

  if (name.length < 4 || name.length > 15) {
    errors.push('Name must be between 4 and 15 characters inclusive');
  }

  const nameRegex = /^[a-zA-Z_]+$/;
  if (!nameRegex.test(name)) {
    errors.push('Name must contain only letters (a-z, A-Z) or underscore (_) characters');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateJob(job: string): ValidationResult {
  const errors: string[] = [];
  const validJobs: JobType[] = ['Warrior', 'Thief', 'Mage'];

  if (!job || typeof job !== 'string') {
    errors.push('Job is required');
    return { isValid: false, errors };
  }

  if (!validJobs.includes(job as JobType)) {
    errors.push(`Job must be one of: ${validJobs.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
}

export function validateCharacterCreation(name: string, job: string): ValidationResult {
  const nameValidation = validateCharacterName(name);
  const jobValidation = validateJob(job);

  const allErrors = [...nameValidation.errors, ...jobValidation.errors];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
