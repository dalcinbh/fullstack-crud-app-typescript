/**
 * Task Interface Definitions
 * 
 * TypeScript interface definitions for task-related data structures used throughout
 * the application. These interfaces provide type safety and documentation for:
 * - Database entity representations
 * - API request/response formats
 * - Query parameter structures
 * - Data transfer objects
 * 
 * Tasks are always associated with projects and represent individual work items
 * within a project. These interfaces ensure consistent data handling across:
 * - Database operations (Prisma models)
 * - Business logic (Task class methods)
 * - API controllers (request/response handling)
 * - Frontend integration (type-safe data contracts)
 * 
 * All task operations require project context for proper validation and
 * relationship management.
 */

/**
 * Task Entity Interface
 * 
 * Represents the main task entity as stored in the database and used throughout
 * the application. This interface mirrors the Prisma Task model and includes
 * all database fields with proper relationships to projects.
 * 
 * Tasks are always associated with a project via the projectId foreign key.
 * The relationship is enforced at the database level with cascade operations.
 * 
 * Used by:
 * - Task.class.ts - Business logic operations
 * - task.controller.ts - API response formatting
 * - Database queries and results
 * - Frontend task management components
 * 
 * @interface Task
 */
export interface Task {
  /** Unique identifier for the task (auto-generated) */
  id: number;
  
  /** Foreign key reference to the parent project (required) */
  projectId: number;
  
  /** Task title/name (required, user-defined) */
  title: string;
  
  /** Detailed task description (required, user-defined) */
  description: string;
  
  /** Task due date (required, user-defined) */
  dueDate: Date;
  
  /** Task completion status - true if completed, false if pending */
  isCompleted: boolean;
  
  /** Timestamp when task was created (auto-generated) */
  createdAt: Date;
  
  /** Timestamp when task was last updated (auto-generated) */
  updatedAt: Date;
}

/**
 * Create Task Request Interface
 * 
 * Defines the structure for creating new tasks via API endpoints. Requires
 * project context and supports flexible date handling. Tasks are created
 * with completion status defaulting to false.
 * 
 * Used by:
 * - POST /projects/:projectId/tasks endpoint
 * - task.controller.ts - createTask function
 * - Frontend task creation forms
 * - Batch task creation operations
 * 
 * @interface CreateTaskRequest
 */
export interface CreateTaskRequest {
  /** ID of the project this task belongs to (required) */
  projectId: number;
  
  /** Task title/name (required) */
  title: string;
  
  /** Task description (required) */
  description: string;
  
  /** Task due date - accepts ISO string or Date object for flexibility */
  dueDate: string | Date;
  
  /** Task completion status (optional, defaults to false) */
  isCompleted?: boolean;
}

/**
 * Update Task Request Interface
 * 
 * Defines the structure for updating existing tasks via API endpoints.
 * All fields are optional to support partial updates, allowing clients to
 * update only the fields they need to change. Project ID cannot be changed
 * after task creation to maintain data integrity.
 * 
 * Used by:
 * - PUT /projects/:projectId/tasks/:taskId endpoint
 * - task.controller.ts - updateTask function
 * - Frontend task edit forms
 * - Bulk task update operations
 * 
 * @interface UpdateTaskRequest
 */
export interface UpdateTaskRequest {
  /** Updated task title (optional) */
  title?: string;
  
  /** Updated task description (optional) */
  description?: string;
  
  /** Updated due date - accepts ISO string or Date object (optional) */
  dueDate?: string | Date;
  
  /** Updated completion status (optional) */
  isCompleted?: boolean;
}

/**
 * Task Query Parameters Interface
 * 
 * Defines the structure for query parameters used in task listing and
 * filtering endpoints. Supports project-specific filtering, completion
 * status filtering, and pagination for efficient data retrieval.
 * 
 * Used by:
 * - GET /projects/:projectId/tasks endpoint
 * - GET /tasks/overdue endpoint
 * - task.controller.ts - getAllTasks and getOverdueTasks functions
 * - Frontend task listing and filtering components
 * 
 * @interface TaskQueryParams
 */
export interface TaskQueryParams {
  /** Filter tasks by project ID (optional) */
  projectId?: number;
  
  /** Filter tasks by completion status (optional) */
  isCompleted?: boolean;
  
  /** Page number for pagination (1-based indexing) */
  page?: number;
  
  /** Number of items per page for pagination */
  limit?: number;
}

/**
 * Task API Response Interface
 * 
 * Standardized response format for all task-related API endpoints. Provides
 * consistent structure for success/error handling, data delivery, and optional
 * pagination metadata. Follows the same pattern as project responses for
 * API consistency.
 * 
 * Used by:
 * - All task controller functions
 * - API response formatting
 * - Frontend API consumption
 * - Error handling and user feedback
 * - Validation result communication
 * 
 * @interface TaskResponse
 */
export interface TaskResponse {
  /** Indicates if the API operation was successful */
  success: boolean;
  
  /** Task data - single task or array of tasks */
  data?: Task | Task[];
  
  /** Optional success or informational message */
  message?: string;
  
  /** Optional error message when success is false */
  error?: string;
  
  /** Optional pagination metadata for list endpoints */
  pagination?: {
    /** Current page number */
    page: number;
    
    /** Items per page */
    limit: number;
    
    /** Total number of items */
    total: number;
    
    /** Total number of pages */
    pages: number;
  };
}