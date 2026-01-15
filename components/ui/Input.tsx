import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-surface border ${error ? 'border-danger' : 'border-gray-700'} rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;