import { Character } from '../../models/Character';
import { PaginationQuery, PaginationResult } from '../../types/pagination';

export interface ICharacterRepository {
  findAll(): Promise<Character[]>;
  findById(id: string): Promise<Character | undefined>;
  findManyByIds(ids: string[]): Promise<Character[]>;
  findPaginated(
    paginationQuery: PaginationQuery
  ): Promise<PaginationResult<Pick<Character, 'id' | 'name' | 'job' | 'status'>>>;
  create(character: Character): Promise<Character>;
  update(id: string, updates: Partial<Character>): Promise<Character | undefined>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
  existsByName(name: string): Promise<boolean>;
}
