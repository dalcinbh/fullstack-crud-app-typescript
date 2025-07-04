import { Project as ProjectInterface } from '../interfaces/project.interface.js';
import { Task } from '../interfaces/project.task.js';
import prisma from '../config/prisma.js';

export class Project {
  private data: ProjectInterface;

  constructor(project: ProjectInterface) {
    this.data = project;
  }

  /**
   * Get all projects from database
   */
  static async getAllProjects(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ projects: ProjectInterface[]; total: number }> {
    try {
      const { page = 1, limit = 10, search } = options || {};
      const skip = (page - 1) * limit;
      
      const where = search ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      } : {};

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          include: {
            tasks: {
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.project.count({ where })
      ]);

      return { projects, total };
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  }

  /**
   * Get a project by ID
   */
  static async getProjectById(id: number): Promise<ProjectInterface | null> {
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return project;
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new project
   */
  static async insertProject(projectData: {
    name: string;
    description: string;
    startDate: Date;
    tasks?: Task[];
  }): Promise<ProjectInterface> {
    try {
      const data: any = {
        name: projectData.name,
        description: projectData.description,
        startDate: projectData.startDate
      };

      if (projectData.tasks && projectData.tasks.length > 0) {
        data.tasks = {
          create: projectData.tasks.map(task => ({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            isCompleted: task.isCompleted || false
          }))
        };
      }

      const project = await prisma.project.create({
        data,
        include: {
          tasks: true
        }
      });

      return project;
    } catch (error) {
      console.error('Error inserting project:', error);
      throw error;
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: number, updateData: {
    name?: string;
    description?: string;
    startDate?: Date;
  }): Promise<ProjectInterface | null> {
    try {
      const project = await prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: number): Promise<boolean> {
    try {
      await prisma.project.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Get project data
   */
  get projectData(): ProjectInterface {
    return this.data;
  }

  /**
   * Update project data
   */
  updateData(newData: Partial<ProjectInterface>): void {
    this.data = { ...this.data, ...newData };
  }

  /**
   * Get project tasks
   */
  getTasks(): Task[] {
    return this.data.tasks || [];
  }

  /**
   * Add a task to the project
   */
  addTask(task: Task): void {
    if (!this.data.tasks) {
      this.data.tasks = [];
    }
    this.data.tasks.push(task);
  }

  /**
   * Remove a task from the project
   */
  removeTask(taskId: number): void {
    if (this.data.tasks) {
      this.data.tasks = this.data.tasks.filter(task => task.id !== taskId);
    }
  }

  /**
   * Get project statistics
   */
  getStats(): {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionPercentage: number;
  } {
    const tasks = this.getTasks();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionPercentage: Math.round(completionPercentage)
    };
  }
}


