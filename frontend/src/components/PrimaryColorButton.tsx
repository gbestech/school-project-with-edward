import React from 'react';

interface PrimaryColorButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const PrimaryColorButton: React.FC<PrimaryColorButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all duration-200
        bg-[var(--primary-color)] text-white
        hover:opacity-90 active:opacity-80
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        backgroundColor: 'var(--primary-color)',
        color: 'white'
      }}
    >
      {children}
    </button>
  );
};

export default PrimaryColorButton; 