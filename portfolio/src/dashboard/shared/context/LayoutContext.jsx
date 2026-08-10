import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const LayoutContext = createContext(null);

export const LayoutProvider = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [tableDensity, setTableDensity] = useState('comfortable'); // 'compact' | 'comfortable'

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      toggleSidebar,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      toggleMobileSidebar,
      tableDensity,
      setTableDensity,
    }),
    [
      isSidebarCollapsed,
      toggleSidebar,
      isMobileSidebarOpen,
      toggleMobileSidebar,
      tableDensity,
    ]
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
