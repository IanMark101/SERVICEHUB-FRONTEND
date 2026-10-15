'use client';

import { useState, type InputHTMLAttributes } from 'react';

type MoneyInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue'> & {
  value: number | string;
};

/** Preserve a blank editing draft while existing forms continue storing numbers. */
export default function MoneyInput({ value, onChange, inputMode = 'decimal', ...props }: MoneyInputProps) {
  const [draft, setDraft] = useState({ number: Number(value), text: value === 0 ? '' : String(value) });
  const displayed = typeof value === 'string' ? value
    : value === draft.number ? draft.text : value === 0 ? '' : String(value);
  return <input {...props} type="number" inputMode={inputMode} value={displayed} onChange={event => {
    const text = event.currentTarget.value.replace(/^0+(?=\d)/, '');
    event.currentTarget.value = text;
    setDraft({ number: Number(text), text });
    onChange?.(event);
  }} />;
}
