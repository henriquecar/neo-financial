import swaggerJsdoc from 'swagger-jsdoc';

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
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Character: {
          type: 'object',
          required: ['id', 'name', 'job', 'status', 'healthPoints', 'strength', 'dexterity', 'intelligence', 'attackModifier', 'speedModifier'],
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
            healthPoints: {
              type: 'number',
              description: 'Character health points',
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
          required: ['name', 'healthPoints', 'strength', 'dexterity', 'intelligence', 'attackFormula', 'speedFormula'],
          properties: {
            name: {
              type: 'string',
              enum: ['Warrior', 'Thief', 'Mage'],
              description: 'Job name',
              example: 'Warrior'
            },
            healthPoints: {
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