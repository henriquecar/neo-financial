import { Character, JobType } from '../../models/Character';
import { PaginationQuery, PaginationResult } from '../../types/pagination';

export interface ICharacterService {
  getAllCharacters(): Promise<Character[]>;
  getCharactersPaginated(paginationQuery: PaginationQuery): Promise<PaginationResult<Pick<Character, 'id' | 'name' | 'job' | 'status'>>>;
  getCharacterById(id: string): Promise<Character | undefined>;
  createCharacter(name: string, job: JobType): Promise<Character>;
  deleteCharacter(id: string): Promise<boolean>;
  updateCharacterStatus(id: string, status: 'Alive' | 'Dead'): Promise<Character | undefined>;
  updateCharacterHealth(id: string, currentHealthPoints: number): Promise<Character | undefined>;
}