import express from 'express';
import { ServiceContainer } from '../container/ServiceContainer';
import { BattleRequest } from '../models/Battle';
import { NotFoundError, ConflictError } from '../errors/CustomErrors';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody } from '../middleware/validation';
import { battleRequestSchema } from '../schemas/battleSchemas';

const router = express.Router();
const container = ServiceContainer.getInstance();
const characterService = container.getCharacterService();
const battleService = container.getBattleService();

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
router.post('/', validateBody(battleRequestSchema), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { character1Id, character2Id }: BattleRequest = req.body;

  // Get characters
  const character1 = await characterService.getCharacterById(character1Id);
  const character2 = await characterService.getCharacterById(character2Id);

  if (!character1) {
    throw new NotFoundError('Character', character1Id);
  }

  if (!character2) {
    throw new NotFoundError('Character', character2Id);
  }

  // Check if characters are alive
  if (character1.status === 'Dead') {
    throw new ConflictError(`${character1.name} is dead and cannot battle`);
  }

  if (character2.status === 'Dead') {
    throw new ConflictError(`${character2.name} is dead and cannot battle`);
  }

  // Execute battle
  const battleResult = battleService.battle(character1, character2);

  // Update character statuses and health points
  await characterService.updateCharacterStatus(battleResult.loser.character.id, 'Dead');
  await characterService.updateCharacterHealth(battleResult.loser.character.id, battleResult.loser.currentHealthPoints);
  await characterService.updateCharacterHealth(battleResult.winner.character.id, battleResult.winner.currentHealthPoints);
  
  res.json(battleResult);
}));

export default router;