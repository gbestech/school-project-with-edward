import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  checked = false,
  onCheckedChange,
  disabled = false,
  className = '',
  id
}) => {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  const baseClasses = 'peer h-4 w-4 shrink-0 rounded-sm border border-slate-200 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50 dark:border-slate-800 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=checked]:bg-slate-50 dark:data-[state=checked]:text-slate-900';
  
  const classes = `${baseClasses} ${className}`;
  
  return (
    <button
      type="button"
      id={id}
      className={classes}
      onClick={handleClick}
      disabled={disabled}
      data-state={checked ? 'checked' : 'unchecked'}
    >
      {checked && (
        <Check className="h-4 w-4" />
      )}
    </button>
  );
};

