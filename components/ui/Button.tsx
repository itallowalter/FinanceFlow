import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'secondary';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  fullWidth, 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-purple-600 text-white focus:ring-purple-500 shadow-lg shadow-purple-500/20",
    secondary: "bg-surface hover:bg-gray-700 text-white border border-gray-700 focus:ring-gray-500",
    danger: "bg-danger hover:bg-rose-600 text-white focus:ring-rose-500",
    ghost: "bg-transparent hover:bg-surface text-gray-300 hover:text-white",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;