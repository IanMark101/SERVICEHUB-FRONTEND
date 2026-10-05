import type { ChangeEvent, InputHTMLAttributes } from 'react';

interface ListingTitleInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function ListingTitleInput({ value, onChange, className, ...props }: ListingTitleInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const entered = input.value;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const direction = input.selectionDirection;
    const uppercase = entered.toUpperCase();

    if (uppercase !== entered) {
      // Keep the caret in place when editing or pasting within the title.
      input.value = uppercase;
      if (start !== null && end !== null) {
        input.setSelectionRange(
          entered.slice(0, start).toUpperCase().length,
          entered.slice(0, end).toUpperCase().length,
          direction ?? undefined,
        );
      }
    }
    onChange(event);
  };

  return (
    <input
      {...props}
      type="text"
      autoCapitalize="characters"
      value={value.toUpperCase()}
      onChange={handleChange}
      className={`uppercase ${className ?? ''}`}
    />
  );
}
