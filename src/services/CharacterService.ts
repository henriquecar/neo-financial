import { Character, JobType, JOB_BASE_STATS, calculateAttackModifier, calculateSpeedModifier } from '../models/Character';
import { PaginationResult, PaginationQuery } from '../types/pagination';
import { ICharacterRepository } from '../repositories/interfaces/ICharacterRepository';
import { ICharacterService } from './interfaces/ICharacterService';
import { v4 as uuidv4 } from 'uuid';

class CharacterService implements ICharacterService {
  constructor(private characterRepository: ICharacterRepository) {}

  async getAllCharacters(): Promise<Character[]> {
    return this.characterRepository.findAll();
  }

  async getCharactersPaginated(paginationQuery: PaginationQuery): Promise<PaginationResult<Pick<Character, 'id' | 'name' | 'job' | 'status'>>> {
    return this.characterRepository.findPaginated(paginationQuery);
  }

  async getCharacterById(id: string): Promise<Character | undefined> {
    return this.characterRepository.findById(id);
  }

  async createCharacter(name: string, job: JobType): Promise<Character> {
    // Check if character name already exists
    const nameExists = await this.characterRepository.existsByName(name);
    if (nameExists) {
      throw new Error(`Character with name '${name}' already exists`);
    }

    const baseStats = JOB_BASE_STATS[job];
    const character: Character = {
      id: uuidv4(),
      name,
      job,
      status: 'Alive',
      maxHealthPoints: baseStats.healthPoints,
      currentHealthPoints: baseStats.healthPoints, // Start at full health
      strength: baseStats.strength,
      dexterity: baseStats.dexterity,
      intelligence: baseStats.intelligence,
      attackModifier: calculateAttackModifier(job, baseStats.strength, baseStats.dexterity, baseStats.intelligence),
      speedModifier: calculateSpeedModifier(job, baseStats.strength, baseStats.dexterity, baseStats.intelligence),
    };

    return this.characterRepository.create(character);
  }

  async deleteCharacter(id: string): Promise<boolean> {
    return this.characterRepository.delete(id);
  }

  async updateCharacterStatus(id: string, status: 'Alive' | 'Dead'): Promise<Character | undefined> {
    return this.characterRepository.update(id, { status });
  }

  async updateCharacterHealth(id: string, currentHealthPoints: number): Promise<Character | undefined> {
    const character = await this.characterRepository.findById(id);
    if (character) {
      const clampedHealth = Math.max(0, Math.min(currentHealthPoints, character.maxHealthPoints));
      return this.characterRepository.update(id, { currentHealthPoints: clampedHealth });
    }
    return undefined;
  }
}

export { CharacterService };