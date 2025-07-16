import React, { useState } from 'react'
import type { LoginCredentials } from '@/types/types'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './../hooks/useAuth'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from './../hooks/useDocumentTitle'
import LoginComponent from './../components/home/Login'
import Footer from './../components/home/Footer'
import Navbar from './../components/home/Nav'
import { AuthService } from '../services/AuthService'

const authService = new AuthService()

const Login = () => {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Set document title
  useDocumentTitle(t('login.title', 'Login - AI Hustle Daily'))

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
       console.log('Sending login request with:', credentials);
      setIsLoading(true)
      setErrors({})

      const loggedInUser = await login(credentials);
      
    
      
      
      toast.success(t('login.success', 'Login successful!'))
      
      // Navigate based on user role after successful login
      // The user should be available in the auth context after login
     if (loggedInUser?.role) {
      switch (loggedInUser.role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'parent':
          navigate('/parent/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      navigate('/');
    }
  } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle specific error messages
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.non_field_errors) {
          setErrors({ general: errorData.non_field_errors[0] })
        } else if (errorData.email) {
          setErrors({ email: errorData.email[0] })
        } else if (errorData.password) {
          setErrors({ password: errorData.password[0] })
        } else if (errorData.detail) {
          setErrors({ general: errorData.detail })
        } else {
          setErrors({ general: 'Login failed. Please check your credentials.' })
        }
      } else {
        setErrors({ general: 'Login failed. Please try again.' })
      }
      
      toast.error(t('login.error', 'Login failed. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    if (provider === 'google') {
      await handleGoogleLogin()
    } else if (provider === 'facebook') {
      toast.info('Facebook login not implemented yet.')
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setErrors({})
    
    try {
      const result = await authService.googleSignIn()
      
      if (result.success) {
        console.log('Google login successful:', result.data)
        const userData = result.data
        
        toast.success(t('login.success', 'Google login successful!'))
        
        // Navigate based on user role if available
        if (userData?.user?.role) {
          switch (userData.user.role) {
            case 'student':
              navigate('/student/dashboard')
              break
            case 'teacher':
              navigate('/teacher/dashboard')
              break
            case 'parent':
              navigate('/parent/dashboard')
              break
            case 'admin':
              navigate('/admin/dashboard')
              break
            default:
              navigate('/')
          }
        } else {
          navigate('/')
        }
        
      } else {
        console.error('Google login failed:', result.message)
        setErrors(result.errors || { google: result.message })
        toast.error(result.message || 'Google login failed. Please try again.')
      }
    } catch (error) {
      console.error('Google login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Google login failed'
      setErrors({ google: errorMessage })
      toast.error('Google login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <LoginComponent
        onLogin={handleLogin}
        onBackToHome={handleBackToHome}
        onSocialLogin={handleSocialLogin}
        isLoading={isLoading}
        onCreateAccount={() => navigate('/signup')}
        errors={errors}
      />
      <Footer />
    </>
  )
}

export default Login