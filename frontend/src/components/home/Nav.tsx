// components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Moon,
  Sun,
  Monitor,
  ChevronDown
} from 'lucide-react';
import { useAuth } from './../../hooks/useAuth';
import { useTheme } from './../../hooks/useTheme';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-menu]')) {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(prev => !prev);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(prev => !prev);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-3xl border-b border-slate-800/50 shadow-2xl shadow-slate-900/20' 
          : 'bg-transparent backdrop-blur-2xl border-b border-white/5'
      }`}>
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent opacity-60"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-5 group">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-500 group-hover:scale-110 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <GraduationCap className="text-white relative z-10 transition-transform duration-500 group-hover:rotate-12" size={32} />
                </div>
                {/* Floating particles effect */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-500 group-hover:translate-x-1">
                <div className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent tracking-tight">
                  AI HUSTLE
                </div>
                <div className="text-xs text-slate-300/70 font-semibold tracking-[0.2em] uppercase mt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  Premium Education
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-12">
              {navLinks.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onMouseEnter={() => setActiveItem(item.name)}
                  onMouseLeave={() => setActiveItem('')}
                  className="relative text-slate-200/90 hover:text-white font-medium text-lg transition-all duration-300 group py-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5">
                    {item.name}
                  </span>
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transform origin-left transition-transform duration-300 ${
                    activeItem === item.name ? 'scale-x-100' : 'scale-x-0'
                  }`}></div>
                  <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-3 text-slate-200/80 hover:text-white transition-all duration-300 hover:bg-white/10 rounded-xl group"
                title={`Current theme: ${theme}`}
              >
                <ThemeIcon size={20} className="group-hover:scale-110 transition-transform duration-300" />
              </button>

              {isAuthenticated && user ? (
                /* User Menu */
                <div className="relative" data-menu>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                      <User size={18} className="text-white" />
                    </div>
                    <span className="text-slate-200/90 font-medium group-hover:text-white transition-colors duration-300">{user.first_name}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-3xl rounded-2xl border border-slate-800/50 shadow-2xl shadow-slate-900/20 overflow-hidden">
                      <div className="p-4 border-b border-slate-800/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                        <p className="text-white font-semibold">{user.last_name}</p>
                        <p className="text-slate-300/70 text-sm capitalize">{user.role}</p>
                        
                      

                      </div>
                      <div className="py-2">
                        <Link
                          to={`/${user.role}/dashboard`}
                          className="flex items-center space-x-3 px-4 py-3 text-slate-200/80 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User size={18} className="group-hover:scale-110 transition-transform duration-300" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-3 text-slate-200/80 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings size={18} className="group-hover:scale-110 transition-transform duration-300" />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-200/80 hover:text-white hover:bg-red-500/20 transition-all duration-300 group"
                        >
                          <LogOut size={18} className="group-hover:scale-110 transition-transform duration-300" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Premium Sign In Button */
                <button
                  onClick={handleLoginClick}
                  className="relative group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Border glow */}
                  <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/40 transition-colors duration-500"></div>
                  
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Sign In</span>
                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-200/80 hover:text-white transition-colors duration-300 hover:bg-white/10 rounded-lg"
              >
                <ThemeIcon size={20} />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="relative p-4 rounded-2xl hover:bg-white/10 text-white transition-all duration-300 group"
                data-menu
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <Menu className={`absolute transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-45' : 'opacity-100 rotate-0'}`} size={24} />
                  <X className={`absolute transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`} size={24} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed top-24 left-0 right-0 z-40 transition-all duration-500 ease-out ${
        isMenuOpen 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-slate-900/95 backdrop-blur-3xl border-b border-slate-800/50 shadow-2xl mx-4 rounded-2xl overflow-hidden">
          <div className="px-6 py-8 space-y-6">
            {/* Navigation Links */}
            {navLinks.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-slate-200/90 hover:text-white font-medium text-xl py-3 px-4 rounded-xl hover:bg-white/5 transition-all duration-300 transform hover:translate-x-2 group"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: isMenuOpen ? 'slideInLeft 0.5s ease-out forwards' : 'none'
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <ChevronDown className="w-4 h-4 opacity-50 -rotate-90 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            ))}

            <div className="border-t border-slate-800/50 pt-6">
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 py-3 px-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{user.full_name}</p>
                      <p className="text-slate-300/70 text-sm capitalize">{user.role}</p>
                    </div>
                  </div>
                  
                  <Link
                    to={`/${user.role}/dashboard`}
                    className="flex items-center space-x-3 py-3 px-4 text-slate-200/80 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 py-3 px-4 text-slate-200/80 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 py-3 px-4 text-slate-200/80 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group mt-8"
                  style={{ 
                    animationDelay: '300ms',
                    animation: isMenuOpen ? 'slideInLeft 0.5s ease-out forwards' : 'none'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;