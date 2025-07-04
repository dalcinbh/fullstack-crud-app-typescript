import express from 'express';
import {
  insertProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectById,
} from '../controllers/project.controller.js';
import { sendToFileProjectStorage } from '../middlewares/send-file-project.middleware.js';

const router = express.Router();

// Project routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', sendToFileProjectStorage, insertProject);
router.put('/:id', sendToFileProjectStorage, updateProject);
router.delete('/:id', deleteProject);

export default router;
