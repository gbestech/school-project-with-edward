import React, { useState } from 'react';
import Hero from './../components/home/HeroSection';
import Navbar from './../components/home/Nav';
import Footer from './../components/home/Footer';
import type { UserRole } from '@/types/types'; // Ensure this matches the import in Nav.tsx, or import LoginCredentials and UserRole from the same source as Nav.tsx expects

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    role: 'student' as UserRole, // ✅ VALID ROLE
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = () => {
    // TODO: Implement real login logic (API call, token storage, etc.)
    console.log('Logging in with:', loginForm);
  };

  const handleLogout = () => {
    // TODO: Clear session or token storage here
    console.log('Logged out');
  };

  return (
    <>
      <Navbar
      
      />
      <Hero setIsLoginOpen={setIsLoginOpen} />
      <Footer />
    </>
  );
};

export default Landing;
