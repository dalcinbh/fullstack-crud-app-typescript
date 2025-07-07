/**
 * TypeScript interface definitions for task-related data structures and API contracts.
 * Defines type safety for task entities, Redux state management, API requests/responses,
 * and data transfer objects used throughout the task management functionality.
 * Ensures consistent typing across components, services, and state management layers.
 */

/**
 * Core task entity interface representing individual tasks within projects.
 * Used throughout the application for displaying, editing, and managing task information.
 */
export interface Task {
  /** Unique identifier for the task in the database */
  id: number;
  /** Foreign key reference to the parent project this task belongs to */
  projectId: number;
  /** Human-readable title or name of the task */
  title: string;
  /** Detailed description explaining the task requirements and scope */
  description: string;
  /** Date when the task is due for completion */
  dueDate: Date;
  /** Boolean flag indicating whether the task has been completed */
  isCompleted: boolean;
  /** Timestamp when the task record was first created in the database */
  createdAt: Date;
  /** Timestamp when the task record was last modified */
  updatedAt: Date;
}

/**
 * Redux state interface for managing task-related application state.
 * Tracks loading states, operation results, and data collections for the task slice.
 */
export interface TaskStates {
  /** Array of all tasks currently loaded in the application state */
  tasks: Task[];
  /** Currently selected or active task, null when no task is selected */
  task: Task | null;
  /** Boolean flag indicating whether any task operation is currently in progress */
  loading: boolean;
  /** Flag indicating successful completion of task creation operation */
  insertSuccess: boolean;
  /** Flag indicating successful completion of task update operation */
  updateSuccess: boolean;
  /** Flag indicating successful completion of task deletion operation */
  deleteSuccess: boolean;
  /** Flag indicating whether an error occurred during the last operation */
  error: boolean;
  /** Human-readable message describing the result of the last operation or error details */
  message: string;
}

/**
 * Data transfer object for creating new tasks through API requests.
 * Contains all required fields needed for task creation within a specific project.
 */
export interface CreateTaskRequest {
  /** Foreign key reference to the project this task will belong to */
  projectId: number;
  /** Title or name for the new task */
  title: string;
  /** Detailed description of the task requirements and scope */
  description: string;
  /** Due date for task completion as string (ISO format) or Date object */
  dueDate: string | Date;
  /** Optional completion status, defaults to false if not specified */
  isCompleted?: boolean;
}

/**
 * Data transfer object for updating existing tasks through API requests.
 * All fields are optional to support partial updates of task information.
 */
export interface UpdateTaskRequest {
  /** Updated title or name for the task */
  title?: string;
  /** Updated description of the task requirements and scope */
  description?: string;
  /** Updated due date for task completion as string (ISO format) or Date object */
  dueDate?: string | Date;
  /** Updated completion status of the task */
  isCompleted?: boolean;
}

/**
 * Query parameters interface for filtering and searching tasks through API requests.
 * Supports filtering by project, completion status, and pagination.
 */
export interface TaskQueryParams {
  /** Filter tasks by specific project ID */
  projectId?: number;
  /** Filter tasks by completion status (true for completed, false for pending) */
  isCompleted?: boolean;
  /** Page number for pagination, starting from 1 */
  page?: number;
  /** Maximum number of tasks to return per page */
  limit?: number;
}

/**
 * API response interface for task-related HTTP requests.
 * Standardizes the format of responses from task endpoints with flexible data structure.
 */
export interface TaskResponse {
  /** Boolean flag indicating whether the API request was successful */
  success: boolean;
  /** Task data returned by the API, can be single task or array of tasks */
  data?: Task | Task[];
  /** Optional success message describing the operation result */
  message?: string;
  /** Optional error message when the request fails */
  error?: string;
  /** Optional pagination metadata included with paginated responses */
  pagination?: {
    /** Current page number in the response */
    page: number;
    /** Number of items per page used in the response */
    limit: number;
    /** Total count of items available across all pages */
    total: number;
    /** Total number of pages available based on limit and total */
    pages: number;
  };
}