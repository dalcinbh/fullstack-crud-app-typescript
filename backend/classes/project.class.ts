import { Project as ProjectInterface } from '../interfaces/project.interface.js';
import { Task } from '../interfaces/task.interface.js';
import prisma from '../config/prisma.js';

/**
 * Project business logic class
 * 
 * Handles all project-related database operations and business rules.
 * Provides static methods for CRUD operations with proper validation,
 * error handling, and data transformation. Also includes instance 
 * methods for project analysis and status calculation.
 * 
 * This class follows the repository pattern, encapsulating all 
 * project-specific database queries and business logic away from 
 * the controllers.
 */
export class Project {
  private data: ProjectInterface;

  /**
   * Creates a new Project instance
   * @param {ProjectInterface} project - The project data to wrap
   */
  constructor(project: ProjectInterface) {
    this.data = project;
  }

  /**
   * Retrieves all projects from the database with optional text search
   * 
   * Returns all projects ordered by creation date (newest first), including
   * their associated tasks. Can filter results by searching project names
   * and descriptions using case-insensitive partial matching.
   * 
   * @param {Object} [options] - Optional search parameters
   * @param {string} [options.search] - Text to search in project names and descriptions
   * @returns {Promise<{projects: ProjectInterface[]}>} Object containing array of all matching projects
   * @throws {Error} When database operation fails
   */
  static async getAllProjects(options?: {
    search?: string;
  }): Promise<{ projects: ProjectInterface[] }> {
    try {
      const { search } = options || {};
      
      // Build dynamic where clause for search functionality
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
            orderBy: { createdAt: 'desc' } // Most recent tasks first
          }
        },
        orderBy: { createdAt: 'desc' } // Most recent projects first
      });

      return { projects };
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  }

  /**
   * Retrieves a single project by its ID with existence validation
   * 
   * Fetches a project including all associated tasks ordered by creation date.
   * Returns both the project data and an existence flag to help controllers
   * determine appropriate HTTP response codes.
   * 
   * @param {number} id - The unique identifier of the project
   * @returns {Promise<{project: ProjectInterface | null, exists: boolean}>} 
   *   Object containing the project data (or null) and existence flag
   * @throws {Error} When database operation fails
   */
  static async getProjectById(id: number): Promise<{ project: ProjectInterface | null; exists: boolean }> {
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' } // Include tasks ordered by newest first
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
   * Creates a new project with optional initial tasks
   * 
   * Creates a project record and optionally creates associated tasks in a 
   * single transaction. Tasks are created with default completion status 
   * of false. All date fields are properly converted to Date objects.
   * 
   * @param {Object} projectData - The project data to create
   * @param {string} projectData.name - Project name (required)
   * @param {string} projectData.description - Project description (required)
   * @param {Date} projectData.startDate - Project start date (required)
   * @param {Array<any>} [projectData.tasks] - Optional array of tasks to create with project
   * @returns {Promise<ProjectInterface>} The created project with tasks included
   * @throws {Error} When database operation fails or validation errors occur
   */
  static async createProject(projectData: {
    name: string;
    description: string;
    startDate: Date;
    tasks?: any[];
  }): Promise<ProjectInterface> {
    try {
      // Prepare base project data
      const data: any = {
        name: projectData.name,
        description: projectData.description,
        startDate: projectData.startDate
      };

      // Add tasks creation if provided
      if (projectData.tasks && Array.isArray(projectData.tasks)) {
        data.tasks = {
          create: projectData.tasks.map((task: any) => ({
            title: task.title,
            description: task.description,
            dueDate: new Date(task.dueDate), // Ensure proper date conversion
            isCompleted: task.isCompleted || false // Default to incomplete
          }))
        };
      }

      const project = await prisma.project.create({
        data,
        include: {
          tasks: true // Return the created project with its tasks
        }
      });

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Updates an existing project with validation
   * 
   * Updates project fields while preserving existing data for fields not provided.
   * Validates project existence before attempting update and returns appropriate
   * flags for controller response handling.
   * 
   * @param {number} id - The unique identifier of the project to update
   * @param {Object} updateData - Fields to update
   * @param {string} [updateData.name] - New project name
   * @param {string} [updateData.description] - New project description  
   * @param {Date} [updateData.startDate] - New project start date
   * @returns {Promise<{project: ProjectInterface | null, exists: boolean}>}
   *   Object containing updated project data and existence flag
   * @throws {Error} When database operation fails
   */
  static async updateProject(id: number, updateData: {
    name?: string;
    description?: string;
    startDate?: Date;
  }): Promise<{ project: ProjectInterface | null; exists: boolean }> {
    try {
      // Validate project exists before attempting update
      const existingProject = await prisma.project.findUnique({
        where: { id }
      });

      if (!existingProject) {
        return { project: null, exists: false };
      }

      // Build update object with only provided fields
      const data: any = {};
      if (updateData.name) data.name = updateData.name;
      if (updateData.description) data.description = updateData.description;
      if (updateData.startDate) data.startDate = updateData.startDate;

      const project = await prisma.project.update({
        where: { id },
        data,
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' } // Include updated tasks list
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
   * Deletes a project with validation and cascade handling
   * 
   * Validates project existence before deletion and handles cascade deletion
   * of associated tasks automatically. Returns success and existence flags
   * to help controllers provide appropriate HTTP responses.
   * 
   * @param {number} id - The unique identifier of the project to delete
   * @returns {Promise<{success: boolean, exists: boolean}>}
   *   Object containing operation success and existence flags
   * @throws {Error} When database operation fails
   */
  static async deleteProject(id: number): Promise<{ success: boolean; exists: boolean }> {
    try {
      // Validate project exists before attempting deletion
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

  // ========== INSTANCE METHODS ==========

  /**
   * Gets the wrapped project data
   * @returns {ProjectInterface} The current project data
   */
  get projectData(): ProjectInterface {
    return this.data;
  }

  /**
   * Updates the project data with new values
   * 
   * Merges new data with existing project data, preserving unchanged fields.
   * This is an in-memory operation and does not persist to database.
   * 
   * @param {Partial<ProjectInterface>} newData - Fields to update
   */
  updateData(newData: Partial<ProjectInterface>): void {
    this.data = { ...this.data, ...newData };
  }

  /**
   * Calculates project duration in days from start date to today
   * 
   * Computes the number of days since the project started based on
   * the difference between start date and current date.
   * 
   * @returns {number} Number of days since project start (0 if no start date)
   */
  getProjectDuration(): number {
    if (!this.data.startDate) return 0;
    const today = new Date();
    const startDate = new Date(this.data.startDate);
    const diffTime = today.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  }

  /**
   * Determines if project was created within the last 7 days
   * 
   * Checks the creation timestamp to identify recently created projects
   * for UI highlighting or filtering purposes.
   * 
   * @returns {boolean} True if project was created within last week
   */
  isRecentlyCreated(): boolean {
    if (!this.data.createdAt) return false;
    const today = new Date();
    const createdAt = new Date(this.data.createdAt);
    const diffTime = today.getTime() - createdAt.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Consider projects created in last 7 days as recent
  }

  /**
   * Analyzes project completion status based on task completion
   * 
   * Determines project status by examining the completion state of all
   * associated tasks:
   * - 'not_started': No tasks or no completed tasks
   * - 'in_progress': Some but not all tasks completed  
   * - 'completed': All tasks completed
   * 
   * @returns {'completed' | 'in_progress' | 'not_started'} Project status
   */
  getProjectStatus(): 'completed' | 'in_progress' | 'not_started' {
    const tasks = this.data.tasks || [];
    if (tasks.length === 0) return 'not_started';
    
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    if (completedTasks === 0) return 'not_started';
    if (completedTasks === tasks.length) return 'completed';
    return 'in_progress';
  }

  /**
   * Generates comprehensive project statistics and metrics
   * 
   * Calculates various project metrics including task completion statistics,
   * project duration, and overall status for dashboard and reporting purposes.
   * 
   * @returns {Object} Complete project statistics object
   * @returns {number} returns.totalTasks - Total number of tasks in project
   * @returns {number} returns.completedTasks - Number of completed tasks
   * @returns {number} returns.pendingTasks - Number of incomplete tasks
   * @returns {number} returns.completionPercentage - Completion percentage (0-100)
   * @returns {number} returns.projectDuration - Days since project start
   * @returns {string} returns.status - Project status (completed/in_progress/not_started)
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
    
    // Calculate completion percentage (avoid division by zero)
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionPercentage: Math.round(completionPercentage), // Round to whole number
      projectDuration: this.getProjectDuration(),
      status: this.getProjectStatus()
    };
  }
}


