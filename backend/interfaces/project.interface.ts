/**
 * Project Interface Definitions
 * 
 * TypeScript interface definitions for project-related data structures used throughout
 * the application. These interfaces provide type safety and documentation for:
 * - Database entity representations
 * - API request/response formats
 * - Query parameter structures
 * - Data transfer objects
 * 
 * These interfaces ensure consistent data handling across the application layers:
 * - Database operations (Prisma models)
 * - Business logic (class methods)
 * - API controllers (request/response handling)
 * - Frontend integration (type-safe data contracts)
 */

import { Task } from './task.interface.js';

/**
 * Project Entity Interface
 * 
 * Represents the main project entity as stored in the database and used throughout
 * the application. This interface mirrors the Prisma Project model and includes
 * all database fields plus optional task relationships.
 * 
 * Used by:
 * - Project.class.ts - Business logic operations
 * - project.controller.ts - API response formatting
 * - Database queries and results
 * - Frontend data consumption
 * 
 * @interface Project
 */
export interface Project {
  /** Unique identifier for the project (auto-generated) */
  id: number;
  
  /** Project name/title (required, user-defined) */
  name: string;
  
  /** Detailed project description (required, user-defined) */
  description: string;
  
  /** Project start date (required, user-defined) */
  startDate: Date;
  
  /** Timestamp when project was created (auto-generated) */
  createdAt: Date;
  
  /** Timestamp when project was last updated (auto-generated) */
  updatedAt: Date;
  
  /** Optional array of associated tasks (populated via Prisma relations) */
  tasks?: Task[];
}

/**
 * Create Project Request Interface
 * 
 * Defines the structure for creating new projects via API endpoints. Supports
 * flexible date handling (string or Date objects) and optional task creation
 * in the same request for convenience.
 * 
 * Used by:
 * - POST /projects endpoint
 * - project.controller.ts - insertProject function
 * - Frontend project creation forms
 * 
 * @interface CreateProjectRequest
 */
export interface CreateProjectRequest {
  /** Project name/title (required) */
  name: string;
  
  /** Project description (required) */
  description: string;
  
  /** Project start date - accepts ISO string or Date object for flexibility */
  startDate: string | Date;
  
  /** Optional array of initial tasks to create with the project */
  tasks?: CreateTaskRequest[];
}

/**
 * Update Project Request Interface
 * 
 * Defines the structure for updating existing projects via API endpoints.
 * All fields are optional to support partial updates, allowing clients to
 * update only the fields they need to change.
 * 
 * Used by:
 * - PUT /projects/:id endpoint
 * - project.controller.ts - updateProject function
 * - Frontend project edit forms
 * 
 * @interface UpdateProjectRequest
 */
export interface UpdateProjectRequest {
  /** Updated project name (optional) */
  name?: string;
  
  /** Updated project description (optional) */
  description?: string;
  
  /** Updated start date - accepts ISO string or Date object (optional) */
  startDate?: string | Date;
}

/**
 * Project Query Parameters Interface
 * 
 * Defines the structure for query parameters used in project listing endpoints.
 * Supports pagination and search functionality for efficient data retrieval
 * and user-friendly project browsing.
 * 
 * Used by:
 * - GET /projects endpoint
 * - project.controller.ts - getAllProjects function
 * - Frontend project listing components
 * 
 * @interface ProjectQueryParams
 */
export interface ProjectQueryParams {
  /** Page number for pagination (1-based indexing) */
  page?: number;
  
  /** Number of items per page for pagination */
  limit?: number;
  
  /** Search term to filter projects by name or description */
  search?: string;
}

/**
 * Project API Response Interface
 * 
 * Standardized response format for all project-related API endpoints. Provides
 * consistent structure for success/error handling, data delivery, and optional
 * pagination metadata.
 * 
 * Used by:
 * - All project controller functions
 * - API response formatting
 * - Frontend API consumption
 * - Error handling and user feedback
 * 
 * @interface ProjectResponse
 */
export interface ProjectResponse {
  /** Indicates if the API operation was successful */
  success: boolean;
  
  /** Project data - single project or array of projects */
  data?: Project | Project[];
  
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

/**
 * Create Task Request Interface
 * 
 * Defines the structure for creating tasks as part of project creation.
 * Used when creating projects with initial tasks in a single API call.
 * Supports flexible date handling and optional completion status.
 * 
 * Used by:
 * - CreateProjectRequest interface
 * - Project creation with initial tasks
 * - Batch task creation operations
 * 
 * @interface CreateTaskRequest
 */
export interface CreateTaskRequest {
  /** Task title/name (required) */
  title: string;
  
  /** Task description (required) */
  description: string;
  
  /** Task due date - accepts ISO string or Date object */
  dueDate: string | Date;
  
  /** Task completion status (optional, defaults to false) */
  isCompleted?: boolean;
}

/**
 * Project Statistics Interface
 * 
 * Defines the structure for project statistics and metrics used in
 * dashboards, reporting, and project analysis features. Provides
 * comprehensive task completion statistics and project progress indicators.
 * 
 * Used by:
 * - Project.class.ts - getBasicStats method
 * - Dashboard components
 * - Project analytics and reporting
 * - Progress tracking features
 * 
 * @interface ProjectStats
 */
export interface ProjectStats {
  /** Total number of tasks in the project */
  totalTasks: number;
  
  /** Number of completed tasks */
  completedTasks: number;
  
  /** Number of pending/incomplete tasks */
  pendingTasks: number;
  
  /** Completion percentage (0-100) */
  completionPercentage: number;
}