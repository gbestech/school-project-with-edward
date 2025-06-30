import React, { useState, useEffect } from 'react'
import type { LoginCredentials, UserRole, CustomUser } from '@/types/types'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './../hooks/useAuth'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from './../hooks/useDocumentTitle'
import { useTheme } from './../hooks/useTheme'
import { useLocalStorage } from './../hooks/useLocalStorage'
import { useMediaQuery } from './../hooks/useMediaQuery'
import LoginComponent from './../components/home/Login'
import Footer from './../components/home/Footer'
import Navbar from './../components/home/Nav'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useTranslation()
  
  // Set document title
  useDocumentTitle(t('login.title', 'Login - AI Hustle Daily'))

  const handleLogin = async (user: CustomUser) => {
    try {
      // Here you would typically call your authentication service
      await login(user)
      
      // Show success message
      toast.success(t('login.success', 'Login successful!'))
      
      // Navigate to dashboard or home page based on user role
      switch (user.role) {
        case 'student':
          navigate('/student/dashboard')
          break
        case 'teacher':
          navigate('/teacher/dashboard')
          break
        case 'parent':
          navigate('/parent/dashboard')
          break
        default:
          navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(t('login.error', 'Login failed. Please try again.'))
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <>
    <Navbar/>
       <LoginComponent 
      onLogin={handleLogin}
      onBackToHome={handleBackToHome}
    />
    <Footer/>
    </>
 
  )
}

export default Login