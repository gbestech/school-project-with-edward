
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Eye, EyeOff, GraduationCap, ArrowRight, BookOpen, Users,
  Award, Sparkles, ChevronLeft, Shield, Zap, Globe, Star,
  AlertCircle, CheckCircle, Mail, Lock, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types
interface CustomUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  full_name: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  role: string;
  rememberMe: boolean;
}

interface LoginProps {
  onLogin: (user: CustomUser) => void;
  onBackToHome: () => void;
  onSocialLogin?: (provider: 'google' | 'facebook') => void;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  angle: number;
}

const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  onBackToHome, 
  onSocialLogin,
  onForgotPassword,
  onCreateAccount,
  isLoading: externalLoading = false,
  error: externalError = null
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<LoginCredentials>({
    email: '', 
    password: '', 
    role: 'student',
    rememberMe: false
  });
  const [internalLoading, setInternalLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  // Combined loading state
  const isLoading = externalLoading || internalLoading;
const navigate = useNavigate()
  // Handle external errors
  useEffect(() => {
    if (externalError) {
      setErrors({ general: externalError });
    }
  }, [externalError]);

  // Component mount state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Optimized mouse tracking with proper throttling
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!mounted) return;
    setMousePos({ x: e.clientX, y: e.clientY });
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    let rafId: number = 0;
    const throttledMove = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        handleMouseMove(e);
        rafId = 0;
      });
    };
    
    window.addEventListener('mousemove', throttledMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', throttledMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [handleMouseMove, mounted]);

  // Optimized particle system
  useEffect(() => {
    if (!mounted) return;

    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.3 + 0.1,
      angle: Math.random() * Math.PI * 2
    }));
    setParticles(newParticles);

    const animateParticles = () => {
      if (!mounted) return;
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y <= -2 ? 102 : particle.y - particle.speed,
        x: particle.x + Math.sin(particle.angle) * 0.05,
        angle: particle.angle + 0.005
      })));
    };

    const interval = setInterval(animateParticles, 100);
    return () => clearInterval(interval);
  }, [mounted]);

  // Form validation with proper error handling
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form.email, form.password]);

  // Enhanced login handler with proper error management
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setInternalLoading(true);
    setErrors({});

    try {
      // Create user object from form data
      const mockUser: CustomUser = {
        id: Date.now(), // Use timestamp as unique ID
        username: form.email.split('@')[0],
        email: form.email,
        first_name: form.email.split('@')[0].charAt(0).toUpperCase() + form.email.split('@')[0].slice(1),
        last_name: 'User',
        role: form.role,
        is_active: true,
        is_staff: form.role === 'teacher',
        is_superuser: form.role === 'admin',
        date_joined: new Date().toISOString(),
        full_name: `${form.email.split('@')[0].charAt(0).toUpperCase() + form.email.split('@')[0].slice(1)} User`
      };

      // Store remember me preference
      if (form.rememberMe && typeof window !== 'undefined') {
        try {
          const rememberData = {
            email: form.email,
            role: form.role,
            timestamp: Date.now()
          };
          // Using a simple in-memory approach since localStorage isn't available
          console.log('Remember me data:', rememberData);
        } catch (err) {
          console.warn('Could not save remember me preference:', err);
        }
      }

      setLoginSuccess(true);
      
      // Call the parent login handler
      await onLogin(mockUser);
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setInternalLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear general error when user starts typing
    if (errors.general && (field === 'email' || field === 'password')) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    if (onSocialLogin) {
      onSocialLogin(provider);
    } else {
      console.log(`${provider} login initiated`);
      // You could show a toast or handle this differently
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      console.log('Forgot password clicked');
      // You could show a modal or navigate to forgot password page
    }
  };

  const handleCreateAccount = () => {
    if (onCreateAccount) {
      onCreateAccount();
    } else {
      navigate('/signup');
      // You could navigate to registration page
    }
  };

  // Auto-fill demo credentials (for development/demo purposes)
  const fillDemoCredentials = () => {
    setForm(prev => ({
      ...prev,
      email: 'demo@example.com',
      password: 'demo123'
    }));
    setErrors({});
  };

  // Memoized feature data
  const features = useMemo(() => [
    { icon: BookOpen, title: 'Smart Courses', desc: 'AI-powered curriculum', color: 'from-blue-500 to-cyan-500' },
    { icon: Shield, title: 'Secure Learning', desc: 'Protected environment', color: 'from-green-500 to-emerald-500' },
    { icon: Zap, title: 'Instant Progress', desc: 'Real-time tracking', color: 'from-yellow-500 to-orange-500' },
    { icon: Users, title: 'Global Community', desc: 'Connect worldwide', color: 'from-purple-500 to-pink-500' },
    { icon: Award, title: 'Achievements', desc: 'Unlock milestones', color: 'from-red-500 to-rose-500' },
    { icon: Globe, title: 'Multilingual', desc: 'Learn in any language', color: 'from-indigo-500 to-blue-500' }
  ], []);

  const stats = useMemo(() => [
    { number: '50K+', label: 'Active Students' },
    { number: '1K+', label: 'Expert Teachers' },
    { number: '99%', label: 'Success Rate' }
  ], []);

  const roleIcons = { student: BookOpen, teacher: GraduationCap, parent: Users };
  const RoleIcon = roleIcons[form.role as keyof typeof roleIcons] || BookOpen;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Optimized Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        
        <div 
          className="absolute inset-0 opacity-30 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.1), transparent 50%)`
          }}
        />
        
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-blue-400 to-purple-400 pointer-events-none"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              willChange: 'transform'
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={onBackToHome} 
          className="absolute top-6 left-6 flex items-center space-x-2 text-white/80 hover:text-white transition-all duration-300 group z-20 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 hover:bg-white/15"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium text-sm">Back</span>
        </button>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Branding */}
          <div className="text-white text-center lg:text-left space-y-6">
            <div className="space-y-4">
                           <div className="space-y-3">
                <h2 className="text-4xl lg:text-5xl font-black leading-tight">
                  Welcome to the <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Future of Learning
                  </span>
                </h2>
                <p className="text-lg text-white/70 max-w-md leading-relaxed">
                  Join thousands in our revolutionary AI-powered education ecosystem.
                </p>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/8 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:bg-white/12 transition-all duration-300 hover:scale-105 group"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon size={16} className="text-white" />
                  </div>
                  <h4 className="text-white font-bold text-xs mb-1">{feature.title}</h4>
                  <p className="text-white/50 text-xs">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start space-x-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-white/50 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-2xl max-w-md w-full mx-auto relative">
            <div className="text-white">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 mb-3">
                  {loginSuccess ? (
                    <>
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="text-xs font-semibold">Login Successful!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-yellow-400" />
                      <span className="text-xs font-semibold">Premium Access</span>
                      <Star size={12} className="text-yellow-400" />
                    </>
                  )}
                </div>
                <h3 className="text-2xl font-black mb-1">
                  {loginSuccess ? 'Welcome Back!' : 'Sign In'}
                </h3>
                <p className="text-white/60 text-sm">
                  {loginSuccess ? 'Redirecting...' : 'Access your premium account'}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Error Message */}
                {errors.general && (
                  <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <AlertCircle size={14} className="text-red-400" />
                    <span className="text-sm text-red-300">{errors.general}</span>
                  </div>
                )}

                {/* Demo Info */}
                <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-300 font-medium mb-1">Demo Credentials:</p>
                      <p className="text-xs text-blue-200">demo@example.com / demo123</p>
                    </div>
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="text-xs bg-blue-500/30 hover:bg-blue-500/40 px-2 py-1 rounded-md transition-colors"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-white/90 flex items-center space-x-2">
                    <Mail size={14} />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-xl ${
                      errors.email 
                        ? 'border-red-500/50 focus:ring-red-400/50' 
                        : 'border-white/20 focus:ring-blue-400/50'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-red-300 text-xs flex items-center space-x-1">
                      <AlertCircle size={12} />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-white/90 flex items-center space-x-2">
                    <Lock size={14} />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-xl pr-12 ${
                        errors.password 
                          ? 'border-red-500/50 focus:ring-red-400/50' 
                          : 'border-white/20 focus:ring-blue-400/50'
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-300 text-xs flex items-center space-x-1">
                      <AlertCircle size={12} />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-white/90 flex items-center space-x-2">
                    <UserCheck size={14} />
                    <span>Account Type</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 backdrop-blur-xl appearance-none cursor-pointer"
                      disabled={isLoading}
                    >
                      <option value="student" className="bg-slate-800">Student</option>
                      <option value="teacher" className="bg-slate-800">Teacher</option>
                      <option value="parent" className="bg-slate-800">Parent</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none">
                      <RoleIcon size={16} />
                    </div>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.rememberMe}
                      onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                      className="w-4 h-4 accent-blue-500 rounded" 
                      disabled={isLoading}
                    />
                    <span className="text-white/70">Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-blue-300 hover:text-blue-200 font-medium hover:underline transition-colors"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading || loginSuccess}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 font-bold text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing In...
                      </>
                    ) : loginSuccess ? (
                      <>
                        <CheckCircle size={18} />
                        Success!
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative bg-gradient-to-r from-slate-900/90 to-purple-900/90 px-3 text-xs text-white/50">
                    Or continue with
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-300 group backdrop-blur-xl disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-xs font-medium">Google</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-300 group backdrop-blur-xl disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-xs font-medium">Facebook</span>
                  </button>
                </div>
              </form>

              {/* Sign Up Link */}
              <p className="mt-6 text-center text-white/60 text-sm">
                Don't have an account?{' '}
                <button 
                  onClick={handleCreateAccount}
                  className="text-blue-300 hover:text-blue-200 font-bold hover:underline transition-all"
                  disabled={isLoading}
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;