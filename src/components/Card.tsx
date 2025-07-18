import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-catppuccin-surface0 rounded-lg shadow-sm border border-gray-200 dark:border-catppuccin-surface1 ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-catppuccin-surface1">
          {title && <h3 className="text-lg font-medium text-gray-900 dark:text-catppuccin-text">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-500 dark:text-catppuccin-subtext1">{description}</p>}
        </div>
      )}
      <div className={title || description ? 'p-6' : 'p-4'}>{children}</div>
    </div>
  );
}