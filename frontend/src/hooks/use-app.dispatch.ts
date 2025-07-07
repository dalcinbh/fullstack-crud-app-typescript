/**
 * Custom Redux dispatch hook module providing type-safe action dispatching.
 * Wraps the standard React Redux useDispatch hook with application-specific typing
 * to ensure all dispatched actions are properly typed according to the store configuration.
 * Eliminates the need for manual type assertions when dispatching Redux actions.
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';

/**
 * Type-safe custom hook for dispatching Redux actions throughout the application.
 * Provides automatic TypeScript inference for all available Redux actions and thunks.
 * Ensures compile-time type checking for action creators and async thunk functions.
 * Prevents runtime errors by catching type mismatches during development.
 * 
 * @returns Typed dispatch function that accepts only valid Redux actions for this store
 */
const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
