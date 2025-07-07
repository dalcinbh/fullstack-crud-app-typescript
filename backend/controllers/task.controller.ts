import { Request, Response } from 'express';
import { Task } from '../interfaces/task.interface.js';
import { Task as TaskClass } from '../classes/task.class.js';

/**
 * Get all tasks for a specific project
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
 * Create a new task for a specific project
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
 * Update a task's status or other fields
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
 * Toggle task completion status
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
 * Delete a task
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
 * Get a specific task by ID
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
 * Get task statistics for a project
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
 * Get overdue tasks
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
 * Mark multiple tasks as completed
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