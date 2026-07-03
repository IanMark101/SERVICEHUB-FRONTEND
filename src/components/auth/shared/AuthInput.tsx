import React, { ChangeEvent } from 'react';

interface AuthInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  helperText?: string;
  className?: string;
  required?: boolean;
  children?: React.ReactNode; // For eye toggle or other absolute overlay items
}

export default function AuthInput({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  className = '',
  required = false,
  children,
}: AuthInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full bg-white dark:bg-[#0f1115] border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-450 dark:placeholder-slate-600 focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]/50 transition-all shadow-sm ${
            children ? 'pr-12' : ''
          } ${className}`}
        />
        {children}
      </div>
      <div className="h-4 mt-1 flex items-center">
        {error ? (
          <span className="text-[10px] text-red-500 font-semibold leading-none animate-in fade-in duration-100">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-[10px] text-slate-400 dark:text-[#b4b0a9] leading-none">
            {helperText}
          </span>
        ) : null}
      </div>
    </div>
  );
}
