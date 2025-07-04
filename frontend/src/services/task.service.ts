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
    const res = await fetch(`${api}/tasks`, config);
    const task = await handleResponse(res);
    return task as Task;
  } catch (error: any) {
    throw error;
  }
};

// Update Task
const updateTask = async (
  id: string,
  data: UpdateTaskRequest
): Promise<Task> => {
  const config = requestConfig('PUT', data);
  try {
    const res = await fetch(`${api}/tasks/${id}`, config);
    const updatedTask = await handleResponse(res);
    return updatedTask as Task;
  } catch (error: any) {
    throw error;
  }
};

// Delete Task
const deleteTask = async (
  id: string,
): Promise<{ message: string }> => {
  const config = requestConfig('DELETE', null);
  try {
    const res = await fetch(`${api}/tasks/${id}`, config);
    const response = await handleResponse(res);
    return { message: response.message };
  } catch (error: any) {
    throw error;
  }
};

// Get All Tasks
const getAllTasks = async (projectId?: number): Promise<Task[]> => {
  const config = requestConfig('GET', null);
  const url = projectId ? `${api}/tasks?projectId=${projectId}` : `${api}/tasks`;
  try {
    const res = await fetch(url, config);
    const tasks = await handleResponse(res);
    return tasks as Task[];
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
  isCompleted: boolean
): Promise<Task> => {
  const config = requestConfig('PUT', { isCompleted });
  try {
    const res = await fetch(`${api}/tasks/${id}/toggle`, config);
    const updatedTask = await handleResponse(res);
    return updatedTask as Task;
  } catch (error: any) {
    throw error;
  }
};

const TaskService = {
  insertTask,
  updateTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  toggleTaskCompletion,
};

export default TaskService;
