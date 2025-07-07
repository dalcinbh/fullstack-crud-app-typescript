import { Task as TaskInterface } from '../interfaces/task.interface.js';
import prisma from '../config/prisma.js';
const taskListSizePage = parseInt(process.env.TASK_LIST_SIZE_PAGE || '10');

export class Task {
  private data: TaskInterface;

  constructor(task: TaskInterface) {
    this.data = task;
  }

  /**
   * Get all tasks for a specific project
   */
  static async getTasksByProjectId(projectId: number): Promise<TaskInterface[]> {
    try {
      const tasks = await prisma.task.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
      });

      return tasks;
    } catch (error) {
      console.error('Error getting tasks by project ID:', error);
      throw error;
    }
  }

  /**
   * Get a task by ID
   */
  static async getTaskById(id: number): Promise<TaskInterface | null> {
    try {
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          project: true
        }
      });

      return task;
    } catch (error) {
      console.error('Error getting task by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   */
  static async insertTask(taskData: {
    title: string;
    description: string;
    dueDate: Date;
    projectId: number;
    isCompleted?: boolean;
  }): Promise<TaskInterface> {
    try {
      const task = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate,
          projectId: taskData.projectId,
          isCompleted: taskData.isCompleted || false
        }
      });

      return task;
    } catch (error) {
      console.error('Error inserting task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  static async updateTask(id: number, updateData: {
    title?: string;
    description?: string;
    dueDate?: Date;
    isCompleted?: boolean;
  }): Promise<TaskInterface | null> {
    try {
      const task = await prisma.task.update({
        where: { id },
        data: updateData
      });

      return task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Update task status (completed/pending)
   */
  static async updateTaskStatus(id: number, isCompleted: boolean): Promise<TaskInterface | null> {
    try {
      const task = await prisma.task.update({
        where: { id },
        data: { isCompleted }
      });

      return task;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(id: number): Promise<boolean> {
    try {
      await prisma.task.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Get task statistics for a project
   */
  static async getProjectTaskStats(projectId: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionPercentage: number;
  }> {
    try {
      const [totalTasks, completedTasks] = await Promise.all([
        prisma.task.count({ where: { projectId } }),
        prisma.task.count({ where: { projectId, isCompleted: true } })
      ]);

      const pendingTasks = totalTasks - completedTasks;
      const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionPercentage: Math.round(completionPercentage)
      };
    } catch (error) {
      console.error('Error getting project task stats:', error);
      throw error;
    }
  }

  /**
   * Get overdue tasks for a project
   */
  static async getOverdueTasks(projectId?: number): Promise<TaskInterface[]> {
    try {
      const where: any = {
        dueDate: { lt: new Date() },
        isCompleted: false
      };

      if (projectId) {
        where.projectId = projectId;
      }

      const tasks = await prisma.task.findMany({
        where,
        include: {
          project: true
        },
        orderBy: { dueDate: 'asc' }
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
  static async markTasksAsCompleted(taskIds: number[]): Promise<number> {
    try {
      const result = await prisma.task.updateMany({
        where: { id: { in: taskIds } },
        data: { isCompleted: true }
      });

      return result.count;
    } catch (error) {
      console.error('Error marking tasks as completed:', error);
      throw error;
    }
  }

  /**
   * Get task data
   */
  get taskData(): TaskInterface {
    return this.data;
  }

  /**
   * Update task data
   */
  updateData(newData: Partial<TaskInterface>): void {
    this.data = { ...this.data, ...newData };
  }

  /**
   * Check if task is overdue
   */
  isOverdue(): boolean {
    return new Date() > new Date(this.data.dueDate) && !this.data.isCompleted;
  }

  /**
   * Get days until due date
   */
  getDaysUntilDue(): number {
    const now = new Date();
    const dueDate = new Date(this.data.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get task priority based on due date
   */
  getPriority(): 'high' | 'medium' | 'low' {
    const daysUntilDue = this.getDaysUntilDue();
    
    if (daysUntilDue < 0) return 'high'; // Overdue
    if (daysUntilDue <= 3) return 'high'; // Due within 3 days
    if (daysUntilDue <= 7) return 'medium'; // Due within a week
    return 'low'; // Due later
  }

  /**
   * Toggle task completion status
   */
  async toggleCompletion(): Promise<TaskInterface | null> {
    try {
      const newStatus = !this.data.isCompleted;
      const updatedTask = await Task.updateTaskStatus(this.data.id, newStatus);
      
      if (updatedTask) {
        this.data = updatedTask;
      }
      
      return updatedTask;
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }
} 