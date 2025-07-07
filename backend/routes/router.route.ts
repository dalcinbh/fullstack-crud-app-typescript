/**
 * Main API Router
 * 
 * Central router that mounts all application routes and defines the API structure.
 * This file orchestrates the complete API by mounting specialized route modules
 * under their respective base paths, creating a hierarchical and organized API.
 * 
 * API Structure:
 * - /projects → Project management operations
 * - /projects/:projectId/tasks → Task management within project context
 * - / → Health check and API information
 */

import express from 'express';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';

const router = express.Router();

// Mount project routes under /projects base path
// Handles all project CRUD operations (GET, POST, PUT, DELETE /projects)
router.use('/projects', projectRoutes);

// Mount task routes under /projects/:projectId/tasks base path
// Handles all task operations within project context, ensuring proper task-project relationships
router.use('/projects/:projectId/tasks', taskRoutes);

// GET / → API health check and information endpoint
// Returns API status, version, and current timestamp for monitoring and debugging
router.get('/', (req, res) => {
  res.json({ 
    message: 'API Working!', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
