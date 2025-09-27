import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SchoolSettings {
  id: string;
  school_name: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  school_website: string;
  academic_year: string;
  current_term: string;
  school_motto: string;
  timezone: string;
  date_format: string;
  time_format: string;
  language: string;
  logo?: string;
  favicon?: string;
  logo_url?: string;
  favicon_url?: string;
  auto_save: boolean;
  notifications_enabled: boolean;
  dark_mode: boolean;
  maintenance_mode: boolean;
  session_timeout: number;
  max_login_attempts: number;
  created_at: string;
  updated_at: string;
}

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
      
      const response = await fetch('/api/school-settings/school-settings/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SchoolSettings>) => {
    if (!settings) return;

    try {
      setError(null);
      
      const response = await fetch('/api/school-settings/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...settings, ...newSettings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
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