import express from 'express';
import characterService from '../services/CharacterService';
import { validateCharacterCreation } from '../utils/validation';
import { JobType } from '../models/Character';

const router = express.Router();

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Get all characters
 *     description: Retrieve a list of all characters with their name, job, and status (alive/dead)
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: List of all characters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Character'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => {
  try {
    const characters = characterService.getAllCharacters();
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /characters/{id}:
 *   get:
 *     summary: Get character by ID
 *     description: Retrieve detailed information about a specific character
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
 *         description: Character details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
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
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const character = characterService.getCharacterById(id);
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
router.post('/', (req, res) => {
  try {
    const { name, job } = req.body;

    const validation = validateCharacterCreation(name, job);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }

    const character = characterService.createCharacter(name, job as JobType);
    res.status(201).json(character);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;