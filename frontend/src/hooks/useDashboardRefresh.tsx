import { useEffect, useCallback } from 'react';

// Global event system for dashboard refresh
const DASHBOARD_REFRESH_EVENT = 'dashboard-refresh';

export const useDashboardRefresh = (onRefresh: () => void) => {
  const triggerRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  useEffect(() => {
    const handleRefreshEvent = () => {
      triggerRefresh();
    };

    // Listen for dashboard refresh events
    window.addEventListener(DASHBOARD_REFRESH_EVENT, handleRefreshEvent);

    return () => {
      window.removeEventListener(DASHBOARD_REFRESH_EVENT, handleRefreshEvent);
    };
  }, [triggerRefresh]);

  return {
    triggerRefresh: () => {
      window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
    }
  };
};

// Utility function to trigger dashboard refresh from anywhere
export const triggerDashboardRefresh = () => {
  window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
};







