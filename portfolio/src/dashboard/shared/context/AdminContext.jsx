import React, { useMemo } from 'react';
import { LayoutProvider, useLayout } from './LayoutContext';
import { ModalProvider, useModal } from './ModalContext';
import { RecentItemsProvider } from './RecentItemsContext';
import { useRecentItems } from '../hooks/useRecentItems';

/**
 * Unified AdminAppProvider composing single-responsibility context providers:
 * - LayoutProvider (Sidebar collapse, mobile state, table density)
 * - ModalProvider (Command palette, notifications, Ctrl+K shortcut)
 * - RecentItemsProvider (Recent items list and management)
 */
export const AdminAppProvider = ({ children }) => {
  return (
    <LayoutProvider>
      <ModalProvider>
        <RecentItemsProvider>
          {children}
        </RecentItemsProvider>
      </ModalProvider>
    </LayoutProvider>
  );
};

// Alias for backward compatibility with existing imports
export const AdminProvider = AdminAppProvider;

/**
 * Composite hook useAdmin for backward compatibility and convenient access
 * to layout, modal, and recent items state.
 */
export const useAdmin = () => {
  const layout = useLayout();
  const modal = useModal();
  const recent = useRecentItems();

  return useMemo(
    () => ({
      ...layout,
      ...modal,
      ...recent,
    }),
    [layout, modal, recent]
  );
};

export { LayoutProvider, useLayout } from './LayoutContext';
export { ModalProvider, useModal } from './ModalContext';
export { RecentItemsProvider } from './RecentItemsContext';
export { useRecentItems } from '../hooks/useRecentItems';
