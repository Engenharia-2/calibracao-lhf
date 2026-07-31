import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  loading = false,
  ...props
}: ButtonProps) {
  const classNames = [
    'custom-btn',
    `custom-btn-${variant}`,
    `custom-btn-${size}`,
    fullWidth ? 'custom-btn-full' : '',
    loading ? 'custom-btn--loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classNames} disabled={disabled || loading} {...props}>
      {icon && <span className="custom-btn-icon">{icon}</span>}
      {children && <span className="custom-btn-content">{children}</span>}
    </button>
  );
}
