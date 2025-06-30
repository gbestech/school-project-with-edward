import React, { useState, useCallback } from 'react';
import {
  Eye, EyeOff, ArrowRight, ChevronLeft, AlertCircle, Mail, Lock, User, UserPlus, Phone
} from 'lucide-react';


interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher' | 'admin';
  phone?: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

interface SignupProps {
  onSignup: (credentials: SignupCredentials) => void;
  onBackToHome: () => void;
  onNavigateToLogin: () => void;
  isLoading?: boolean;
  className?: string;
}

export const SignUp: React.FC<SignupProps> = ({ 
  onSignup, 
  onBackToHome, 
  onNavigateToLogin,
  isLoading = false,
  className = ''
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, currentStep, passwordStrength]);

  const handleInputChange = (field: keyof SignupCredentials, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Update password strength
    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSignup = () => {
    if (validateForm()) {
      onSignup(form);
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

  const renderStep1 = () => (
    <div className="space-y-4">
      {/* First Name */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
          <User size={14} />
          <span>First Name</span>
        </label>
        <input
          type="text"
          value={form.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          placeholder="Enter your first name"
          className={`w-full px-4 py-3 rounded-xl bg-white border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
            errors.firstName 
              ? 'border-red-500 focus:ring-red-400' 
              : 'border-gray-200 focus:ring-blue-400'
          }`}
          disabled={isLoading}
        />
        {errors.firstName && (
          <p className="text-red-500 text-xs flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>{errors.firstName}</span>
          </p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
          <User size={14} />
          <span>Last Name</span>
        </label>
        <input
          type="text"
          value={form.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          placeholder="Enter your last name"
          className={`w-full px-4 py-3 rounded-xl bg-white border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
            errors.lastName 
              ? 'border-red-500 focus:ring-red-400' 
              : 'border-gray-200 focus:ring-blue-400'
          }`}
          disabled={isLoading}
        />
        {errors.lastName && (
          <p className="text-red-500 text-xs flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>{errors.lastName}</span>
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
          <Mail size={14} />
          <span>Email</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter your email"
          className={`w-full px-4 py-3 rounded-xl bg-white border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
            errors.email 
              ? 'border-red-500 focus:ring-red-400' 
              : 'border-gray-200 focus:ring-blue-400'
          }`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-500 text-xs flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>{errors.email}</span>
          </p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Password */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
          <Lock size={14} />
          <span>Password</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Create a strong password"
            className={`w-full px-4 py-3 rounded-xl bg-white border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 pr-12 ${
              errors.password 
                ? 'border-red-500 focus:ring-red-400' 
                : 'border-gray-200 focus:ring-blue-400'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {form.password && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{getPasswordStrengthLabel()}</span>
            </div>
          </div>
        )}
        
        {errors.password && (
          <p className="text-red-500 text-xs flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>{errors.password}</span>
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
          <Lock size={14} />
          <span>Confirm Password</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            className={`w-full px-4 py-3 rounded-xl bg-white border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 pr-12 ${
              errors.confirmPassword 
                ? 'border-red-500 focus:ring-red-400' 
                : 'border-gray-200 focus:ring-blue-400'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>{errors.confirmPassword}</span>
          </p>
        )}
      </div>

      {/* Phone (Optional) */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
          <Phone size={14} />
          <span>Phone Number <span className="text-gray-400">(Optional)</span></span>
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Enter your phone number"
          className={`w-full px-4 py-3 rounded-xl bg-white border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
            errors.phone 
              ? 'border-red-500 focus:ring-red-400' 
              : 'border-gray-200 focus:ring-blue-400'
          }`}
          disabled={isLoading}
        />
        {errors.phone && (
          <p className="text-red-500 text-xs flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>{errors.phone}</span>
          </p>
        )}
      </div>

      {/* Terms Agreement */}
      <div className="space-y-3">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={form.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            className="w-4 h-4 accent-blue-500 rounded mt-1" 
            disabled={isLoading}
          />
          <span className="text-gray-600 text-sm leading-relaxed">
            I agree to the{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500 underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500 underline">Privacy Policy</a>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-red-500 text-xs flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>{errors.agreeToTerms}</span>
          </p>
        )}
      </div>

      {/* Newsletter Subscription */}
      <label className="flex items-center space-x-3 cursor-pointer">
        <input 
          type="checkbox" 
          checked={form.subscribeNewsletter}
          onChange={(e) => handleInputChange('subscribeNewsletter', e.target.checked)}
          className="w-4 h-4 accent-blue-500 rounded" 
          disabled={isLoading}
        />
        <span className="text-gray-600 text-sm">
          Subscribe to our newsletter for updates and tips
        </span>
      </label>
    </div>
);


  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 ${className}`}>
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          disabled={isLoading}
        >
          <ChevronLeft size={18} />
          <span className="ml-1 text-sm font-medium">Back to Home</span>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
        <p className="text-gray-600 mb-6">Join our platform and start learning today!</p>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
              currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
              currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          
          <div className="flex items-center justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                disabled={isLoading}
              >
                Back
              </button>
            )}
            
            {currentStep < 2 && (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center"
                disabled={isLoading}
              >
                Next <ArrowRight size={16} className="ml-1" />
              </button>
            )}
            
            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleSignup}
                className="ml-auto px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  <>
                    Create Account <UserPlus size={16} className="ml-1" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <span className="text-gray-600 text-sm">Already have an account?</span>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="ml-2 text-blue-600 hover:underline text-sm font-medium"
            disabled={isLoading}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};