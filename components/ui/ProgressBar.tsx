import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, color = 'bg-primary' }) => {
  const percentage = Math.min(Math.max((current / total) * 100, 0), 100);
  
  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
      <div 
        className={`h-2.5 rounded-full transition-all duration-500 ease-out ${color}`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;