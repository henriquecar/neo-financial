import express from 'express';
import swaggerUi from 'swagger-ui-express';
import characterRoutes from './routes/characters';
import jobRoutes from './routes/jobs';
import battleRoutes from './routes/battle';
import swaggerSpecs from './config/swagger';
import { configureSecurity } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';
import { ConfigService } from './config/config';

const app = express();

// Security middleware
configureSecurity(app);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// API routes with versioning
const API_BASE = `/api/${ConfigService.API_VERSION}`;
app.use(`${API_BASE}/characters`, characterRoutes);
app.use(`${API_BASE}/jobs`, jobRoutes);
app.use(`${API_BASE}/battle`, battleRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RPG Character Management API is running',
    version: ConfigService.API_VERSION,
    environment: ConfigService.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found',
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
});

const PORT = ConfigService.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${ConfigService.NODE_ENV}`);
  console.log(`API Version: ${ConfigService.API_VERSION}`);
  console.log(`API Documentation available at: http://localhost:${PORT}/api-docs`);
});