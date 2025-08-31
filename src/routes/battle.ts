import express from 'express';
import battleService from '../services/BattleService';
import characterService from '../services/CharacterService';
import { BattleRequest } from '../models/Battle';

const router = express.Router();

/**
 * @swagger
 * /battle:
 *   post:
 *     summary: Start a battle between two characters
 *     description: Initiates a battle between two characters and returns the complete battle result with log
 *     tags: [Battle]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BattleRequest'
 *           examples:
 *             battle:
 *               summary: Battle between two characters
 *               value:
 *                 character1Id: "123e4567-e89b-12d3-a456-426614174000"
 *                 character2Id: "987f6543-e21c-34b5-a789-123456789012"
 *     responses:
 *       200:
 *         description: Battle completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BattleResult'
 *       400:
 *         description: Invalid request (characters not found or same character)
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
router.post('/', (req, res) => {
  try {
    const { character1Id, character2Id }: BattleRequest = req.body;

    // Validation
    if (!character1Id || !character2Id) {
      return res.status(400).json({ 
        error: 'Both character1Id and character2Id are required' 
      });
    }

    if (character1Id === character2Id) {
      return res.status(400).json({ 
        error: 'A character cannot battle against itself' 
      });
    }

    // Get characters
    const character1 = characterService.getCharacterById(character1Id);
    const character2 = characterService.getCharacterById(character2Id);

    if (!character1) {
      return res.status(400).json({ 
        error: `Character with id ${character1Id} not found` 
      });
    }

    if (!character2) {
      return res.status(400).json({ 
        error: `Character with id ${character2Id} not found` 
      });
    }

    // Check if characters are alive
    if (character1.status === 'Dead') {
      return res.status(400).json({ 
        error: `${character1.name} is dead and cannot battle` 
      });
    }

    if (character2.status === 'Dead') {
      return res.status(400).json({ 
        error: `${character2.name} is dead and cannot battle` 
      });
    }

    // Execute battle
    const battleResult = battleService.battle(character1, character2);

    // Update character statuses and health points
    characterService.updateCharacterStatus(battleResult.loser.character.id, 'Dead');
    characterService.updateCharacterHealth(battleResult.loser.character.id, battleResult.loser.currentHealthPoints);
    characterService.updateCharacterHealth(battleResult.winner.character.id, battleResult.winner.currentHealthPoints);
    
    res.json(battleResult);
  } catch (error) {
    console.error('Error during battle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;