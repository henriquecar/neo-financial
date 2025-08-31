import express from 'express';
import { JOB_BASE_STATS, JobType } from '../models/Character';

const router = express.Router();

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all available jobs
 *     description: Retrieve information about all available character jobs/classes with their base stats and modifier formulas
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of all available jobs with their stats and formulas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => {
  try {
    const jobs = Object.keys(JOB_BASE_STATS).map(jobName => {
      const job = jobName as JobType;
      const stats = JOB_BASE_STATS[job];
      
      // Define modifier formulas for display
      const modifierFormulas = {
        Warrior: {
          attack: "80% of Strength + 20% of Dexterity",
          speed: "60% of Dexterity + 20% of Intelligence"
        },
        Thief: {
          attack: "25% of Strength + 100% of Dexterity + 25% of Intelligence",
          speed: "80% of Dexterity"
        },
        Mage: {
          attack: "20% of Strength + 20% of Dexterity + 120% of Intelligence", 
          speed: "40% of Dexterity + 10% of Strength"
        }
      };
      
      return {
        name: job,
        healthPoints: stats.healthPoints,
        strength: stats.strength,
        dexterity: stats.dexterity,
        intelligence: stats.intelligence,
        attackFormula: modifierFormulas[job].attack,
        speedFormula: modifierFormulas[job].speed
      };
    });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;