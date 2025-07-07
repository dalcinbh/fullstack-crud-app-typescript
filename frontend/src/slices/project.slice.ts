// src/slices/project.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ProjectService from '../services/project.service';
import { RootState } from '../store';
import { Project, ProjectResponse, ProjectStates } from '../interfaces/project.interface';

// Initial state
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


// Insert Project
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


// Update Project
export const updateProjectAsync = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: string; data: Partial<Project> }, thunkAPI) => {
    try {
      const updatedProject = await ProjectService.updateProject(
        id,
        data,
      );
      return updatedProject; // Returns the updated project with bounds
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Delete Project
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

// Get All Projects
export const getAllProjectsAsync = createAsyncThunk<
  ProjectResponse, // <- tipo do retorno em caso de sucesso
  void,            // <- tipo do argumento recebido (nenhum, pois é "_")
  { rejectValue: string } // <- tipo em caso de erro
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

// Get Project by ID
export const getProjectByIdAsync = createAsyncThunk(
  'projects/getProjectById',
  async (id: string, thunkAPI) => {
    try {
      const project = await ProjectService.getProjectById(id);
      return project; // Returns a project with bounds
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const ProjectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
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
    // Insert Project
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

    // Update Project
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

    // Delete Project
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

    // Get All Projects
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

    // Get Project by ID
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

// Export actions and reducer
export const {
  reset
} = ProjectSlice.actions;

export const projectSelector = (state: RootState) => state.ProjectReducer;

export default ProjectSlice.reducer;
