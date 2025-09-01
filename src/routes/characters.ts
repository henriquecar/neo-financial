import express from 'express';
import { ServiceContainer } from '../container/ServiceContainer';
import { mapToCharacterDetail } from '../types/characterDetail';
import { JobType } from '../models/Character';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../errors/CustomErrors';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import {
  createCharacterSchema,
  paginationSchema,
  characterIdParamsSchema,
} from '../schemas/characterSchemas';

const router = express.Router();

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Get characters with pagination
 *     description: Retrieve a paginated list of characters with essential fields only (id, name, job, status). Use GET /characters/{id} for full character details.
 *     tags: [Characters]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (starts from 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of characters per page (max 100)
 *     responses:
 *       200:
 *         description: Paginated list of characters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCharacters'
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    // Parse pagination parameters from query string
    const { parsePaginationParams } = await import('../utils/pagination');
    const paginationQuery = parsePaginationParams(req.query);

    const container = ServiceContainer.getInstance();
    const characterService = container.getCharacterService();
    const result = await characterService.getCharactersPaginated(paginationQuery);
    res.json(result);
  })
);

/**
 * @swagger
 * /characters/{id}:
 *   get:
 *     summary: Get character by ID
 *     description: Retrieve detailed information about a specific character including health and battle modifiers. Base stats (strength, dexterity, intelligence) are aggregated into battle modifiers.
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Character ID
 *     responses:
 *       200:
 *         description: Character details with battle modifiers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharacterDetail'
 *       404:
 *         description: Character not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  validateParams(characterIdParamsSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const container = ServiceContainer.getInstance();
    const characterService = container.getCharacterService();
    const character = await characterService.getCharacterById(id);

    if (!character) {
      throw new NotFoundError('Character', id);
    }

    // Transform to character detail format with battleModifiers
    const characterDetail = mapToCharacterDetail(character);
    res.json(characterDetail);
  })
);

/**
 * @swagger
 * /characters:
 *   post:
 *     summary: Create a new character
 *     description: Create a new character with specified name and job. Character stats are automatically calculated based on the job.
 *     tags: [Characters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCharacterRequest'
 *           examples:
 *             warrior:
 *               summary: Create a Warrior
 *               value:
 *                 name: "Hero_Knight"
 *                 job: "Warrior"
 *             thief:
 *               summary: Create a Thief
 *               value:
 *                 name: "Shadow_Rogue"
 *                 job: "Thief"
 *             mage:
 *               summary: Create a Mage
 *               value:
 *                 name: "Wise_Wizard"
 *                 job: "Mage"
 *     responses:
 *       201:
 *         description: Character created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  validateBody(createCharacterSchema),
  asyncHandler(async (req, res) => {
    const { name, job } = req.body;
    const container = ServiceContainer.getInstance();
    const characterService = container.getCharacterService();
    const character = await characterService.createCharacter(name, job as JobType);
    res.status(201).json(character);
  })
);

export default router;
