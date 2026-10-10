import React, { ChangeEvent, FocusEvent, forwardRef } from 'react';

interface AuthInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  helperText?: string;
  className?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: 'email' | 'numeric' | 'search' | 'tel' | 'text' | 'url';
  children?: React.ReactNode; // For eye toggle or other absolute overlay items
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  className = '',
  required = false,
  autoComplete,
  inputMode,
  children,
}, ref) => {
  const inputId = `auth-${name}`;
  const messageId = `${inputId}-message`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-ink-secondary dark:text-ink-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helperText ? messageId : undefined}
          className={`w-full border bg-[#f8f6f2] dark:bg-charcoal/60 ${
            error
              ? 'border-rose-500 ring-2 ring-rose-500/10 dark:ring-rose-500/20'
              : 'border-[#dedbd5] hover:border-[#c8c3bb] dark:border-white/10 dark:hover:border-white/20'
          } rounded-xl px-3.5 py-3 text-sm text-ink placeholder:text-ink-muted transition-[background-color,border-color,box-shadow] focus:border-brand-focus focus:bg-[#fffdfa] focus:outline-none focus:ring-2 focus:ring-brand/15 dark:text-white dark:placeholder:text-ink-muted dark:focus:border-orange-500 dark:focus:bg-charcoal dark:focus:ring-orange-500/20 ${
            children ? 'pr-11' : ''
          } ${className}`}
        />
        {children}
      </div>
      <div id={messageId} className="min-h-4 mt-1 flex items-center">
        {error ? (
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium leading-tight animate-in fade-in duration-100">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-[11px] text-ink-muted dark:text-ink-muted leading-tight">
            {helperText}
          </span>
        ) : null}
      </div>
    </div>
  );
});

AuthInput.displayName = 'AuthInput';

export default AuthInput;
