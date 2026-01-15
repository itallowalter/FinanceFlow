import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className = '', ...props }, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>}
      <select
        ref={ref}
        className={`w-full bg-surface border ${error ? 'border-danger' : 'border-gray-700'} rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

Select.displayName = "Select";
export default Select;