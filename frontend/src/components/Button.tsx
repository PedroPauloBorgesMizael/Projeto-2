import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, loading, ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`w-full bg-[#0a192f] hover:bg-slate-900 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 ${props.className || ''}`}
    >
      {loading ? 'Entrando...' : children}
    </button>
  );
};
