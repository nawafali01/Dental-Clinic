import React, { createContext, useContext, useState } from 'react';

const ManagerContext = createContext(null);

export const ManagerProvider = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Hardcoded for mock data, clinic manager is assumed to manage 'Apex Dental'
  const activeClinic = { id: 'apex', name: 'Apex Dental Group' };

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  return (
    <ManagerContext.Provider
      value={{
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        activeClinic
      }}
    >
      {children}
    </ManagerContext.Provider>
  );
};

export const useManager = () => {
  const context = useContext(ManagerContext);
  if (!context) {
    throw new Error('useManager must be used within a ManagerProvider');
  }
  return context;
};
