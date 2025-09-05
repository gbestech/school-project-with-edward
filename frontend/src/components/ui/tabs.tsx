import React, { useState } from 'react';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({ 
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || defaultValue || '');
  
  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === TabsList) {
            return React.cloneElement(child, {
              currentValue,
              onValueChange: handleValueChange
            });
          }
          if (child.type === TabsContent) {
            return React.cloneElement(child, {
              isActive: child.props.value === currentValue
            });
          }
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ 
  children, 
  className = '',
  currentValue,
  onValueChange
}) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TabsTrigger) {
          return React.cloneElement(child, {
            isActive: child.props.value === currentValue,
            onClick: () => onValueChange?.(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  children, 
  className = '',
  isActive = false,
  onClick
}) => {
  const activeClasses = isActive 
    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50'
    : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50';
  
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300';
  
  const classes = `${baseClasses} ${activeClasses} ${className}`;
  
  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  children, 
  className = '',
  isActive = false
}) => {
  if (!isActive) return null;

  return (
    <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 ${className}`}>
      {children}
    </div>
  );
};

