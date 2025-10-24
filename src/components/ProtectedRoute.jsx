import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fonction pour vérifier l'authentification
  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    const authenticated = !!token;
    setIsAuthenticated(authenticated);
    return authenticated;
  };

  useEffect(() => {
    // Vérification initiale
    const authenticated = checkAuth();
    
    if (!authenticated) {
      return <Navigate to={redirectPath} replace />;
    }

    // Intervalle de rafraîchissement toutes les 10 secondes (10000 ms)
    const intervalId = setInterval(() => {
      const stillAuthenticated = checkAuth();
      if (!stillAuthenticated) {
        // Arrêter l'intervalle et rediriger
        clearInterval(intervalId);
        window.location.href = redirectPath; // Force redirect
      }
    }, 10000);

    // Nettoyage de l'intervalle au démontage du composant
    return () => clearInterval(intervalId);
  }, [redirectPath]);

  // Redirection si non authentifié
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Rendre les routes enfants si authentifié
  return <Outlet />;
};

export default ProtectedRoute;