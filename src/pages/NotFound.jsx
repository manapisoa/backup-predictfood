import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page non trouvée</h2>
        
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez semble introuvable ou n'existe pas.
        </p>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Home className="mr-2 h-5 w-5" />
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default NotFound;
