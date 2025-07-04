import { Task } from './project.task.js';

/**
 * Project interface representing the main project entity
 */
export interface Project {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[];
}

/**
 * Interface for creating a new project
 */
export interface CreateProjectRequest {
  name: string;
  description: string;
  startDate: string | Date;
  tasks?: CreateTaskRequest[];
}

/**
 * Interface for updating an existing project
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  startDate?: string | Date;
}

/**
 * Interface for project query parameters
 */
export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Interface for project API responses
 */
export interface ProjectResponse {
  success: boolean;
  data?: Project | Project[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Interface for creating a new task
 */
export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: string | Date;
  isCompleted?: boolean;
}

/**
 * Interface for project statistics
 */
export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionPercentage: number;
}