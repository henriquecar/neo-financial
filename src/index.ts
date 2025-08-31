import express from 'express';
import characterRoutes from './routes/characters';
import jobRoutes from './routes/jobs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/characters', characterRoutes);
app.use('/api/jobs', jobRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RPG Character Management API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});