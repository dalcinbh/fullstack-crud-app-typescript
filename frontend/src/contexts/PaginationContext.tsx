/**
 * React Context module for managing pagination state across project and task tables.
 * Provides centralized pagination state management to maintain page positions
 * when navigating between different table components throughout the application.
 * Prevents pagination state loss during component re-renders and route changes.
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Type definition for the pagination context value interface
 */
interface PaginationContextType {
  /** Current page index for the project table (zero-based) */
  projectPageIndex: number;
  /** Function to update the project table page index */
  setProjectPageIndex: (pageIndex: number) => void;
  /** Current page index for the task table (zero-based) */
  taskPageIndex: number;
  /** Function to update the task table page index */
  setTaskPageIndex: (pageIndex: number) => void;
}

/** React Context instance for pagination state management with undefined default */
const PaginationContext = createContext<PaginationContextType | undefined>(undefined);

/**
 * Props interface for the PaginationProvider component
 */
interface PaginationProviderProps {
  /** Child components that will have access to pagination context */
  children: ReactNode;
}

/**
 * Context provider component that manages pagination state for both project and task tables.
 * Maintains separate page indices for project and task tables to provide independent pagination.
 * Wraps child components with pagination context access and initializes state with default values.
 * Ensures consistent pagination behavior across different table components in the application.
 * 
 * @param props - Configuration object containing child components to wrap with context
 * @returns JSX provider element that supplies pagination context to child components
 */
export const PaginationProvider: React.FC<PaginationProviderProps> = ({ children }) => {
  const [projectPageIndex, setProjectPageIndex] = useState(0);
  const [taskPageIndex, setTaskPageIndex] = useState(0);

  /** Context value object containing all pagination state and setter functions */
  const value: PaginationContextType = {
    projectPageIndex,
    setProjectPageIndex,
    taskPageIndex,
    setTaskPageIndex,
  };

  return (
    <PaginationContext.Provider value={value}>
      {children}
    </PaginationContext.Provider>
  );
};

/**
 * Custom hook for accessing pagination context state and functions.
 * Provides type-safe access to pagination state with automatic error handling.
 * Ensures the hook is only used within components wrapped by PaginationProvider.
 * Throws descriptive error if used outside of provider context for debugging assistance.
 * 
 * @returns Object containing pagination state values and setter functions for both tables
 * @throws Error when used outside of PaginationProvider component tree
 */
export const usePaginationContext = (): PaginationContextType => {
  const context = useContext(PaginationContext);
  
  /** Validate context availability and provide helpful error message */
  if (!context) {
    throw new Error('usePaginationContext must be used within a PaginationProvider');
  }
  
  return context;
}; 