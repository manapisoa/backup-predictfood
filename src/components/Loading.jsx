import React from 'react';

// Spinner de base
const Loading = ({
  size = 'default', // small, default, large
  color = 'blue',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    gray: 'border-gray-500',
    white: 'border-white'
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${colorClasses[color]}
      border-2 border-t-transparent border-solid rounded-full 
      animate-spin ${className}
    `} />
  );
};

// Loading avec texte
export const LoadingWithText = ({
  text = 'Chargement...',
  size = 'default',
  color = 'blue',
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Loading size={size} color={color} />
      <span className="text-gray-600">{text}</span>
    </div>
  );
};

// Loading pleine page
export const PageLoading = ({
  text = 'Chargement de la page...',
  logo = null
}) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm 
                    flex items-center justify-center z-50">
      <div className="text-center">
        {logo && (
          <div className="mb-6">
            {logo}
          </div>
        )}
        <div className="mb-4">
          <Loading size="large" />
        </div>
        <p className="text-gray-600 text-lg">{text}</p>
      </div>
    </div>
  );
};

// Loading skeleton pour cartes
export const CardSkeleton = ({ 
  lines = 3,
  hasImage = false,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      <div className="animate-pulse">
        {hasImage && (
          <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
        )}
        <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
        {[...Array(lines)].map((_, i) => (
          <div 
            key={i} 
            className={`h-4 bg-gray-200 rounded mb-3 ${
              i === lines - 1 ? 'w-1/2' : 'w-full'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Loading skeleton pour tableau
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 border-b border-gray-100">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {[...Array(columns)].map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress bar
export const ProgressBar = ({
  progress = 0, // 0-100
  color = 'blue',
  size = 'default', // small, default, large
  showPercentage = false,
  label = null,
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-2',
    default: 'h-3', 
    large: 'h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && <span className="text-sm text-gray-600">{progress}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

// Loading dots animés
export const LoadingDots = ({ 
  color = 'blue',
  size = 'default',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-2 h-2',
    default: 'w-3 h-3',
    large: 'w-4 h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            ${sizeClasses[size]} ${colorClasses[color]} 
            rounded-full animate-bounce
          `}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
};

// Loading overlay pour formulaires
export const FormLoading = ({ 
  isLoading = false, 
  children,
  loadingText = 'Enregistrement...' 
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm 
                        flex items-center justify-center rounded-xl z-10">
          <LoadingWithText text={loadingText} />
        </div>
      )}
    </div>
  );
};

// Loading state pour images
export const ImageLoader = ({
  src,
  alt,
  className = '',
  onLoad,
  onError
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      {loading && !error && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse 
                        flex items-center justify-center rounded-lg">
          <i className="fas fa-image text-gray-400 text-2xl"></i>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-gray-100 
                        flex items-center justify-center rounded-lg">
          <div className="text-center text-gray-400">
            <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <p className="text-sm">Erreur de chargement</p>
          </div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        onLoad={() => {
          setLoading(false);
          if (onLoad) onLoad();
        }}
        onError={() => {
          setLoading(false);
          setError(true);
          if (onError) onError();
        }}
        className={`${loading || error ? 'opacity-0' : 'opacity-100'} 
                   transition-opacity duration-200`}
      />
    </div>
  );
};

export default Loading;