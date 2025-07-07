import { Project as ProjectInterface } from '../interfaces/project.interface.js';
import { Task } from '../interfaces/task.interface.js';
import prisma from '../config/prisma.js';
const projectListSizePage = parseInt(process.env.PROJECT_LIST_SIZE_PAGE || '10');
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
      const { page = 1, limit = projectListSizePage, search } = options || {};
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
   * Get projects with task counts
   */
  static async getProjectsWithTaskCounts(): Promise<(ProjectInterface & {
    taskStats: {
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      completionPercentage: number;
    }
  })[]> {
    try {
      const projects = await prisma.project.findMany({
        include: {
          tasks: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return projects.map(project => {
        const totalTasks = project.tasks?.length || 0;
        const completedTasks = project.tasks?.filter(task => task.isCompleted).length || 0;
        const pendingTasks = totalTasks - completedTasks;
        const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
          ...project,
          taskStats: {
            totalTasks,
            completedTasks,
            pendingTasks,
            completionPercentage: Math.round(completionPercentage)
          }
        };
      });
    } catch (error) {
      console.error('Error getting projects with task counts:', error);
      throw error;
    }
  }

  /**
   * Get projects by status
   */
  static async getProjectsByStatus(status: 'completed' | 'in_progress' | 'not_started'): Promise<ProjectInterface[]> {
    try {
      const projects = await prisma.project.findMany({
        include: {
          tasks: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return projects.filter(project => {
        const totalTasks = project.tasks?.length || 0;
        const completedTasks = project.tasks?.filter(task => task.isCompleted).length || 0;

        switch (status) {
          case 'completed':
            return totalTasks > 0 && completedTasks === totalTasks;
          case 'in_progress':
            return totalTasks > 0 && completedTasks > 0 && completedTasks < totalTasks;
          case 'not_started':
            return totalTasks === 0 || completedTasks === 0;
          default:
            return false;
        }
      });
    } catch (error) {
      console.error('Error getting projects by status:', error);
      throw error;
    }
  }

  /**
   * Search projects by name or description
   */
  static async searchProjects(searchTerm: string): Promise<ProjectInterface[]> {
    try {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } }
          ]
        },
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return projects;
    } catch (error) {
      console.error('Error searching projects:', error);
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
   * Get project duration in days
   */
  getProjectDuration(): number {
    const startDate = new Date(this.data.startDate);
    const now = new Date();
    const diffTime = now.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Check if project is recently created (within last 7 days)
   */
  isRecentlyCreated(): boolean {
    const createdAt = new Date(this.data.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdAt.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }

  /**
   * Get project status based on tasks
   */
  getProjectStatus(): 'completed' | 'in_progress' | 'not_started' {
    const tasks = this.data.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;

    if (totalTasks === 0 || completedTasks === 0) {
      return 'not_started';
    } else if (completedTasks === totalTasks) {
      return 'completed';
    } else {
      return 'in_progress';
    }
  }

  /**
   * Get basic project statistics
   */
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


