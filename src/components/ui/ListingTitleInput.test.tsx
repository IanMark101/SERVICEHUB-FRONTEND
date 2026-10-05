import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ListingTitleInput from './ListingTitleInput';

function TitleForm({ initial = '' }: { initial?: string }) {
  const [title, setTitle] = useState(initial);
  return <>
    <ListingTitleInput aria-label="Listing title" value={title} onChange={(event) => setTitle(event.target.value)} />
    <output aria-label="Saved draft">{title}</output>
  </>;
}

describe('Listing title entry', () => {
  it('converts mixed-case typed or pasted text in the field and the saved draft', () => {
    render(<TitleForm />);
    const field = screen.getByRole('textbox', { name: 'Listing title' });
    fireEvent.change(field, { target: { value: 'Aircon cleaning & TV repair' } });
    expect(field).toHaveValue('AIRCON CLEANING & TV REPAIR');
    expect(screen.getByLabelText('Saved draft')).toHaveTextContent('AIRCON CLEANING & TV REPAIR');
    expect(field).toHaveAttribute('autocapitalize', 'characters');
  });

  it('preserves the caret when inserting lowercase text in the middle', () => {
    render(<TitleForm initial="AIRCON REPAIR" />);
    const field = screen.getByRole('textbox', { name: 'Listing title' }) as HTMLInputElement;
    field.focus();
    fireEvent.change(field, { target: { value: 'AIRCON and REPAIR', selectionStart: 10, selectionEnd: 10 } });
    expect(field).toHaveValue('AIRCON AND REPAIR');
    expect(field.selectionStart).toBe(10);
    expect(field.selectionEnd).toBe(10);
  });

  it('shows an existing mixed-case title in uppercase when editing', () => {
    render(<TitleForm initial="House Cleaning" />);
    expect(screen.getByRole('textbox', { name: 'Listing title' })).toHaveValue('HOUSE CLEANING');
  });
});
