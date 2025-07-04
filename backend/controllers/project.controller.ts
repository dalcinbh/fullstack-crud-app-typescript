import { Request, Response } from 'express';
import { Project } from '../classes/project.class.js';
import { Project as ProjectInterface } from '../interfaces/project.interface.js';
import prisma from '../config/prisma.js';

/**
 * Get all projects with optional pagination and filtering
 */
export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where = search ? {
      OR: [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ]
    } : {};

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get a project by ID
 */
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a new project
 */
export const insertProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, startDate, tasks } = req.body;
    
    // Validation
    if (!name || !description || !startDate) {
      res.status(400).json({
        success: false,
        message: 'Name, description, and start date are required'
      });
      return;
    }

    // Create project with optional tasks
    const projectData: any = {
      name,
      description,
      startDate: new Date(startDate)
    };

    if (tasks && Array.isArray(tasks)) {
      projectData.tasks = {
        create: tasks.map((task: any) => ({
          title: task.title,
          description: task.description,
          dueDate: new Date(task.dueDate),
          isCompleted: task.isCompleted || false
        }))
      };
    }

    const project = await prisma.project.create({
      data: projectData,
      include: {
        tasks: true
      }
    });

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update an existing project
 */
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, startDate } = req.body;
    
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: Number(id) }
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Update project
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);

    const project = await prisma.project.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
      return;
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: Number(id) }
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Delete project (tasks will be deleted automatically due to cascade)
    await prisma.project.delete({
      where: { id: Number(id) }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};