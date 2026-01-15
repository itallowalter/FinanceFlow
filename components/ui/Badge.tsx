import React from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'neutral';

const Badge: React.FC<{ children: React.ReactNode; variant: Variant }> = ({ children, variant }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;