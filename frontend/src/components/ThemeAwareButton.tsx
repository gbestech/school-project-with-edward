import React from 'react';
import { useDesign } from '@/contexts/DesignContext';

interface ThemeAwareButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const ThemeAwareButton: React.FC<ThemeAwareButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button'
}) => {
  const { settings: designSettings } = useDesign();

  const getButtonStyles = () => {
    const baseClasses = 'font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-2xl'
    };

    const variantStyles = {
      primary: {
        className: `${baseClasses} ${sizeClasses[size]} text-white shadow-lg`,
        style: {
          background: designSettings?.theme === 'premium'
            ? 'linear-gradient(135deg, #dc2626 0%, #1e3a8a 50%, #1e40af 100%)'
            : `linear-gradient(135deg, ${designSettings?.primary_color || '#3B82F6'} 0%, ${designSettings?.primary_color || '#3B82F6'}80 100%)`,
          boxShadow: designSettings?.theme === 'premium'
            ? '0 10px 15px -3px rgba(220, 38, 38, 0.25)'
            : `0 10px 15px -3px ${designSettings?.primary_color || '#3B82F6'}25`
        }
      },
      secondary: {
        className: `${baseClasses} ${sizeClasses[size]} bg-white/5 backdrop-blur-3xl text-white border-2 border-white/10 hover:border-white/30`,
        style: {
          background: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }
      },
      outline: {
        className: `${baseClasses} ${sizeClasses[size]} border-2 bg-transparent`,
        style: {
          borderColor: designSettings?.theme === 'premium' ? '#dc2626' : (designSettings?.primary_color || '#3B82F6'),
          color: designSettings?.theme === 'premium' ? '#dc2626' : (designSettings?.primary_color || '#3B82F6')
        }
      }
    };

    return variantStyles[variant];
  };

  const buttonStyles = getButtonStyles();

  return (
    <button
      type={type}
      className={`${buttonStyles.className} ${className}`}
      style={buttonStyles.style}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ThemeAwareButton; 