/**
 * Task interface representing a task within a project
 */
export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  dueDate: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for creating a new task
 */
export interface CreateTaskRequest {
  projectId: number;
  title: string;
  description: string;
  dueDate: string | Date;
  isCompleted?: boolean;
}

/**
 * Interface for updating an existing task
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string | Date;
  isCompleted?: boolean;
}

/**
 * Interface for task query parameters
 */
export interface TaskQueryParams {
  projectId?: number;
  isCompleted?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Interface for task API responses
 */
export interface TaskResponse {
  success: boolean;
  data?: Task | Task[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}