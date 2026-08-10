import { useRecentItemsContext } from '../context/RecentItemsContext';

/**
 * Custom hook for accessing and updating recent items in the admin dashboard.
 * Extracted into its own single-responsibility hook file.
 */
export const useRecentItems = () => {
  return useRecentItemsContext();
};
