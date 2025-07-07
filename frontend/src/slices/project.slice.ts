/**
 * Redux Toolkit slice for managing project-related state throughout the application.
 * Handles asynchronous operations for project CRUD functionality, loading states,
 * and error management. Provides centralized state management for project data,
 * operation results, and pagination information used across project components.
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ProjectService from '../services/project.service';
import { RootState } from '../store';
import { Project, ProjectResponse, ProjectStates } from '../interfaces/project.interface';

/**
 * Initial state configuration for the project slice with default values.
 * Sets up empty data collections, inactive loading states, and pagination defaults.
 */
const initialState: ProjectStates = {
  projects: [],
  project: null,
  loading: false,
  insertSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
  error: false,
  message: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
};

/**
 * Async thunk for creating new projects with provided project details.
 * Dispatches HTTP POST request through ProjectService and handles success/error states.
 * 
 * @param data - Project creation object containing required fields
 * @param data.name - Name or title of the new project
 * @param data.description - Detailed description of project scope and objectives
 * @param data.startDate - Project start date in ISO string format
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to created Project object or rejected with error message
 */
export const insertProjectAsync = createAsyncThunk(
  'projects/insertProject',
  async (
    data: { name: string; description: string; startDate: string },
    thunkAPI
  ) => {
    try {
      const project = await ProjectService.insertProject(data);
      return project;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk for updating existing projects with partial data modifications.
 * Dispatches HTTP PUT request through ProjectService with optimistic updates.
 * 
 * @param params - Object containing update parameters
 * @param params.id - Unique identifier of the project to update
 * @param params.data - Partial project object containing fields to update
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to updated Project object or rejected with error message
 */
export const updateProjectAsync = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: string; data: Partial<Project> }, thunkAPI) => {
    try {
      const updatedProject = await ProjectService.updateProject(
        id,
        data,
      );
      return updatedProject;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

/**
 * Async thunk for permanently removing projects from the system.
 * Dispatches HTTP DELETE request through ProjectService and updates local state.
 * 
 * @param id - Unique identifier of the project to delete
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to deletion confirmation with ID and message
 */
export const deleteProjectAsync = createAsyncThunk(
  'projects/deleteProject',
  async (id: string, thunkAPI) => {
    try {
      const response = await ProjectService.deleteProject(id);
      return { id, message: response.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

/**
 * Async thunk for retrieving all projects with pagination and filtering support.
 * Dispatches HTTP GET request through ProjectService and updates project collection.
 * 
 * @param _ - No parameters required for fetching all projects
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to ProjectResponse with data array and pagination metadata
 */
export const getAllProjectsAsync = createAsyncThunk<
  ProjectResponse,
  void,
  { rejectValue: string }
>(
  'projects/getAllProjects',
  async (_, thunkAPI) => {
    try {
      const response = await ProjectService.getAllProjects();
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk for retrieving a single project by its unique identifier.
 * Dispatches HTTP GET request through ProjectService for detailed project information.
 * 
 * @param id - Unique identifier of the project to retrieve
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to complete Project object with all related data
 */
export const getProjectByIdAsync = createAsyncThunk(
  'projects/getProjectById',
  async (id: string, thunkAPI) => {
    try {
      const project = await ProjectService.getProjectById(id);
      return project;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

/**
 * Redux Toolkit slice definition for project state management with reducers and async handling.
 * Provides synchronous actions for state reset and extraReducers for async operation handling.
 */
const ProjectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    /**
     * Resets all operation states and clears temporary data while preserving project collections.
     * Used to clear success/error flags and selected project after operations complete.
     */
    reset: (state) => {
      state.error = false;
      state.loading = false;
      state.insertSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.message = '';
      state.project = null;
    },
  },
  extraReducers: (builder) => {
    /**
     * Async thunk handlers for project creation operations.
     * Manages loading states, successful project addition, and error handling.
     */
    builder
      .addCase(insertProjectAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
        state.insertSuccess = false;
      })
      .addCase(
        insertProjectAsync.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.loading = false;
          state.insertSuccess = true;
          if (Array.isArray(state.projects)) {
            state.projects = [...state.projects, action.payload];
          } else {
            state.projects = [action.payload];
          }          
        },
      )
      .addCase(
        insertProjectAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Error inserting project.';
        },
      );

    /**
     * Async thunk handlers for project update operations.
     * Manages loading states, optimistic updates in local state, and error handling.
     */
    builder
      .addCase(updateProjectAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
        state.updateSuccess = false;
      })
      .addCase(
        updateProjectAsync.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.loading = false;
          state.updateSuccess = true;
          const index = state.projects.findIndex(
            (p) => p.id === action.payload.id,
          );
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
        },
      )
      .addCase(
        updateProjectAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Error updating project.';
        },
      );

    /**
     * Async thunk handlers for project deletion operations.
     * Manages loading states, removes project from local collection, and error handling.
     */
    builder
      .addCase(deleteProjectAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
        state.deleteSuccess = false;
      })
      .addCase(
        deleteProjectAsync.fulfilled,
        (state, action: PayloadAction<{ id: string; message: string }>) => {
          state.loading = false;
          state.deleteSuccess = true;
          state.projects = state.projects.filter(
            (p) => /^\d+$/.test(action.payload.id) && p.id !== Number(action.payload.id)
          );
          state.message = action.payload.message;
        },
      )
      .addCase(
        deleteProjectAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;      
          state.error = true;
          state.message = action.payload || 'Error deleting project.';
        },
      );

    /**
     * Async thunk handlers for retrieving all projects with pagination.
     * Manages loading states, updates project collection and pagination metadata.
     */
    builder
      .addCase(getAllProjectsAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(
        getAllProjectsAsync.fulfilled,
        (state, action: PayloadAction<ProjectResponse>) => {
          state.loading = false;
          state.projects = action.payload.data;
          state.pagination = action.payload.pagination ?? {
            page: 1,
            limit: 10,
            total: action.payload.data.length,
            pages: 1,
          };
        },
      )      
      .addCase(
        getAllProjectsAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Error fetching projects.';
        },
      );

    /**
     * Async thunk handlers for retrieving individual projects by ID.
     * Manages loading states, sets selected project for detailed view, and error handling.
     */
    builder
      .addCase(getProjectByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(
        getProjectByIdAsync.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.loading = false;
          state.project = action.payload;
        },
      )
      .addCase(
        getProjectByIdAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Error fetching project.';
        },
      );
  },
});

/**
 * Exported action creators from the project slice for direct dispatch usage.
 * Provides access to synchronous actions like reset for state management.
 */
export const {
  reset
} = ProjectSlice.actions;

/**
 * Selector function for accessing project state from the Redux store.
 * Provides typed access to project data, loading states, and operation results.
 * 
 * @param state - Root Redux state object
 * @returns Complete project state including collections, selected project, and metadata
 */
export const projectSelector = (state: RootState) => state.ProjectReducer;

export default ProjectSlice.reducer;
