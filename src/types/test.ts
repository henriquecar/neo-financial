import { JobType, CharacterStatus } from '../models/Character';

export interface TestCharacter {
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

export interface TestCharacterListItem {
  id: string;
  name: string;
  job: JobType;
  status: CharacterStatus;
}

export interface TestBattleParticipant {
  character: TestCharacter;
  currentHealthPoints: number;
}
