import React from 'react';
import Alert from './Alert';

const StockAlert = ({
  product,
  currentStock,
  minimumStock,
  unit,
  onOrder,
  onAdjustThreshold,
  className = ''
}) => {
  const percentage = (currentStock / minimumStock) * 100;
  
  return (
    <Alert
      type="warning"
      className={`border-l-4 ${className}`}
    >
      <div>
        <h4 className="font-semibold mb-2">
          <i className="fas fa-boxes mr-2"></i>
          Stock Bas: {product}
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <span className="font-medium">Stock actuel:</span>
            <div className="font-bold">{currentStock} {unit}</div>
          </div>
          <div>
            <span className="font-medium">Seuil minimum:</span>
            <div className="font-bold">{minimumStock} {unit}</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className={`h-2 rounded-full ${
              percentage <= 50 ? 'bg-red-500' : 
              percentage <= 75 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onOrder}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm
                     hover:bg-blue-700 transition-colors flex items-center"
          >
            <i className="fas fa-shopping-cart mr-1"></i>
            Commander
          </button>
          
          <button
            onClick={onAdjustThreshold}
            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm
                     hover:bg-gray-700 transition-colors flex items-center"
          >
            <i className="fas fa-edit mr-1"></i>
            Ajuster Seuil
          </button>
        </div>
      </div>
    </Alert>
  );
};

export default StockAlert;