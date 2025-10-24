import React from 'react';

const PageHeader = ({
  title,
  subtitle,
  actions,
  breadcrumbs = null,
  className = ''
}) => {
  return (
    <div className={`
      bg-white/95 backdrop-blur-lg rounded-2xl p-8 mb-8 
      shadow-xl border border-white/20 ${className}
    `}>
      {breadcrumbs && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <i className="fas fa-chevron-right text-xs mx-2"></i>
                )}
                {crumb.href ? (
                  <a 
                    href={crumb.href} 
                    className="hover:text-blue-600 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className={index === breadcrumbs.length - 1 ? 'font-medium text-gray-800' : ''}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-gray-600 text-lg">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;