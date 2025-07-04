// src/slices/task.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import TaskService from '../services/task.service';
import { RootState } from '../store';
import { Task, TaskStates, CreateTaskRequest, UpdateTaskRequest } from '../interfaces/task.interface';

// Initial state
const initialState: TaskStates = {
  tasks: [],
  task: null,
  loading: false,
  insertSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
  error: false,
  message: '',
};

// Insert Task
export const insertTaskAsync = createAsyncThunk(
  'tasks/insertTask',
  async (data: CreateTaskRequest, thunkAPI) => {
    try {
      const task = await TaskService.insertTask(data);
      return task; // Backend returns a task
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Update Task
export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: UpdateTaskRequest }, thunkAPI) => {
    try {
      const updatedTask = await TaskService.updateTask(id, data);
      return updatedTask; // Returns the updated task
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Delete Task
export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, thunkAPI) => {
    try {
      const response = await TaskService.deleteTask(id);
      return { id, message: response.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Get All Tasks
export const getAllTasksAsync = createAsyncThunk(
  'tasks/getAllTasks',
  async (projectId: number | undefined, thunkAPI) => {
    try {
      const tasks = await TaskService.getAllTasks(projectId);
      return tasks; // Returns the list of tasks
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Get Task by ID
export const getTaskByIdAsync = createAsyncThunk(
  'tasks/getTaskById',
  async (id: string, thunkAPI) => {
    try {
      const task = await TaskService.getTaskById(id);
      return task; // Returns a task
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Toggle Task Completion
export const toggleTaskCompletionAsync = createAsyncThunk(
  'tasks/toggleTaskCompletion',
  async ({ id, isCompleted }: { id: string; isCompleted: boolean }, thunkAPI) => {
    try {
      const updatedTask = await TaskService.toggleTaskCompletion(id, isCompleted);
      return updatedTask; // Returns the updated task
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const TaskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    reset: (state) => {
      state.error = false;
      state.loading = false;
      state.insertSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.message = '';
      state.task = null;
    },
  },
  extraReducers: (builder) => {
    // Insert Task
    builder
      .addCase(insertTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
        state.insertSuccess = false;
      })
      .addCase(
        insertTaskAsync.fulfilled,
        (state, action: PayloadAction<Task>) => {
          state.loading = false;
          state.insertSuccess = true;
          state.tasks.unshift(action.payload);
        },
      )
      .addCase(
        insertTaskAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Error inserting task.';
        },
      );

    // Update Task
    builder
      .addCase(updateTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
        state.updateSuccess = false;
      })
      .addCase(
        updateTaskAsync.fulfilled,
        (state, action: PayloadAction<Task>) => {
          state.loading = false;
          state.updateSuccess = true;
          const index = state.tasks.findIndex(
            (t) => t.id === action.payload.id,
          );
          if (index !== -1) {
            state.tasks[index] = action.payload;
          }
        },
      )
      .addCase(
        updateTaskAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Error updating task.';
        },
      );

    // Delete Task
    builder
      .addCase(deleteTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
        state.deleteSuccess = false;
      })
      .addCase(
        deleteTaskAsync.fulfilled,
        (state, action: PayloadAction<{ id: string; message: string }>) => {
          state.loading = false;
          state.deleteSuccess = true;
          state.tasks = state.tasks.filter(
            (t) => /^\d+$/.test(action.payload.id) && t.id !== Number(action.payload.id)
          );
          state.message = action.payload.message;
        },
      )
      .addCase(
        deleteTaskAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;      
          state.error = true;
          state.message = action.payload || 'Error deleting task.';
        },
      );

    // Get All Tasks
    builder
      .addCase(getAllTasksAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(
        getAllTasksAsync.fulfilled,
        (state, action: PayloadAction<Task[]>) => {
          state.loading = false;
          state.tasks = action.payload;
        },
      )
      .addCase(
        getAllTasksAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Error fetching tasks.';
        },
      );

    // Get Task by ID
    builder
      .addCase(getTaskByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(
        getTaskByIdAsync.fulfilled,
        (state, action: PayloadAction<Task>) => {
          state.loading = false;
          state.task = action.payload;
        },
      )
      .addCase(
        getTaskByIdAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Error fetching task.';
        },
      );

    // Toggle Task Completion
    builder
      .addCase(toggleTaskCompletionAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(
        toggleTaskCompletionAsync.fulfilled,
        (state, action: PayloadAction<Task>) => {
          state.loading = false;
          state.updateSuccess = true;
          const index = state.tasks.findIndex(
            (t) => t.id === action.payload.id,
          );
          if (index !== -1) {
            state.tasks[index] = action.payload;
          }
        },
      )
      .addCase(
        toggleTaskCompletionAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Error toggling task completion.';
        },
      );
  },
});

// Export actions and reducer
export const {
  reset
} = TaskSlice.actions;

export const taskSelector = (state: RootState) => state.TaskReducer;

export default TaskSlice.reducer;
