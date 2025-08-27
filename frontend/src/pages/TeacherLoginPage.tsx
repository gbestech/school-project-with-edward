import React, { useState } from 'react';
import TeacherLoginForm from '@/components/login/TeacherLoginForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './../hooks/useAuth';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from './../hooks/useDocumentTitle';

import Navbar from './../components/home/Nav';
import { AuthService } from '../services/AuthService';
import type { LoginCredentials } from '@/types/types';

const authService = new AuthService();

const TeacherLoginPage: React.FC = () => {
  console.log('🔍 TeacherLoginPage: Component rendered');
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useDocumentTitle(t('login.title', 'Student Login - AI Hustle Daily'));

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setErrors({});
      console.log('🔍 TeacherLoginPage: Starting login process...');
      console.log('🔍 TeacherLoginPage: Credentials:', { username: credentials.username, role: credentials.role });
      
      const loggedInUser = await login(credentials);
      console.log('🔍 TeacherLoginPage: Login successful, user data:', loggedInUser);
      console.log('🔍 TeacherLoginPage: User role:', loggedInUser?.role);
      
      toast.success(t('login.success', 'Login successful!'));
      // Always navigate to teacher dashboard for this page
      console.log('🔍 TeacherLoginPage: Navigating to /teacher/dashboard');
      navigate('/teacher/dashboard');
    } catch (error: any) {
      console.error('🔍 TeacherLoginPage: Login error:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.non_field_errors) {
          setErrors({ general: errorData.non_field_errors[0] });
        } else if (errorData.username) {
          setErrors({ username: errorData.username[0] });
        } else if (errorData.password) {
          setErrors({ password: errorData.password[0] });
        } else if (errorData.detail) {
          setErrors({ general: errorData.detail });
        } else {
          setErrors({ general: 'Login failed. Please check your credentials.' });
        }
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
      toast.error(t('login.error', 'Login failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    if (provider === 'google') {
      await handleGoogleLogin();
    } else if (provider === 'facebook') {
      toast.info('Facebook login not implemented yet.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const result = await authService.googleSignIn();
      if (result.success) {
        toast.success(t('login.success', 'Google login successful!'));
        navigate('/teacher/dashboard');
      } else {
        setErrors(result.errors || { google: result.message });
        toast.error(result.message || 'Google login failed. Please try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      setErrors({ google: errorMessage });
      toast.error('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <TeacherLoginForm
        onLogin={handleLogin}
        onBackToHome={handleBackToHome}
        onSocialLogin={handleSocialLogin}
        isLoading={isLoading}
        onCreateAccount={() => navigate('/signup')}
        errors={errors}
        initialRole="teacher"
        hideRoleSelect={true}
      />
    </>
  );
};

export default TeacherLoginPage;
