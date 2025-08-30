# RPG Character Management API

A backend API for managing role-playing game characters, built as part of the Neo Financial coding assignment.

## Overview

This project provides a RESTful API for character management in a role-playing game context. The system stores all data in memory and focuses on clean architecture, comprehensive testing, and clear documentation.

## Features

- Character creation and management
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