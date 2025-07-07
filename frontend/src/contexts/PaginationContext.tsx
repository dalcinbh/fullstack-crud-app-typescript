import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PaginationContextType {
  projectPageIndex: number;
  setProjectPageIndex: (pageIndex: number) => void;
  taskPageIndex: number;
  setTaskPageIndex: (pageIndex: number) => void;
}

const PaginationContext = createContext<PaginationContextType | undefined>(undefined);

interface PaginationProviderProps {
  children: ReactNode;
}

export const PaginationProvider: React.FC<PaginationProviderProps> = ({ children }) => {
  const [projectPageIndex, setProjectPageIndex] = useState(0);
  const [taskPageIndex, setTaskPageIndex] = useState(0);

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

export const usePaginationContext = (): PaginationContextType => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error('usePaginationContext must be used within a PaginationProvider');
  }
  return context;
}; 