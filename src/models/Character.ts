export type JobType = 'Warrior' | 'Thief' | 'Mage';
export type CharacterStatus = 'Alive' | 'Dead';

export interface JobStats {
  healthPoints: number;
  strength: number;
  dexterity: number;
  intelligence: number;
}

export interface Character {
  id: string;
  name: string;
  job: JobType;
  status: CharacterStatus;
  maxHealthPoints: number;
  currentHealthPoints: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  attackModifier: number;
  speedModifier: number;
}

export const JOB_BASE_STATS: Record<JobType, JobStats> = {
  Warrior: {
    healthPoints: 20,
    strength: 10,
    dexterity: 5,
    intelligence: 5,
  },
  Thief: {
    healthPoints: 15,
    strength: 4,
    dexterity: 10,
    intelligence: 4,
  },
  Mage: {
    healthPoints: 12,
    strength: 5,
    dexterity: 6,
    intelligence: 10,
  },
};

export function calculateAttackModifier(job: JobType, strength: number, dexterity: number, intelligence: number): number {
  switch (job) {
    case 'Warrior':
      return Math.round(strength * 0.8 + dexterity * 0.2);
    case 'Thief':
      return Math.round(strength * 0.25 + dexterity * 1.0 + intelligence * 0.25);
    case 'Mage':
      return Math.round(strength * 0.2 + dexterity * 0.2 + intelligence * 1.2);
  }
}

export function calculateSpeedModifier(job: JobType, strength: number, dexterity: number, intelligence: number): number {
  switch (job) {
    case 'Warrior':
      return Math.round(dexterity * 0.6 + intelligence * 0.2);
    case 'Thief':
      return Math.round(dexterity * 0.8);
    case 'Mage':
      return Math.round(dexterity * 0.4 + strength * 0.1);
  }
}