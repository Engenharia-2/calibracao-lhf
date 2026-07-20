import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const classNames = [
    'custom-btn',
    `custom-btn-${variant}`,
    `custom-btn-${size}`,
    fullWidth ? 'custom-btn-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classNames} disabled={disabled} {...props}>
      {icon && <span className="custom-btn-icon">{icon}</span>}
      {children && <span className="custom-btn-content">{children}</span>}
    </button>
  );
}
