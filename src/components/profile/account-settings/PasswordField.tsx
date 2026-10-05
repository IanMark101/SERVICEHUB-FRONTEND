'use client';
import { useId, useState, type Ref } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props { label: string; value: string; onChange: (value: string) => void; error?: string; valid?: boolean; disabled?: boolean; autoComplete?: string; describedBy?: string; inputRef?: Ref<HTMLInputElement>; onBlur?: () => void }
export default function PasswordField({ label, value, onChange, error, valid, disabled, autoComplete = 'new-password', describedBy, inputRef, onBlur }: Props) {
  const id = useId(); const [visible, setVisible] = useState(false);
  const visibilityLabel = label.startsWith('Confirm') ? 'confirmation password' : label.toLowerCase();
  return <div className="password-field">
    <label htmlFor={id}>{label}</label>
    <div className={`password-field__control ${error ? 'is-invalid' : valid ? 'is-valid' : ''}`}>
      <input ref={inputRef} id={id} type={visible ? 'text' : 'password'} value={value} onChange={event => onChange(event.target.value)} onBlur={onBlur} required disabled={disabled} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={[describedBy, error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined} spellCheck={false} autoCapitalize="none" />
      <button type="button" disabled={disabled} onClick={() => setVisible(!visible)} aria-label={`${visible ? 'Hide' : 'Show'} ${visibilityLabel}`} aria-pressed={visible}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
    </div>
    {error && <p id={`${id}-error`} className="security-password__field-error" aria-live="polite">{error}</p>}
  </div>;
}
