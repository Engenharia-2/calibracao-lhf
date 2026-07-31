import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header__info">
        {typeof title === 'string' ? <h2>{title}</h2> : title}
        {subtitle && (typeof subtitle === 'string' ? <p>{subtitle}</p> : subtitle)}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </div>
  );
}
