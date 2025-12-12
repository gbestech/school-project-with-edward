
import React, { useState } from 'react';
import AdminLoginForm from '@/components/login/AdminLoginForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Navbar from '@/components/home/Nav';
import { AuthService } from '@/services/AuthService';
import type { LoginCredentials } from '@/types/types';
import { UserRole } from '@/types/types';

const authService = new AuthService();

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useDocumentTitle(t('login.title', 'Admin Login - AL-QOLAMULMUWAFFAQ'));

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setErrors({});
      
      console.log('🔐 AdminLoginPage: Starting login...');
      const loggedInUser = await login(credentials);
      
      console.log('✅ AdminLoginPage: Login successful');
      console.log('👤 AdminLoginPage: User data:', loggedInUser);
      console.log('🎭 AdminLoginPage: User role:', loggedInUser?.role);
      
      if (!loggedInUser) {
        throw new Error('Login failed: No user data returned');
      }

      toast.success(t('login.success', 'Login successful!'));
      
      // Navigate based on user role
      const role = loggedInUser.role as UserRole;
      
      switch (role) {
        case UserRole.SUPERADMIN:
          console.log('🚀 Navigating to super admin dashboard');
          navigate('/super-admin/dashboard');
          break;
          
        case UserRole.ADMIN:
          console.log('🚀 Navigating to admin dashboard');
          navigate('/admin/dashboard');
          break;
          
        // All section admins go to admin dashboard
        case UserRole.SECONDARY_ADMIN:
          console.log('🚀 Navigating to secondary admin dashboard');
          navigate('/admin/dashboard');
          break;
          
        case UserRole.SENIOR_SECONDARY_ADMIN:
          console.log('🚀 Navigating to senior secondary admin dashboard');
          navigate('/admin/dashboard');
          break;
          
        case UserRole.JUNIOR_SECONDARY_ADMIN:
          console.log('🚀 Navigating to junior secondary admin dashboard');
          navigate('/admin/dashboard');
          break;
          
        case UserRole.PRIMARY_ADMIN:
          console.log('🚀 Navigating to primary admin dashboard');
          navigate('/admin/dashboard');
          break;
          
        case UserRole.NURSERY_ADMIN:
          console.log('🚀 Navigating to nursery admin dashboard');
          navigate('/admin/dashboard');
          break;
          
        case UserRole.TEACHER:
          console.log('🚀 Navigating to teacher dashboard');
          navigate('/teacher/dashboard');
          break;
          
        case UserRole.STUDENT:
          console.log('🚀 Navigating to student dashboard');
          navigate('/student/dashboard');
          break;
          
        case UserRole.PARENT:
          console.log('🚀 Navigating to parent dashboard');
          navigate('/parent/dashboard');
          break;
          
        default:
          console.warn('⚠️ Unknown role:', role, 'defaulting to admin dashboard');
          navigate('/admin/dashboard');
      }
      
    } catch (error: any) {
      console.error('❌ AdminLoginPage: Login error:', error);
      
      // Handle different error types
      if (error.response?.data) {
        const errorData = error.response.data;
        const newErrors: Record<string, string> = {};
        
        if (errorData.non_field_errors) {
          newErrors.general = errorData.non_field_errors[0];
        } else if (errorData.username) {
          newErrors.username = errorData.username[0];
        } else if (errorData.password) {
          newErrors.password = errorData.password[0];
        } else if (errorData.detail) {
          newErrors.general = errorData.detail;
        } else if (errorData.error) {
          newErrors.general = errorData.error;
        } else {
          newErrors.general = 'Login failed. Please check your credentials.';
        }
        
        setErrors(newErrors);
      } else if (error.message) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
      
      toast.error(error.message || t('login.error', 'Login failed. Please try again.'));
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
        
        // Get user data to determine navigation
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const role = user.role as UserRole;
          
          // Navigate based on user role (same logic as handleLogin)
          switch (role) {
            case UserRole.SUPERADMIN:
              navigate('/super-admin/dashboard');
              break;
            case UserRole.ADMIN:
              navigate('/admin/dashboard');
              break;
            case UserRole.SECONDARY_ADMIN:
            case UserRole.SENIOR_SECONDARY_ADMIN:
            case UserRole.JUNIOR_SECONDARY_ADMIN:
            case UserRole.PRIMARY_ADMIN:
            case UserRole.NURSERY_ADMIN:
              navigate('/admin/dashboard');
              break;
            case UserRole.TEACHER:
              navigate('/teacher/dashboard');
              break;
            case UserRole.STUDENT:
              navigate('/student/dashboard');
              break;
            case UserRole.PARENT:
              navigate('/parent/dashboard');
              break;
            default:
              navigate('/admin/dashboard');
          }
        } else {
          navigate('/admin/dashboard');
        }
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
      <AdminLoginForm
        onLogin={handleLogin}
        onBackToHome={handleBackToHome}
        onSocialLogin={handleSocialLogin}
        isLoading={isLoading}
        onCreateAccount={() => navigate('/signup')}
        errors={errors}
        initialRole="admin"
        hideRoleSelect={true}
      />
    </>
  );
};

export default AdminLoginPage;