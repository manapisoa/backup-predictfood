import React from 'react';
import Alert from './Alert';

const DLCAlert = ({
  product,
  expiresIn,
  quantity,
  value,
  onCreateRecipe,
  onMarkdown,
  onIgnore,
  className = ''
}) => {
  const getUrgencyLevel = (hoursLeft) => {
    if (hoursLeft <= 24) return 'critical';
    if (hoursLeft <= 72) return 'warning'; 
    return 'info';
  };

  const urgency = getUrgencyLevel(expiresIn);

  return (
    <Alert
      type={urgency === 'critical' ? 'error' : 'warning'}
      className={`border-l-4 ${className}`}
      dismissible={false}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-lg mb-2">
            <i className="fas fa-clock mr-2"></i>
            DLC Critique: {product}
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
            <div>
              <span className="font-medium">Expire dans:</span>
              <div className="font-bold text-lg">{expiresIn}h</div>
            </div>
            <div>
              <span className="font-medium">Quantité:</span>
              <div className="font-bold text-lg">{quantity}</div>
            </div>
            <div>
              <span className="font-medium">Valeur:</span>
              <div className="font-bold text-lg">{value}€</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={onCreateRecipe}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm 
                       hover:bg-green-700 transition-colors flex items-center"
            >
              <i className="fas fa-utensils mr-1"></i>
              Créer Recette Anti-Gaspi
            </button>
            
            <button
              onClick={onMarkdown}
              className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm
                       hover:bg-orange-700 transition-colors flex items-center"
            >
              <i className="fas fa-percentage mr-1"></i>
              Promotion Flash
            </button>
            
            <button
              onClick={onIgnore}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm
                       hover:bg-gray-700 transition-colors flex items-center"
            >
              <i className="fas fa-times mr-1"></i>
              Ignorer
            </button>
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default DLCAlert;