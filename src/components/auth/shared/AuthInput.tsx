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
      <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all ${
            children ? 'pr-10' : ''
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
