import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, description }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-colors duration-300">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer transition-colors duration-300">
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">{description}</p>
        )}
      </div>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
          aria-describedby={description ? `${id}-description` : undefined}
        />
        <div
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="switch"
          aria-checked={checked}
          aria-labelledby={id}
          className={`w-11 h-6 rounded-full cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
            checked 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/10' 
              : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white dark:bg-slate-200 rounded-full shadow-md transform transition-transform duration-300 mt-0.5 ${
              checked ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </div>
        {description && (
          <p id={`${id}-description`} className="sr-only">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ToggleSwitch;