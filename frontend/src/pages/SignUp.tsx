
import React, { useState, useCallback } from 'react';
import { SignUp } from './../components/home/SignUp';
import { useNavigate } from 'react-router-dom';
import {AuthService, SignupCredentials, SignupState, ApiResponse, User} from './../services/AuthService';

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Types


// Custom hooks for signup logic
const useSignup = () => {
  const [state, setState] = useState<SignupState>({
    isLoading: false,
    user: null,
    token: null,
    errors: {},
    successMessage: '',
  });

  const authService = new AuthService();

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, errors: {} }));
  

    try {
      // Client-side validation
      const validationErrors = validateCredentials(credentials);
      if (Object.keys(validationErrors).length > 0) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          errors: validationErrors 
        }));
        return { success: false, errors: validationErrors };
      }

      // Check if email already exists (optional pre-check)
      const emailExists = await authService.checkEmailExists(credentials.email);
      if (emailExists) {
        const emailError = { email: 'This email is already registered' };
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          errors: emailError 
        }));
        return { success: false, errors: emailError };
      }

      // Register user
      const response = await authService.register(credentials);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          user: response.data.user,
          token: response.data.token,
          successMessage: response.message,
          errors: {},
        }));

  


        // Send verification email
        await authService.sendVerificationEmail(credentials.email);

        // Track successful registration
        trackRegistration(response.data.user);

        return { success: true, user: response.data.user };
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          errors: response.errors || {},
        }));
        return { success: false, errors: response.errors || {} };
      }
    } catch (error) {
      console.error('Signup error:', error);
      const networkError = { general: 'An unexpected error occurred. Please try again.' };
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        errors: networkError 
      }));
      return { success: false, errors: networkError };
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    try {
      const response = await authService.resendVerification(email);
      return response;
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, message: 'Failed to resend verification email' };
    }
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      user: null,
      token: null,
      errors: {},
      successMessage: '',
    });
  }, []);

  return {
    ...state,
    signup,
    resendVerification,
    clearErrors,
    reset,
  };
};

// Validation utilities
const validateCredentials = (credentials: SignupCredentials): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!credentials.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!credentials.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!credentials.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!credentials.password) {
    errors.password = 'Password is required';
  } else if (credentials.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  if (credentials.password !== credentials.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!credentials.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the terms and conditions';
  }

  return errors;
};

// Analytics/tracking utilities
const trackRegistration = (user: User) => {
  // Track successful registration for analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: 'email',
      user_id: user.id,
      user_role: user.role,
    });
  }

  // Track in other analytics services
  console.log('User registered:', {
    id: user.id,
    role: user.role,
    timestamp: new Date().toISOString(),
  });
};

// Navigation utilities
const useNavigation = () => {
  const navigate = useNavigate();

  const goToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const goToLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const goToDashboard = useCallback((userRole: string) => {
    // Route based on user role
    const dashboardRoutes = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard',
    };
    
    const route = dashboardRoutes[userRole as keyof typeof dashboardRoutes] || '/dashboard';
    navigate(route);
  }, [navigate]);

  return { goToHome, goToLogin, goToDashboard };
};

// Main SignUp Page Component
const SignUpPage: React.FC = () => {
  const { 
    isLoading, 
    user, 
    errors, 
    successMessage, 
    signup, 
    resendVerification, 
    clearErrors 
  } = useSignup();
  
  const { goToHome, goToLogin, goToDashboard } = useNavigation();

  const handleSignup = async (credentials: SignupCredentials) => {
    const result = await signup(credentials);
    
    if (result.success && result.user) {
      // Optional: Auto-redirect to dashboard after successful signup
      setTimeout(() => goToDashboard(result.user.role), 3000);
    }
  };

  const handleFormInteraction = useCallback(() => {
    // Clear errors when user starts interacting with form
    if (Object.keys(errors).length > 0) {
      clearErrors();
    }

    // Track form engagement
    console.log('Form interaction detected');
  }, [errors, clearErrors]);

  // If registration is successful, show success state or redirect
  if (user && successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user.firstName}!</h1>
          <p className="text-gray-600 mb-6">{successMessage}</p>
          
          <div className="space-y-3">
            <button
              onClick={goToLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Login
            </button>
            
            <button
              onClick={goToHome}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render main signup form
  return (
    <SignUp
      onSignup={handleSignup}
      onBackToHome={goToHome}
      onNavigateToLogin={goToLogin}
      isLoading={isLoading}
    />
  );
};

export default SignUpPage;