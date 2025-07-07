/**
 * Project Controller
 * 
 * Express route handlers for project-related API endpoints. This controller serves as the
 * HTTP interface layer, handling request validation, calling appropriate business logic
 * methods from the Project class, and formatting responses with proper HTTP status codes.
 * 
 * Follows the clean architecture pattern where controllers handle only HTTP concerns:
 * - Request parameter validation and parsing
 * - HTTP status code determination
 * - Response formatting with consistent JSON structure
 * - Error handling and logging
 * 
 * All business logic is delegated to the Project class methods, maintaining separation
 * of concerns and keeping controllers thin and focused on HTTP handling.
 * 
 * API Response Format:
 * - Success: { success: true, data: any, message?: string }
 * - Error: { success: false, message: string, error?: string }
 */

import { Request, Response } from 'express';
import { Project } from '../classes/project.class.js';


/**
 * GET /projects - Retrieves all projects with optional search filtering
 * 
 * Returns a paginated list of all projects ordered by creation date (newest first).
 * Supports optional text search across project names and descriptions using
 * case-insensitive partial matching.
 * 
 * @param {Request} req - Express request object
 * @param {string} [req.query.search] - Optional search term to filter projects
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with projects array or error message
 * 
 * Response Codes:
 * - 200: Success with projects array
 * - 500: Internal server error
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
 * GET /projects/:id - Retrieves a specific project by ID
 * 
 * Fetches a single project including all associated tasks. Validates that the
 * project ID is a valid number and that the project exists in the database.
 * 
 * @param {Request} req - Express request object
 * @param {string} req.params.id - Project ID as string (validated as number)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with project data or error message
 * 
 * Response Codes:
 * - 200: Success with project data
 * - 400: Invalid project ID format
 * - 404: Project not found
 * - 500: Internal server error
 */
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate project ID format
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    const result = await Project.getProjectById(Number(id));

    // Check if project exists
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
 * POST /projects - Creates a new project with optional initial tasks
 * 
 * Creates a new project record with required fields (name, description, startDate)
 * and optionally creates associated tasks in the same transaction. Validates all
 * required fields and converts startDate string to Date object.
 * 
 * @param {Request} req - Express request object
 * @param {string} req.body.name - Project name (required)
 * @param {string} req.body.description - Project description (required)
 * @param {string} req.body.startDate - Project start date as ISO string (required)
 * @param {Array<any>} [req.body.tasks] - Optional array of initial tasks to create
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with created project or error message
 * 
 * Response Codes:
 * - 201: Project created successfully
 * - 400: Missing required fields
 * - 500: Internal server error
 */
export const insertProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, startDate, tasks } = req.body;
    
    // Validate required fields
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
      startDate: new Date(startDate), // Convert string to Date
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
 * PUT /projects/:id - Updates an existing project
 * 
 * Updates project fields while preserving existing data for fields not provided.
 * Validates project ID format and existence before performing update. Only updates
 * fields that are provided in the request body.
 * 
 * @param {Request} req - Express request object
 * @param {string} req.params.id - Project ID as string (validated as number)
 * @param {string} [req.body.name] - New project name (optional)
 * @param {string} [req.body.description] - New project description (optional)
 * @param {string} [req.body.startDate] - New start date as ISO string (optional)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with updated project or error message
 * 
 * Response Codes:
 * - 200: Project updated successfully
 * - 400: Invalid project ID format
 * - 404: Project not found
 * - 500: Internal server error
 */
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, startDate } = req.body;
    
    // Validate project ID format
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);

    const result = await Project.updateProject(Number(id), updateData);

    // Check if project exists
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
 * DELETE /projects/:id - Deletes a project and all associated tasks
 * 
 * Removes a project from the database including all associated tasks (cascade delete).
 * Validates project ID format and existence before performing deletion. The database
 * schema handles cascade deletion of tasks automatically.
 * 
 * @param {Request} req - Express request object
 * @param {string} req.params.id - Project ID as string (validated as number)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with success message or error
 * 
 * Response Codes:
 * - 200: Project deleted successfully
 * - 400: Invalid project ID format
 * - 404: Project not found
 * - 500: Internal server error
 */
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate project ID format
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    const result = await Project.deleteProject(Number(id));

    // Check if project exists
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