import React, { useEffect } from 'react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'default', // small, default, large, xl
  showCloseButton = true,
  closeOnOverlay = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'max-w-md',
    default: 'max-w-2xl',
    large: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className={`
        relative bg-white rounded-2xl shadow-2xl w-full mx-4 max-h-[90vh] 
        overflow-hidden transform transition-all duration-300 ease-out
        ${sizeClasses[size]} ${className}
      `}>
        {/* Header */}
        {(title || subtitle || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              {title && (
                <h2 className="text-2xl font-bold text-gray-800">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl p-1 
                         hover:bg-gray-100 rounded-full transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal avec footer d'actions
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger' // success, warning, danger
}) => {
  const variantClasses = {
    success: 'text-green-600',
    warning: 'text-orange-600',
    danger: 'text-red-600'
  };

  const iconClasses = {
    success: 'fa-check-circle',
    warning: 'fa-exclamation-triangle',
    danger: 'fa-exclamation-circle'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small">
      <div className="text-center">
        <div className={`text-6xl mb-4 ${variantClasses[variant]}`}>
          <i className={`fas ${iconClasses[variant]}`}></i>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <div className="flex space-x-3 justify-center">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Modal de formulaire
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  submitText = 'Enregistrer',
  cancelText = 'Annuler',
  isLoading = false,
  size = 'default'
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      subtitle={subtitle}
      size={size}
    >
      <form onSubmit={handleSubmit}>
        {children}
        
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} type="button">
            {cancelText}
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            loading={isLoading}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal d'alerte simple
export const AlertModal = ({
  isOpen,
  onClose,
  type = 'info', // success, info, warning, error
  title,
  message,
  actionText = 'OK'
}) => {
  const typeConfig = {
    success: {
      color: 'text-green-600',
      icon: 'fa-check-circle',
      bgColor: 'bg-green-100'
    },
    info: {
      color: 'text-blue-600',
      icon: 'fa-info-circle',
      bgColor: 'bg-blue-100'
    },
    warning: {
      color: 'text-orange-600',
      icon: 'fa-exclamation-triangle',
      bgColor: 'bg-orange-100'
    },
    error: {
      color: 'text-red-600',
      icon: 'fa-exclamation-circle',
      bgColor: 'bg-red-100'
    }
  };

  const config = typeConfig[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small">
      <div className="text-center">
        <div className={`
          w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center
          mx-auto mb-4
        `}>
          <i className={`fas ${config.icon} text-2xl ${config.color}`}></i>
        </div>
        
        {title && (
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {title}
          </h3>
        )}
        
        {message && (
          <p className="text-gray-600 mb-6">
            {message}
          </p>
        )}

        <Button variant="primary" onClick={onClose}>
          {actionText}
        </Button>
      </div>
    </Modal>
  );
};

export default Modal;