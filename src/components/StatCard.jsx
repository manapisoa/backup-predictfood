import React from 'react';

const StatCard = ({ 
  icon, 
  value, 
  label, 
  color = 'blue', 
  change = null,
  onClick = null,
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-600',
    green: 'border-green-500 text-green-600',
    orange: 'border-orange-500 text-orange-600',
    red: 'border-red-500 text-red-600',
    purple: 'border-purple-500 text-purple-600',
    gray: 'border-gray-500 text-gray-600'
  };

  const sizeClasses = {
    small: {
      container: 'p-4',
      value: 'text-xl',
      label: 'text-xs',
      icon: 'text-lg'
    },
    default: {
      container: 'p-6',
      value: 'text-3xl',
      label: 'text-sm',
      icon: 'text-2xl'
    },
    large: {
      container: 'p-8',
      value: 'text-4xl',
      label: 'text-base',
      icon: 'text-3xl'
    }
  };

  const currentSize = sizeClasses[size];
  const currentColor = colorClasses[color] || colorClasses.blue;

  const getChangeColor = (change) => {
    if (!change) return '';
    if (change.startsWith('+')) return 'text-green-600 bg-green-100';
    if (change.startsWith('-')) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div 
      className={`
        bg-white rounded-2xl ${currentSize.container} shadow-lg hover:shadow-xl 
        transition-all duration-300 border-l-4 ${currentColor}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="text-center">
        {icon && (
          <div className={`${currentColor} ${currentSize.icon} mb-3`}>
            <i className={`fas fa-${icon}`}></i>
          </div>
        )}
        
        <div className={`font-bold ${currentColor} ${currentSize.value} mb-2`}>
          {value}
        </div>
        
        <div className={`text-gray-600 ${currentSize.label} mb-2`}>
          {label}
        </div>

        {change && (
          <div className={`
            inline-block px-3 py-1 rounded-full text-xs font-medium
            ${getChangeColor(change)}
          `}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour grille de statistiques
export const StatsGrid = ({ children, columns = 'auto-fit', minWidth = '250px', className = '' }) => {
  return (
    <div 
      className={`
        grid gap-6 mb-8
        ${className}
      `}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(${minWidth}, 1fr))`
      }}
    >
      {children}
    </div>
  );
};

export default StatCard;