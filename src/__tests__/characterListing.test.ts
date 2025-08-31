import request from 'supertest';
import express from 'express';
import characterRoutes from '../routes/characters';
import characterService from '../services/CharacterService';

const app = express();
app.use(express.json());
app.use('/api/characters', characterRoutes);

describe('Character Listing API', () => {
  beforeEach(() => {
    // Clear all characters before each test
    const characters = characterService.getAllCharacters();
    characters.forEach((char: any) => characterService.deleteCharacter(char.id));
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
      // Create multiple characters with different jobs
      const warrior = characterService.createCharacter('Chamness', 'Warrior');
      const mage = characterService.createCharacter('Aetherius', 'Mage');
      const thief = characterService.createCharacter('Mera', 'Thief');

      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(3);
      
      // Verify it contains all required fields for the list view
      response.body.data.forEach((character: any) => {
        expect(character).toHaveProperty('id');
        expect(character).toHaveProperty('name');
        expect(character).toHaveProperty('job');
        expect(character).toHaveProperty('status');
        expect(character.status).toBe('Alive'); // All new characters should be alive
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

      const createdCharacters = characters.map(char => 
        characterService.createCharacter(char.name, char.job)
      );

      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body.data).toHaveLength(8);

      // Verify each character has the required structure for the list view
      response.body.data.forEach((character: any) => {
        expect(character).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          job: expect.stringMatching(/^(Warrior|Thief|Mage)$/),
          status: 'Alive',
          healthPoints: expect.any(Number),
          strength: expect.any(Number),
          dexterity: expect.any(Number),
          intelligence: expect.any(Number),
          attackModifier: expect.any(Number),
          speedModifier: expect.any(Number)
        });
      });
    });
  });

  describe('GET /api/characters/:id', () => {
    it('should return character details by ID', async () => {
      const character = characterService.createCharacter('TestHero', 'Warrior');

      const response = await request(app)
        .get(`/api/characters/${character.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: character.id,
        name: 'TestHero',
        job: 'Warrior',
        status: 'Alive',
        healthPoints: 20,
        strength: 10,
        dexterity: 5,
        intelligence: 5,
        attackModifier: 9,
        speedModifier: 4
      });
    });

    it('should return 404 for non-existent character', async () => {
      const response = await request(app)
        .get('/api/characters/non-existent-id')
        .expect(404);

      expect(response.body).toEqual({ error: 'Character not found' });
    });

    it('should handle server errors gracefully', async () => {
      // Mock service to throw error
      jest.spyOn(characterService, 'getCharacterById').mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const response = await request(app)
        .get('/api/characters/test-id')
        .expect(500);

      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Character List View Data Structure', () => {
    it('should provide all fields needed for the character list table', async () => {
      // Create one character of each type
      characterService.createCharacter('WarriorTest', 'Warrior');
      characterService.createCharacter('ThiefTest', 'Thief');  
      characterService.createCharacter('MageTest', 'Mage');

      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body.data).toHaveLength(3);

      // Verify the response structure matches what the UI needs
      const expectedFields = [
        'id',           // For details link
        'name',         // Character Name column
        'job',          // Job column  
        'status',       // Status column (Alive/Dead)
        'healthPoints', // For details view
        'strength',     // For details view
        'dexterity',    // For details view
        'intelligence', // For details view
        'attackModifier', // For details view
        'speedModifier'   // For details view
      ];

      response.body.data.forEach((character: any) => {
        expectedFields.forEach(field => {
          expect(character).toHaveProperty(field);
        });
      });
    });

    it('should display characters with mixed Alive/Dead statuses like in the screenshot', async () => {
      // Create characters matching the screenshot
      const chamness = characterService.createCharacter('Chamness', 'Warrior');
      const aetherius = characterService.createCharacter('Aetherius', 'Mage');
      const mera = characterService.createCharacter('Mera', 'Thief');
      const vyncent = characterService.createCharacter('Vyncent', 'Warrior');
      const thatetch = characterService.createCharacter('Thatetch', 'Warrior');

      // Set some characters to Dead status (like in the screenshot)
      characterService.updateCharacterStatus(aetherius.id, 'Dead');
      characterService.updateCharacterStatus(vyncent.id, 'Dead');
      characterService.updateCharacterStatus(thatetch.id, 'Dead');

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