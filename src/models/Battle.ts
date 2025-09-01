import { Character } from './Character';

export interface BattleParticipant {
  character: Character;
  currentHealthPoints: number;
}

export interface BattleTurn {
  attacker: BattleParticipant;
  defender: BattleParticipant;
  damage: number;
  defenderRemainingHP: number;
}

export interface BattleRound {
  roundNumber: number;
  firstPlayer: BattleParticipant;
  secondPlayer: BattleParticipant;
  firstPlayerSpeed: number;
  secondPlayerSpeed: number;
  turns: BattleTurn[];
  roundEnded: boolean;
}

export interface BattleResult {
  winner: BattleParticipant;
  loser: BattleParticipant;
  rounds: BattleRound[];
  battleLog: string[];
  totalRounds: number;
}

export interface BattleRequest {
  character1Id: string;
  character2Id: string;
}
