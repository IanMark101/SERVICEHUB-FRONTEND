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
  children,
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          className={`w-full bg-slate-50/70 dark:bg-zinc-900/60 border ${
            error
              ? 'border-rose-500 ring-2 ring-rose-500/10 dark:ring-rose-500/20'
              : 'border-black/[0.08] dark:border-white/10 hover:border-black/[0.14] dark:hover:border-white/20'
          } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-[#c86544] focus:ring-2 focus:ring-[#c86544]/15 dark:focus:border-orange-500 dark:focus:ring-orange-500/20 ${
            children ? 'pr-11' : ''
          } ${className}`}
        />
        {children}
      </div>
      <div className="min-h-4 mt-1 flex items-center">
        {error ? (
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium leading-tight animate-in fade-in duration-100">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
            {helperText}
          </span>
        ) : null}
      </div>
    </div>
  );
});

AuthInput.displayName = 'AuthInput';

export default AuthInput;
