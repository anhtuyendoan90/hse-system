import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'purple' | 'outline';
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'secondary', dot = false, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {dot && <span className={`badge-dot badge-dot-${variant === 'outline' ? 'secondary' : variant}`} />}
      {children}
    </span>
  );
}

export interface StatusIndicatorProps {
  label: string;
  status: 'active' | 'warning' | 'danger' | 'inactive';
  className?: string;
}

export function StatusIndicator({ label, status, className = '' }: StatusIndicatorProps) {
  return (
    <span className={`status-indicator ${className}`}>
      <span className={`status-dot status-dot--${status}`} />
      {label}
    </span>
  );
}
