import { useEffect } from 'react';
import { useSettings } from './useSettings'; // Your existing useSettings hook
import ResultSettingsService from '@/services/ResultSettingsService';

/**
 * Custom hook that integrates the ResultSettingsService with school settings
 * This ensures that school information like name, logo, etc. are available
 * when generating result sheets and reports
 */
export const useResultService = () => {
  const { settings, isLoading, error } = useSettings();

  // Update the service with school settings whenever they change
  useEffect(() => {
    if (settings) {
      ResultSettingsService.setSchoolSettings(settings);
    }
  }, [settings]);

  return {
    service: ResultSettingsService,
    schoolSettings: settings,
    isLoading,
    error
  };
};