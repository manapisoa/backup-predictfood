import React, { useState } from 'react';
import Sidebar from './Sidebard';
import PageHeader from './PageHeader';
import useBreakpoint from '../hooks/useBreakpoint';

const Layout = ({ 
  children, 
  currentModule = 'dashboard',
  onModuleChange,
  restaurantInfo = {},
  alerts = {},
  showHeader = true,
  headerTitle,
  headerSubtitle,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useBreakpoint();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex ${className}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeModule={currentModule}
        onModuleChange={onModuleChange}
        restaurantName={restaurantInfo.name}
        aiStatus={restaurantInfo.aiStatus}
        alerts={alerts}
        isMobile={isMobile}
      />

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* CONTENU PRINCIPAL - CORRIGÉ */}
      <div className="flex-1 ml-80 overflow-x-hidden">
        <div className="p-6">
          {/* Mobile menu button */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-lg rounded-full p-3 shadow-lg md:hidden"
            >
              <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'} text-gray-700`}></i>
            </button>
          )}

          {showHeader && (
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {headerTitle}
              </h1>
              {headerSubtitle && (
                <p className="text-gray-600 text-lg">
                  {headerSubtitle}
                </p>
              )}
            </div>
          )}
          
          {/* LE CONTENU PRINCIPAL S'AFFICHE ICI */}
          <main className="space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;