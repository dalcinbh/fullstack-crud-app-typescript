// src/services/project.service.ts
import { api, requestConfig } from '../config/config';
import { Project } from '../interfaces/project.interface';

const handleResponse = async (res: Response) => {
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.errors?.[0] || 'An error occurred during the operation.');
  }
  return result;
};

// Insert Project
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


// Update Project
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

// Delete Project
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

// Get All Projects
const getAllProjects = async (): Promise<Project[]> => {
  const config = requestConfig('GET', null);
  try {
    const res = await fetch(`${api}/projects`, config);
    const projects = await handleResponse(res);
    return projects as Project[];
  } catch (error: any) {
    throw error;
  }
};

// Get Project by ID
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

const ProjectService = {
  insertProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectById,
};

export default ProjectService;
