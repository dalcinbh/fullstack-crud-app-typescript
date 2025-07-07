/**
 * Project Routes
 * 
 * Defines HTTP routes for project-related operations. These routes handle
 * the complete CRUD (Create, Read, Update, Delete) operations for projects,
 * including listing, individual retrieval, creation, updates, and deletion.
 * 
 * All routes use the '/projects' base path when mounted in the main router.
 */

import express from 'express';
import {
  insertProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectById,
} from '../controllers/project.controller.js';

const router = express.Router();

// GET /projects → Retrieves all projects with optional search filtering
// Calls getAllProjects controller which supports text search across project names and descriptions
router.get('/', getAllProjects);

// GET /projects/:id → Retrieves a specific project by its unique ID
// Calls getProjectById controller which includes project validation and associated tasks
router.get('/:id', getProjectById);

// POST /projects → Creates a new project with required fields
// Calls insertProject controller which validates required fields and optionally creates initial tasks
router.post('/', insertProject);

// PUT /projects/:id → Updates an existing project with partial data
// Calls updateProject controller which validates project existence and updates only provided fields
router.put('/:id', updateProject);

// DELETE /projects/:id → Deletes a project and all associated tasks
// Calls deleteProject controller which validates project existence and handles cascade deletion
router.delete('/:id', deleteProject);

export default router;
