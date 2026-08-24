import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  action?: React.ReactNode;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
}

export function PageHeader({ action, onSearch, searchPlaceholder }: PageHeaderProps) {
  return (
    <div className="page-header">
      {onSearch && (
        <div className="page-header__search-container">
          <input
            type="text"
            className="form-input page-header__search"
            placeholder={searchPlaceholder || 'Pesquisar...'}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}
      {action && (
        <div className="page-header__action">
          {action}
        </div>
      )}
    </div>
  );
}
