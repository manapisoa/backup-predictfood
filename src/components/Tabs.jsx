import React, { useState } from 'react';

const Tabs = ({
  tabs = [],
  defaultTab = 0,
  onTabChange,
  className = '',
  variant = 'default' // default, pills, underline
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onTabChange) {
      onTabChange(index, tabs[index]);
    }
  };

  const variantStyles = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'px-6 py-3 border-b-2 border-transparent hover:border-gray-300',
      activeTab: 'border-blue-500 text-blue-600',
      inactiveTab: 'text-gray-500 hover:text-gray-700'
    },
    pills: {
      container: 'bg-gray-100 p-1 rounded-xl',
      tab: 'px-4 py-2 rounded-lg transition-all',
      activeTab: 'bg-white text-blue-600 shadow-sm',
      inactiveTab: 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
    },
    underline: {
      container: 'border-b border-gray-200',
      tab: 'px-4 py-3 border-b-2 border-transparent',
      activeTab: 'border-blue-500 text-blue-600 bg-blue-50',
      inactiveTab: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className={`flex ${styles.container} mb-6`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`
              ${styles.tab}
              ${activeTab === index ? styles.activeTab : styles.inactiveTab}
              font-medium transition-colors duration-200
              flex items-center space-x-2
            `}
          >
            {tab.icon && (
              <i className={`fas fa-${tab.icon}`}></i>
            )}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[18px] text-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {tabs[activeTab] && tabs[activeTab].content && (
          <div className="animate-fadeIn">
            {tabs[activeTab].content}
          </div>
        )}
      </div>
    </div>
  );
};

// Composant TabPanel pour structurer le contenu
export const TabPanel = ({ 
  children, 
  title, 
  className = '',
  loading = false 
}) => {
  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

// Composant Accordion pour les sections pliables
export const Accordion = ({
  items = [],
  allowMultiple = false,
  className = ''
}) => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(index);
      }
      
      return newSet;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 
                     transition-colors duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {item.icon && (
                <i className={`fas fa-${item.icon} text-gray-600`}></i>
              )}
              <span className="font-medium text-gray-800">{item.title}</span>
              {item.badge && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            
            <i className={`
              fas fa-chevron-down text-gray-400 transition-transform duration-200
              ${openItems.has(index) ? 'rotate-180' : ''}
            `}></i>
          </button>
          
          <div className={`
            overflow-hidden transition-all duration-200 bg-white
            ${openItems.has(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <div className="p-6 border-t border-gray-100">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tabs;