import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  icon,
  actions,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  variant = 'default', // 'default', 'gradient', 'bordered'
  hover = true,
  onClick = null
}) => {
  const baseClasses = 'bg-white rounded-2xl shadow-lg transition-all duration-300';
  
  const variantClasses = {
    default: 'border border-gray-100',
    gradient: 'bg-gradient-to-br from-white to-gray-50',
    bordered: 'border-2 border-gray-200'
  };

  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${hoverClasses} 
        ${clickClasses}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      {(title || subtitle || icon || actions) && (
        <div className={`
          flex items-center justify-between p-6 pb-4 
          ${subtitle ? 'border-b border-gray-100' : ''}
          ${headerClassName}
        `}>
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="text-blue-600 text-xl">
                <i className={`fas fa-${icon}`}></i>
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-xl font-semibold text-gray-800">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className={`p-6 ${title || subtitle || icon || actions ? 'pt-0' : ''} ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

// Composant pour cartes avec statistiques intégrées
export const StatCard = ({ 
  title, 
  value, 
  label, 
  icon, 
  color = 'blue',
  change = null,
  actions = null,
  className = ''
}) => {
  const colorClasses = {
    blue: 'text-blue-600 border-blue-500',
    green: 'text-green-600 border-green-500',
    orange: 'text-orange-600 border-orange-500',
    red: 'text-red-600 border-red-500',
    purple: 'text-purple-600 border-purple-500'
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  return (
    <Card className={`border-l-4 ${currentColor.split(' ')[1]} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {title && <h4 className="font-medium text-gray-700">{title}</h4>}
        {icon && (
          <div className={`text-2xl ${currentColor.split(' ')[0]}`}>
            <i className={`fas fa-${icon}`}></i>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <div className={`text-3xl font-bold mb-2 ${currentColor.split(' ')[0]}`}>
          {value}
        </div>
        <div className="text-sm text-gray-600 mb-2">{label}</div>
        
        {change && (
          <div className={`
            inline-block px-2 py-1 rounded-full text-xs font-medium
            ${change.startsWith('+') ? 'text-green-600 bg-green-100' : 
              change.startsWith('-') ? 'text-red-600 bg-red-100' : 
              'text-gray-600 bg-gray-100'}
          `}>
            {change}
          </div>
        )}
      </div>
      
      {actions && (
        <div className="flex justify-center mt-4 space-x-2">
          {actions}
        </div>
      )}
    </Card>
  );
};

// Composant pour cartes de produit/recette
export const ItemCard = ({ 
  title, 
  subtitle, 
  image, 
  stats, 
  badges, 
  actions,
  className = ''
}) => {
  return (
    <Card className={className}>
      {image && (
        <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden mb-4">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
      </div>

      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {badges.map((badge, index) => (
            <span 
              key={index}
              className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${badge.type === 'success' ? 'bg-green-100 text-green-800' :
                  badge.type === 'warning' ? 'bg-orange-100 text-orange-800' :
                  badge.type === 'danger' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'}
              `}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="font-bold text-lg text-blue-600">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {actions && (
        <div className="flex flex-wrap gap-2">
          {actions}
        </div>
      )}
    </Card>
  );
};

export default Card;