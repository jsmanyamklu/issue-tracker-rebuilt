import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600',
    success: 'bg-success-50 text-success-800 dark:bg-success-900/30 dark:text-success-200 border border-success-200 dark:border-success-800',
    warning: 'bg-warning-50 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200 border border-warning-200 dark:border-warning-800',
    danger: 'bg-danger-50 text-danger-800 dark:bg-danger-900/30 dark:text-danger-200 border border-danger-200 dark:border-danger-800',
    info: 'bg-primary-50 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200 border border-primary-200 dark:border-primary-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold shadow-sm ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
