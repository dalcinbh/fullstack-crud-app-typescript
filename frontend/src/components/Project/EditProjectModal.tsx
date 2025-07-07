import React, { useState, useEffect } from 'react';
import useAppDispatch from '../../hooks/use-app.dispatch';
import useAppSelector from '../../hooks/use-app.selector';
import { updateProjectAsync, projectSelector, reset } from '../../slices/project.slice';
import { Project } from '../../interfaces/project.interface';

/**
 * Props interface for the EditProjectModal component
 */
interface EditProjectModalProps {
  /** Controls whether the modal is visible or hidden */
  isOpen: boolean;
  /** Callback function executed when the modal should be closed */
  onClose: () => void;
  /** Callback function executed when a project is successfully updated */
  onSuccess: () => void;
  /** Project object containing current data to be edited */
  project: Project;
}

/**
 * Modal component for editing existing projects with form validation and Redux integration.
 * Pre-populates form fields with current project data and handles updates to project information.
 * Manages form validation, error display, and communicates with Redux store for project updates.
 * Automatically closes and resets form state upon successful project modification.
 * 
 * @param props - Configuration object containing modal state, project data, and callback functions
 * @returns JSX modal element with pre-filled form for project editing
 */
const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, onSuccess, project }) => {
  const dispatch = useAppDispatch();
  const { loading, updateSuccess, error, message } = useAppSelector(projectSelector);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    startDate: '',
  });

  /**
   * Effect hook that loads project data into form fields when modal opens.
   * Handles date conversion from various formats to ensure proper display in date input.
   * Resets error state and clears Redux state for clean editing experience.
   */
  useEffect(() => {
    if (isOpen && project) {
      const startDate = project.startDate instanceof Date 
        ? project.startDate.toISOString().split('T')[0] 
        : new Date(project.startDate).toISOString().split('T')[0];

      setFormData({
        name: project.name,
        description: project.description,
        startDate: startDate,
      });
      setErrors({
        name: '',
        description: '',
        startDate: '',
      });
      dispatch(reset());
    }
  }, [isOpen, project, dispatch]);

  /**
   * Effect hook that handles successful project update.
   * Triggers success callback, closes modal, and resets Redux state.
   */
  useEffect(() => {
    if (updateSuccess) {
      onSuccess();
      onClose();
      dispatch(reset());
    }
  }, [updateSuccess, onSuccess, onClose, dispatch]);

  /**
   * Validates all form fields and sets appropriate error messages.
   * Ensures required fields are filled and data meets validation criteria.
   * 
   * @returns Boolean indicating whether all validation rules pass
   */
  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      startDate: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  /**
   * Handles form submission by validating input and dispatching project update action.
   * Converts date string back to Date object and includes project ID for proper update.
   * Prevents default form submission behavior and only proceeds if validation passes.
   * 
   * @param e - React form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    dispatch(updateProjectAsync({ 
      id: project.id.toString(), 
      data: {
        ...formData,
        startDate: new Date(formData.startDate)
      }
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
            <h3 className="text-lg font-medium text-gray-900">Edit Project</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
                placeholder="Enter project description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
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
                {loading ? 'Updating...' : 'Update Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal; 