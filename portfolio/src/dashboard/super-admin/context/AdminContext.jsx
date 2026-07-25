import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [tableDensity, setTableDensity] = useState('comfortable'); // 'compact' | 'comfortable'
  const [recentItems, setRecentItems] = useState([
    { id: '1', title: 'Dashboard Overview', path: '/admin/dashboard', type: 'page', time: '2 mins ago' },
    { id: '2', title: 'Downtown Dental Clinic', path: '/admin/clinics', type: 'clinic', time: '15 mins ago' },
    { id: '3', title: 'Sarah Jenkins (Lead #1042)', path: '/admin/pipeline', type: 'lead', time: '1 hour ago' },
    { id: '4', title: 'AI Prompt v2.4 Deployment', path: '/admin/ai-ops', type: 'ai', time: '3 hours ago' },
  ]);

  // Global Keyboard Shortcuts (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  const addRecentItem = (item) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((i) => i.path !== item.path);
      return [{ ...item, id: Date.now().toString(), time: 'Just now' }, ...filtered].slice(0, 8);
    });
  };

  return (
    <AdminContext.Provider
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
        tableDensity,
        setTableDensity,
        recentItems,
        addRecentItem,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
