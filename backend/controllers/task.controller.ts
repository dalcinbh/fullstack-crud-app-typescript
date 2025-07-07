import { Request, Response } from 'express';
import { Task } from '../interfaces/task.interface.js';
import prisma from '../config/prisma.js';

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

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Get all tasks for the project
    const tasks = await prisma.task.findMany({
      where: { projectId: Number(projectId) },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: tasks
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

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        projectId: Number(projectId),
        title,
        description,
        dueDate: new Date(dueDate),
        isCompleted: false
      }
    });

    res.status(201).json({
      success: true,
      data: task,
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

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Check if task exists and belongs to the project
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(taskId) }
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    if (existingTask.projectId !== Number(projectId)) {
      res.status(403).json({
        success: false,
        message: 'Task does not belong to this project'
      });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (isCompleted !== undefined) updateData.isCompleted = Boolean(isCompleted);

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: Number(taskId) },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedTask,
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

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Check if task exists and belongs to the project
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(taskId) }
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    if (existingTask.projectId !== Number(projectId)) {
      res.status(403).json({
        success: false,
        message: 'Task does not belong to this project'
      });
      return;
    }

    // Toggle completion status
    const updatedTask = await prisma.task.update({
      where: { id: Number(taskId) },
      data: { isCompleted: !existingTask.isCompleted }
    });

    res.json({
      success: true,
      data: updatedTask,
      message: `Task marked as ${updatedTask.isCompleted ? 'completed' : 'pending'}`
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

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Check if task exists and belongs to the project
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(taskId) }
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    if (existingTask.projectId !== Number(projectId)) {
      res.status(403).json({
        success: false,
        message: 'Task does not belong to this project'
      });
      return;
    }

    // Delete task
    await prisma.task.delete({
      where: { id: Number(taskId) }
    });

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