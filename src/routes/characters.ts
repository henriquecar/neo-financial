import express from 'express';
import characterService from '../services/CharacterService';
import { validateCharacterCreation } from '../utils/validation';
import { JobType } from '../models/Character';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const characters = characterService.getAllCharacters();
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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