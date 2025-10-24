import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Alert, { AlertManager } from './components/Alert';
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from './components/ui/theme-context';

// Import des pages principales
import AdminPage from './pages/admin/AdminPage';
import Login from './pages/auth/login';
import Receptions from './pages/reception/receptions';
import Register from './pages/auth/register';
import Recipes from './pages/recipes/Recipe';
import Inventory from './pages/inventory/Inventory';
import Purchase from './pages/purchase/Purchase';
import Product from './pages/product/Product';
import Dashboard from './pages/dashboard/Dashboard';
import Home from './pages/dashboard/home';
import Restaurant from './pages/restaurant/Restaurant';
import Sales from './pages/sales/Sales';
import Supplier from './pages/supplier/Supplier';
import Bot from './pages/bot/bot';
import NotFound from './pages/NotFound';
// import Haccp from './pages/haccp/Haccp';
import Haccp from './pages/haccp/Haccp'
import LayoutDashboard from './pages/dashboard/Dashboard';




function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AlertManager>
        <div className="App">
          <Routes>
            {/* Redirection par défaut */}
           
            {/* Routes d'authentification */}
            {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/bot" element={<Bot />} />

            {/* Routes protégées */}
             {/* <Route element={<ProtectedRoute />}>  */}
                  <Route element={<LayoutDashboard />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/receptions" element={<Receptions />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/purchase" element={<Purchase />} />
                  <Route path="/product" element={<Product />} />
                  <Route path="/dashboard" element={<Home />} />
                  <Route path="/restaurant" element={<Restaurant />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/supplier" element={<Supplier />} />
                  <Route path="/haccp" element={<Haccp />} />
              {/* </Route> */}
              {/* <Route path="/haccp" element={<Haccp />} /> */}
            </Route> 
            


            {/* Route 404 - Doit être la dernière route */}
            <Route path="*" element={<NotFound />} />
            
        {/* Fin des routes protégées */}
          </Routes>
        </div>
      </AlertManager>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;