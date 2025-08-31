import { Character, JobType, JOB_BASE_STATS, calculateAttackModifier, calculateSpeedModifier } from '../models/Character';
import { PaginationResult, PaginationQuery } from '../types/pagination';
import { v4 as uuidv4 } from 'uuid';

class CharacterService {
  private characters: Map<string, Character> = new Map();

  getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  getCharactersPaginated(paginationQuery: PaginationQuery): PaginationResult<Character> {
    const allCharacters = Array.from(this.characters.values());
    const totalItems = allCharacters.length;
    const totalPages = Math.ceil(totalItems / paginationQuery.limit);
    
    // Extract the requested page of characters
    const startIndex = paginationQuery.offset;
    const endIndex = startIndex + paginationQuery.limit;
    const data = allCharacters.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        currentPage: paginationQuery.page,
        totalPages,
        totalItems,
        itemsPerPage: paginationQuery.limit,
        hasNextPage: paginationQuery.page < totalPages,
        hasPreviousPage: paginationQuery.page > 1
      }
    };
  }

  getCharacterById(id: string): Character | undefined {
    return this.characters.get(id);
  }

  createCharacter(name: string, job: JobType): Character {
    const baseStats = JOB_BASE_STATS[job];
    const character: Character = {
      id: uuidv4(),
      name,
      job,
      status: 'Alive',
      healthPoints: baseStats.healthPoints,
      strength: baseStats.strength,
      dexterity: baseStats.dexterity,
      intelligence: baseStats.intelligence,
      attackModifier: calculateAttackModifier(job, baseStats.strength, baseStats.dexterity, baseStats.intelligence),
      speedModifier: calculateSpeedModifier(job, baseStats.strength, baseStats.dexterity, baseStats.intelligence),
    };

    this.characters.set(character.id, character);
    return character;
  }

  deleteCharacter(id: string): boolean {
    return this.characters.delete(id);
  }

  updateCharacterStatus(id: string, status: 'Alive' | 'Dead'): Character | undefined {
    const character = this.characters.get(id);
    if (character) {
      character.status = status;
      this.characters.set(id, character);
      return character;
    }
    return undefined;
  }
}

export default new CharacterService();