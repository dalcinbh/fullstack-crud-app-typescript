import React, { useState, useEffect } from 'react';
import useAppDispatch from '../../hooks/use-app.dispatch';
import useAppSelector from '../../hooks/use-app.selector';
import { insertTaskAsync, taskSelector, reset } from '../../slices/task.slice';

/**
 * Props interface for the AddTaskModal component
 */
interface AddTaskModalProps {
  /** Controls whether the modal is visible or hidden */
  isOpen: boolean;
  /** Callback function executed when the modal should be closed */
  onClose: () => void;
  /** Callback function executed when a task is successfully created */
  onSuccess: () => void;
  /** Unique identifier of the project to which the task will be added */
  projectId: number;
}

/**
 * Modal component for creating new tasks within a specific project with form validation and Redux integration.
 * Provides a form interface for entering task details including title, description, and due date.
 * Handles form validation, error display, and communicates with Redux store for task creation.
 * Automatically closes and resets form state upon successful task creation.
 * 
 * @param props - Configuration object containing modal state, project ID, and callback functions
 * @returns JSX modal element with form for task creation
 */
const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSuccess, projectId }) => {
  const dispatch = useAppDispatch();
  const { loading, insertSuccess, error, message } = useAppSelector(taskSelector);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const [errors, setErrors] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  /**
   * Effect hook that resets form state and clears Redux state when modal opens.
   * Ensures clean slate for each new task creation attempt.
   */
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
      });
      setErrors({
        title: '',
        description: '',
        dueDate: '',
      });
      dispatch(reset());
    }
  }, [isOpen, dispatch]);

  /**
   * Effect hook that handles successful task creation.
   * Triggers success callback, closes modal, and resets Redux state.
   */
  useEffect(() => {
    if (insertSuccess) {
      onSuccess();
      onClose();
      dispatch(reset());
    }
  }, [insertSuccess, onSuccess, onClose, dispatch]);

  /**
   * Validates all form fields and sets appropriate error messages.
   * Checks for required fields and ensures proper data format.
   * 
   * @returns Boolean indicating whether all validation rules pass
   */
  const validateForm = () => {
    const newErrors = {
      title: '',
      description: '',
      dueDate: '',
    };

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  /**
   * Handles form submission by validating input and dispatching task creation action.
   * Converts date string to Date object and includes project ID for proper association.
   * Prevents default form submission behavior and only proceeds if validation passes.
   * 
   * @param e - React form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    dispatch(insertTaskAsync({
      projectId,
      title: formData.title,
      description: formData.description,
      dueDate: new Date(formData.dueDate),
    }));
  };

  /**
   * Handles input field changes and clears corresponding error messages.
   * Updates form data state and provides real-time error clearing for better UX.
   * 
   * @param e - React change event from input or textarea elements
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    /** Clear error when user starts typing to provide immediate feedback */
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add New Task</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter task title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter task description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
            </div>

            {error && message && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {message}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal; 