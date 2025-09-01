import { Character } from '../../models/Character';
import { BattleResult } from '../../models/Battle';

export interface IBattleService {
  battle(character1: Character, character2: Character): BattleResult;
}
