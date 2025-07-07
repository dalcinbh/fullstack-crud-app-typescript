import { Task as TaskInterface } from '../interfaces/task.interface.js';
import prisma from '../config/prisma.js';

export class Task {
  private data: TaskInterface;

  constructor(task: TaskInterface) {
    this.data = task;
  }

  /**
   * Get all tasks for a specific project
   */
  static async getTasksByProjectId(projectId: number): Promise<{ tasks: TaskInterface[]; projectExists: boolean }> {
    try {
      // Check if project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return { tasks: [], projectExists: false };
      }

      const tasks = await prisma.task.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
      });

      return { tasks, projectExists: true };
    } catch (error) {
      console.error('Error getting tasks by project ID:', error);
      throw error;
    }
  }

  /**
   * Create a new task with proper validation
   */
  static async createTask(taskData: {
    title: string;
    description: string;
    dueDate: Date;
    projectId: number;
  }): Promise<{ task: TaskInterface | null; projectExists: boolean }> {
    try {
      // Check if project exists
      const project = await prisma.project.findUnique({
        where: { id: taskData.projectId }
      });

      if (!project) {
        return { task: null, projectExists: false };
      }

      // Create task
      const task = await prisma.task.create({
        data: {
          projectId: taskData.projectId,
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate,
          isCompleted: false
        }
      });

      return { task, projectExists: true };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update a task with proper validation
   */
  static async updateTask(
    projectId: number,
    taskId: number,
    updateData: {
      title?: string;
      description?: string;
      dueDate?: Date;
      isCompleted?: boolean;
    }
  ): Promise<{ 
    task: TaskInterface | null; 
    projectExists: boolean; 
    taskExists: boolean; 
    taskBelongsToProject: boolean 
  }> {
    try {
      // Check if project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return { task: null, projectExists: false, taskExists: false, taskBelongsToProject: false };
      }

      // Check if task exists and belongs to the project
      const existingTask = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!existingTask) {
        return { task: null, projectExists: true, taskExists: false, taskBelongsToProject: false };
      }

      if (existingTask.projectId !== projectId) {
        return { task: null, projectExists: true, taskExists: true, taskBelongsToProject: false };
      }

      // Build update data
      const data: any = {};
      if (updateData.title !== undefined) data.title = updateData.title;
      if (updateData.description !== undefined) data.description = updateData.description;
      if (updateData.dueDate !== undefined) data.dueDate = updateData.dueDate;
      if (updateData.isCompleted !== undefined) data.isCompleted = Boolean(updateData.isCompleted);

      // Update task
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data
      });

      return { 
        task: updatedTask, 
        projectExists: true, 
        taskExists: true, 
        taskBelongsToProject: true 
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Toggle task completion status with proper validation
   */
  static async toggleTaskCompletion(
    projectId: number,
    taskId: number
  ): Promise<{ 
    task: TaskInterface | null; 
    projectExists: boolean; 
    taskExists: boolean; 
    taskBelongsToProject: boolean 
  }> {
    try {
      // Check if project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return { task: null, projectExists: false, taskExists: false, taskBelongsToProject: false };
      }

      // Check if task exists and belongs to the project
      const existingTask = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!existingTask) {
        return { task: null, projectExists: true, taskExists: false, taskBelongsToProject: false };
      }

      if (existingTask.projectId !== projectId) {
        return { task: null, projectExists: true, taskExists: true, taskBelongsToProject: false };
      }

      // Toggle completion status
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { isCompleted: !existingTask.isCompleted }
      });

      return { 
        task: updatedTask, 
        projectExists: true, 
        taskExists: true, 
        taskBelongsToProject: true 
      };
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }

  /**
   * Delete a task with proper validation
   */
  static async deleteTask(
    projectId: number,
    taskId: number
  ): Promise<{ 
    success: boolean; 
    projectExists: boolean; 
    taskExists: boolean; 
    taskBelongsToProject: boolean 
  }> {
    try {
      // Check if project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return { success: false, projectExists: false, taskExists: false, taskBelongsToProject: false };
      }

      // Check if task exists and belongs to the project
      const existingTask = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!existingTask) {
        return { success: false, projectExists: true, taskExists: false, taskBelongsToProject: false };
      }

      if (existingTask.projectId !== projectId) {
        return { success: false, projectExists: true, taskExists: true, taskBelongsToProject: false };
      }

      // Delete task
      await prisma.task.delete({
        where: { id: taskId }
      });

      return { 
        success: true, 
        projectExists: true, 
        taskExists: true, 
        taskBelongsToProject: true 
      };
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Get a task by ID
   */
  static async getTaskById(id: number): Promise<TaskInterface | null> {
    try {
      const task = await prisma.task.findUnique({
        where: { id }
      });

      return task;
    } catch (error) {
      console.error('Error getting task by ID:', error);
      throw error;
    }
  }

  /**
   * Get task statistics for a project using groupBy
   */
  static async getProjectTaskStats(projectId: number): Promise<any> {
    try {
      const stats = await prisma.task.groupBy({
        by: ['isCompleted'],
        where: { projectId },
        _count: {
          isCompleted: true
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting project task stats:', error);
      throw error;
    }
  }

  /**
   * Get overdue tasks
   */
  static async getOverdueTasks(projectId?: number): Promise<TaskInterface[]> {
    try {
      const where: any = {
        dueDate: {
          lt: new Date()
        }
      };

      if (projectId) {
        where.projectId = projectId;
      }

      const tasks = await prisma.task.findMany({
        where,
        orderBy: { dueDate: 'desc' }
      });

      return tasks;
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      throw error;
    }
  }

  /**
   * Mark multiple tasks as completed
   */
  static async markTasksAsCompleted(taskIds: number[]): Promise<{ count: number }> {
    try {
      const updatedCount = await prisma.task.updateMany({
        where: {
          id: {
            in: taskIds
          }
        },
        data: {
          isCompleted: true
        }
      });

      return { count: updatedCount.count };
    } catch (error) {
      console.error('Error marking tasks as completed:', error);
      throw error;
    }
  }

  // Instance methods
  get taskData(): TaskInterface {
    return this.data;
  }

  updateData(newData: Partial<TaskInterface>): void {
    this.data = { ...this.data, ...newData };
  }

  isOverdue(): boolean {
    if (!this.data.dueDate) return false;
    return new Date(this.data.dueDate) < new Date() && !this.data.isCompleted;
  }

  getDaysUntilDue(): number {
    if (!this.data.dueDate) return 0;
    const today = new Date();
    const dueDate = new Date(this.data.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getPriority(): 'high' | 'medium' | 'low' {
    const daysUntilDue = this.getDaysUntilDue();
    if (daysUntilDue <= 1) return 'high';
    if (daysUntilDue <= 7) return 'medium';
    return 'low';
  }

  async toggleCompletion(): Promise<TaskInterface | null> {
    try {
      const updatedTask = await prisma.task.update({
        where: { id: this.data.id },
        data: { isCompleted: !this.data.isCompleted }
      });
      this.data = updatedTask;
      return updatedTask;
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }
} 