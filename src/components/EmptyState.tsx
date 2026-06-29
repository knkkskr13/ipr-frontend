import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const defaultIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-10 h-10 text-gray-200"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
);

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-4">
      {icon ?? defaultIcon}
      <p className="text-sm text-gray-400">{title}</p>
      {description && <p className="text-xs text-gray-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
