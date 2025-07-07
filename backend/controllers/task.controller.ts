/**
 * Task Controller
 * 
 * Express route handlers for task-related API endpoints within the context of projects.
 * This controller serves as the HTTP interface layer, handling request validation,
 * calling appropriate business logic methods from the Task class, and formatting
 * responses with proper HTTP status codes.
 * 
 * Follows the clean architecture pattern with comprehensive validation chains:
 * - Request parameter validation and parsing
 * - Multi-level validation (project exists, task exists, task belongs to project)
 * - HTTP status code determination based on validation results
 * - Response formatting with consistent JSON structure
 * - Error handling and logging
 * 
 * All business logic is delegated to the Task class methods, maintaining separation
 * of concerns. The controller handles complex validation scenarios including:
 * - Project existence validation
 * - Task existence validation  
 * - Task-project relationship validation
 * - Appropriate HTTP status codes for each validation failure
 * 
 * API Response Format:
 * - Success: { success: true, data: any, message?: string }
 * - Error: { success: false, message: string, error?: string }
 * 
 * Task operations follow RESTful patterns within project context:
 * - GET /projects/:projectId/tasks - List project tasks
 * - POST /projects/:projectId/tasks - Create task in project
 * - PUT /projects/:projectId/tasks/:taskId - Update task
 * - DELETE /projects/:projectId/tasks/:taskId - Delete task
 */

import { Request, Response } from 'express';
import { Task } from '../interfaces/task.interface.js';
import { Task as TaskClass } from '../classes/task.class.js';

/**
 * GET /projects/:projectId/tasks - Retrieves all tasks for a specific project
 * 
 * Returns all tasks belonging to a project ordered by creation date (newest first).
 * Validates that the project exists before fetching tasks. This ensures users
 * cannot access tasks for non-existent projects.
 * 
 * @param {Request} req - Express request object
 * @param {string} req.params.projectId - Project ID as string (validated as number)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with tasks array or error message
 * 
 * Response Codes:
 * - 200: Success with tasks array
 * - 400: Invalid project ID format
 * - 404: Project not found
 * - 500: Internal server error
 */
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    
    if (!projectId || isNaN(Number(projectId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    const result = await TaskClass.getTasksByProjectId(Number(projectId));

    if (!result.projectExists) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.json({
      success: true,
      data: result.tasks
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tasks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * POST /projects/:projectId/tasks - Creates a new task for a specific project
 * 
 * Creates a task record associated with a project. Validates that required fields
 * are provided (title, description, dueDate) and that the target project exists.
 * Tasks are created with completion status defaulting to false.
 * 
 * @param {Request} req - Express request object
 * @param {string} req.params.projectId - Project ID as string (validated as number)
 * @param {string} req.body.title - Task title (required)
 * @param {string} req.body.description - Task description (required)
 * @param {string} req.body.dueDate - Task due date as ISO string (required)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with created task or error message
 * 
 * Response Codes:
 * - 201: Task created successfully
 * - 400: Invalid project ID or missing required fields
 * - 404: Project not found
 * - 500: Internal server error
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { title, description, dueDate } = req.body;

    if (!projectId || isNaN(Number(projectId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    // Validation
    if (!title || !description || !dueDate) {
      res.status(400).json({
        success: false,
        message: 'Title, description, and due date are required'
      });
      return;
    }

    const result = await TaskClass.createTask({
      projectId: Number(projectId),
      title,
      description,
      dueDate: new Date(dueDate)
    });

    if (!result.projectExists) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: result.task,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * PUT /projects/:projectId/tasks/:taskId - Updates a task's fields
 * 
 * Updates task fields while preserving existing data for fields not provided.
 * Performs comprehensive validation chain: project exists, task exists, and
 * task belongs to the specified project. Only updates fields provided in request body.
 * 
 * @param {Request} req - Express request object
 * @param {string} req.params.projectId - Project ID as string (validated as number)
 * @param {string} req.params.taskId - Task ID as string (validated as number)
 * @param {string} [req.body.title] - New task title (optional)
 * @param {string} [req.body.description] - New task description (optional)
 * @param {string} [req.body.dueDate] - New due date as ISO string (optional)
 * @param {boolean} [req.body.isCompleted] - New completion status (optional)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with updated task or error message
 * 
 * Response Codes:
 * - 200: Task updated successfully
 * - 400: Invalid project ID or task ID format
 * - 403: Task does not belong to this project
 * - 404: Project not found or task not found
 * - 500: Internal server error
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, taskId } = req.params;
    const { title, description, dueDate, isCompleted } = req.body;

    if (!projectId || isNaN(Number(projectId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    if (!taskId || isNaN(Number(taskId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
      return;
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (isCompleted !== undefined) updateData.isCompleted = Boolean(isCompleted);

    const result = await TaskClass.updateTask(
      Number(projectId),
      Number(taskId),
      updateData
    );

    if (!result.projectExists) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    if (!result.taskExists) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    if (!result.taskBelongsToProject) {
      res.status(403).json({
        success: false,
        message: 'Task does not belong to this project'
      });
      return;
    }

    res.json({
      success: true,
      data: result.task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * PATCH /projects/:projectId/tasks/:taskId/toggle - Toggles task completion status
 * 
 * Switches task completion status from complete to incomplete or vice versa.
 * Performs full validation chain before toggling status. This is a convenience
 * endpoint for quick task status changes without sending full update payload.
 * 
 * @param {Request} req - Express request object
 * @param {string} req.params.projectId - Project ID as string (validated as number)
 * @param {string} req.params.taskId - Task ID as string (validated as number)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with updated task or error message
 * 
 * Response Codes:
 * - 200: Task completion toggled successfully
 * - 400: Invalid project ID or task ID format
 * - 403: Task does not belong to this project
 * - 404: Project not found or task not found
 * - 500: Internal server error
 */
export const toggleTaskCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, taskId } = req.params;
    
    if (!projectId || isNaN(Number(projectId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    if (!taskId || isNaN(Number(taskId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
      return;
    }

    const result = await TaskClass.toggleTaskCompletion(
      Number(projectId),
      Number(taskId)
    );

    if (!result.projectExists) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    if (!result.taskExists) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    if (!result.taskBelongsToProject) {
      res.status(403).json({
        success: false,
        message: 'Task does not belong to this project'
      });
      return;
    }

    res.json({
      success: true,
      data: result.task,
      message: `Task marked as ${result.task?.isCompleted ? 'completed' : 'pending'}`
    });
  } catch (error) {
    console.error('Error toggling task completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle task completion',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * DELETE /projects/:projectId/tasks/:taskId - Deletes a task from a project
 * 
 * Removes a task from the database after comprehensive validation. Ensures
 * project exists, task exists, and task belongs to the specified project
 * before deletion. Provides detailed error messages for each validation failure.
 * 
 * @param {Request} req - Express request object
 * @param {string} req.params.projectId - Project ID as string (validated as number)
 * @param {string} req.params.taskId - Task ID as string (validated as number)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with success message or error
 * 
 * Response Codes:
 * - 200: Task deleted successfully
 * - 400: Invalid project ID or task ID format
 * - 403: Task does not belong to this project
 * - 404: Project not found or task not found
 * - 500: Internal server error
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, taskId } = req.params;

    if (!projectId || isNaN(Number(projectId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    if (!taskId || isNaN(Number(taskId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
      return;
    }

    const result = await TaskClass.deleteTask(
      Number(projectId),
      Number(taskId)
    );

    if (!result.projectExists) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    if (!result.taskExists) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    if (!result.taskBelongsToProject) {
      res.status(403).json({
        success: false,
        message: 'Task does not belong to this project'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /tasks/:id - Retrieves a specific task by ID (simplified endpoint)
 * 
 * Simple task retrieval by ID without project context validation. Used for
 * internal operations or when project context is not required. Returns
 * basic error response format for consistency with other endpoints.
 * 
 * @param {Request} req - Express request object
 * @param {string} req.params.id - Task ID as string (validated as number)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with task data or error message
 * 
 * Response Codes:
 * - 200: Success with task data
 * - 400: Invalid task ID format
 * - 404: Task not found
 * - 500: Internal server error
 */
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const task = await TaskClass.getTaskById(parsedId);
    
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error('Error in getTaskById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /projects/:projectId/tasks/stats - Retrieves task statistics for a project
 * 
 * Returns aggregated task completion statistics for a specific project using
 * database groupBy functionality. Provides counts of completed vs incomplete
 * tasks for dashboard and reporting purposes.
 * 
 * @param {Request} req - Express request object
 * @param {string} req.params.projectId - Project ID as string (validated as number)
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with task statistics or error message
 * 
 * Response Codes:
 * - 200: Success with statistics data
 * - 400: Invalid project ID format
 * - 500: Internal server error
 */
export const getProjectTaskStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const parsedProjectId = parseInt(projectId, 10);

    if (isNaN(parsedProjectId)) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    const stats = await TaskClass.getProjectTaskStats(parsedProjectId);
    res.json(stats);
  } catch (error) {
    console.error('Error in getProjectTaskStats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /tasks/overdue - Retrieves overdue tasks with optional project filtering
 * 
 * Returns tasks with due dates in the past, ordered by due date (most overdue first).
 * Supports optional project filtering via query parameter. Useful for dashboard
 * alerts and task management features.
 * 
 * @param {Request} req - Express request object
 * @param {string} [req.query.projectId] - Optional project ID to filter results
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with overdue tasks array or error message
 * 
 * Response Codes:
 * - 200: Success with overdue tasks array
 * - 400: Invalid project ID format (when provided)
 * - 500: Internal server error
 */
export const getOverdueTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    const parsedProjectId = projectId ? parseInt(projectId as string, 10) : undefined;

    if (projectId && isNaN(parsedProjectId!)) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    const tasks = await TaskClass.getOverdueTasks(parsedProjectId);
    res.json(tasks);
  } catch (error) {
    console.error('Error in getOverdueTasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PATCH /tasks/bulk-complete - Marks multiple tasks as completed
 * 
 * Bulk operation to mark multiple tasks as completed in a single request.
 * Accepts an array of task IDs and validates each ID format before processing.
 * Returns the count of successfully updated tasks for confirmation.
 * 
 * @param {Request} req - Express request object
 * @param {number[]} req.body.taskIds - Array of task IDs to mark as completed
 * @param {Response} res - Express response object
 * @returns {Promise<void>} HTTP response with update count or error message
 * 
 * Response Codes:
 * - 200: Success with count of updated tasks
 * - 400: Invalid or missing task IDs array
 * - 500: Internal server error
 */
export const markTasksAsCompleted = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      res.status(400).json({ error: 'Task IDs array is required' });
      return;
    }

    const parsedTaskIds = taskIds.map(id => parseInt(id, 10));
    const hasInvalidIds = parsedTaskIds.some(id => isNaN(id));

    if (hasInvalidIds) {
      res.status(400).json({ error: 'All task IDs must be valid numbers' });
      return;
    }

    const result = await TaskClass.markTasksAsCompleted(parsedTaskIds);
    res.json({ 
      message: `${result.count} tasks marked as completed`,
      updatedCount: result.count 
    });
  } catch (error) {
    console.error('Error in markTasksAsCompleted:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Task Controller Export Object
 * 
 * Grouped export of all task controller functions for convenient importing
 * and potential future middleware attachment or route organization.
 */
export const taskController = {
  getAllTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  getTaskById,
  getProjectTaskStats,
  getOverdueTasks,
  markTasksAsCompleted
}; 