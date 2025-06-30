import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, Search, Moon, Sun, Sparkles, Zap } from 'lucide-react';

const NotFound = () => {
  const [isDark, setIsDark] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    interface MouseEventWithClient extends MouseEvent {
      clientX: number;
      clientY: number;
    }

    const handleMouseMove = (e: MouseEventWithClient): void => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  interface MousePosition {
    x: number;
    y: number;
  }

  interface NavigationLink {
    name: string;
    path: string;
    icon: string;
  }

  const handleNavigation = (path: string): void => {
    console.log(`Navigating to: ${path}`);
    // In a real app, this would use react-router-dom's navigate
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Dynamic Mouse Follower */}
      <div 
        className={`fixed w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500 ${
          isDark ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-blue-300 to-indigo-300'
        }`}
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          transform: 'translate3d(0, 0, 0)',
        }}
      />

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-1/4 w-72 h-72 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-400/20'
        }`} />
        <div className={`absolute bottom-32 right-1/3 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${
          isDark ? 'bg-purple-500/10' : 'bg-indigo-400/20'
        }`} />
        <div className={`absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse delay-2000 ${
          isDark ? 'bg-pink-500/10' : 'bg-rose-400/20'
        }`} />
        <div className={`absolute bottom-1/4 left-1/3 w-56 h-56 rounded-full blur-3xl animate-pulse delay-3000 ${
          isDark ? 'bg-cyan-500/10' : 'bg-cyan-400/20'
        }`} />
      </div>

      {/* Geometric Patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-0 left-0 w-full h-full ${
          isDark ? 'bg-white' : 'bg-slate-900'
        }`} style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, currentColor 2px, transparent 0), radial-gradient(circle at 75px 75px, currentColor 2px, transparent 0)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-8 right-8 z-50 p-4 rounded-2xl backdrop-blur-2xl border transition-all duration-300 hover:scale-110 ${
          isDark 
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
            : 'bg-white/60 border-black/10 text-slate-800 hover:bg-white/80 shadow-lg'
        }`}
      >
        {isDark ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated 404 with Premium Effects */}
          <div className="mb-12 relative">
            <div className={`text-9xl md:text-[12rem] font-black relative ${
              isDark 
                ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' 
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
            } bg-clip-text text-transparent`}>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>4</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.1s' }}>0</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>4</span>
            </div>
            
            {/* Sparkle Effects */}
            <Sparkles className={`absolute -top-8 -left-8 animate-pulse ${
              isDark ? 'text-yellow-400' : 'text-amber-500'
            }`} size={32} />
            <Zap className={`absolute -top-4 -right-4 animate-pulse delay-500 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} size={28} />
            <Sparkles className={`absolute -bottom-8 left-1/2 animate-pulse delay-1000 ${
              isDark ? 'text-pink-400' : 'text-rose-500'
            }`} size={24} />
          </div>

          {/* Premium Title */}
          <h1 className={`text-5xl md:text-7xl font-black mb-8 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Oops!
            </span>
            <br />
            <span className={isDark ? 'text-white/90' : 'text-slate-700'}>
              Page Not Found
            </span>
          </h1>

          {/* Elegant Description */}
          <p className={`text-xl md:text-2xl mb-12 leading-relaxed max-w-2xl mx-auto ${
            isDark ? 'text-white/70' : 'text-slate-600'
          }`}>
            The page you're seeking has vanished into the digital cosmos. 
            <br className="hidden md:block" />
            Let's guide you back to familiar territory.
          </p>

          {/* Premium Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button
              onClick={() => handleNavigation('/')}
              className={`group relative flex items-center space-x-3 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-purple-500/30' 
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-blue-500/30 shadow-lg'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Home size={24} />
              <span>Return Home</span>
            </button>

            <button
              onClick={() => window.history.back()}
              className={`group flex items-center space-x-3 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-[1.05] border-2 backdrop-blur-xl ${
                isDark 
                  ? 'bg-white/5 border-white/20 text-white hover:bg-white/15 hover:border-white/40' 
                  : 'bg-white/60 border-slate-200 text-slate-800 hover:bg-white/90 hover:border-slate-300 shadow-lg'
              }`}
            >
              <ArrowLeft size={24} />
              <span>Go Back</span>
            </button>
          </div>

          {/* Premium Navigation Card */}
          <div className={`backdrop-blur-2xl rounded-3xl p-8 border transition-all duration-300 ${
            isDark 
              ? 'bg-white/5 border-white/10 hover:bg-white/[0.08]' 
              : 'bg-white/70 border-white/50 hover:bg-white/90 shadow-xl hover:shadow-2xl'
          }`}>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`p-3 rounded-2xl ${
                isDark ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Search className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={28} />
              </div>
              <h3 className={`font-bold text-2xl ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Explore Popular Destinations
              </h3>
            </div>
            
            <p className={`text-lg mb-8 ${
              isDark ? 'text-white/60' : 'text-slate-600'
            }`}>
              Navigate to one of these frequently visited sections
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: 'Home', path: '/', icon: '🏠' },
                { name: 'Login', path: '/login', icon: '🔐' },
                { name: 'Students', path: '/student/dashboard', icon: '🎓' },
                { name: 'Teachers', path: '/teacher/dashboard', icon: '👨‍🏫' },
                { name: 'Parents', path: '/parent/dashboard', icon: '👨‍👩‍👧‍👦' }
              ].map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(link.path)}
                  className={`group p-4 rounded-2xl transition-all duration-300 hover:scale-[1.05] border ${
                    isDark 
                      ? 'bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border-white/10 hover:border-white/30' 
                      : 'bg-white/60 hover:bg-white text-slate-700 hover:text-slate-900 border-white/50 hover:border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="text-2xl mb-2">{link.icon}</div>
                  <div className="font-semibold text-sm">{link.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Premium Footer */}
          <div className={`mt-16 text-center ${
            isDark ? 'text-white/40' : 'text-slate-500'
          }`}>
            <p className="text-sm">
              Lost in the digital maze? Our navigation compass will guide you home.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;