import { Request, Response } from 'express';
import { Project } from '../classes/project.class.js';
import { Project as ProjectInterface } from '../interfaces/project.interface.js';

/**
 * Get all projects with optional filtering
 */
export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    
    const result = await Project.getAllProjects({
      search: search as string
    });

    res.json({
      success: true,
      data: result.projects
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get a project by ID
 */
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    const result = await Project.getProjectById(Number(id));

    if (!result.exists) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.json({
      success: true,
      data: result.project
    });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a new project
 */
export const insertProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, startDate, tasks } = req.body;
    
    // Validation
    if (!name || !description || !startDate) {
      res.status(400).json({
        success: false,
        message: 'Name, description, and start date are required'
      });
      return;
    }

    const project = await Project.createProject({
      name,
      description,
      startDate: new Date(startDate),
      tasks
    });

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update an existing project
 */
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, startDate } = req.body;
    
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);

    const result = await Project.updateProject(Number(id), updateData);

    if (!result.exists) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.json({
      success: true,
      data: result.project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    const result = await Project.deleteProject(Number(id));

    if (!result.exists) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};