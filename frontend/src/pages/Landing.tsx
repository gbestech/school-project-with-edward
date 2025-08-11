import React from 'react';
import Hero from '@/components/home/HeroSection';
import Navbar from '@/components/home/Nav';
import Footer from '@/components/home/Footer';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

const Landing = () => {
  const { isDarkMode } = useGlobalTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
};

export default Landing;
