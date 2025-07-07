// src/services/task.service.ts
import { api, requestConfig } from '../config/config';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../interfaces/task.interface';

const handleResponse = async (res: Response) => {
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.errors?.[0] || 'An error occurred during the operation.');
  }
  return result;
};

// Insert Task
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

// Update Task
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

// Update Task Status
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

// Delete Task
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

// Get All Tasks
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

// Get Task by ID
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

// Toggle Task Completion
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
