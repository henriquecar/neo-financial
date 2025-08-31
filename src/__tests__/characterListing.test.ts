import request from 'supertest';
import express from 'express';
import characterRoutes from '../routes/characters';
import { ServiceContainer } from '../container/ServiceContainer';
import { InMemoryCharacterRepository } from '../repositories/InMemoryCharacterRepository';
import { TestCharacter, TestCharacterListItem } from '../types/test';
import { errorHandler } from '../middleware/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/characters', characterRoutes);
app.use(errorHandler);

describe('Character Listing API', () => {
  let characterService: any;

  beforeEach(async () => {
    // Reset the service container for each test
    ServiceContainer.reset();
    const container = ServiceContainer.getInstance();
    characterService = container.getCharacterService();
    const characterRepository = container.getCharacterRepository() as InMemoryCharacterRepository;
    characterRepository.clear();
  });

  describe('GET /api/characters', () => {
    it('should return empty array when no characters exist', async () => {
      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.totalItems).toBe(0);
    });

    it('should return all characters with name, job, and status for list view', async () => {
      // Create multiple characters with different jobs via API
      await request(app)
        .post('/api/characters')
        .send({ name: 'Chamness', job: 'Warrior' })
        .expect(201);
      
      await request(app)
        .post('/api/characters')
        .send({ name: 'Aetherius', job: 'Mage' })
        .expect(201);
      
      await request(app)
        .post('/api/characters')
        .send({ name: 'Mera', job: 'Thief' })
        .expect(201);

      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(3);
      
      // Verify it contains only the essential fields for the list view
      response.body.data.forEach((character: TestCharacterListItem) => {
        expect(character).toHaveProperty('id');
        expect(character).toHaveProperty('name');
        expect(character).toHaveProperty('job');
        expect(character).toHaveProperty('status');
        expect(character.status).toBe('Alive'); // All new characters should be alive
        
        // Verify it does NOT contain detailed stats (those should only be in individual character endpoint)
        expect(character).not.toHaveProperty('maxHealthPoints');
        expect(character).not.toHaveProperty('strength');
        expect(character).not.toHaveProperty('dexterity');
        expect(character).not.toHaveProperty('intelligence');
        expect(character).not.toHaveProperty('attackModifier');
        expect(character).not.toHaveProperty('speedModifier');
      });

      // Verify specific characters are present
      const characterNames = response.body.data.map((char: any) => char.name);
      expect(characterNames).toContain('Chamness');
      expect(characterNames).toContain('Aetherius');
      expect(characterNames).toContain('Mera');
    });

    it('should show character details matching the list screen format', async () => {
      // Create characters similar to the screenshot
      const characters = [
        { name: 'Chamness', job: 'Warrior' as const },
        { name: 'Aetherius', job: 'Mage' as const },
        { name: 'Mera', job: 'Thief' as const },
        { name: 'Gytheue', job: 'Thief' as const },
        { name: 'Vyncent', job: 'Warrior' as const },
        { name: 'Eathed', job: 'Thief' as const },
        { name: 'Lilde', job: 'Mage' as const },
        { name: 'Thatetch', job: 'Warrior' as const }
      ];

      // Create characters via API
      for (const char of characters) {
        await request(app)
          .post('/api/characters')
          .send({ name: char.name, job: char.job })
          .expect(201);
      }

      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body.data).toHaveLength(8);

      // Verify each character has only the essential fields for the list view
      response.body.data.forEach((character: any) => {
        expect(character).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          job: expect.stringMatching(/^(Warrior|Thief|Mage)$/),
          status: 'Alive'
        });
        
        // Ensure no detailed stats are included in list view
        expect(Object.keys(character)).toEqual(['id', 'name', 'job', 'status']);
      });
    });
  });

  describe('GET /api/characters/:id', () => {
    it('should return character details by ID with battleModifiers', async () => {
      // Create character via API
      const createResponse = await request(app)
        .post('/api/characters')
        .send({ name: 'TestHero', job: 'Warrior' })
        .expect(201);
      
      const character = createResponse.body;

      const response = await request(app)
        .get(`/api/characters/${character.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: character.id,
        name: 'TestHero',
        job: 'Warrior',
        status: 'Alive',
        maxHealthPoints: 20,
        currentHealthPoints: 20,
        battleModifiers: {
          attack: 9,
          speed: 4
        }
      });

      // Verify base stats are not included
      expect(response.body).not.toHaveProperty('strength');
      expect(response.body).not.toHaveProperty('dexterity');
      expect(response.body).not.toHaveProperty('intelligence');
      expect(response.body).not.toHaveProperty('attackModifier');
      expect(response.body).not.toHaveProperty('speedModifier');
    });

    it('should return 404 for non-existent character', async () => {
      const response = await request(app)
        .get('/api/characters/non-existent-id')
        .expect(404);

      expect(response.body.error.message).toContain('Character with id non-existent-id not found');
    });

    it('should handle server errors gracefully', async () => {
      // Mock service to throw error
      jest.spyOn(characterService, 'getCharacterById').mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      const response = await request(app)
        .get('/api/characters/test-id')
        .expect(500);

      expect(response.body.error.message).toBe('Internal server error');
    });
  });

  describe('Character List View Data Structure', () => {
    it('should provide all fields needed for the character list table', async () => {
      // Create one character of each type via API
      await request(app)
        .post('/api/characters')
        .send({ name: 'WarriorTest', job: 'Warrior' })
        .expect(201);
      
      await request(app)
        .post('/api/characters')
        .send({ name: 'ThiefTest', job: 'Thief' })
        .expect(201);
      
      await request(app)
        .post('/api/characters')
        .send({ name: 'MageTest', job: 'Mage' })
        .expect(201);

      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body.data).toHaveLength(3);

      // Verify the response structure matches what the UI needs for the character list
      const expectedFields = ['id', 'name', 'job', 'status']; // Only essential fields for list view

      response.body.data.forEach((character: TestCharacterListItem) => {
        // Check that it has exactly the expected fields
        expect(Object.keys(character).sort()).toEqual(expectedFields.sort());
        
        expectedFields.forEach(field => {
          expect(character).toHaveProperty(field);
        });
      });
    });

    it('should display characters with mixed Alive/Dead statuses like in the screenshot', async () => {
      // Create characters matching the screenshot via API
      const chamness = await request(app)
        .post('/api/characters')
        .send({ name: 'Chamness', job: 'Warrior' })
        .expect(201);
      
      const aetherius = await request(app)
        .post('/api/characters')
        .send({ name: 'Aetherius', job: 'Mage' })
        .expect(201);
      
      const mera = await request(app)
        .post('/api/characters')
        .send({ name: 'Mera', job: 'Thief' })
        .expect(201);
      
      const vyncent = await request(app)
        .post('/api/characters')
        .send({ name: 'Vyncent', job: 'Warrior' })
        .expect(201);
      
      const thatetch = await request(app)
        .post('/api/characters')
        .send({ name: 'Thatetch', job: 'Warrior' })
        .expect(201);

      // Set some characters to Dead status (simulate via service since no direct API for status update)
      const container = ServiceContainer.getInstance();
      const testCharacterService = container.getCharacterService();
      await testCharacterService.updateCharacterStatus(aetherius.body.id, 'Dead');
      await testCharacterService.updateCharacterStatus(vyncent.body.id, 'Dead');
      await testCharacterService.updateCharacterStatus(thatetch.body.id, 'Dead');

      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body.data).toHaveLength(5);

      // Verify we have both Alive and Dead characters
      const aliveCharacters = response.body.data.filter((char: any) => char.status === 'Alive');
      const deadCharacters = response.body.data.filter((char: any) => char.status === 'Dead');

      expect(aliveCharacters).toHaveLength(2); // Chamness, Mera
      expect(deadCharacters).toHaveLength(3);  // Aetherius, Vyncent, Thatetch

      // Verify specific characters and their statuses match the screenshot pattern
      const champnessChar = response.body.data.find((char: any) => char.name === 'Chamness');
      const aetheriusChar = response.body.data.find((char: any) => char.name === 'Aetherius');
      const vyncentChar = response.body.data.find((char: any) => char.name === 'Vyncent');

      expect(champnessChar.status).toBe('Alive');
      expect(aetheriusChar.status).toBe('Dead');
      expect(vyncentChar.status).toBe('Dead');
    });
  });
});