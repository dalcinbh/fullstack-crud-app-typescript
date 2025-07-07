import express from 'express';
import {
  getAllTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask
} from '../controllers/task.controller.js';

const router = express.Router({ mergeParams: true });

// Task routes
// GET /projects/:projectId/tasks
router.get('/', getAllTasks);

// POST /projects/:projectId/tasks
router.post('/', createTask);

// PATCH /projects/:projectId/tasks/:taskId
router.patch('/:taskId', updateTask);

// PATCH /projects/:projectId/tasks/:taskId/complete
router.patch('/:taskId/complete', toggleTaskCompletion);

// DELETE /projects/:projectId/tasks/:taskId
router.delete('/:taskId', deleteTask);

export default router; 