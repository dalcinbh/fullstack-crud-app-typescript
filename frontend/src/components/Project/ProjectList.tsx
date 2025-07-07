// src/components/Project/ProjectList.tsx
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

const ProjectList = () => {
  const dispatch = useAppDispatch();
  const { projects, loading } = useAppSelector(projectSelector);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState<Project | null>(null);

  // Read page size from environment variables
  const projectPageSize = Number(process.env.REACT_APP_PROJECT_LIST_SIZE_PAGE) || 5;

  useEffect(() => {
    dispatch(getAllProjectsAsync());
  }, [dispatch]);

  const handleAddProject = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleProjectAdded = () => {
    // Refresh the projects list after adding a new project
    dispatch(getAllProjectsAsync());
  };

  const handleEditProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProject(null);
  };

  const handleProjectUpdated = () => {
    // Refresh the projects list after updating a project
    dispatch(getAllProjectsAsync());
  };

  const handleManageTasks = useCallback((project: Project) => {
    setSelectedProjectForTasks(project);
    setIsTaskModalOpen(true);
  }, []);

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedProjectForTasks(null);
  };

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

  const data: Project[] = projects || [];

  return (
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

      {!loading && <Table data={data} columns={columns} pageSize={projectPageSize} />}

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
          onProjectsUpdate={() => dispatch(getAllProjectsAsync())}
        />
      )}
    </div>
  );
};

export default ProjectList;
