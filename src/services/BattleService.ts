import { Character } from '../models/Character';
import { BattleParticipant, BattleRound, BattleResult, BattleTurn } from '../models/Battle';
import { BattleTimeoutError } from '../errors/CustomErrors';
import { ConfigService } from '../config/config';

class BattleService {
  
  private generateRandomInt(max: number): number {
    return Math.floor(Math.random() * (max + 1));
  }

  private createBattleParticipant(character: Character): BattleParticipant {
    return {
      character,
      currentHealthPoints: character.currentHealthPoints
    };
  }

  private determineRoundOrder(participant1: BattleParticipant, participant2: BattleParticipant): {
    first: BattleParticipant;
    second: BattleParticipant;
    firstSpeed: number;
    secondSpeed: number;
  } {
    let firstSpeed: number;
    let secondSpeed: number;
    
    // Keep rolling until there's no draw
    do {
      firstSpeed = this.generateRandomInt(participant1.character.speedModifier);
      secondSpeed = this.generateRandomInt(participant2.character.speedModifier);
    } while (firstSpeed === secondSpeed);

    if (firstSpeed > secondSpeed) {
      return { first: participant1, second: participant2, firstSpeed, secondSpeed };
    } else {
      return { first: participant2, second: participant1, firstSpeed: secondSpeed, secondSpeed: firstSpeed };
    }
  }

  private executeAttack(attacker: BattleParticipant, defender: BattleParticipant): BattleTurn {
    const damage = this.generateRandomInt(attacker.character.attackModifier);
    defender.currentHealthPoints = Math.max(0, defender.currentHealthPoints - damage);
    
    return {
      attacker,
      defender,
      damage,
      defenderRemainingHP: defender.currentHealthPoints
    };
  }

  private generateBattleLog(rounds: BattleRound[], winner: BattleParticipant, participant1: BattleParticipant, participant2: BattleParticipant): string[] {
    const log: string[] = [];
    
    // Battle start
    log.push(`Battle between ${participant1.character.name} (${participant1.character.job}) - ${participant1.character.currentHealthPoints} HP and ${participant2.character.name} (${participant2.character.job}) - ${participant2.character.currentHealthPoints} HP begins!`);
    
    // Round by round log
    rounds.forEach(round => {
      log.push(`${round.firstPlayer.character.name} ${round.firstPlayerSpeed} speed was faster than ${round.secondPlayer.character.name} ${round.secondPlayerSpeed} speed and will begin this round.`);
      
      round.turns.forEach(turn => {
        log.push(`${turn.attacker.character.name} attacks ${turn.defender.character.name} for ${turn.damage}, ${turn.defender.character.name} has ${turn.defenderRemainingHP} HP remaining.`);
      });
    });
    
    // Battle end
    log.push(`${winner.character.name} wins the battle! ${winner.character.name} still has ${winner.currentHealthPoints} HP remaining!`);
    
    return log;
  }

  public battle(character1: Character, character2: Character): BattleResult {
    const participant1 = this.createBattleParticipant(character1);
    const participant2 = this.createBattleParticipant(character2);
    const rounds: BattleRound[] = [];
    let roundNumber = 1;
    let maxRounds = ConfigService.MAX_BATTLE_ROUNDS;

    while (participant1.currentHealthPoints > 0 && 
           participant2.currentHealthPoints > 0 && 
           maxRounds-- > 0) {
      const { first, second, firstSpeed, secondSpeed } = this.determineRoundOrder(participant1, participant2);
      
      const round: BattleRound = {
        roundNumber,
        firstPlayer: first,
        secondPlayer: second,
        firstPlayerSpeed: firstSpeed,
        secondPlayerSpeed: secondSpeed,
        turns: [],
        roundEnded: false
      };

      // First player attacks
      const firstTurn = this.executeAttack(first, second);
      round.turns.push(firstTurn);

      // Check if battle is over
      if (second.currentHealthPoints === 0) {
        round.roundEnded = true;
        rounds.push(round);
        break;
      }

      // Second player attacks
      const secondTurn = this.executeAttack(second, first);
      round.turns.push(secondTurn);

      // Check if battle is over
      if (first.currentHealthPoints === 0) {
        round.roundEnded = true;
        rounds.push(round);
        break;
      }

      round.roundEnded = true;
      rounds.push(round);
      roundNumber++;
    }

    // Check for battle timeout
    if (maxRounds <= 0) {
      throw new BattleTimeoutError(`Battle exceeded maximum rounds (${ConfigService.MAX_BATTLE_ROUNDS})`);
    }

    // Determine winner and loser
    const winner = participant1.currentHealthPoints > 0 ? participant1 : participant2;
    const loser = participant1.currentHealthPoints === 0 ? participant1 : participant2;

    // Generate battle log
    const battleLog = this.generateBattleLog(rounds, winner, participant1, participant2);

    return {
      winner,
      loser,
      rounds,
      battleLog,
      totalRounds: rounds.length
    };
  }
}

export { BattleService };
export default new BattleService(); // Keep for backward compatibility during transition