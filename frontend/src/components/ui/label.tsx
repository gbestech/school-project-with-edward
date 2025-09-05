import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ 
  children, 
  htmlFor,
  className = ''
}) => {
  const baseClasses = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
  
  const classes = `${baseClasses} ${className}`;
  
  return (
    <label
      htmlFor={htmlFor}
      className={classes}
    >
      {children}
    </label>
  );
};

