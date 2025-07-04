import express from 'express';
import projectRoutes from './project.routes.js';

const router = express.Router();

// Mount routes
router.use('/projects', projectRoutes);

// Health check route
router.get('/', (req, res) => {
  res.json({ 
    message: 'API Working!', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
