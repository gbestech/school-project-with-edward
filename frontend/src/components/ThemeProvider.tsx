import React, { useEffect } from 'react';
import { useDesign } from '@/contexts/DesignContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings: designSettings } = useDesign();

  useEffect(() => {
    if (!designSettings) return;

    const root = document.documentElement;
    const body = document.body;

    // Apply theme class to both body and document root
    body.className = body.className.replace(/theme-\w+/g, '');
    root.className = root.className.replace(/theme-\w+/g, '');
    
    // If theme is 'default', apply 'theme-default' class
    const themeClass = designSettings.theme === 'default' ? 'theme-default' : `theme-${designSettings.theme}`;
    body.classList.add(themeClass);
    root.classList.add(themeClass);

    // Apply primary color
    root.style.setProperty('--primary-color', designSettings.primary_color);
    
    // Update derived CSS variables
    const primaryColor = designSettings.primary_color;
    root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 100%)`);
    root.style.setProperty('--primary-shadow', `0 10px 15px -3px ${primaryColor}25`);
    
    // Apply typography
    const fontFamily = `'${designSettings.typography}', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    root.style.setProperty('--font-family', fontFamily);
    
    // Apply border radius
    root.style.setProperty('--border-radius', designSettings.border_radius);
    
    // Apply shadow style
    root.style.setProperty('--shadow-style', designSettings.shadow_style);
    
    // Apply animations
    if (designSettings.animations_enabled) {
      body.classList.add('animations-enabled');
      body.classList.remove('animations-disabled');
    } else {
      body.classList.add('animations-disabled');
      body.classList.remove('animations-enabled');
    }
    
    // Apply compact mode
    if (designSettings.compact_mode) {
      body.classList.add('compact-mode');
    } else {
      body.classList.remove('compact-mode');
    }

  }, [designSettings]);

  return <>{children}</>;
};

export default ThemeProvider; 