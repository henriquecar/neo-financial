import express from 'express';
import swaggerUi from 'swagger-ui-express';
import characterRoutes from './routes/characters';
import jobRoutes from './routes/jobs';
import battleRoutes from './routes/battle';
import swaggerSpecs from './config/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api/characters', characterRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/battle', battleRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RPG Character Management API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation available at: http://localhost:${PORT}/api-docs`);
});