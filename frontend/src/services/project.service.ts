// src/services/ProjectService.ts
import { api, requestConfig } from '../config/config';
import { Project } from '../interfaces/project.interface';

const handleResponse = async (res: Response) => {
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.errors?.[0] || 'Ocorreu um erro na operação.');
  }
  return result;
};

// Inserir Projeto
const insertProject = async (
  formData: FormData,
): Promise<Project> => {
  const config = requestConfig('POST', formData); // true para multipart/form-data
  try {
    const res = await fetch(`${api}/projects/uploadfile`, config);
    const data = await handleResponse(res);
    return data as Project;
  } catch (error: any) {
    throw error;
  }
};

// Atualizar Projeto
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

// Deletar Projeto
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

// Buscar Todos os Projetos
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

// Buscar Projeto por ID
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
