import request from 'supertest';
import express from 'express';
import characterRoutes from '../routes/characters';
import characterService from '../services/CharacterService';
import { parsePaginationParams } from '../utils/pagination';

const app = express();
app.use(express.json());
app.use('/api/characters', characterRoutes);

describe('Pagination', () => {
  beforeEach(() => {
    // Clear all characters before each test
    const characters = characterService.getAllCharacters();
    characters.forEach((char: any) => characterService.deleteCharacter(char.id));
  });

  describe('parsePaginationParams utility', () => {
    it('should return default values for empty query', () => {
      const result = parsePaginationParams({});
      
      expect(result).toEqual({
        page: 1,
        limit: 10,
        offset: 0
      });
    });

    it('should parse valid pagination parameters', () => {
      const result = parsePaginationParams({
        page: '3',
        limit: '20'
      });
      
      expect(result).toEqual({
        page: 3,
        limit: 20,
        offset: 40 // (3-1) * 20
      });
    });

    it('should handle invalid page numbers', () => {
      const result = parsePaginationParams({
        page: '0',
        limit: '5'
      });
      
      expect(result).toEqual({
        page: 1, // Should default to 1
        limit: 5,
        offset: 0
      });
    });

    it('should enforce maximum limit', () => {
      const result = parsePaginationParams({
        page: '1',
        limit: '200' // Over the max limit of 100
      });
      
      expect(result).toEqual({
        page: 1,
        limit: 100, // Should be capped at 100
        offset: 0
      });
    });

    it('should handle non-numeric values', () => {
      const result = parsePaginationParams({
        page: 'invalid',
        limit: 'also-invalid'
      });
      
      expect(result).toEqual({
        page: 1,
        limit: 10,
        offset: 0
      });
    });
  });

  describe('GET /api/characters with pagination', () => {
    beforeEach(async () => {
      // Create 25 test characters for pagination testing
      for (let i = 1; i <= 25; i++) {
        const job = i % 3 === 0 ? 'Mage' : i % 2 === 0 ? 'Thief' : 'Warrior';
        characterService.createCharacter(`Character_${i.toString().padStart(2, '0')}`, job as any);
      }
    });

    it('should return paginated results with default parameters', async () => {
      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      
      const { data, pagination } = response.body;
      
      expect(data).toHaveLength(10); // Default limit
      expect(pagination).toEqual({
        currentPage: 1,
        totalPages: 3, // 25 characters / 10 per page = 3 pages
        totalItems: 25,
        itemsPerPage: 10,
        hasNextPage: true,
        hasPreviousPage: false
      });
    });

    it('should return specific page with custom limit', async () => {
      const response = await request(app)
        .get('/api/characters?page=2&limit=8')
        .expect(200);

      const { data, pagination } = response.body;
      
      expect(data).toHaveLength(8);
      expect(pagination).toEqual({
        currentPage: 2,
        totalPages: 4, // 25 characters / 8 per page = 4 pages (rounded up)
        totalItems: 25,
        itemsPerPage: 8,
        hasNextPage: true,
        hasPreviousPage: true
      });
    });

    it('should handle last page correctly', async () => {
      const response = await request(app)
        .get('/api/characters?page=3&limit=10')
        .expect(200);

      const { data, pagination } = response.body;
      
      expect(data).toHaveLength(5); // Only 5 characters left on last page
      expect(pagination).toEqual({
        currentPage: 3,
        totalPages: 3,
        totalItems: 25,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: true
      });
    });

    it('should return empty data for page beyond total pages', async () => {
      const response = await request(app)
        .get('/api/characters?page=10&limit=10')
        .expect(200);

      const { data, pagination } = response.body;
      
      expect(data).toHaveLength(0);
      expect(pagination).toEqual({
        currentPage: 10,
        totalPages: 3,
        totalItems: 25,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: true
      });
    });

    it('should handle single character per page', async () => {
      const response = await request(app)
        .get('/api/characters?page=5&limit=1')
        .expect(200);

      const { data, pagination } = response.body;
      
      expect(data).toHaveLength(1);
      expect(pagination).toEqual({
        currentPage: 5,
        totalPages: 25, // 25 characters / 1 per page = 25 pages
        totalItems: 25,
        itemsPerPage: 1,
        hasNextPage: true,
        hasPreviousPage: true
      });
    });

    it('should handle edge case with no characters', async () => {
      // Clear all characters
      const characters = characterService.getAllCharacters();
      characters.forEach((char: any) => characterService.deleteCharacter(char.id));

      const response = await request(app)
        .get('/api/characters?page=1&limit=10')
        .expect(200);

      const { data, pagination } = response.body;
      
      expect(data).toHaveLength(0);
      expect(pagination).toEqual({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false
      });
    });

    it('should enforce maximum limit of 100', async () => {
      const response = await request(app)
        .get('/api/characters?limit=150') // Request more than max
        .expect(200);

      const { pagination } = response.body;
      
      expect(pagination.itemsPerPage).toBe(100); // Should be capped at 100
    });

    it('should handle invalid pagination parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/characters?page=invalid&limit=also-invalid')
        .expect(200);

      const { data, pagination } = response.body;
      
      // Should use defaults
      expect(data).toHaveLength(10);
      expect(pagination.currentPage).toBe(1);
      expect(pagination.itemsPerPage).toBe(10);
    });

    it('should maintain character data structure in paginated response', async () => {
      const response = await request(app)
        .get('/api/characters?page=1&limit=5')
        .expect(200);

      const { data } = response.body;
      
      expect(data).toHaveLength(5);
      
      // Verify each character has the expected structure
      data.forEach((character: any) => {
        expect(character).toHaveProperty('id');
        expect(character).toHaveProperty('name');
        expect(character).toHaveProperty('job');
        expect(character).toHaveProperty('status');
        expect(character).toHaveProperty('healthPoints');
        expect(character).toHaveProperty('strength');
        expect(character).toHaveProperty('dexterity');
        expect(character).toHaveProperty('intelligence');
        expect(character).toHaveProperty('attackModifier');
        expect(character).toHaveProperty('speedModifier');
      });
    });
  });
});