


import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SettingsService, { SchoolSettings } from '@/services/SettingsService';

interface SettingsContextType {
  settings: SchoolSettings | null;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SchoolSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Context: Fetching settings via SettingsService...');
      const data = await SettingsService.getSettings();
      console.log('Context: Settings fetched:', data);
      
      setSettings(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch settings';
      console.error('Context: Fetch error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SchoolSettings>) => {
    if (!settings) {
      console.warn('Context: Cannot update - no settings loaded');
      return;
    }

    try {
      setError(null);
      
      const updatedData = { ...settings, ...newSettings };
      console.log('Context: Updating settings:', updatedData);
      
      const responseData = await SettingsService.updateSettings(updatedData);
      console.log('Context: Update response:', responseData);
      
      setSettings(responseData);
      
      // Broadcast update to other components
      window.dispatchEvent(new CustomEvent('settings-updated', { detail: responseData }));
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update settings';
      console.error('Context: Update error:', errorMsg);
      setError(errorMsg);
      throw err;
    }
  };

  const refreshSettings = async () => {
    console.log('Context: Refreshing settings...');
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();

    // Listen for settings updates from any component
    const handleSettingsUpdate = (event: CustomEvent) => {
      console.log('Context: Settings updated via event:', event.detail);
      setSettings(event.detail);
    };

    window.addEventListener('settings-updated' as any, handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings-updated' as any, handleSettingsUpdate);
    };
  }, []);

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    setError,
    refreshSettings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};