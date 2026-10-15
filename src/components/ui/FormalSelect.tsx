'use client';

import type { ChangeEvent } from 'react';
import FormSelect from './FormSelect';

export interface FormalSelectOption { value: string; label: string; disabled?: boolean; searchText?: string }
export interface FormalSelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement> | { target: { value: string } }) => void;
  options: FormalSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  searchLabel?: string;
  isDark?: boolean;
  theme?: 'seeker' | 'provider';
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  ariaLabel?: string;
  'aria-label'?: string;
  className?: string;
}

/** Existing call sites retain their API and use the shared native form control. */
export default function FormalSelect({ id, name, value, onChange, options, placeholder = 'Select an option...', disabled, required, searchable, searchLabel, theme = 'seeker', ariaInvalid, ariaDescribedBy, ariaLabel, className = '', ...props }: FormalSelectProps) {
  return <FormSelect id={id} name={name} value={value} onChange={onChange} disabled={disabled} required={required} searchable={searchable} searchLabel={searchLabel} searchTerms={searchable ? Object.fromEntries(options.map(option => [option.value, option.searchText ?? ''])) : undefined} tone={theme} aria-invalid={ariaInvalid} aria-describedby={ariaDescribedBy} aria-label={ariaLabel || props['aria-label']} className={`w-full px-4 py-3 text-sm font-medium ${className}`}>
    <option value="" disabled>{placeholder}</option>
    {options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
  </FormSelect>;
}
