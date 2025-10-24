import React, { useState, useMemo } from 'react';
import Button from './Button';

const Table = ({
  data = [],
  columns = [],
  searchable = false,
  sortable = false,
  pagination = false,
  pageSize = 10,
  className = '',
  emptyMessage = 'Aucune donnée disponible',
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrage et tri des données
  const processedData = useMemo(() => {
    let filtered = data;

    // Recherche
    if (searchable && searchTerm) {
      filtered = data.filter(item =>
        columns.some(column =>
          String(item[column.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Tri
    if (sortable && sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, columns, searchTerm, sortConfig, searchable, sortable]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return processedData.slice(start, end);
  }, [processedData, pagination, currentPage, pageSize]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  const handleSort = (key) => {
    if (!sortable) return;
    
    setSortConfig(prevConfig => ({
      key,
      direction: 
        prevConfig.key === key && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  const getSortIcon = (columnKey) => {
    if (!sortable || sortConfig.key !== columnKey) {
      return 'fa-sort text-gray-400';
    }
    return sortConfig.direction === 'asc' 
      ? 'fa-sort-up text-blue-500' 
      : 'fa-sort-down text-blue-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* En-tête avec recherche */}
      {searchable && (
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}
                  `}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {sortable && column.sortable !== false && (
                      <i className={`fas ${getSortIcon(column.key)} text-xs`}></i>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render 
                        ? column.render(row[column.key], row, index)
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Affichage de {(currentPage - 1) * pageSize + 1} à{' '}
            {Math.min(currentPage * pageSize, processedData.length)} sur{' '}
            {processedData.length} résultats
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </Button>
            
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="secondary"
              size="small"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-chevron-right"></i>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Badge pour les statuts
export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  icon = null,
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {icon && <i className={`fas fa-${icon} mr-1`}></i>}
      {children}
    </span>
  );
};

// Composant ActionButton pour les actions dans le tableau
export const ActionButton = ({ 
  icon, 
  onClick, 
  variant = 'secondary', 
  tooltip,
  className = '' 
}) => {
  return (
    <Button
      variant={variant}
      size="small"
      onClick={onClick}
      className={`p-2 ${className}`}
      title={tooltip}
    >
      <i className={`fas fa-${icon}`}></i>
    </Button>
  );
};

export default Table;