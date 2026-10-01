import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Variantes de estilo modernas e equilibradas
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow transition-all duration-150 active:scale-[0.99]',
    secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs hover:shadow transition-all duration-150 active:scale-[0.99]',
    outline: 'border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 transition-colors',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all active:scale-[0.99]',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg font-medium',
    md: 'text-sm px-4 py-2.5 gap-2 rounded-xl font-medium',
    lg: 'text-base px-6 py-3 gap-2.5 rounded-xl font-semibold',
  };

  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`
        inline-flex items-center justify-center cursor-pointer
        disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
        ${fullWidth ? 'w-full' : ''}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
};
