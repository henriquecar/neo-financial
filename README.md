# NEO RPG Character Management API

A backend API for managing role-playing game characters, built as part of the Neo Financial coding assignment.

## Overview

This project provides a RESTful API for character management in a role-playing game context. The system stores all data in memory and focuses on clean architecture, comprehensive testing, and clear documentation.

## Game Concepts

### Jobs (Character Classes)
Jobs are character classes that define a character's battle specialties and initial statistics. When creating a new character, players select from available jobs, which determines the character's starting stats. While stats can grow during gameplay, stat progression is not implemented in this assignment.

Available jobs with their base statistics and modifiers:

| Job | Health Points (HP) | Strength | Dexterity | Intelligence | Attack Modifier | Speed Modifier |
|-----|-------------------|----------|-----------|--------------|----------------|----------------|
| **Warrior** | 20 | 10 | 5 | 5 | 80% of strength + 20% of dexterity | 60% of dexterity + 20% of intelligence |
| **Thief** | 15 | 4 | 10 | 4 | 25% of strength + 100% of dexterity + 25% of intelligence | 80% of dexterity |
| **Mage** | 12 | 5 | 6 | 10 | 20% of strength + 20% of dexterity + 120% of intelligence | 40% of dexterity + 10% of strength |

### Character Creation
To create a new character, the following information is required:

**Name Requirements:**
- Must contain only letters (a-z, A-Z) or underscore (_) characters
- Length must be between 4 and 15 characters inclusive
- Examples: `Hero`, `Dark_Knight`, `Wizard123` (invalid - contains numbers)

**Job Requirements:**
- Must be one of the three available jobs: `Warrior`, `Thief`, or `Mage`
- Each character can only have a single job at a time

### Character Design Considerations
The character system is designed with future extensibility in mind. While not implemented in this MVP, the architecture should support:

**Planned Future Features:**
- **Leveling System**: Characters will be able to level up, causing their core attributes to change:
  - Health
  - Strength  
  - Dexterity
  - Intelligence

- **Job Changing**: Characters will be able to change their job, with calculations involving modifiers to reflect their new job:
  - Attack modifier
  - Speed modifier

## Features

- Character creation and management with job selection
- Job listing and information system
- In-memory data storage
- RESTful API endpoints
- Comprehensive unit tests
- TypeScript implementation

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode
```bash
npm run dev
```
Starts the server with hot reloading for development.

#### Production Mode
```bash
npm run build
npm start
```

### Testing

Run unit tests:
```bash
npm test
```

### Code Quality

Check TypeScript types:
```bash
npm run typecheck
```

Run linting:
```bash
npm run lint
```

## Project Structure

```
src/
├── index.ts          # Application entry point
├── routes/           # API route handlers
├── models/           # Data models and types
├── services/         # Business logic
├── middleware/       # Express middleware
└── __tests__/        # Unit tests
```

## API Documentation

*API endpoints and usage examples will be documented here as features are implemented.*

## Assignment Requirements

This project fulfills the Neo Financial coding assignment requirements:
- ✅ Backend API implementation
- ✅ In-memory state storage
- ✅ Clean, maintainable code
- ✅ Unit test coverage
- ✅ Clear documentation
- ✅ TypeScript implementation

## Development Notes

- All data is stored in memory (no database required)
- Focus on code quality and maintainability
- Comprehensive test coverage for business logic
- Clear API documentation with examples