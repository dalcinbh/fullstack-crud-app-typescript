/**
 * Task Routes
 * 
 * Defines HTTP routes for task-related operations within the context of projects.
 * These routes handle CRUD operations for tasks, but always require a project context
 * through the :projectId parameter. All routes include comprehensive validation to
 * ensure tasks belong to the specified project.
 * 
 * All routes use the '/projects/:projectId/tasks' base path when mounted in the main router.
 * The { mergeParams: true } option allows access to :projectId from the parent route.
 */

import express from 'express';
import {
  getAllTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask
} from '../controllers/task.controller.js';

const router = express.Router({ mergeParams: true });

// GET /projects/:projectId/tasks → Retrieves all tasks for a specific project
// Calls getAllTasks controller which validates project existence and returns tasks ordered by creation date
router.get('/', getAllTasks);

// POST /projects/:projectId/tasks → Creates a new task within the specified project
// Calls createTask controller which validates project existence and required task fields
router.post('/', createTask);

// PATCH /projects/:projectId/tasks/:taskId → Updates an existing task with partial data
// Calls updateTask controller which performs 3-step validation: project exists, task exists, task belongs to project
router.patch('/:taskId', updateTask);

// PATCH /projects/:projectId/tasks/:taskId/complete → Toggles task completion status
// Calls toggleTaskCompletion controller which switches completion status with full validation chain
router.patch('/:taskId/complete', toggleTaskCompletion);

// DELETE /projects/:projectId/tasks/:taskId → Deletes a task from the specified project
// Calls deleteTask controller which validates relationships before deletion to ensure data integrity
router.delete('/:taskId', deleteTask);

export default router; 