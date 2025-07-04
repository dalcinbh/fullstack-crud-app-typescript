// src/slices/ProjectSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ProjectService from '../services/project.service';
import { RootState } from '../store';
import { Project, ProjectStates } from '../interfaces/project.interface';

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
};

// Insert Project
export const insertProjectAsync = createAsyncThunk(
  'projects/insertProject',
  async (formData: FormData, thunkAPI) => {
    try {
      const project = await ProjectService.insertProject(formData);
      return project; // O backend retorna um projeto com bounds
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
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
      return updatedProject; // Retorna o projeto atualizado com bounds
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
export const getAllProjectsAsync = createAsyncThunk(
  'projects/getAllProjects',
  async (_, thunkAPI) => {
    try {
      const projects = await ProjectService.getAllProjects();
      return projects; // Retorna a lista de projetos com bounds
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Get Project by ID
export const getProjectByIdAsync = createAsyncThunk(
  'projects/getProjectById',
  async (id: string, thunkAPI) => {
    try {
      const project = await ProjectService.getProjectById(id);
      return project; // Retorna um projeto com bounds
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
    // Inserir Projeto
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
          state.projects.unshift(action.payload);
        },
      )
      .addCase(
        insertProjectAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Erro ao inserir projeto.';
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
          state.message = action.payload || 'Erro ao atualizar projeto.';
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
          state.message = action.payload || 'Erro ao deletar projeto.';
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
        (state, action: PayloadAction<Project[]>) => {
          state.loading = false;
          state.projects = action.payload;
        },
      )
      .addCase(
        getAllProjectsAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Erro ao buscar projetos.';
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
          state.message = action.payload || 'Erro ao buscar projeto.';
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
