// components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Menu, 
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Home,
  BookOpen,
  Users,
  Calendar,
  Building,
  FileText,
  UserCheck,
  LayoutDashboard
} from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/contexts/SettingsContext';
import { getAbsoluteUrl } from '@/utils/urlUtils';


const Nav: React.FC = () => {
  const { isDarkMode, toggleTheme } = useGlobalTheme();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactRibbonVisible, setContactRibbonVisible] = useState(true);

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Refs for click outside detection
  const navRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    // Check if ContactRibbon is visible
    const checkContactRibbon = () => {
      const visible = localStorage.getItem('contactRibbonVisible') !== 'false';
      setContactRibbonVisible(visible);
    };

    // Initial check
    checkContactRibbon();

    // Listen for storage changes
    window.addEventListener('storage', checkContactRibbon);
    
    // Check periodically for changes
    const interval = setInterval(checkContactRibbon, 1000);

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkContactRibbon);
      clearInterval(interval);
    };
  }, []);

  // Click outside handler for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close user dropdown if clicking outside
      if (userDropdownOpen && userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
      
      // Close navigation dropdowns if clicking outside
      if (activeDropdown && navRef.current && !navRef.current.contains(target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown, userDropdownOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
    setUserDropdownOpen(false);
  };

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      case 'parent':
        return '/parent/dashboard';
      default:
        return '/';
    }
  };

  // Calculate top position based on ContactRibbon visibility
  const topPosition = contactRibbonVisible ? 'top-0' : 'top-0';

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
  };

  return (
    <nav className={`fixed ${topPosition} left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-lg' 
        : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between h-18">
          {/* Logo and School Name */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-300">
            <div className="w-15 h-15 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105">
              {settings?.logo ? (
                <img 
                  src={getAbsoluteUrl(settings.logo)} 
                  alt={`${settings.school_name} logo`}
                  className="w-15 h-15 object-cover"
                  onError={(e) => {
                    console.error('Navbar logo failed to load:', getAbsoluteUrl(settings.logo));
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Navbar logo loaded successfully:', getAbsoluteUrl(settings.logo));
                  }}
                />
              ) : (
                <img 
               src={`${import.meta.env.BASE_URL}images/godstreasurelogo.png`}
                alt='Gods Treasure Schools Logo'
                className="w-15 h-15 text-white" />
              )}
            </div>
            <span className="hidden md:block text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {settings?.school_name || 'Gods Treasure Schools'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div ref={navRef} className="hidden lg:flex items-center space-x-8">

            {/* About Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('about')}
                className={`text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  activeDropdown === 'about'
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>About</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'about' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-xl z-50">
                  <div className="py-2">
                    <NavLink
                      to="/about/office-proprietress"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <User className="w-4 h-4" />
                      <span>Office of the Proprietress</span>
                    </NavLink>
                    <NavLink
                      to="/about/admin-desk"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Admin Desk</span>
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Admissions Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('admissions')}
                className={`text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  activeDropdown === 'admissions'
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Admissions</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'admissions' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'admissions' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-xl z-50">
                  <div className="py-2">
                    <NavLink
                      to="/how-to-apply"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <FileText className="w-4 h-4" />
                      <span>How to Apply</span>
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Academics Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('academics')}
                className={`text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  activeDropdown === 'academics'
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Academics</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'academics' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'academics' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-xl z-50">
                  <div className="py-2">
                    <NavLink
                      to="/academics/structure"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <Building className="w-4 h-4" />
                      <span>Academic Structure</span>
                    </NavLink>
                    <NavLink
                      to="/academics/curriculum"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Curriculum</span>
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* News Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('news')}
                className={`text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  activeDropdown === 'news'
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>News</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'news' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'news' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-xl z-50">
                  <div className="py-2">
                    <NavLink
                      to="/news/events"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Events</span>
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Portal Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('portal')}
                className={`text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  activeDropdown === 'portal'
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Portal</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'portal' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'portal' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-xl z-50">
                  <div className="py-2">
                    <NavLink
                      to="/portal/prospective-students"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <User className="w-4 h-4" />
                      <span>Prospective Students</span>
                    </NavLink>
                    <NavLink
                      to="/parent-login"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <Users className="w-4 h-4" />
                      <span>Parents</span>
                    </NavLink>
                    <NavLink
                      to="/teacher-login"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Staff</span>
                    </NavLink>
                    <NavLink
                      to="/student-login"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <User className="w-4 h-4" />
                      <span>Returning Students</span>
                    </NavLink>
                    <NavLink
                      to="/admin-login"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Login Dropdown */}
            
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 border border-slate-200 dark:border-slate-600"
              title={`Current theme: ${isDarkMode ? 'dark' : 'light'}`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>

            {/* User Profile or Auth Buttons */}
            {user ? (
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 border border-slate-200 dark:border-slate-600"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {(user as any)?.profile_picture ? (
                      <img src={(user as any).profile_picture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user.first_name || user.username}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-xl z-50">
                    <div className="py-2">
                      <NavLink
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </NavLink>
                      <NavLink
                        to={getDashboardRoute()}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </NavLink>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink
                  to="/student-login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
                >
                  Login
                </NavLink>
                {/* <NavLink
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-blue-500/20"
                >
                  Sign Up
                </NavLink> */}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 border border-slate-200 dark:border-slate-600"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden max-h-[80vh] overflow-y-auto py-4 border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <div className="space-y-2">
              {/* Mobile Navigation Items */}
              <NavLink 
                to="/" 
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </NavLink>
              
              {/* About Section */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  About
                </div>
                <NavLink
                  to="/about/office-proprietress"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Office of the Proprietress</span>
                </NavLink>
                <NavLink
                  to="/about/admin-desk"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Admin Desk</span>
                </NavLink>
              </div>

              {/* Admissions Section */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Admissions
                </div>
                <NavLink
                  to="/how-to-apply"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText className="w-4 h-4" />
                  <span>How to Apply</span>
                </NavLink>
              </div>

              {/* Academics Section */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Academics
                </div>
                <NavLink
                  to="/academics/structure"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Building className="w-4 h-4" />
                  <span>Academic Structure</span>
                </NavLink>
                <NavLink
                  to="/academics/curriculum"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Curriculum</span>
                </NavLink>
              </div>

              {/* News Section */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  News
                </div>
                <NavLink
                  to="/news/events"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Events</span>
                </NavLink>
              </div>

              {/* Portal Section */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Portal
                </div>
                <NavLink
                  to="/portal/prospective-students"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Prospective Students</span>
                </NavLink>
                <NavLink
                  to="/parent-login"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="w-4 h-4" />
                  <span>Parents</span>
                </NavLink>
                <NavLink
                  to="/teacher-login"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Staff</span>
                </NavLink>
                <NavLink
                  to="/student-login"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Returning Students</span>
                </NavLink>
                <NavLink
                  to="/admin-login"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin</span>
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;