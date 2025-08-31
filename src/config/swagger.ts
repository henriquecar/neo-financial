import swaggerJsdoc from 'swagger-jsdoc';
import { ConfigService } from './config';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NEO RPG Character Management API',
      version: '1.0.0',
      description: 'A RESTful API for managing role-playing game characters',
    },
    servers: [
      {
        url: `http://localhost:${ConfigService.PORT}/api/${ConfigService.API_VERSION}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Character: {
          type: 'object',
          required: ['id', 'name', 'job', 'status', 'maxHealthPoints', 'strength', 'dexterity', 'intelligence', 'attackModifier', 'speedModifier'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the character',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: {
              type: 'string',
              description: 'Character name (4-15 characters, letters and underscores only)',
              minLength: 4,
              maxLength: 15,
              pattern: '^[a-zA-Z_]+$',
              example: 'Dark_Knight'
            },
            job: {
              type: 'string',
              enum: ['Warrior', 'Thief', 'Mage'],
              description: 'Character class/job',
              example: 'Warrior'
            },
            status: {
              type: 'string',
              enum: ['Alive', 'Dead'],
              description: 'Character status',
              example: 'Alive'
            },
            maxHealthPoints: {
              type: 'number',
              description: 'Character maximum health points',
              example: 20
            },
            strength: {
              type: 'number',
              description: 'Character strength attribute',
              example: 10
            },
            dexterity: {
              type: 'number',
              description: 'Character dexterity attribute',
              example: 5
            },
            intelligence: {
              type: 'number',
              description: 'Character intelligence attribute',
              example: 5
            },
            attackModifier: {
              type: 'number',
              description: 'Calculated attack modifier based on job and stats',
              example: 9
            },
            speedModifier: {
              type: 'number',
              description: 'Calculated speed modifier based on job and stats',
              example: 4
            }
          }
        },
        Job: {
          type: 'object',
          required: ['name', 'maxHealthPoints', 'strength', 'dexterity', 'intelligence', 'attackFormula', 'speedFormula'],
          properties: {
            name: {
              type: 'string',
              enum: ['Warrior', 'Thief', 'Mage'],
              description: 'Job name',
              example: 'Warrior'
            },
            maxHealthPoints: {
              type: 'number',
              description: 'Base health points for this job',
              example: 20
            },
            strength: {
              type: 'number',
              description: 'Base strength for this job',
              example: 10
            },
            dexterity: {
              type: 'number',
              description: 'Base dexterity for this job',
              example: 5
            },
            intelligence: {
              type: 'number',
              description: 'Base intelligence for this job',
              example: 5
            },
            attackFormula: {
              type: 'string',
              description: 'Formula for calculating attack modifier',
              example: '80% of Strength + 20% of Dexterity'
            },
            speedFormula: {
              type: 'string',
              description: 'Formula for calculating speed modifier',
              example: '60% of Dexterity + 20% of Intelligence'
            }
          }
        },
        CreateCharacterRequest: {
          type: 'object',
          required: ['name', 'job'],
          properties: {
            name: {
              type: 'string',
              description: 'Character name (4-15 characters, letters and underscores only)',
              minLength: 4,
              maxLength: 15,
              pattern: '^[a-zA-Z_]+$',
              example: 'Hero_Knight'
            },
            job: {
              type: 'string',
              enum: ['Warrior', 'Thief', 'Mage'],
              description: 'Character class/job',
              example: 'Warrior'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Validation failed'
            },
            details: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Name must be between 4 and 15 characters inclusive']
            }
          }
        },
        CharacterListItem: {
          type: 'object',
          required: ['id', 'name', 'job', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the character',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: {
              type: 'string',
              description: 'Character name',
              example: 'Dark_Knight'
            },
            job: {
              type: 'string',
              enum: ['Warrior', 'Thief', 'Mage'],
              description: 'Character class/job',
              example: 'Warrior'
            },
            status: {
              type: 'string',
              enum: ['Alive', 'Dead'],
              description: 'Character status',
              example: 'Alive'
            }
          }
        },
        PaginatedCharacters: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CharacterListItem'
              },
              description: 'Array of character summary items for the current page'
            },
            pagination: {
              $ref: '#/components/schemas/PaginationInfo'
            }
          }
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'number',
              description: 'Current page number',
              example: 1
            },
            totalPages: {
              type: 'number',
              description: 'Total number of pages',
              example: 5
            },
            totalItems: {
              type: 'number',
              description: 'Total number of items',
              example: 42
            },
            itemsPerPage: {
              type: 'number',
              description: 'Number of items per page',
              example: 10
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Whether there is a next page',
              example: true
            },
            hasPreviousPage: {
              type: 'boolean',
              description: 'Whether there is a previous page',
              example: false
            }
          }
        },
        BattleModifiers: {
          type: 'object',
          properties: {
            attack: {
              type: 'number',
              description: 'Calculated attack modifier based on job and stats',
              example: 9
            },
            speed: {
              type: 'number', 
              description: 'Calculated speed modifier based on job and stats',
              example: 4
            }
          }
        },
        CharacterDetail: {
          type: 'object',
          required: ['id', 'name', 'job', 'status', 'maxHealthPoints', 'currentHealthPoints', 'battleModifiers'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the character',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: {
              type: 'string',
              description: 'Character name',
              example: 'Dark_Knight'
            },
            job: {
              type: 'string',
              enum: ['Warrior', 'Thief', 'Mage'],
              description: 'Character class/job',
              example: 'Warrior'
            },
            status: {
              type: 'string',
              enum: ['Alive', 'Dead'],
              description: 'Character status',
              example: 'Alive'
            },
            maxHealthPoints: {
              type: 'number',
              description: 'Maximum life points for the character',
              example: 20
            },
            currentHealthPoints: {
              type: 'number',
              description: 'Current life points for the character',
              example: 15
            },
            battleModifiers: {
              $ref: '#/components/schemas/BattleModifiers'
            }
          }
        },
        BattleRequest: {
          type: 'object',
          required: ['character1Id', 'character2Id'],
          properties: {
            character1Id: {
              type: 'string',
              description: 'ID of the first character',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            character2Id: {
              type: 'string',
              description: 'ID of the second character',
              example: '987f6543-e21c-34b5-a789-123456789012'
            }
          }
        },
        BattleParticipant: {
          type: 'object',
          properties: {
            character: {
              $ref: '#/components/schemas/Character'
            },
            currentHealthPoints: {
              type: 'number',
              description: 'Current health points during battle',
              example: 15
            }
          }
        },
        BattleTurn: {
          type: 'object',
          properties: {
            attacker: {
              $ref: '#/components/schemas/BattleParticipant'
            },
            defender: {
              $ref: '#/components/schemas/BattleParticipant'
            },
            damage: {
              type: 'number',
              description: 'Damage dealt in this turn',
              example: 8
            },
            defenderRemainingHP: {
              type: 'number',
              description: 'Defender health points after taking damage',
              example: 12
            }
          }
        },
        BattleRound: {
          type: 'object',
          properties: {
            roundNumber: {
              type: 'number',
              description: 'Round number in the battle',
              example: 1
            },
            firstPlayer: {
              $ref: '#/components/schemas/BattleParticipant'
            },
            secondPlayer: {
              $ref: '#/components/schemas/BattleParticipant'
            },
            firstPlayerSpeed: {
              type: 'number',
              description: 'Speed roll of the first player',
              example: 7
            },
            secondPlayerSpeed: {
              type: 'number',
              description: 'Speed roll of the second player',
              example: 3
            },
            turns: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/BattleTurn'
              },
              description: 'All turns in this round'
            },
            roundEnded: {
              type: 'boolean',
              description: 'Whether the round ended',
              example: true
            }
          }
        },
        BattleResult: {
          type: 'object',
          properties: {
            winner: {
              $ref: '#/components/schemas/BattleParticipant'
            },
            loser: {
              $ref: '#/components/schemas/BattleParticipant'
            },
            rounds: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/BattleRound'
              },
              description: 'All rounds in the battle'
            },
            battleLog: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Detailed battle log messages',
              example: [
                "Battle between Hero (Warrior) - 20 HP and Mage (Mage) - 12 HP begins!",
                "Hero 5 speed was faster than Mage 3 speed and will begin this round.",
                "Hero attacks Mage for 8, Mage has 4 HP remaining.",
                "Mage attacks Hero for 6, Hero has 14 HP remaining.",
                "Hero 7 speed was faster than Mage 2 speed and will begin this round.",
                "Hero attacks Mage for 4, Mage has 0 HP remaining.",
                "Hero wins the battle! Hero still has 14 HP remaining!"
              ]
            },
            totalRounds: {
              type: 'number',
              description: 'Total number of rounds in the battle',
              example: 2
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Internal server error'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

export default specs;