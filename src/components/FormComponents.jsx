import React, { useState } from 'react';

// Input de base
export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  icon = null,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <i className={`fas fa-${icon} text-gray-400`}></i>
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 border border-gray-300 rounded-xl
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

// Select
export const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner...',
  required = false,
  disabled = false,
  error = null,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 border border-gray-300 rounded-xl
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200 bg-white
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

// Textarea
export const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  maxLength = null,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className={`
          w-full px-4 py-2.5 border border-gray-300 rounded-xl
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200 resize-vertical
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        {...props}
      />
      
      <div className="flex justify-between items-center mt-1">
        <div>
          {error && (
            <p className="text-sm text-red-500 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
        
        {maxLength && (
          <p className="text-sm text-gray-400">
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

// Checkbox
export const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  error = null,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-4 h-4 text-blue-600 border-gray-300 rounded
            focus:ring-blue-500 focus:ring-2 transition-colors
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          {...props}
        />
        <span className={`ml-2 text-sm text-gray-700 ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </span>
      </label>
      
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

// RadioGroup
export const RadioGroup = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  error = null,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <label key={index} className="flex items-center cursor-pointer">
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              {...props}
            />
            <span className="ml-2 text-sm text-gray-700">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

// FileUpload
export const FileUpload = ({
  label,
  onChange,
  accept = "*/*",
  multiple = false,
  disabled = false,
  error = null,
  helperText = null,
  className = '',
  ...props
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6
          transition-colors duration-200 cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          {...props}
        />
        
        <div className="text-center">
          <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
          <p className="text-gray-600 mb-2">
            Glissez-déposez vos fichiers ici ou{' '}
            <span className="text-blue-500 underline">cliquez pour parcourir</span>
          </p>
          {helperText && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

// FormGroup pour regrouper des champs
export const FormGroup = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {title && (
        <div className="mb-4 pb-2 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// FormRow pour organiser les champs en colonnes
export const FormRow = ({
  children,
  columns = 2,
  className = ''
}) => {
  return (
    <div 
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {children}
    </div>
  );
};

// SearchInput avec suggestions
export const SearchInput = ({
  value,
  onChange,
  onSelect,
  suggestions = [],
  placeholder = 'Rechercher...',
  loading = false,
  className = ''
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <i className="fas fa-spinner animate-spin text-gray-400"></i>
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 
                      rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                onSelect(suggestion);
                setShowSuggestions(false);
              }}
            >
              {suggestion.label || suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// NumberInput avec contrôles +/-
export const NumberInput = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  disabled = false,
  error = null,
  className = ''
}) => {
  const handleIncrement = () => {
    const newValue = parseFloat(value || 0) + step;
    if (!max || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = parseFloat(value || 0) - step;
    if (!min || newValue >= min) {
      onChange(newValue);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && value <= min)}
          className="p-2 border border-r-0 border-gray-300 rounded-l-xl 
                   bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        >
          <i className="fas fa-minus text-gray-600"></i>
        </button>
        
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            flex-1 px-4 py-2.5 border-t border-b border-gray-300 text-center
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'bg-gray-100' : 'bg-white'}
          `}
        />
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          className="p-2 border border-l-0 border-gray-300 rounded-r-xl 
                   bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        >
          <i className="fas fa-plus text-gray-600"></i>
        </button>
        
        {unit && (
          <span className="ml-2 text-sm text-gray-600">{unit}</span>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;