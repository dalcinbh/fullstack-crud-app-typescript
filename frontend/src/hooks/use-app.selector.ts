/**
 * Custom Redux selector hook module providing type-safe state access.
 * Wraps the standard React Redux useSelector hook with application-specific typing
 * to ensure all state selections are properly typed according to the root state structure.
 * Eliminates the need for manual type assertions when accessing Redux store state.
 */
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import type { RootState } from '../store';

/**
 * Type-safe custom hook for selecting data from Redux store state throughout the application.
 * Provides automatic TypeScript inference for all available state properties and nested objects.
 * Ensures compile-time type checking for state selectors and prevents undefined property access.
 * Enables IntelliSense autocompletion for state properties during development.
 * 
 * @template TSelected - The type of the selected state value returned by the selector function
 * @returns Typed useSelector hook that accepts selector functions with proper state typing
 */
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector;
