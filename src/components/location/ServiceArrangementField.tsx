'use client';

import { useId } from 'react';
import { arrangementOptionLabel, type ServiceLocationMode } from '../../lib/serviceArrangement';
import FormSelect from '../ui/FormSelect';
import styles from './Location.module.css';

export default function ServiceArrangementField({ value, onChange, options = ['PROVIDER_VISITS', 'SEEKER_VISITS', 'BOTH', 'REMOTE'], disabled = false, label = 'Work location', workspace = 'seeker' }: {
  value: ServiceLocationMode; onChange: (mode: ServiceLocationMode) => void;
  options?: ServiceLocationMode[]; disabled?: boolean; label?: string; workspace?: 'seeker' | 'provider';
}) {
  const id = useId();
  return <div className={styles.fieldGroup}>
    <label htmlFor={id} className={styles.label}>{label}</label>
    <FormSelect id={id} aria-label={label} tone={workspace} className={styles.field} value={value} disabled={disabled}
      onChange={event => {
        const selected = options.find(mode => mode === event.target.value);
        if (selected) onChange(selected);
      }}>
      {options.map(mode => <option key={mode} value={mode}>{arrangementOptionLabel(mode, workspace)}</option>)}
    </FormSelect>
  </div>;
}
