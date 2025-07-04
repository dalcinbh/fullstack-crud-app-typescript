import { configureStore } from '@reduxjs/toolkit';
import ProjectReducer from './slices/project.slice';
import TaskReducer from './slices/task.slice';

export const store = configureStore({
  reducer: {
    ProjectReducer,
    TaskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
