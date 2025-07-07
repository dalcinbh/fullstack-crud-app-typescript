/**
 * Redux Toolkit slice for managing task-related state throughout the application.
 * Handles asynchronous operations for task CRUD functionality within project contexts,
 * including status management, completion toggling, and error handling. Provides
 * centralized state management for task data and operation results across task components.
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import TaskService from '../services/task.service';
import { RootState } from '../store';
import { Task, TaskStates, CreateTaskRequest, UpdateTaskRequest } from '../interfaces/task.interface';

/**
 * Initial state configuration for the task slice with default values.
 * Sets up empty data collections and inactive loading states for task operations.
 */
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

/**
 * Async thunk for creating new tasks within specific projects using nested API endpoints.
 * Dispatches HTTP POST request through TaskService and handles project relationship validation.
 * 
 * @param data - Task creation object containing all required fields
 * @param data.projectId - Foreign key reference to the parent project
 * @param data.title - Title or name of the new task
 * @param data.description - Detailed description of task requirements
 * @param data.dueDate - Due date for task completion
 * @param data.isCompleted - Optional completion status, defaults to false
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to created Task object or rejected with error message
 */
export const insertTaskAsync = createAsyncThunk(
  'tasks/insertTask',
  async (data: CreateTaskRequest, thunkAPI) => {
    try {
      const task = await TaskService.insertTask(data);
      return task;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

/**
 * Async thunk for updating existing tasks with partial data modifications within project context.
 * Dispatches HTTP PATCH request through TaskService with project validation and optimistic updates.
 * 
 * @param params - Object containing update parameters
 * @param params.id - Unique identifier of the task to update
 * @param params.data - Partial task object containing fields to update
 * @param params.projectId - Parent project ID for validation and endpoint construction
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to updated Task object or rejected with error message
 */
export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data, projectId }: { id: string; data: UpdateTaskRequest; projectId: number }, thunkAPI) => {
    try {
      const updatedTask = await TaskService.updateTask(id, data, projectId);
      return updatedTask;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

/**
 * Async thunk for permanently removing tasks from the system within project context.
 * Dispatches HTTP DELETE request through TaskService with project relationship validation.
 * 
 * @param params - Object containing deletion parameters
 * @param params.id - Unique identifier of the task to delete
 * @param params.projectId - Parent project ID for validation and endpoint construction
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to deletion confirmation with ID and message
 */
export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async ({ id, projectId }: { id: string; projectId: number }, thunkAPI) => {
    try {
      const response = await TaskService.deleteTask(id, projectId);
      return { id, message: response.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

/**
 * Async thunk for retrieving all tasks belonging to a specific project.
 * Dispatches HTTP GET request through TaskService for project-filtered task collection.
 * 
 * @param projectId - Unique identifier of the project to retrieve tasks from
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to array of Task objects associated with the project
 */
export const getAllTasksAsync = createAsyncThunk(
  'tasks/getAllTasks',
  async (projectId: number, thunkAPI) => {
    try {
      const tasks = await TaskService.getAllTasks(projectId);
      return tasks;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

/**
 * Async thunk for retrieving a single task by its unique identifier.
 * Dispatches HTTP GET request through TaskService for detailed task information.
 * 
 * @param id - Unique identifier of the task to retrieve
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to complete Task object with all related data
 */
export const getTaskByIdAsync = createAsyncThunk(
  'tasks/getTaskById',
  async (id: string, thunkAPI) => {
    try {
      const task = await TaskService.getTaskById(id);
      return task;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

/**
 * Async thunk for toggling task completion status using specialized endpoint.
 * Dispatches HTTP PATCH request through TaskService that automatically inverts current completion status.
 * 
 * @param params - Object containing toggle parameters
 * @param params.id - Unique identifier of the task to toggle
 * @param params.projectId - Parent project ID for validation and endpoint construction
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to updated Task object with inverted completion status
 */
export const toggleTaskCompletionAsync = createAsyncThunk(
  'tasks/toggleTaskCompletion',
  async ({ id, projectId }: { id: string; projectId: number }, thunkAPI) => {
    try {
      const updatedTask = await TaskService.toggleTaskCompletion(id, projectId);
      return updatedTask;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

/**
 * Async thunk for updating only the completion status of a task with explicit boolean value.
 * Dispatches HTTP PATCH request through TaskService for precise status control.
 * 
 * @param params - Object containing status update parameters
 * @param params.id - Unique identifier of the task to update
 * @param params.projectId - Parent project ID for validation and endpoint construction
 * @param params.isCompleted - New completion status (true for completed, false for pending)
 * @param thunkAPI - Redux Toolkit thunk API for error handling and dispatch
 * @returns Promise resolving to updated Task object with new completion status
 */
export const updateTaskStatusAsync = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ id, projectId, isCompleted }: { id: string; projectId: number; isCompleted: boolean }, thunkAPI) => {
    try {
      const updatedTask = await TaskService.updateTaskStatus(id, projectId, isCompleted);
      return updatedTask;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

/**
 * Redux Toolkit slice definition for task state management with reducers and async handling.
 * Provides synchronous actions for state reset and extraReducers for async operation handling.
 */
const TaskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /**
     * Resets all operation states and clears temporary data while preserving task collections.
     * Used to clear success/error flags and selected task after operations complete.
     */
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
    /**
     * Async thunk handlers for task creation operations.
     * Manages loading states, adds new task to collection start, and error handling.
     */
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

    /**
     * Async thunk handlers for task update operations.
     * Manages loading states, optimistic updates in local state, and error handling.
     */
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

    /**
     * Async thunk handlers for task deletion operations.
     * Manages loading states, removes task from local collection, and error handling.
     */
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

    /**
     * Async thunk handlers for retrieving all tasks from a specific project.
     * Manages loading states and updates task collection with project-filtered data.
     */
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

    /**
     * Async thunk handlers for retrieving individual tasks by ID.
     * Manages loading states, sets selected task for detailed view, and error handling.
     */
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

    /**
     * Async thunk handlers for toggling task completion status.
     * Manages loading states, updates task completion in local state, and error handling.
     */
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

    /**
     * Async thunk handlers for updating task status with explicit boolean values.
     * Manages loading states, updates task completion status in local state, and error handling.
     */
    builder
      .addCase(updateTaskStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.message = '';
      })
      .addCase(
        updateTaskStatusAsync.fulfilled,
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
        updateTaskStatusAsync.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = true;
          state.message = action.payload || 'Error updating task status.';
        },
      );
  },
});

/**
 * Exported action creators from the task slice for direct dispatch usage.
 * Provides access to synchronous actions like reset for state management.
 */
export const {
  reset
} = TaskSlice.actions;

/**
 * Selector function for accessing task state from the Redux store.
 * Provides typed access to task data, loading states, and operation results.
 * 
 * @param state - Root Redux state object
 * @returns Complete task state including collections, selected task, and operation metadata
 */
export const taskSelector = (state: RootState) => state.TaskReducer;

export default TaskSlice.reducer;
