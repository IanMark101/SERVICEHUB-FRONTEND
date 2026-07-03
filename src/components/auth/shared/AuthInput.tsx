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
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
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
          className={`w-full bg-white dark:bg-[#0c0c0e] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]/30 transition-all ${
            children ? 'pr-10' : ''
          } ${className}`}
        />
        {children}
      </div>
      <div className="h-4 mt-0.5 flex items-center">
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
