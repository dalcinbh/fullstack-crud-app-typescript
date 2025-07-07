/**
 * TypeScript interface definitions for project-related data structures and API contracts.
 * Defines type safety for project entities, Redux state management, API requests/responses,
 * and data transfer objects used throughout the project management application.
 * Ensures consistent typing across components, services, and state management layers.
 */
import { Task } from './task.interface';

/**
 * Core project entity interface representing the main project data structure.
 * Used throughout the application for displaying, editing, and managing project information.
 */
export interface Project {
  /** Unique identifier for the project in the database */
  id: number;
  /** Human-readable name or title of the project */
  name: string;
  /** Detailed description explaining the project scope and objectives */
  description: string;
  /** Date when the project is scheduled to begin or was started */
  startDate: Date;
  /** Timestamp when the project record was first created in the database */
  createdAt: Date;
  /** Timestamp when the project record was last modified */
  updatedAt: Date;
  /** Optional array of tasks associated with this project for relationship mapping */
  tasks?: Task[];
}

/**
 * Redux state interface for managing project-related application state.
 * Tracks loading states, operation results, and data collections for the project slice.
 */
export interface ProjectStates {
  /** Array of all projects currently loaded in the application state */
  projects: Project[];
  /** Currently selected or active project, null when no project is selected */
  project: Project | null;
  /** Boolean flag indicating whether any project operation is currently in progress */
  loading: boolean;
  /** Flag indicating successful completion of project creation operation */
  insertSuccess: boolean;
  /** Flag indicating successful completion of project update operation */
  updateSuccess: boolean;
  /** Flag indicating successful completion of project deletion operation */
  deleteSuccess: boolean;
  /** Flag indicating whether an error occurred during the last operation */
  error: boolean;
  /** Human-readable message describing the result of the last operation or error details */
  message: string;
  /** Pagination metadata for project list navigation and display */
  pagination: {
    /** Current page number in the paginated project list */
    page: number;
    /** Maximum number of projects to display per page */
    limit: number;
    /** Total count of projects available across all pages */
    total: number;
    /** Total number of pages available based on limit and total count */
    pages: number;
  };
}

/**
 * Data transfer object for creating new projects through API requests.
 * Contains all required and optional fields needed for project creation.
 */
export interface CreateProjectRequest {
  /** Name or title for the new project */
  name: string;
  /** Detailed description of the project scope and objectives */
  description: string;
  /** Project start date as string (ISO format) or Date object */
  startDate: string | Date;
  /** Optional array of initial tasks to create along with the project */
  tasks?: CreateTaskRequest[];
}

/**
 * Data transfer object for updating existing projects through API requests.
 * All fields are optional to support partial updates of project information.
 */
export interface UpdateProjectRequest {
  /** Updated name or title for the project */
  name?: string;
  /** Updated description of the project scope and objectives */
  description?: string;
  /** Updated project start date as string (ISO format) or Date object */
  startDate?: string | Date;
}

/**
 * Query parameters interface for filtering and searching projects through API requests.
 * Supports pagination and text-based search functionality.
 */
export interface ProjectQueryParams {
  /** Page number for pagination, starting from 1 */
  page?: number;
  /** Maximum number of projects to return per page */
  limit?: number;
  /** Text search term to filter projects by name or description */
  search?: string;
}

/**
 * Data transfer object for creating tasks within projects during project creation.
 * Used when creating projects with initial tasks in a single operation.
 */
export interface CreateTaskRequest {
  /** Title or name of the task */
  title: string;
  /** Detailed description of the task requirements and scope */
  description: string;
  /** Due date for task completion as string (ISO format) or Date object */
  dueDate: string | Date;
  /** Optional completion status, defaults to false if not specified */
  isCompleted?: boolean;
}

/**
 * Statistical data interface for project analytics and dashboard displays.
 * Provides calculated metrics about task completion within projects.
 */
export interface ProjectStats {
  /** Total number of tasks associated with the project */
  totalTasks: number;
  /** Number of tasks marked as completed */
  completedTasks: number;
  /** Number of tasks still pending completion */
  pendingTasks: number;
  /** Percentage of completed tasks relative to total tasks (0-100) */
  completionPercentage: number;
}

/**
 * API response interface for project-related HTTP requests.
 * Standardizes the format of responses from project endpoints.
 */
export interface ProjectResponse {
  /** Boolean flag indicating whether the API request was successful */
  success: boolean;
  /** Array of project objects returned by the API */
  data: Project[];
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