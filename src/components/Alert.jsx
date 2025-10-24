import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/useToast"


// Composant Alert principal
const Alert = ({
  type = 'info', // success, warning, error, info
  title,
  message,
  dismissible = false,
  onDismiss,
  icon = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const config = {
    success: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      icon: 'fa-check-circle'
    },
    warning: {
      bgColor: 'bg-orange-100', 
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200',
      icon: 'fa-exclamation-triangle'
    },
    error: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800', 
      borderColor: 'border-red-200',
      icon: 'fa-exclamation-circle'
    },
    info: {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200', 
      icon: 'fa-info-circle'
    }
  };

  const currentConfig = config[type];

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className={`
      ${currentConfig.bgColor} ${currentConfig.textColor} ${currentConfig.borderColor}
      border rounded-xl p-4 mb-4 flex items-start space-x-3
      ${className}
    `}>
      {icon && (
        <div className="flex-shrink-0 pt-0.5">
          <i className={`fas ${currentConfig.icon} text-lg`}></i>
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <div className="text-sm">{message}</div>
      </div>
      
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-4 p-1 hover:bg-black hover:bg-opacity-10 rounded-lg transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

// Composant pour notifications toast
export const Toast = ({
  type = 'info',
  title,
  message,
  duration = 5000,
  position = 'top-right', // top-right, top-left, bottom-right, bottom-left
  onClose,
  actions = null
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      bgColor: 'bg-green-500',
      icon: 'fa-check-circle'
    },
    warning: {
      bgColor: 'bg-orange-500',
      icon: 'fa-exclamation-triangle'
    },
    error: {
      bgColor: 'bg-red-500',
      icon: 'fa-exclamation-circle'
    },
    info: {
      bgColor: 'bg-blue-500',
      icon: 'fa-info-circle'
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const currentConfig = config[type];

  if (!isVisible) return null;

  return (
    <div className={`
      fixed ${positionClasses[position]} z-50
      ${currentConfig.bgColor} text-white rounded-xl p-4 shadow-2xl
      transform transition-all duration-300 ease-in-out
      max-w-md min-w-80
    `}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-0.5">
          <i className={`fas ${currentConfig.icon} text-lg`}></i>
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm opacity-90">{message}</div>
          
          {actions && (
            <div className="flex space-x-2 mt-3">
              {actions}
            </div>
          )}
        </div>
        
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-20 rounded-lg transition-colors"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
      </div>
      
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-black bg-opacity-20 rounded-b-xl overflow-hidden">
          <div 
            className="h-full bg-white bg-opacity-30"
            style={{ 
              animation: `shrink ${duration}ms linear forwards`,
              transformOrigin: 'left'
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

// Container pour gérer plusieurs toasts
export const ToastContainer = ({ toasts = [], onRemove }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id || index}
          style={{
            transform: `translateY(${index * 80}px)`
          }}
          className="pointer-events-auto"
        >
          <Toast
            {...toast}
            onClose={() => onRemove(toast.id || index)}
          />
        </div>
      ))}
    </div>
  );
};

// Composant AlertBanner pour les alertes de page
export const AlertBanner = ({
  type = 'info',
  title,
  message,
  actions = null,
  className = ''
}) => {
  const config = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
      icon: 'fa-check-circle text-green-500'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
      icon: 'fa-exclamation-triangle text-yellow-500'
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
      icon: 'fa-exclamation-circle text-red-500'
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
      icon: 'fa-info-circle text-blue-500'
    }
  };

  const currentConfig = config[type];

  return (
    <div className={`
      ${currentConfig.bgColor} ${currentConfig.borderColor}
      border rounded-lg p-4 mb-6
      ${className}
    `}>
      <div className="flex">
        <div className="flex-shrink-0">
          <i className={`fas ${currentConfig.icon} text-xl`}></i>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${currentConfig.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${currentConfig.textColor}`}>
            {message}
          </div>
          {actions && (
            <div className="mt-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant InlineAlert pour les alertes dans les formulaires
export const InlineAlert = ({
  type = 'error',
  message,
  className = ''
}) => {
  const config = {
    success: {
      textColor: 'text-green-600',
      icon: 'fa-check-circle'
    },
    warning: {
      textColor: 'text-yellow-600',
      icon: 'fa-exclamation-triangle'
    },
    error: {
      textColor: 'text-red-600',
      icon: 'fa-exclamation-circle'
    },
    info: {
      textColor: 'text-blue-600',
      icon: 'fa-info-circle'
    }
  };

  const currentConfig = config[type];

  return (
    <div className={`flex items-center mt-1 text-sm ${currentConfig.textColor} ${className}`}>
      <i className={`fas ${currentConfig.icon} mr-1`}></i>
      {message}
    </div>
  );
};

// Composant AlertManager qui utilise le hook useToast
export const AlertManager = ({ children }) => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default Alert;