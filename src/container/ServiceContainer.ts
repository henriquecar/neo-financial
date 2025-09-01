import { CharacterService } from '../services/CharacterService';
import { BattleService } from '../services/BattleService';
import { InMemoryCharacterRepository } from '../repositories/InMemoryCharacterRepository';
import { ICharacterRepository } from '../repositories/interfaces/ICharacterRepository';
import { ICharacterService } from '../services/interfaces/ICharacterService';
import { IBattleService } from '../services/interfaces/IBattleService';

export class ServiceContainer {
  private static instance: ServiceContainer;
  private characterRepository: ICharacterRepository;
  private characterService: ICharacterService;
  private battleService: IBattleService;

  private constructor() {
    // Initialize repositories
    this.characterRepository = new InMemoryCharacterRepository();

    // Initialize services with their dependencies
    this.characterService = new CharacterService(this.characterRepository);
    this.battleService = new BattleService(this.characterService);
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  public getCharacterRepository(): ICharacterRepository {
    return this.characterRepository;
  }

  public getCharacterService(): ICharacterService {
    return this.characterService;
  }

  public getBattleService(): IBattleService {
    return this.battleService;
  }

  // For testing purposes - allows resetting the container
  public static reset(): void {
    ServiceContainer.instance = new ServiceContainer();
  }
}
