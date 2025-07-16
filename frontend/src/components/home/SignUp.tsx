
import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye, EyeOff, ArrowRight, ChevronLeft, AlertCircle, Mail, Lock, User, UserPlus, Phone,
  CheckCircle, Star, Sparkles, Shield
} from 'lucide-react';

// Types
interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  phone?: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

interface SignupProps {
  onSignup: (credentials: SignupCredentials) => Promise<void>;
  onBackToHome: () => void;
  onNavigateToLogin: () => void;
  onGoogleSignup?: () => void;
  onFormInteraction?: () => void;
  isLoading?: boolean;
  isGoogleLoading?: boolean;
  errors?: Record<string, string>;
}

export const SignUp: React.FC<SignupProps> = ({ 
  onSignup, 
  onBackToHome, 
  onNavigateToLogin,
  onGoogleSignup,
  onFormInteraction,
  isLoading = false,
  isGoogleLoading = false,
  errors = {}
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<SignupCredentials>({
    firstName: '',
    lastName: '',
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'student',
    phone: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  });
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

    function onSignInClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    onNavigateToLogin();
  }

    function onGoToDashboard(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    // Redirect to dashboard (replace with your actual dashboard route)
    window.location.href = '/dashboard';
  }

  // Password strength calculator
  const calculatePasswordStrength = useCallback((password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    return strength;
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

    // Step 1 validation
    if (currentStep >= 1) {
      if (!form.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      } else if (form.firstName.length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters';
      }

      if (!form.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      } else if (form.lastName.length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters';
      }

      if (!form.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(form.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Step 2 validation
    if (currentStep >= 2) {
      if (!form.password) {
        newErrors.password = 'Password is required';
      } else if (form.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (passwordStrength < 3) {
        newErrors.password = 'Password is too weak. Include uppercase, lowercase, numbers, and symbols.';
      }

      if (!form.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (form.phone && form.phone.trim() && !phoneRegex.test(form.phone.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }

      if (!form.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, currentStep, passwordStrength]);

  const handleInputChange = (field: keyof SignupCredentials, value: string | boolean) => {
    console.log('Input changed:', field, value); // <-- Debug input changes
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear local errors when user starts typing
    if (localErrors[field]) {
      setLocalErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Notify parent of form interaction
    if (onFormInteraction) {
      onFormInteraction();
    }
    
    // Update password strength
    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signup form submitted:', form); // <-- Debug form submission
    if (!validateForm()) return;

    try {
      setSignupSuccess(true);
      await onSignup(form);
    } catch (error) {
      console.error('Signup error:', error);
      setSignupSuccess(false);
    }
  };

  const nextStep = () => {
    if (validateForm()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleGoogleSignup = () => {
    if (onGoogleSignup) {
      onGoogleSignup();
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Excellent';
  };

  const allErrors = { ...localErrors, ...errors };

  return (
    <div className="relative max-w-md w-full mx-auto">
      {/* Form container with enhanced glass effect */}
      <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
        
        <div className="relative text-white">
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 mb-4">
              {signupSuccess ? (
                <>
                  <CheckCircle size={16} className="text-green-400 animate-bounce" />
                  <span className="text-sm font-semibold text-green-300">Account Created!</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-cyan-400 animate-pulse" />
                  <span className="text-sm font-semibold">Premium Learning Experience</span>
                  <Star size={14} className="text-cyan-400 animate-spin" />
                </>
              )}
            
            <h2 className="text-3xl font-black mb-2">
              {signupSuccess ? 'Welcome Aboard! 🎉' : 'Create Account'}
            </h2>
            
            <p className="text-white/70 text-sm">
              {signupSuccess 
                ? 'Your learning journey begins now!' 
                : `Step ${currentStep} of 2 - Join thousands of successful learners`
              }
            </p>
          </div>

          {/* Enhanced Progress Indicator */}
          {!signupSuccess && (
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  currentStep >= 1 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-500 text-white/60'
                }`}>
                  {currentStep > 1 ? <CheckCircle size={16} /> : '1'}
                </div>
                
                <div className={`w-16 h-2 rounded-full transition-all duration-500 ${
                  currentStep >= 2 
                    ? 'bg-blue-500 shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-500/50'
                }`} />
                
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  currentStep >= 2 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-white/20 text-white/60'
                }`}>
                  {signupSuccess ? <CheckCircle size={16} /> : '2'}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Error Message */}
          {(allErrors.general || allErrors.signup) && (
            <div className="flex items-center space-x-3 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-xl animate-shake mb-6">
              <AlertCircle size={16} className="text-red-400 animate-pulse" />
              <span className="text-sm text-red-300 font-medium">
                {allErrors.general || allErrors.signup}
              </span>
            </div>
          )}

         
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Step 1: Enhanced Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-5">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/90 flex items-center space-x-2">
                    <User size={16} className="text-blue-400" />
                    <span>First Name</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      className={`w-full px-4 py-4 rounded-2xl bg-white/5 border text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-xl ${
                        allErrors.firstName 
                          ? 'border-red-500/50 focus:ring-red-400/50 animate-shake' 
                          : 'border-white/20 focus:ring-blue-400/50 hover:border-white/30'
                      }`}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  {allErrors.firstName && (
                    <p className="text-red-300 text-xs flex items-center space-x-2 animate-fade-in">
                      <AlertCircle size={12} />
                      <span>{allErrors.firstName}</span>
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/90 flex items-center space-x-2">
                    <User size={16} className="text-blue-400" />
                    <span>Last Name</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      className={`w-full px-4 py-4 rounded-2xl bg-white/5 border text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-xl ${
                        allErrors.lastName 
                          ? 'border-red-500/50 focus:ring-red-400/50 animate-shake' 
                          : 'border-white/20 focus:ring-blue-400/50 hover:border-white/30'
                      }`}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  {allErrors.lastName && (
                    <p className="text-red-300 text-xs flex items-center space-x-2 animate-fade-in">
                      <AlertCircle size={12} />
                      <span>{allErrors.lastName}</span>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/90 flex items-center space-x-2">
                    <Mail size={16} className="text-blue-400" />
                    <span>Email Address</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className={`w-full px-4 py-4 rounded-2xl bg-white/5 border text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-xl ${
                        allErrors.email 
                          ? 'border-red-500/50 focus:ring-red-400/50 animate-shake' 
                          : 'border-white/20 focus:ring-blue-400/50 hover:border-white/30'
                      }`}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  {allErrors.email && (
                    <p className="text-red-300 text-xs flex items-center space-x-2 animate-fade-in">
                      <AlertCircle size={12} />
                      <span>{allErrors.email}</span>
                    </p>
                  )}
                </div>

                {/* Enhanced Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/90 flex items-center space-x-2">
                    <UserPlus size={16} className="text-blue-400" />
                    <span>I am a...</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 backdrop-blur-xl appearance-none cursor-pointer hover:border-white/30"
                      disabled={isLoading}
                    >
                      <option value="student" className="bg-slate-800 text-white">🎓 Student</option>
                      <option value="teacher" className="bg-slate-800 text-white">👨‍🏫 Teacher</option>
                      <option value="parent" className="bg-slate-800 text-white">👨‍👩‍👧‍👦 Parent</option>
                      <option value="admin" className="bg-slate-800 text-white">🛡️ Admin</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none">
                      <ChevronLeft size={16} className="rotate-[-90deg]" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* Enhanced Continue Button */}
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative">Continue to Step 2</span>
                  <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            )}

            {/* Step 2: Enhanced Security & Terms */}
            {currentStep === 2 && (
              <div className="space-y-5">
                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/90 flex items-center space-x-2">
                    <Lock size={16} className="text-blue-400" />
                    <span>Create Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a strong password"
                      className={`w-full px-4 py-4 rounded-2xl bg-white/5 border text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-xl pr-14 ${
                        allErrors.password 
                          ? 'border-red-500/50 focus:ring-red-400/50 animate-shake' 
                          : 'border-white/20 focus:ring-blue-400/50 hover:border-white/30'
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-all duration-300 hover:scale-110"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  
                  {/* Enhanced Password Strength Indicator */}
                  {form.password && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                            style={{ 
                              width: `${(passwordStrength / 5) * 100}%`,
                              boxShadow: passwordStrength > 2 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
                            }}
                          />
                        </div>
                        <span className={`text-xs font-medium transition-colors duration-300 ${
                          passwordStrength > 3 ? 'text-green-400' : 
                          passwordStrength > 1 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {getPasswordStrengthLabel()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {allErrors.password && (
                    <p className="text-red-300 text-xs flex items-center space-x-2 animate-fade-in">
                      <AlertCircle size={12} />
                      <span>{allErrors.password}</span>
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/90 flex items-center space-x-2">
                    <Lock size={16} className="text-blue-400" />
                    <span>Confirm Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-4 rounded-2xl bg-white/5 border text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-xl pr-14 ${
                        allErrors.confirmPassword 
                          ? 'border-red-500/50 focus:ring-red-400/50 animate-shake' 
                          : 'border-white/20 focus:ring-blue-400/50 hover:border-white/30'
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-all duration-300 hover:scale-110"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  {allErrors.confirmPassword && (
                    <p className="text-red-300 text-xs flex items-center space-x-2 animate-fade-in">
                      <AlertCircle size={12} />
                      <span>{allErrors.confirmPassword}</span>
                    </p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/90 flex items-center space-x-2">
                    <Phone size={16} className="text-blue-400" />
                    <span>Phone Number <span className="text-white/50">(Optional)</span></span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className={`w-full px-4 py-4 rounded-2xl bg-white/5 border text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-xl ${
                        allErrors.phone 
                          ? 'border-red-500/50 focus:ring-red-400/50 animate-shake' 
                          : 'border-white/20 focus:ring-blue-400/50 hover:border-white/30'
                      }`}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  {allErrors.phone && (
                    <p className="text-red-300 text-xs flex items-center space-x-2 animate-fade-in">
                      <AlertCircle size={12} />
                      <span>{allErrors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Terms and Privacy */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={form.agreeToTerms}
                          onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                          className="mt-1 w-4 h-4 text-orange-500 bg-transparent border-white/30 rounded focus:ring-orange-500/50 focus:ring-2"
                        />
                        <label htmlFor="terms" className="text-sm text-white/80 leading-relaxed">
                          I agree to the{' '}
                          <a href="#" className="text-orange-400 hover:text-orange-300 underline font-medium">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="#" className="text-orange-400 hover:text-orange-300 underline font-medium">
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        disabled={isLoading}
                        className="flex-1 bg-white/10 hover:bg-white/15 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 border border-white/20 hover:border-white/30 group"
                      >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                        <span>Back</span>
                      </button>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="relative">Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <span className="relative">Create Account</span>
                            <CheckCircle size={18} className="relative group-hover:scale-110 transition-transform duration-300" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              

                     
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/10 text-white/60 rounded-full">or</span>
                </div>
              </div>

                 {/* Google Signup Button */}
          {!signupSuccess && currentStep === 1 && (
            <div className="mb-6">
              <button
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="w-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isGoogleLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
         
            </div>
          )}

             
              </form>

              {/* Sign In Link */}
              {!signupSuccess && (
                <div className="text-center mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/60 text-sm">
                    Already have an account?{' '}
                    <button 
                      onClick={onSignInClick}
                      className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors duration-300 hover:no-underline"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              )}

              {/* Success State */}
              {signupSuccess && (
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle size={32} className="text-white" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white">Account Created Successfully!</h3>
                    <p className="text-white/70">
                      Welcome to the future of learning. Check your email for verification instructions.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={onGoToDashboard}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 shadow-xl shadow-orange-500/25"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight size={18} />
                    </button>
                    
                    <button
                      onClick={onBackToHome}
                      className="flex-1 bg-white/10 hover:bg-white/15 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/30"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl" />
          </div>


      
  </div>
    {/* Custom CSS for animations */}
    {/* Place the <style> tag inside a React fragment or the returned JSX */}
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </>
  </div>
  );
};

