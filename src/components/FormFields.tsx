import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, required, error, hint, children }: FieldWrapperProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  prefix?: string;
}

export function TextField({
  label,
  required,
  error,
  hint,
  prefix,
  className = '',
  ...rest
}: TextFieldProps) {
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint}>
      <div
        className={`flex items-center bg-white rounded-lg px-3 border ${
          error ? 'border-red-400' : 'border-gray-300'
        } focus-within:ring-2 focus-within:ring-blue-400 transition`}
      >
        {prefix && <span className="text-gray-500 mr-2 flex-shrink-0">{prefix}</span>}
        <input
          className={`w-full py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none border-0 bg-transparent ${className}`}
          {...rest}
        />
      </div>
    </FieldWrapper>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  label,
  required,
  error,
  hint,
  options,
  placeholder,
  className = '',
  ...rest
}: SelectFieldProps) {
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint}>
      <div
        className={`flex items-center bg-white rounded-lg px-3 border ${
          error ? 'border-red-400' : 'border-gray-300'
        } focus-within:ring-2 focus-within:ring-blue-400 transition`}
      >
        <select
          className={`w-full py-2.5 text-sm text-gray-800 outline-none border-0 bg-transparent cursor-pointer ${className}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </FieldWrapper>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function TextAreaField({
  label,
  required,
  error,
  hint,
  className = '',
  ...rest
}: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint}>
      <div
        className={`bg-white rounded-lg border ${
          error ? 'border-red-400' : 'border-gray-300'
        } focus-within:ring-2 focus-within:ring-blue-400 transition`}
      >
        <textarea
          className={`w-full px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none border-0 bg-transparent resize-none ${className}`}
          {...rest}
        />
      </div>
    </FieldWrapper>
  );
}
