/**
 * Project service module providing HTTP client functionality for project-related operations.
 * Handles all API communication for project CRUD operations including creation, retrieval,
 * updates, and deletion. Implements error handling and response processing for consistent
 * data management across the application.
 */
import { api, requestConfig } from '../config/config';
import { Project, ProjectResponse } from '../interfaces/project.interface';

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
 * Creates a new project in the system with provided project details.
 * Sends POST request to projects endpoint with name, description, and start date.
 * 
 * @param data - Object containing project creation fields
 * @param data.name - Name or title of the new project
 * @param data.description - Detailed description of project scope and objectives
 * @param data.startDate - Project start date in ISO string format
 * @returns Promise resolving to created Project object with generated ID and timestamps
 * @throws Error when creation fails due to validation errors or server issues
 */
const insertProject = async (
  data: { name: string; description: string; startDate: string }
): Promise<Project> => {
  const config = requestConfig('POST', data);
  try {
    const res = await fetch(`${api}/projects`, config);
    const result = await handleResponse(res);
    return result as Project;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Updates an existing project with new information using partial data.
 * Sends PUT request to specific project endpoint with updated fields.
 * 
 * @param id - Unique identifier of the project to update
 * @param data - Partial project object containing fields to update
 * @returns Promise resolving to updated Project object with new values and timestamps
 * @throws Error when update fails due to invalid ID, validation errors, or server issues
 */
const updateProject = async (
  id: string,
  data: Partial<Project>
): Promise<Project> => {
  const config = requestConfig('PUT', data);
  try {
    const res = await fetch(`${api}/projects/${id}`, config);
    const updatedProject = await handleResponse(res);
    return updatedProject as Project;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Permanently removes a project from the system including all associated tasks.
 * Sends DELETE request to specific project endpoint for complete removal.
 * 
 * @param id - Unique identifier of the project to delete
 * @returns Promise resolving to success message confirming deletion
 * @throws Error when deletion fails due to invalid ID, foreign key constraints, or server issues
 */
const deleteProject = async (
  id: string,
): Promise<{ message: string }> => {
  const config = requestConfig('DELETE', null);
  try {
    const res = await fetch(`${api}/projects/${id}`, config);
    const response = await handleResponse(res);
    return { message: response.message };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Retrieves all projects from the system with optional pagination and filtering.
 * Sends GET request to projects endpoint returning complete project list.
 * 
 * @returns Promise resolving to ProjectResponse containing array of projects and pagination metadata
 * @throws Error when retrieval fails due to server issues or database connectivity problems
 */
const getAllProjects = async (): Promise<ProjectResponse> => {
  const config = requestConfig('GET', null);
  try {
    const res = await fetch(`${api}/projects`, config);
    const projects = await handleResponse(res);
    return projects as ProjectResponse;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Retrieves a single project by its unique identifier including associated tasks.
 * Sends GET request to specific project endpoint for detailed project information.
 * 
 * @param id - Unique identifier of the project to retrieve
 * @returns Promise resolving to complete Project object with all related data
 * @throws Error when retrieval fails due to invalid ID, project not found, or server issues
 */
const getProjectById = async (
  id: string,
): Promise<Project> => {
  const config = requestConfig('GET', null);
  try {
    const res = await fetch(`${api}/projects/${id}`, config);
    const project = await handleResponse(res);
    return project as Project;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Service object containing all project-related API operations.
 * Provides centralized access to project CRUD functionality with consistent error handling.
 * Used by Redux slices and components for project data management.
 */
const ProjectService = {
  insertProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectById,
};

export default ProjectService;
