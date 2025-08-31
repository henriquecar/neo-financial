import { Character } from '../models/Character';

export interface BattleModifiers {
  attack: number;
  speed: number;
}

export interface CharacterDetail {
  id: string;
  name: string;
  job: string;
  status: string;
  maxHealthPoints: number;
  currentHealthPoints: number;
  battleModifiers: BattleModifiers;
}

export function mapToCharacterDetail(character: Character): CharacterDetail {
  return {
    id: character.id,
    name: character.name,
    job: character.job,
    status: character.status,
    maxHealthPoints: character.maxHealthPoints,
    currentHealthPoints: character.currentHealthPoints,
    battleModifiers: {
      attack: character.attackModifier,
      speed: character.speedModifier
    }
  };
}