import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const RecentItemsContext = createContext(null);

export const RecentItemsProvider = ({ children }) => {
  const [recentItems, setRecentItems] = useState([
    { id: '1', title: 'Dashboard Overview', path: '/admin/dashboard', type: 'page', time: '2 mins ago' },
    { id: '2', title: 'Downtown Dental Clinic', path: '/admin/clinics', type: 'clinic', time: '15 mins ago' },
    { id: '3', title: 'Sarah Jenkins (Lead #1042)', path: '/admin/pipeline', type: 'lead', time: '1 hour ago' },
    { id: '4', title: 'AI Prompt v2.4 Deployment', path: '/admin/ai-ops', type: 'ai', time: '3 hours ago' },
  ]);

  const addRecentItem = useCallback((item) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((i) => i.path !== item.path);
      return [{ ...item, id: Date.now().toString(), time: 'Just now' }, ...filtered].slice(0, 8);
    });
  }, []);

  const value = useMemo(
    () => ({
      recentItems,
      setRecentItems,
      addRecentItem,
    }),
    [recentItems, addRecentItem]
  );

  return <RecentItemsContext.Provider value={value}>{children}</RecentItemsContext.Provider>;
};

export const useRecentItemsContext = () => {
  const context = useContext(RecentItemsContext);
  if (!context) {
    throw new Error('useRecentItemsContext must be used within a RecentItemsProvider');
  }
  return context;
};
