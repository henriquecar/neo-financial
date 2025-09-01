import request from 'supertest';
import express from 'express';
import battleRoutes from '../routes/battle';
import characterRoutes from '../routes/characters';
import { ServiceContainer } from '../container/ServiceContainer';
import { InMemoryCharacterRepository } from '../repositories/InMemoryCharacterRepository';
import { errorHandler } from '../middleware/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/battle', battleRoutes);
app.use('/api/characters', characterRoutes);
app.use(errorHandler);

describe('Battle System', () => {
  let warrior: any;
  let mage: any;
  let thief: any;
  let characterService: any;
  let battleService: any;

  beforeEach(async () => {
    // Reset the service container for each test
    ServiceContainer.reset();
    const container = ServiceContainer.getInstance();
    characterService = container.getCharacterService();
    battleService = container.getBattleService();
    const characterRepository = container.getCharacterRepository() as InMemoryCharacterRepository;
    characterRepository.clear();

    // Create test characters via API calls to ensure proper integration
    const testId =
      Math.random()
        .toString(36)
        .replace(/[^a-z]/g, '')
        .substr(0, 3) || 'tst';

    const warriorResponse = await request(app)
      .post('/api/characters')
      .send({ name: `War_${testId}`, job: 'Warrior' })
      .expect(201);
    warrior = warriorResponse.body;

    const mageResponse = await request(app)
      .post('/api/characters')
      .send({ name: `Mag_${testId}`, job: 'Mage' })
      .expect(201);
    mage = mageResponse.body;

    const thiefResponse = await request(app)
      .post('/api/characters')
      .send({ name: `Thi_${testId}`, job: 'Thief' })
      .expect(201);
    thief = thiefResponse.body;
  });

  describe('BattleService', () => {
    it('should conduct a battle between two characters', () => {
      const result = battleService.battle(warrior, mage);

      expect(result.winner).toBeDefined();
      expect(result.loser).toBeDefined();
      expect(result.rounds).toBeDefined();
      expect(result.battleLog).toBeDefined();
      expect(result.totalRounds).toBeGreaterThan(0);

      // One character should be dead (0 HP), the other should be alive (> 0 HP)
      expect(result.winner.currentHealthPoints).toBeGreaterThan(0);
      expect(result.loser.currentHealthPoints).toBe(0);

      // Battle log should have proper format
      expect(result.battleLog[0]).toMatch(
        /^Battle between .+ \(.+\) - \d+ HP and .+ \(.+\) - \d+ HP begins!$/
      );
      expect(result.battleLog[result.battleLog.length - 1]).toMatch(
        /^.+ wins the battle! .+ still has \d+ HP remaining!$/
      );
    });

    it('should generate proper battle log messages', () => {
      const result = battleService.battle(warrior, thief);

      // Check battle start message
      expect(result.battleLog[0]).toBe(
        `Battle between ${warrior.name} (${warrior.job}) - ${warrior.currentHealthPoints} HP and ${thief.name} (${thief.job}) - ${thief.currentHealthPoints} HP begins!`
      );

      // Check battle end message
      const lastMessage = result.battleLog[result.battleLog.length - 1];
      expect(lastMessage).toMatch(/^.+ wins the battle! .+ still has \d+ HP remaining!$/);

      // Check that speed announcements and attack messages are present
      const speedMessages = result.battleLog.filter((msg: string) =>
        msg.includes('speed was faster than')
      );
      const attackMessages = result.battleLog.filter(
        (msg: string) => msg.includes('attacks') && msg.includes('for')
      );

      expect(speedMessages.length).toBeGreaterThan(0);
      expect(attackMessages.length).toBeGreaterThan(0);
    });

    it('should handle multiple rounds if characters are balanced', async () => {
      // Create two identical warriors for a potentially longer battle via API calls
      const testId = Math.random()
        .toString(36)
        .replace(/[^a-z]/g, '')
        .substr(0, 2)
        .padEnd(2, 'x');

      const warrior1Response = await request(app)
        .post('/api/characters')
        .send({ name: `WarA${testId}`, job: 'Warrior' })
        .expect(201);
      const warrior1 = warrior1Response.body;

      const warrior2Response = await request(app)
        .post('/api/characters')
        .send({ name: `WarB${testId}`, job: 'Warrior' })
        .expect(201);
      const warrior2 = warrior2Response.body;

      const result = battleService.battle(warrior1, warrior2);

      expect(result.totalRounds).toBeGreaterThan(0);
      expect(result.rounds.length).toBe(result.totalRounds);

      // Check that all rounds are properly structured
      result.rounds.forEach((round: any, index: number) => {
        expect(round.roundNumber).toBe(index + 1);
        expect(round.turns.length).toBeGreaterThan(0);
        expect(round.turns.length).toBeLessThanOrEqual(2); // Max 2 turns per round
      });
    });
  });

  describe('POST /api/battle', () => {
    it('should start a battle between two valid characters', async () => {
      const battleRequest = {
        character1Id: warrior.id,
        character2Id: mage.id,
      };

      const response = await request(app).post('/api/battle').send(battleRequest).expect(200);

      expect(response.body).toHaveProperty('winner');
      expect(response.body).toHaveProperty('loser');
      expect(response.body).toHaveProperty('rounds');
      expect(response.body).toHaveProperty('battleLog');
      expect(response.body).toHaveProperty('totalRounds');

      expect(response.body.winner.currentHealthPoints).toBeGreaterThan(0);
      expect(response.body.loser.currentHealthPoints).toBe(0);
      expect(response.body.battleLog).toBeInstanceOf(Array);
      expect(response.body.battleLog.length).toBeGreaterThan(0);
    });

    it('should return 400 if character IDs are missing', async () => {
      const response = await request(app)
        .post('/api/battle')
        .send({ character1Id: warrior.id })
        .expect(400);

      expect(response.body.error.message).toBe('Validation failed');
    });

    it('should return 400 if characters are the same', async () => {
      const response = await request(app)
        .post('/api/battle')
        .send({
          character1Id: warrior.id,
          character2Id: warrior.id,
        })
        .expect(400);

      expect(response.body.error.message).toBe('Validation failed');
    });

    it('should return 400 if character is not found', async () => {
      const response = await request(app)
        .post('/api/battle')
        .send({
          character1Id: 'non-existent-id',
          character2Id: mage.id,
        })
        .expect(404);

      expect(response.body.error.message).toMatch(/Character with id .+ not found/);
    });

    it('should return 409 if character is dead', async () => {
      // Kill the warrior
      await characterService.updateCharacterStatus(warrior.id, 'Dead');

      const response = await request(app)
        .post('/api/battle')
        .send({
          character1Id: warrior.id,
          character2Id: mage.id,
        })
        .expect(409);

      expect(response.body.error.message).toMatch(/.+ is dead and cannot battle/);
    });

    it('should update loser status to Dead after battle', async () => {
      const battleRequest = {
        character1Id: warrior.id,
        character2Id: mage.id,
      };

      const response = await request(app).post('/api/battle').send(battleRequest).expect(200);

      // Check that loser is marked as Dead in the service
      const loserCharacter = await characterService.getCharacterById(
        response.body.loser.character.id
      );
      expect(loserCharacter?.status).toBe('Dead');
    });

    it('should update both characters health after battle', async () => {
      const battleRequest = {
        character1Id: warrior.id,
        character2Id: mage.id,
      };

      // Get initial health values
      const initialWarrior = await characterService.getCharacterById(warrior.id);
      const initialMage = await characterService.getCharacterById(mage.id);

      const response = await request(app).post('/api/battle').send(battleRequest).expect(200);

      // Get updated characters from service
      const updatedWarrior = await characterService.getCharacterById(warrior.id);
      const updatedMage = await characterService.getCharacterById(mage.id);

      // Check that winner's health is updated
      const winnerId = response.body.winner.character.id;
      const winnerCurrentHP = response.body.winner.currentHealthPoints;

      if (winnerId === warrior.id) {
        expect(updatedWarrior?.currentHealthPoints).toBe(winnerCurrentHP);
        expect(updatedWarrior?.currentHealthPoints).toBeLessThanOrEqual(
          initialWarrior?.currentHealthPoints!
        );
        expect(updatedMage?.currentHealthPoints).toBe(0);
      } else {
        expect(updatedMage?.currentHealthPoints).toBe(winnerCurrentHP);
        expect(updatedMage?.currentHealthPoints).toBeLessThanOrEqual(
          initialMage?.currentHealthPoints!
        );
        expect(updatedWarrior?.currentHealthPoints).toBe(0);
      }

      // Check that loser's health is 0
      const loserId = response.body.loser.character.id;
      const updatedLoser = await characterService.getCharacterById(loserId);
      expect(updatedLoser?.currentHealthPoints).toBe(0);
    });

    it('should show updated health in character details after battle', async () => {
      // Start battle
      const battleResponse = await request(app)
        .post('/api/battle')
        .send({
          character1Id: warrior.id,
          character2Id: thief.id,
        })
        .expect(200);

      const winnerId = battleResponse.body.winner.character.id;
      const winnerCurrentHP = battleResponse.body.winner.currentHealthPoints;

      // Get character details
      const detailsResponse = await request(app).get(`/api/characters/${winnerId}`).expect(200);

      // Verify the details show updated health
      expect(detailsResponse.body.currentHealthPoints).toBe(winnerCurrentHP);
      expect(detailsResponse.body.currentHealthPoints).toBeLessThanOrEqual(
        detailsResponse.body.maxHealthPoints
      );
    });

    it('should show updated health and status in character list after battle', async () => {
      // Start battle
      const battleResponse = await request(app)
        .post('/api/battle')
        .send({
          character1Id: warrior.id,
          character2Id: thief.id,
        })
        .expect(200);

      const loserId = battleResponse.body.loser.character.id;

      // Get character list
      const listResponse = await request(app).get('/api/characters').expect(200);

      // Find loser in the list
      const loserInList = listResponse.body.data.find((char: any) => char.id === loserId);
      expect(loserInList).toBeDefined();
      expect(loserInList.status).toBe('Dead');
    });

    it('should preserve battle statistics in response', async () => {
      const response = await request(app)
        .post('/api/battle')
        .send({
          character1Id: warrior.id,
          character2Id: thief.id,
        })
        .expect(200);

      // Check that character data is properly included
      expect(response.body.winner.character).toHaveProperty('name');
      expect(response.body.winner.character).toHaveProperty('job');
      expect(response.body.winner.character).toHaveProperty('maxHealthPoints');

      expect(response.body.loser.character).toHaveProperty('name');
      expect(response.body.loser.character).toHaveProperty('job');
      expect(response.body.loser.character).toHaveProperty('maxHealthPoints');

      // Check rounds structure
      response.body.rounds.forEach((round: any) => {
        expect(round).toHaveProperty('roundNumber');
        expect(round).toHaveProperty('firstPlayer');
        expect(round).toHaveProperty('secondPlayer');
        expect(round).toHaveProperty('firstPlayerSpeed');
        expect(round).toHaveProperty('secondPlayerSpeed');
        expect(round).toHaveProperty('turns');
        expect(round.turns).toBeInstanceOf(Array);
      });
    });
  });

  describe('Battle Logic Edge Cases', () => {
    it('should handle warrior vs mage combat correctly', () => {
      const result = battleService.battle(warrior, mage);

      // Warrior has higher HP (20 vs 12) and decent attack (9)
      // Mage has higher attack potential (12) but lower HP
      // Either could win depending on speed rolls and damage rolls

      expect([warrior.id, mage.id]).toContain(result.winner.character.id);
      expect([warrior.id, mage.id]).toContain(result.loser.character.id);
      expect(result.winner.character.id).not.toBe(result.loser.character.id);
    });

    it('should handle thief vs mage combat correctly', () => {
      const result = battleService.battle(thief, mage);

      // Thief has moderate HP (15) and high speed/attack potential
      // Mage has lowest HP (12) but highest attack potential

      expect([thief.id, mage.id]).toContain(result.winner.character.id);
      expect([thief.id, mage.id]).toContain(result.loser.character.id);
      expect(result.winner.character.id).not.toBe(result.loser.character.id);
    });

    it('should ensure no infinite loops in battle', () => {
      // Create two characters and ensure battle completes in reasonable time
      const start = Date.now();
      const result = battleService.battle(warrior, mage);
      const duration = Date.now() - start;

      // Battle should complete within 1 second (very generous)
      expect(duration).toBeLessThan(1000);
      expect(result.totalRounds).toBeLessThan(100); // Reasonable upper limit
    });
  });
});
