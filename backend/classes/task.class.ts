import { Task as TaskInterface } from '../interfaces/task.interface.js';
import prisma from '../config/prisma.js';

/**
 * Task business logic class
 * 
 * Handles all task-related database operations and business rules within the context
 * of projects. Provides static methods for CRUD operations with comprehensive validation
 * including project existence, task existence, and task-project relationship validation.
 * Also includes instance methods for task analysis, priority calculation, and status management.
 * 
 * This class follows the repository pattern, encapsulating all task-specific database 
 * queries and business logic away from the controllers. All operations include proper
 * validation chains to ensure data integrity and provide detailed feedback for API responses.
 */
export class Task {
  private data: TaskInterface;

  /**
   * Creates a new Task instance
   * @param {TaskInterface} task - The task data to wrap
   */
  constructor(task: TaskInterface) {
    this.data = task;
  }

  /**
   * Retrieves all tasks for a specific project with project validation
   * 
   * Fetches all tasks belonging to a project ordered by creation date (newest first).
   * Validates that the project exists before attempting to fetch tasks, providing
   * appropriate flags for controller response handling.
   * 
   * @param {number} projectId - The unique identifier of the project
   * @returns {Promise<{tasks: TaskInterface[], projectExists: boolean}>} 
   *   Object containing tasks array and project existence flag
   * @throws {Error} When database operation fails
   */
  static async getTasksByProjectId(projectId: number): Promise<{ tasks: TaskInterface[]; projectExists: boolean }> {
    try {
      // Validate project exists before fetching tasks
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return { tasks: [], projectExists: false };
      }

      const tasks = await prisma.task.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' } // Most recent tasks first
      });

      return { tasks, projectExists: true };
    } catch (error) {
      console.error('Error getting tasks by project ID:', error);
      throw error;
    }
  }

  /**
   * Creates a new task with project validation
   * 
   * Creates a task record after validating that the associated project exists.
   * Tasks are created with completion status defaulting to false and proper
   * date handling for due dates.
   * 
   * @param {Object} taskData - The task data to create
   * @param {string} taskData.title - Task title (required)
   * @param {string} taskData.description - Task description (required)
   * @param {Date} taskData.dueDate - Task due date (required)
   * @param {number} taskData.projectId - Associated project ID (required)
   * @returns {Promise<{task: TaskInterface | null, projectExists: boolean}>}
   *   Object containing created task and project existence flag
   * @throws {Error} When database operation fails or validation errors occur
   */
  static async createTask(taskData: {
    title: string;
    description: string;
    dueDate: Date;
    projectId: number;
  }): Promise<{ task: TaskInterface | null; projectExists: boolean }> {
    try {
      // Validate project exists before creating task
      const project = await prisma.project.findUnique({
        where: { id: taskData.projectId }
      });

      if (!project) {
        return { task: null, projectExists: false };
      }

      // Create task with default completion status
      const task = await prisma.task.create({
        data: {
          projectId: taskData.projectId,
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate,
          isCompleted: false // Default to incomplete
        }
      });

      return { task, projectExists: true };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Updates an existing task with comprehensive validation
   * 
   * Updates task fields while preserving existing data for fields not provided.
   * Performs a complete validation chain: project existence, task existence,
   * and task-project relationship validation. Returns detailed flags for
   * precise error handling and appropriate HTTP response codes.
   * 
   * @param {number} projectId - The project ID the task should belong to
   * @param {number} taskId - The unique identifier of the task to update
   * @param {Object} updateData - Fields to update
   * @param {string} [updateData.title] - New task title
   * @param {string} [updateData.description] - New task description
   * @param {Date} [updateData.dueDate] - New task due date
   * @param {boolean} [updateData.isCompleted] - New completion status
   * @returns {Promise<{task: TaskInterface | null, projectExists: boolean, taskExists: boolean, taskBelongsToProject: boolean}>}
   *   Object containing updated task and detailed validation flags
   * @throws {Error} When database operation fails
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
      // Step 1: Validate project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return { task: null, projectExists: false, taskExists: false, taskBelongsToProject: false };
      }

      // Step 2: Validate task exists
      const existingTask = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!existingTask) {
        return { task: null, projectExists: true, taskExists: false, taskBelongsToProject: false };
      }

      // Step 3: Validate task belongs to project
      if (existingTask.projectId !== projectId) {
        return { task: null, projectExists: true, taskExists: true, taskBelongsToProject: false };
      }

      // Build update object with only provided fields
      const data: any = {};
      if (updateData.title !== undefined) data.title = updateData.title;
      if (updateData.description !== undefined) data.description = updateData.description;
      if (updateData.dueDate !== undefined) data.dueDate = updateData.dueDate;
      if (updateData.isCompleted !== undefined) data.isCompleted = Boolean(updateData.isCompleted);

      // Perform update
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
   * Toggles task completion status with comprehensive validation
   * 
   * Switches task completion status from complete to incomplete or vice versa.
   * Performs full validation chain (project exists, task exists, task belongs to project)
   * before toggling the completion status. Useful for quick task status changes.
   * 
   * @param {number} projectId - The project ID the task should belong to
   * @param {number} taskId - The unique identifier of the task to toggle
   * @returns {Promise<{task: TaskInterface | null, projectExists: boolean, taskExists: boolean, taskBelongsToProject: boolean}>}
   *   Object containing updated task and detailed validation flags
   * @throws {Error} When database operation fails
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
      // Step 1: Validate project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return { task: null, projectExists: false, taskExists: false, taskBelongsToProject: false };
      }

      // Step 2: Validate task exists and get current completion status
      const existingTask = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!existingTask) {
        return { task: null, projectExists: true, taskExists: false, taskBelongsToProject: false };
      }

      // Step 3: Validate task belongs to project
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
   * Deletes a task with comprehensive validation
   * 
   * Removes a task from the database after performing full validation chain.
   * Ensures project exists, task exists, and task belongs to the specified project
   * before deletion. Returns detailed flags for precise error handling.
   * 
   * @param {number} projectId - The project ID the task should belong to
   * @param {number} taskId - The unique identifier of the task to delete
   * @returns {Promise<{success: boolean, projectExists: boolean, taskExists: boolean, taskBelongsToProject: boolean}>}
   *   Object containing operation success and detailed validation flags
   * @throws {Error} When database operation fails
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
      // Step 1: Validate project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return { success: false, projectExists: false, taskExists: false, taskBelongsToProject: false };
      }

      // Step 2: Validate task exists
      const existingTask = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!existingTask) {
        return { success: false, projectExists: true, taskExists: false, taskBelongsToProject: false };
      }

      // Step 3: Validate task belongs to project
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
   * Retrieves a single task by its ID without project validation
   * 
   * Simple task retrieval by ID for internal operations or when project
   * context is not required. Returns null if task doesn't exist.
   * 
   * @param {number} id - The unique identifier of the task
   * @returns {Promise<TaskInterface | null>} The task data or null if not found
   * @throws {Error} When database operation fails
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
   * Generates task completion statistics for a project using database aggregation
   * 
   * Uses Prisma's groupBy functionality to efficiently calculate task statistics
   * by completion status. Returns grouped counts for completed and incomplete tasks
   * within a specific project.
   * 
   * @param {number} projectId - The project ID to analyze
   * @returns {Promise<any>} Array of grouped statistics with completion counts
   * @throws {Error} When database operation fails
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
   * Retrieves overdue tasks with optional project filtering
   * 
   * Finds tasks with due dates in the past, ordered by due date (most overdue first).
   * Can filter by specific project or return overdue tasks across all projects.
   * Useful for dashboard alerts and task management features.
   * 
   * @param {number} [projectId] - Optional project ID to filter results
   * @returns {Promise<TaskInterface[]>} Array of overdue tasks
   * @throws {Error} When database operation fails
   */
  static async getOverdueTasks(projectId?: number): Promise<TaskInterface[]> {
    try {
      // Build dynamic where clause for overdue tasks
      const where: any = {
        dueDate: {
          lt: new Date() // Tasks with due date before now
        }
      };

      // Add project filter if specified
      if (projectId) {
        where.projectId = projectId;
      }

      const tasks = await prisma.task.findMany({
        where,
        orderBy: { dueDate: 'desc' } // Most overdue first
      });

      return tasks;
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      throw error;
    }
  }

  /**
   * Bulk marks multiple tasks as completed
   * 
   * Efficiently updates multiple tasks to completed status in a single database
   * operation. Useful for batch operations and bulk task management. Returns
   * the count of affected tasks for confirmation.
   * 
   * @param {number[]} taskIds - Array of task IDs to mark as completed
   * @returns {Promise<{count: number}>} Object containing count of updated tasks
   * @throws {Error} When database operation fails
   */
  static async markTasksAsCompleted(taskIds: number[]): Promise<{ count: number }> {
    try {
      const updatedCount = await prisma.task.updateMany({
        where: {
          id: {
            in: taskIds // Update tasks where ID is in provided array
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

  // ========== INSTANCE METHODS ==========

  /**
   * Gets the wrapped task data
   * @returns {TaskInterface} The current task data
   */
  get taskData(): TaskInterface {
    return this.data;
  }

  /**
   * Updates the task data with new values
   * 
   * Merges new data with existing task data, preserving unchanged fields.
   * This is an in-memory operation and does not persist to database.
   * 
   * @param {Partial<TaskInterface>} newData - Fields to update
   */
  updateData(newData: Partial<TaskInterface>): void {
    this.data = { ...this.data, ...newData };
  }

  /**
   * Determines if the task is overdue
   * 
   * Checks if the task's due date has passed and the task is not completed.
   * Returns false for tasks without due dates or already completed tasks.
   * 
   * @returns {boolean} True if task is overdue and incomplete
   */
  isOverdue(): boolean {
    if (!this.data.dueDate) return false;
    return new Date(this.data.dueDate) < new Date() && !this.data.isCompleted;
  }

  /**
   * Calculates days until task due date
   * 
   * Computes the number of days between current date and task due date.
   * Returns positive numbers for future dates, negative for past dates.
   * Returns 0 if no due date is set.
   * 
   * @returns {number} Days until due date (negative if overdue, 0 if no due date)
   */
  getDaysUntilDue(): number {
    if (!this.data.dueDate) return 0;
    const today = new Date();
    const dueDate = new Date(this.data.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  }

  /**
   * Calculates task priority based on due date proximity
   * 
   * Assigns priority levels based on days until due date:
   * - High: Due within 1 day (today or tomorrow)
   * - Medium: Due within 7 days (next week)
   * - Low: Due later than 7 days or no due date
   * 
   * @returns {'high' | 'medium' | 'low'} Task priority level
   */
  getPriority(): 'high' | 'medium' | 'low' {
    const daysUntilDue = this.getDaysUntilDue();
    if (daysUntilDue <= 1) return 'high';    // Due today or tomorrow
    if (daysUntilDue <= 7) return 'medium';  // Due within a week
    return 'low';                            // Due later than a week
  }

  /**
   * Toggles task completion status and persists to database
   * 
   * Instance method that switches the completion status of the current task
   * and updates both the database and the internal data. Returns the updated
   * task data for immediate use.
   * 
   * @returns {Promise<TaskInterface | null>} Updated task data or null if operation fails
   * @throws {Error} When database operation fails
   */
  async toggleCompletion(): Promise<TaskInterface | null> {
    try {
      const updatedTask = await prisma.task.update({
        where: { id: this.data.id },
        data: { isCompleted: !this.data.isCompleted }
      });
      
      // Update internal data to reflect database changes
      this.data = updatedTask;
      return updatedTask;
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }
} 