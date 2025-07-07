import { Project as ProjectInterface } from '../interfaces/project.interface.js';
import { Task } from '../interfaces/task.interface.js';
import prisma from '../config/prisma.js';

export class Project {
  private data: ProjectInterface;

  constructor(project: ProjectInterface) {
    this.data = project;
  }

  /**
   * Get all projects with optional filtering
   */
  static async getAllProjects(options?: {
    search?: string;
  }): Promise<{ projects: ProjectInterface[] }> {
    try {
      const { search } = options || {};
      
      const where = search ? {
        OR: [
          { name: { contains: search as string } },
          { description: { contains: search as string } }
        ]
      } : {};

      const projects = await prisma.project.findMany({
        where,
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { projects };
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  }

  /**
   * Get a project by ID with validation
   */
  static async getProjectById(id: number): Promise<{ project: ProjectInterface | null; exists: boolean }> {
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return {
        project,
        exists: project !== null
      };
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new project with proper validation
   */
  static async createProject(projectData: {
    name: string;
    description: string;
    startDate: Date;
    tasks?: any[];
  }): Promise<ProjectInterface> {
    try {
      // Create project with optional tasks
      const data: any = {
        name: projectData.name,
        description: projectData.description,
        startDate: projectData.startDate
      };

      if (projectData.tasks && Array.isArray(projectData.tasks)) {
        data.tasks = {
          create: projectData.tasks.map((task: any) => ({
            title: task.title,
            description: task.description,
            dueDate: new Date(task.dueDate),
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
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update an existing project with validation
   */
  static async updateProject(id: number, updateData: {
    name?: string;
    description?: string;
    startDate?: Date;
  }): Promise<{ project: ProjectInterface | null; exists: boolean }> {
    try {
      // Check if project exists
      const existingProject = await prisma.project.findUnique({
        where: { id }
      });

      if (!existingProject) {
        return { project: null, exists: false };
      }

      // Update project
      const data: any = {};
      if (updateData.name) data.name = updateData.name;
      if (updateData.description) data.description = updateData.description;
      if (updateData.startDate) data.startDate = updateData.startDate;

      const project = await prisma.project.update({
        where: { id },
        data,
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return { project, exists: true };
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete a project with validation
   */
  static async deleteProject(id: number): Promise<{ success: boolean; exists: boolean }> {
    try {
      // Check if project exists
      const existingProject = await prisma.project.findUnique({
        where: { id }
      });

      if (!existingProject) {
        return { success: false, exists: false };
      }

      // Delete project (tasks will be deleted automatically due to cascade)
      await prisma.project.delete({
        where: { id }
      });

      return { success: true, exists: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Instance methods
  get projectData(): ProjectInterface {
    return this.data;
  }

  updateData(newData: Partial<ProjectInterface>): void {
    this.data = { ...this.data, ...newData };
  }

  getProjectDuration(): number {
    if (!this.data.startDate) return 0;
    const today = new Date();
    const startDate = new Date(this.data.startDate);
    const diffTime = today.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isRecentlyCreated(): boolean {
    if (!this.data.createdAt) return false;
    const today = new Date();
    const createdAt = new Date(this.data.createdAt);
    const diffTime = today.getTime() - createdAt.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }

  getProjectStatus(): 'completed' | 'in_progress' | 'not_started' {
    const tasks = this.data.tasks || [];
    if (tasks.length === 0) return 'not_started';
    
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    if (completedTasks === 0) return 'not_started';
    if (completedTasks === tasks.length) return 'completed';
    return 'in_progress';
  }

  getBasicStats(): {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionPercentage: number;
    projectDuration: number;
    status: string;
  } {
    const tasks = this.data.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionPercentage: Math.round(completionPercentage),
      projectDuration: this.getProjectDuration(),
      status: this.getProjectStatus()
    };
  }
}


