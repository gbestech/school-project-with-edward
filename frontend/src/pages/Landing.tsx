import React from 'react';
import Hero from '@/components/home/HeroSection';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

const Landing = () => {
  const { isDarkMode } = useGlobalTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <Hero />
    </div>
  );
};

export default Landing;
