import { Character } from '../models/Character';
import { PaginationQuery, PaginationResult } from '../types/pagination';
import { ICharacterRepository } from './interfaces/ICharacterRepository';

export class InMemoryCharacterRepository implements ICharacterRepository {
  private characters: Map<string, Character> = new Map();

  async findAll(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }

  async findById(id: string): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async findManyByIds(ids: string[]): Promise<Character[]> {
    const characters: Character[] = [];
    for (const id of ids) {
      const character = this.characters.get(id);
      if (character) {
        characters.push(character);
      }
    }
    return characters;
  }

  async findPaginated(
    paginationQuery: PaginationQuery
  ): Promise<PaginationResult<Pick<Character, 'id' | 'name' | 'job' | 'status'>>> {
    const allCharacters = Array.from(this.characters.values());
    const totalItems = allCharacters.length;
    const totalPages = Math.ceil(totalItems / paginationQuery.limit);

    // Extract the requested page of characters with only essential fields
    const startIndex = paginationQuery.offset;
    const endIndex = startIndex + paginationQuery.limit;
    const charactersSlice = allCharacters.slice(startIndex, endIndex);

    // Map to lightweight character objects with only essential fields
    const data = charactersSlice.map(character => ({
      id: character.id,
      name: character.name,
      job: character.job,
      status: character.status,
    }));

    return {
      data,
      pagination: {
        currentPage: paginationQuery.page,
        totalPages,
        totalItems,
        itemsPerPage: paginationQuery.limit,
        hasNextPage: paginationQuery.page < totalPages,
        hasPreviousPage: paginationQuery.page > 1,
      },
    };
  }

  async create(character: Character): Promise<Character> {
    this.characters.set(character.id, character);
    return character;
  }

  async update(id: string, updates: Partial<Character>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (character) {
      const updatedCharacter = { ...character, ...updates };
      this.characters.set(id, updatedCharacter);
      return updatedCharacter;
    }
    return undefined;
  }

  async delete(id: string): Promise<boolean> {
    return this.characters.delete(id);
  }

  async count(): Promise<number> {
    return this.characters.size;
  }

  async existsByName(name: string): Promise<boolean> {
    for (const character of this.characters.values()) {
      if (character.name.toLowerCase() === name.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  // Additional methods for testing/development
  clear(): void {
    this.characters.clear();
  }
}
