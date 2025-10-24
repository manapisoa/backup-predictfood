import React from 'react';

const Button = ({
  children,
  variant = 'primary', // primary, secondary, success, warning, danger, ghost
  size = 'default', // small, default, large
  icon = null,
  iconPosition = 'left', // left, right
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick = null,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-xl 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-500 to-purple-600 text-white 
      hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500
      shadow-lg hover:shadow-xl hover:-translate-y-0.5
    `,
    secondary: `
      bg-gray-100 text-gray-700 border border-gray-200
      hover:bg-gray-200 hover:border-gray-300 focus:ring-gray-500
    `,
    success: `
      bg-green-500 text-white hover:bg-green-600 focus:ring-green-500
      shadow-lg hover:shadow-xl hover:-translate-y-0.5
    `,
    warning: `
      bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500
      shadow-lg hover:shadow-xl hover:-translate-y-0.5
    `,
    danger: `
      bg-red-500 text-white hover:bg-red-600 focus:ring-red-500
      shadow-lg hover:shadow-xl hover:-translate-y-0.5
    `,
    ghost: `
      text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:ring-gray-500
    `
  };

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    default: 'px-4 py-2.5 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
            className="opacity-25"
          />
          <path 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            className="opacity-75"
          />
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <i className={`fas fa-${icon} ${children ? 'mr-2' : ''}`}></i>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && !loading && (
        <i className={`fas fa-${icon} ${children ? 'ml-2' : ''}`}></i>
      )}
    </button>
  );
};

// Composant ButtonGroup pour grouper des boutons
export const ButtonGroup = ({ 
  children, 
  className = '',
  orientation = 'horizontal' // horizontal, vertical
}) => {
  const orientationClasses = {
    horizontal: 'flex-row space-x-2',
    vertical: 'flex-col space-y-2'
  };

  return (
    <div className={`
      flex ${orientationClasses[orientation]} ${className}
    `}>
      {children}
    </div>
  );
};

// Composant FloatingActionButton pour les actions rapides
export const FloatingActionButton = ({ 
  icon, 
  onClick, 
  color = 'blue',
  size = 'default',
  className = '',
  tooltip = ''
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    red: 'bg-red-500 hover:bg-red-600',
    orange: 'bg-orange-500 hover:bg-orange-600'
  };

  const sizeClasses = {
    small: 'w-12 h-12 text-lg',
    default: 'w-14 h-14 text-xl',
    large: 'w-16 h-16 text-2xl'
  };

  return (
    <button
      className={`
        fixed bottom-6 right-6 rounded-full text-white shadow-2xl
        hover:shadow-3xl hover:scale-110 transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 z-50
        ${colorClasses[color]} ${sizeClasses[size]} ${className}
      `}
      onClick={onClick}
      title={tooltip}
    >
      <i className={`fas fa-${icon}`}></i>
    </button>
  );
};

export default Button;