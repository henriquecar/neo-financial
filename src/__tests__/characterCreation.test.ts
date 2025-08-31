import request from 'supertest';
import express from 'express';
import characterRoutes from '../routes/characters';
import jobRoutes from '../routes/jobs';
import characterService from '../services/CharacterService';

const app = express();
app.use(express.json());
app.use('/api/characters', characterRoutes);
app.use('/api/jobs', jobRoutes);

describe('Character Creation API', () => {
  beforeEach(() => {
    // Clear all characters before each test
    const characters = characterService.getAllCharacters();
    characters.forEach((char: any) => characterService.deleteCharacter(char.id));
  });

  describe('POST /api/characters', () => {
    it('should create a valid Warrior character', async () => {
      const characterData = {
        name: 'TestHero',
        job: 'Warrior'
      };

      const response = await request(app)
        .post('/api/characters')
        .send(characterData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'TestHero',
        job: 'Warrior',
        status: 'Alive',
        healthPoints: 20,
        strength: 10,
        dexterity: 5,
        intelligence: 5,
        attackModifier: 9, // 80% of 10 + 20% of 5 = 8 + 1 = 9
        speedModifier: 4   // 60% of 5 + 20% of 5 = 3 + 1 = 4
      });
      expect(response.body.id).toBeDefined();
    });

    it('should create a valid Thief character', async () => {
      const characterData = {
        name: 'SneakyRogue',
        job: 'Thief'
      };

      const response = await request(app)
        .post('/api/characters')
        .send(characterData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'SneakyRogue',
        job: 'Thief',
        status: 'Alive',
        healthPoints: 15,
        strength: 4,
        dexterity: 10,
        intelligence: 4,
        attackModifier: 12, // 25% of 4 + 100% of 10 + 25% of 4 = 1 + 10 + 1 = 12
        speedModifier: 8    // 80% of 10 = 8
      });
    });

    it('should create a valid Mage character', async () => {
      const characterData = {
        name: 'WiseWizard',
        job: 'Mage'
      };

      const response = await request(app)
        .post('/api/characters')
        .send(characterData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'WiseWizard',
        job: 'Mage',
        status: 'Alive',
        healthPoints: 12,
        strength: 5,
        dexterity: 6,
        intelligence: 10,
        attackModifier: 14, // 20% of 5 + 20% of 6 + 120% of 10 = 1 + 1.2 + 12 = 14.2 -> 14
        speedModifier: 3    // 40% of 6 + 10% of 5 = 2.4 + 0.5 = 2.9 -> 3
      });
    });

    it('should reject character with name too short', async () => {
      const characterData = {
        name: 'Bob',
        job: 'Warrior'
      };

      const response = await request(app)
        .post('/api/characters')
        .send(characterData)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Validation failed',
        details: ['Name must be between 4 and 15 characters inclusive']
      });
    });

    it('should reject character with name too long', async () => {
      const characterData = {
        name: 'ThisNameIsTooLongForACharacter',
        job: 'Warrior'
      };

      const response = await request(app)
        .post('/api/characters')
        .send(characterData)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Validation failed',
        details: ['Name must be between 4 and 15 characters inclusive']
      });
    });

    it('should reject character with invalid name characters', async () => {
      const characterData = {
        name: 'Hero123',
        job: 'Warrior'
      };

      const response = await request(app)
        .post('/api/characters')
        .send(characterData)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Validation failed',
        details: ['Name must contain only letters (a-z, A-Z) or underscore (_) characters']
      });
    });

    it('should accept character name with underscores', async () => {
      const characterData = {
        name: 'Dark_Knight',
        job: 'Warrior'
      };

      const response = await request(app)
        .post('/api/characters')
        .send(characterData)
        .expect(201);

      expect(response.body.name).toBe('Dark_Knight');
    });

    it('should reject character with invalid job', async () => {
      const characterData = {
        name: 'TestHero',
        job: 'Paladin'
      };

      const response = await request(app)
        .post('/api/characters')
        .send(characterData)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Validation failed',
        details: ['Job must be one of: Warrior, Thief, Mage']
      });
    });

    it('should reject character with missing name', async () => {
      const characterData = {
        job: 'Warrior'
      };

      const response = await request(app)
        .post('/api/characters')
        .send(characterData)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Validation failed',
        details: ['Name is required']
      });
    });

    it('should reject character with missing job', async () => {
      const characterData = {
        name: 'TestHero'
      };

      const response = await request(app)
        .post('/api/characters')
        .send(characterData)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Validation failed',
        details: ['Job is required']
      });
    });
  });

  describe('GET /api/jobs', () => {
    it('should return all available jobs with their stats and modifier formulas', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body).toEqual(
        expect.arrayContaining([
          {
            name: 'Warrior',
            healthPoints: 20,
            strength: 10,
            dexterity: 5,
            intelligence: 5,
            attackFormula: "80% of Strength + 20% of Dexterity",
            speedFormula: "60% of Dexterity + 20% of Intelligence"
          },
          {
            name: 'Thief',
            healthPoints: 15,
            strength: 4,
            dexterity: 10,
            intelligence: 4,
            attackFormula: "25% of Strength + 100% of Dexterity + 25% of Intelligence",
            speedFormula: "80% of Dexterity"
          },
          {
            name: 'Mage',
            healthPoints: 12,
            strength: 5,
            dexterity: 6,
            intelligence: 10,
            attackFormula: "20% of Strength + 20% of Dexterity + 120% of Intelligence",
            speedFormula: "40% of Dexterity + 10% of Strength"
          }
        ])
      );
    });
  });
});