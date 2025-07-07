/**
 * Redux store configuration using Redux Toolkit for centralized state management.
 * Combines project and task reducers with custom middleware configuration for
 * optimal performance and development experience. Provides type-safe dispatch
 * and state access patterns for consistent state management throughout the application.
 */
import { configureStore } from '@reduxjs/toolkit';
import ProjectReducer from './slices/project.slice';
import TaskReducer from './slices/task.slice';

/**
 * Configures the Redux store with combined reducers and custom middleware settings.
 * Integrates project and task state management with serialization handling for
 * complex data types like dates and file objects used in the application.
 */
export const store = configureStore({
  reducer: {
    /** Project state management including CRUD operations and pagination */
    ProjectReducer,
    /** Task state management with project relationship handling */
    TaskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      /** Disables serialization checks for Date objects and complex data structures */
      serializableCheck: false,
    }),
});

/**
 * Type definition for the Redux store dispatch function with thunk support.
 * Enables type-safe dispatching of both synchronous actions and async thunks
 * throughout the application components and custom hooks.
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Type definition for the complete Redux store state structure.
 * Provides type safety for state selectors and ensures consistent access
 * to project and task state across all components and utility functions.
 */
export type RootState = ReturnType<typeof store.getState>;

export default store;
