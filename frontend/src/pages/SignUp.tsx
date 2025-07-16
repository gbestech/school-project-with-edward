import React, { useState, useCallback, useEffect } from 'react';
import { SignUp } from './../components/home/SignUp';
import { useNavigate } from 'react-router-dom';
import {
  AuthService, 
  SignupCredentials, 
  GoogleRegistrationData,
  ApiResponse, 
  User
} from './../services/AuthService';

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Types
interface SignupState {
  isLoading: boolean;
  user: User | null;
  token: string | null;
  errors: Record<string, string>;
  successMessage: string;
}

interface GoogleSignupState {
  isGoogleLoading: boolean;
  showGoogleForm: boolean;
  googleUserInfo: any | null;
  googleCredential: string | null;
}

// Custom hooks for signup logic
const useSignup = () => {
  const [state, setState] = useState<SignupState>({
    isLoading: false,
    user: null,
    token: null,
    errors: {},
    successMessage: '',
  });

  const [googleState, setGoogleState] = useState<GoogleSignupState>({
    isGoogleLoading: false,
    showGoogleForm: false,
    googleUserInfo: null,
    googleCredential: null,
  });

  const authService = new AuthService();

  // Regular signup
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

  // Google signup initiation
  const initiateGoogleSignup = useCallback(async () => {
    setGoogleState(prev => ({ ...prev, isGoogleLoading: true }));

    try {
      const result = await authService.googleSignInForRegistration();
      
      if (result.success && result.credential && result.userInfo) {
        // Check if user already exists
        const emailExists = await authService.checkEmailExists(result.userInfo.email);
        
        if (emailExists) {
          setState(prev => ({
            ...prev,
            errors: { email: 'This email is already registered. Please sign in instead.' }
          }));
          setGoogleState(prev => ({ ...prev, isGoogleLoading: false }));
          return { success: false, errors: { email: 'Email already registered' } };
        }

        // Set up Google registration form
        setGoogleState(prev => ({
          ...prev,
          isGoogleLoading: false,
          showGoogleForm: true,
          googleUserInfo: result.userInfo ?? null,
          googleCredential: result.credential ?? null,
        }));

        return { success: true, requiresAdditionalInfo: true };
      } else {
        setState(prev => ({
          ...prev,
          errors: { google: result.error || 'Google sign-in failed' }
        }));
        setGoogleState(prev => ({ ...prev, isGoogleLoading: false }));
        return { success: false, errors: { google: result.error || 'Google sign-in failed' } };
      }
    } catch (error) {
      console.error('Google signup error:', error);
      const googleError = { google: 'Google sign-in failed. Please try again.' };
      setState(prev => ({ ...prev, errors: googleError }));
      setGoogleState(prev => ({ ...prev, isGoogleLoading: false }));
      return { success: false, errors: googleError };
    }
  }, []);

  // Complete Google registration
  const completeGoogleSignup = useCallback(async (additionalData: {
    role: "student" | "teacher" | "parent" | "admin" 
    phone?: string;
    agreeToTerms: boolean;
    subscribeNewsletter: boolean;
  }) => {
    if (!googleState.googleCredential || !googleState.googleUserInfo) {
      setState(prev => ({
        ...prev,
        errors: { google: 'Google authentication data is missing. Please try again.' }
      }));
      return { success: false, errors: { google: 'Missing Google data' } };
    }

    setState(prev => ({ ...prev, isLoading: true, errors: {} }));

    try {
      // Validate additional data
      const validationErrors = validateGoogleRegistrationData(additionalData);
      if (Object.keys(validationErrors).length > 0) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          errors: validationErrors 
        }));
        return { success: false, errors: validationErrors };
      }

      // Prepare Google registration data
      const googleRegistrationData: GoogleRegistrationData = {
        firstName: googleState.googleUserInfo.given_name,
        lastName: googleState.googleUserInfo.family_name,
        email: googleState.googleUserInfo.email,
        role: additionalData.role,
        phone: additionalData.phone,
        agreeToTerms: additionalData.agreeToTerms,
        subscribeNewsletter: additionalData.subscribeNewsletter,
        googleCredential: googleState.googleCredential,
      };

      // Register with Google
      const response = await authService.googleRegister(googleRegistrationData);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          user: response.data.user,
          token: response.data.token,
          successMessage: response.message,
          errors: {},
        }));

        // Reset Google state
        setGoogleState({
          isGoogleLoading: false,
          showGoogleForm: false,
          googleUserInfo: null,
          googleCredential: null,
        });

        // Track successful registration
        trackRegistration(response.data.user, 'google');

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
      console.error('Google registration error:', error);
      const networkError = { general: 'An unexpected error occurred. Please try again.' };
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        errors: networkError 
      }));
      return { success: false, errors: networkError };
    }
  }, [googleState.googleCredential, googleState.googleUserInfo]);

  // Cancel Google registration
  const cancelGoogleSignup = useCallback(() => {
    setGoogleState({
      isGoogleLoading: false,
      showGoogleForm: false,
      googleUserInfo: null,
      googleCredential: null,
    });
    setState(prev => ({ ...prev, errors: {} }));
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
    setGoogleState({
      isGoogleLoading: false,
      showGoogleForm: false,
      googleUserInfo: null,
      googleCredential: null,
    });
  }, []);

  return {
    ...state,
    ...googleState,
    signup,
    initiateGoogleSignup,
    completeGoogleSignup,
    cancelGoogleSignup,
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

  if (!credentials.role) {
    errors.role = 'Role is required';
  }

  if (!credentials.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the terms and conditions';
  }

  return errors;
};

const validateGoogleRegistrationData = (data: {
  role: string;
  phone?: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.role) {
    errors.role = 'Role is required';
  }

  if (data.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (!data.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the terms and conditions';
  }

  return errors;
};

// Analytics/tracking utilities
const trackRegistration = (user: User, method: string = 'email') => {
  // Track successful registration for analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method,
      user_id: user.id,
      user_role: user.role,
    });
  }

  // Track in other analytics services
  console.log('User registered:', {
    id: user.id,
    role: user.role,
    method,
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
      parent: '/parent/dashboard',
      admin: '/admin/dashboard',
    };
    
    const route = dashboardRoutes[userRole as keyof typeof dashboardRoutes] || '/dashboard';
    navigate(route);
  }, [navigate]);

  return { goToHome, goToLogin, goToDashboard };
};

// Google Registration Form Component
const GoogleRegistrationForm: React.FC<{
  userInfo: any;
  onComplete: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
}> = ({ userInfo, onComplete, onCancel, isLoading, errors }) => {
  const [formData, setFormData] = useState({
    role: '',
    phone: '',
    agreeToTerms: false,
    subscribeNewsletter: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Registration</h1>
          <p className="text-gray-600">Welcome, {userInfo?.name}! Just a few more details to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                I agree to the <a href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</a> *
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms}</p>}

            <div className="flex items-start">
              <input
                type="checkbox"
                id="subscribeNewsletter"
                name="subscribeNewsletter"
                checked={formData.subscribeNewsletter}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="subscribeNewsletter" className="ml-2 block text-sm text-gray-900">
                Subscribe to our newsletter for updates and tips
              </label>
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main SignUp Page Component
const SignUpPage: React.FC = () => {
  const { 
    isLoading, 
    user, 
    errors, 
    successMessage,
    isGoogleLoading,
    showGoogleForm,
    googleUserInfo,
    signup,
    initiateGoogleSignup,
    completeGoogleSignup,
    cancelGoogleSignup,
    resendVerification, 
    clearErrors 
  } = useSignup();
  
  const { goToHome, goToLogin, goToDashboard } = useNavigation();

  const handleSignup = async (credentials: SignupCredentials) => {
    const result = await signup(credentials);
    
    if (result.success && result.user) {
      // Redirect to email verification page
      window.location.href = `/verify-email?email=${encodeURIComponent(credentials.email)}`;
    }
  };

  const handleGoogleSignup = async () => {
    const result = await initiateGoogleSignup();
    
    if (result.success && !result.requiresAdditionalInfo) {
      // Direct sign-up successful, redirect
      setTimeout(() => goToDashboard('student'), 3000); // Default to student, or handle role selection
    }
  };

  const handleCompleteGoogleSignup = async (additionalData: any) => {
    const result = await completeGoogleSignup(additionalData);
    
    if (result.success && result.user) {
      // Auto-redirect to dashboard after successful signup
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

  // Show Google registration form if needed
  if (showGoogleForm && googleUserInfo) {
    return (
      <GoogleRegistrationForm
        userInfo={googleUserInfo}
        onComplete={handleCompleteGoogleSignup}
        onCancel={cancelGoogleSignup}
        isLoading={isLoading}
        errors={errors}
      />
    );
  }

  // If registration is successful, redirect to email verification
  if (user && successMessage) {
    // Redirect to email verification page
    window.location.href = `/verify-email?email=${encodeURIComponent(user.email)}`;
    return null;
  }

  // Render main signup form
  return (
    <SignUp
      onSignup={handleSignup}
      onGoogleSignup={handleGoogleSignup}
      onBackToHome={goToHome}
      onNavigateToLogin={goToLogin}
      isLoading={isLoading}
      isGoogleLoading={isGoogleLoading}
      errors={errors}
      onFormInteraction={handleFormInteraction}
    />
  );
};

export default SignUpPage;