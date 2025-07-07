import React, { useCallback, useState } from 'react';
import useAppDispatch from '../../hooks/use-app.dispatch';
import { updateTaskStatusAsync, deleteTaskAsync } from '../../slices/task.slice';
import { getAllProjectsAsync } from '../../slices/project.slice';
import { Task } from '../../interfaces/task.interface';
import { formatDateToBR } from '../../utils/dateFormat';

/**
 * Props interface for the TaskItem component
 */
interface TaskItemProps {
  /** Task object containing all task data to display */
  task: Task;
  /** Unique identifier of the project that owns this task */
  projectId: number;
  /** Optional callback function executed after task updates */
  onUpdate?: () => void;
}

/**
 * Individual task item component with inline editing capabilities and visual status indicators.
 * Displays task information including title, description, due date, and completion status.
 * Provides inline status editing with save functionality and task deletion capabilities.
 * Features visual indicators for overdue tasks and completed tasks with appropriate styling.
 * Integrates with Redux store for task operations and project data synchronization.
 * 
 * @param props - Configuration object containing task data, project ID, and update callback
 * @returns JSX element representing a single task item with interactive controls
 */
const TaskItem: React.FC<TaskItemProps> = ({ task, projectId, onUpdate }) => {
  const dispatch = useAppDispatch();
  const [selectedStatus, setSelectedStatus] = useState(task.isCompleted ? 'completed' : 'pending');
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  /**
   * Handles task status changes through dropdown selection.
   * Updates local state and tracks whether changes need to be saved.
   * Uses useCallback to prevent unnecessary re-renders and maintain performance.
   * 
   * @param event - React change event from status dropdown
   */
  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);
    setHasPendingChanges(newStatus !== (task.isCompleted ? 'completed' : 'pending'));
  }, [task.isCompleted]);

  /**
   * Saves task status changes to the backend and updates related data.
   * Dispatches Redux actions to update task status and refresh project data.
   * Handles error cases and provides user feedback through console logging.
   * Uses useCallback to maintain reference stability across renders.
   */
  const handleSave = useCallback(async () => {
    try {
      const isCompleted = selectedStatus === 'completed';
      await dispatch(updateTaskStatusAsync({
        id: task.id.toString(),
        projectId: projectId,
        isCompleted: isCompleted
      }));
      
      /** Reload tasks and projects after successful update */
      if (onUpdate) {
        onUpdate();
      }
      dispatch(getAllProjectsAsync());
      
      setHasPendingChanges(false);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }, [dispatch, task.id, projectId, selectedStatus, onUpdate]);

  /**
   * Handles task deletion with user confirmation.
   * Shows confirmation dialog before proceeding with deletion.
   * Dispatches Redux action to delete task and triggers data refresh.
   * Uses useCallback to prevent unnecessary re-renders.
   */
  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTaskAsync({
        id: task.id.toString(),
        projectId: projectId,
      }));
      if (onUpdate) {
        onUpdate();
      }
    }
  }, [dispatch, task.id, projectId, onUpdate]);

  /** Calculate task status indicators based on completion and due date */
  const isCompleted = selectedStatus === 'completed';
  const isOverdue = new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <div className={`p-4 border rounded-lg transition-all hover:shadow-md ${
      isCompleted 
        ? 'bg-green-50 border-green-200' 
        : isOverdue 
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start space-x-3">
        {/* Status Select */}
        <div className="flex-shrink-0 pt-1">
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="text-sm border border-gray-300 rounded-md py-1 px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${
                isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h4>
              <p className={`text-sm mt-1 ${
                isCompleted ? 'line-through text-gray-400' : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {/** Save Button - Only show when there are pending changes */}
              {hasPendingChanges && (
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md transition-colors font-medium"
                  title="Save changes"
                >
                  Save
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Task Meta Information */}
          <div className="flex items-center space-x-4 mt-3">
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
              Due: {formatDateToBR(task.dueDate)}
            </div>

            {/* Status Badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isCompleted
                ? 'bg-green-100 text-green-800'
                : isOverdue
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem; 