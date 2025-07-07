/**
 * Main project management component that displays a comprehensive list of projects with CRUD operations.
 * Integrates with Redux store to manage project data and provides interfaces for adding, editing, and managing tasks.
 * Features sortable table with pagination, search functionality, and modal-based interactions.
 * Automatically refreshes data after operations and maintains responsive design with loading states.
 * 
 * @returns JSX element containing project list table with action buttons and modal interfaces
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import useAppDispatch from '../../hooks/use-app.dispatch';
import useAppSelector from '../../hooks/use-app.selector';
import { formatDateToBR, formatDateTimeToBR } from '../../utils/dateFormat';

import { getAllProjectsAsync, projectSelector } from '../../slices/project.slice';
import { Project } from '../../interfaces/project.interface';
import { Table } from './Table';
import AddProjectModal from './AddProjectModal';
import EditProjectModal from './EditProjectModal';
import TaskManagementModal from '../Task/TaskManagementModal';
import { PaginationProvider } from '../../contexts/PaginationContext';

const ProjectList = () => {
  const dispatch = useAppDispatch();
  const { projects, loading } = useAppSelector(projectSelector);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState<Project | null>(null);

  /** Read page size from environment variables with fallback to default value */
  const projectPageSize = Number(process.env.REACT_APP_PROJECT_LIST_SIZE_PAGE) || 5;

  /**
   * Effect hook that loads all projects from the API on component mount.
   * Ensures fresh data is available when the component initializes.
   */
  useEffect(() => {
    dispatch(getAllProjectsAsync());
  }, [dispatch]);

  /**
   * Opens the add project modal and resets any existing modal state.
   */
  const handleAddProject = () => {
    setIsModalOpen(true);
  };

  /**
   * Closes the add project modal and clears modal state.
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  /**
   * Handles successful project addition by refreshing the projects list.
   * Ensures the UI reflects the newly created project immediately.
   */
  const handleProjectAdded = () => {
    dispatch(getAllProjectsAsync());
  };

  /**
   * Initiates project editing by setting the selected project and opening the edit modal.
   * Uses useCallback to prevent unnecessary re-renders of child components.
   * 
   * @param project - Project object to be edited
   */
  const handleEditProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  }, []);

  /**
   * Closes the edit project modal and clears selected project state.
   */
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProject(null);
  };

  /**
   * Handles successful project update by refreshing the projects list.
   * Uses useCallback to maintain reference stability across renders.
   */
  const handleProjectUpdated = useCallback(() => {
    dispatch(getAllProjectsAsync());
  }, [dispatch]);

  /**
   * Initiates task management for a specific project by opening the task modal.
   * Uses useCallback to prevent unnecessary re-renders of child components.
   * 
   * @param project - Project object whose tasks will be managed
   */
  const handleManageTasks = useCallback((project: Project) => {
    setSelectedProjectForTasks(project);
    setIsTaskModalOpen(true);
  }, []);

  /**
   * Closes the task management modal and clears selected project state.
   */
  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedProjectForTasks(null);
  };

  /**
   * Handles project list updates after task operations.
   * Ensures the project list reflects any changes made through task management.
   */
  const handleProjectsUpdate = useCallback(() => {
    dispatch(getAllProjectsAsync());
  }, [dispatch]);

  /**
   * Memoized column definitions for the project table.
   * Defines structure, formatting, and behavior for each table column including sorting and filtering.
   * Uses useMemo to prevent re-creation on every render for better performance.
   */
  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        cell: (info) => info.getValue(),
        enableSorting: true,
        enableColumnFilter: false,
        filterFn: 'includesString',
      },
      {
        header: 'Project Name',
        accessorKey: 'name',
        cell: (info) => (
          <div className="font-medium text-gray-900">
            {info.getValue() as string}
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
        filterFn: 'includesString',
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: (info) => (
          <div className="text-gray-600 max-w-xs truncate" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
        filterFn: 'includesString',
      },
      {
        header: 'Start Date',
        accessorKey: 'startDate',
        cell: (info) => (
          <div className="text-gray-900">
            {formatDateToBR(info.getValue() as string | Date)}
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
        filterFn: 'includesString',
      },
      {
        header: 'Created At',
        accessorKey: 'createdAt',
        cell: (info) => (
          <div className="text-gray-600 text-sm">
            {formatDateTimeToBR(info.getValue() as string | Date)}
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
        filterFn: 'includesString',
      },
      {
        header: 'Updated At',
        accessorKey: 'updatedAt',
        cell: (info) => (
          <div className="text-gray-600 text-sm">
            {formatDateTimeToBR(info.getValue() as string | Date)}
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
        filterFn: 'includesString',
      },
      {
        id: 'tasks-count',
        header: 'Tasks',
        accessorKey: 'tasks',
        cell: (info) => {
          const tasks = info.getValue() as any[] || [];
          const completedTasks = tasks.filter(task => task.isCompleted).length;
          return (
            <div className="text-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {completedTasks}/{tasks.length}
              </span>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: 'project-status',
        header: 'Status',
        accessorKey: 'tasks',
        cell: (info) => {
          const tasks = info.getValue() as any[] || [];
          const completedTasks = tasks.filter(task => task.isCompleted).length;
          const totalTasks = tasks.length;
          
          let status = 'Not Started';
          let statusClass = 'bg-gray-100 text-gray-800';
          
          /** Determine project status based on task completion ratio */
          if (totalTasks === 0) {
            status = 'No Tasks';
            statusClass = 'bg-gray-100 text-gray-800';
          } else if (completedTasks === totalTasks) {
            status = 'Completed';
            statusClass = 'bg-green-100 text-green-800';
          } else if (completedTasks > 0) {
            status = 'In Progress';
            statusClass = 'bg-yellow-100 text-yellow-800';
          } else {
            status = 'Not Started';
            statusClass = 'bg-blue-100 text-blue-800';
          }
          
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
              {status}
            </span>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const project = info.row.original;
          return (
            <div className="flex justify-center space-x-1">
              <button
                onClick={() => handleManageTasks(project)}
                className="text-green-600 hover:text-green-800 p-1 rounded-md hover:bg-green-50 transition-colors"
                title="Manage tasks"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
                  />
                </svg>
              </button>
              <button
                onClick={() => handleEditProject(project)}
                className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                title="Edit project"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                  />
                </svg>
              </button>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [handleEditProject, handleManageTasks],
  );

  /** Memoized project data array to prevent unnecessary re-renders */
  const data: Project[] = projects || [];

  return (
    <PaginationProvider>
      <div className="mt-2 flex flex-col items-center">
        <div className="mt-2 flex flex-col items-start w-full">
          <div className="flex justify-between items-center w-full mb-6">
            <div className="flex-col items-start">
              <div className="font-semibold text-xl md:text-2xl text-gray-900 mt-2">
                <h2>Projects</h2>
              </div>
              <div className="text-sm md:text-base text-gray-600 mb-0">
                <span>Manage your projects and track progress</span>
              </div>
              <div className="text-sm text-gray-500">
                <span>Total Projects: {data.length}</span>
              </div>
            </div>
            
            <button
              onClick={handleAddProject}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add New Project
            </button>
          </div>

          <div className="relative w-full" style={{ minHeight: '35px' }}>
            <div className="absolute inset-0 flex justify-center items-center">
              {loading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading projects...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {!loading && (
          <Table 
            data={data} 
            columns={columns} 
            pageSize={projectPageSize}
          />
        )}

        <AddProjectModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleProjectAdded}
        />

        {selectedProject && (
          <EditProjectModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onSuccess={handleProjectUpdated}
            project={selectedProject}
          />
        )}

        {selectedProjectForTasks && (
          <TaskManagementModal
            isOpen={isTaskModalOpen}
            onClose={handleCloseTaskModal}
            project={selectedProjectForTasks}
            onProjectsUpdate={handleProjectsUpdate}
          />
        )}
      </div>
    </PaginationProvider>
  );
};

export default ProjectList;
