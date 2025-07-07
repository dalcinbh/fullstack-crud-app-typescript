/**
 * Task service module providing HTTP client functionality for task-related operations.
 * Handles all API communication for task CRUD operations within project contexts including
 * creation, retrieval, updates, status changes, and deletion. Implements the hierarchical
 * task-project relationship through nested API endpoints with consistent error handling.
 */
import { api, requestConfig } from '../config/config';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../interfaces/task.interface';

/**
 * Processes HTTP responses from API endpoints with consistent error handling.
 * Parses JSON responses and throws meaningful errors for failed requests.
 * 
 * @param res - Fetch API Response object from HTTP request
 * @returns Promise resolving to parsed JSON response data
 * @throws Error with descriptive message when request fails or returns error status
 */
const handleResponse = async (res: Response) => {
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.errors?.[0] || 'An error occurred during the operation.');
  }
  return result;
};

/**
 * Creates a new task within a specific project using nested API endpoint structure.
 * Sends POST request to project-specific tasks endpoint with task details.
 * 
 * @param data - Task creation object containing all required fields
 * @param data.projectId - Foreign key reference to the parent project
 * @param data.title - Title or name of the new task
 * @param data.description - Detailed description of task requirements
 * @param data.dueDate - Due date for task completion
 * @param data.isCompleted - Optional completion status, defaults to false
 * @returns Promise resolving to created Task object with generated ID and timestamps
 * @throws Error when creation fails due to invalid project ID, validation errors, or server issues
 */
const insertTask = async (
  data: CreateTaskRequest,
): Promise<Task> => {
  const config = requestConfig('POST', data);
  try {
    const res = await fetch(`${api}/projects/${data.projectId}/tasks`, config);
    const response = await handleResponse(res);
    return response.data as Task;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Updates an existing task with new information using partial data within project context.
 * Sends PATCH request to specific task endpoint with updated fields and project validation.
 * 
 * @param id - Unique identifier of the task to update
 * @param data - Partial task object containing fields to update
 * @param projectId - Parent project ID for validation and endpoint construction
 * @returns Promise resolving to updated Task object with new values and timestamps
 * @throws Error when update fails due to invalid IDs, validation errors, or server issues
 */
const updateTask = async (
  id: string,
  data: UpdateTaskRequest,
  projectId: number
): Promise<Task> => {
  const config = requestConfig('PATCH', data);
  try {
    const res = await fetch(`${api}/projects/${projectId}/tasks/${id}`, config);
    const response = await handleResponse(res);
    return response.data as Task;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Updates only the completion status of a task within its project context.
 * Sends PATCH request with completion boolean to toggle task status efficiently.
 * 
 * @param id - Unique identifier of the task to update
 * @param projectId - Parent project ID for validation and endpoint construction
 * @param isCompleted - New completion status (true for completed, false for pending)
 * @returns Promise resolving to updated Task object with new completion status
 * @throws Error when update fails due to invalid IDs, validation errors, or server issues
 */
const updateTaskStatus = async (
  id: string,
  projectId: number,
  isCompleted: boolean
): Promise<Task> => {
  const config = requestConfig('PATCH', { isCompleted });
  try {
    const res = await fetch(`${api}/projects/${projectId}/tasks/${id}`, config);
    const response = await handleResponse(res);
    return response.data as Task;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Permanently removes a task from the system within its project context.
 * Sends DELETE request to specific task endpoint with project relationship validation.
 * 
 * @param id - Unique identifier of the task to delete
 * @param projectId - Parent project ID for validation and endpoint construction
 * @returns Promise resolving to success message confirming deletion
 * @throws Error when deletion fails due to invalid IDs, foreign key constraints, or server issues
 */
const deleteTask = async (
  id: string,
  projectId: number
): Promise<{ message: string }> => {
  const config = requestConfig('DELETE', null);
  try {
    const res = await fetch(`${api}/projects/${projectId}/tasks/${id}`, config);
    const response = await handleResponse(res);
    return { message: response.message };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Retrieves all tasks belonging to a specific project with complete task information.
 * Sends GET request to project-specific tasks endpoint for filtered task list.
 * 
 * @param projectId - Unique identifier of the project to retrieve tasks from
 * @returns Promise resolving to array of Task objects associated with the project
 * @throws Error when retrieval fails due to invalid project ID or server issues
 */
const getAllTasks = async (projectId: number): Promise<Task[]> => {
  const config = requestConfig('GET', null);
  try {
    const res = await fetch(`${api}/projects/${projectId}/tasks`, config);
    const response = await handleResponse(res);
    return response.data as Task[];
  } catch (error: any) {
    throw error;
  }
};

/**
 * Retrieves a single task by its unique identifier using direct task endpoint.
 * Sends GET request to individual task endpoint for detailed task information.
 * 
 * @param id - Unique identifier of the task to retrieve
 * @returns Promise resolving to complete Task object with all related data
 * @throws Error when retrieval fails due to invalid ID, task not found, or server issues
 */
const getTaskById = async (
  id: string,
): Promise<Task> => {
  const config = requestConfig('GET', null);
  try {
    const res = await fetch(`${api}/tasks/${id}`, config);
    const task = await handleResponse(res);
    return task as Task;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Toggles the completion status of a task using specialized endpoint for status changes.
 * Sends PATCH request to completion-specific endpoint that automatically inverts current status.
 * 
 * @param id - Unique identifier of the task to toggle
 * @param projectId - Parent project ID for validation and endpoint construction
 * @returns Promise resolving to updated Task object with inverted completion status
 * @throws Error when toggle fails due to invalid IDs, validation errors, or server issues
 */
const toggleTaskCompletion = async (
  id: string,
  projectId: number
): Promise<Task> => {
  const config = requestConfig('PATCH', {});
  try {
    const res = await fetch(`${api}/projects/${projectId}/tasks/${id}/complete`, config);
    const response = await handleResponse(res);
    return response.data as Task;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Service object containing all task-related API operations with project context awareness.
 * Provides centralized access to task CRUD functionality with hierarchical relationship
 * management and consistent error handling. Used by Redux slices and components for task data management.
 */
const TaskService = {
  insertTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getAllTasks,
  getTaskById,
  toggleTaskCompletion,
};

export default TaskService;
