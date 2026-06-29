import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  outline: 'border border-blue-600 text-blue-700 hover:bg-blue-50',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200',
  ghost: 'text-gray-500 hover:bg-gray-100',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  icon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${
        variantClasses[variant]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {isLoading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
}
