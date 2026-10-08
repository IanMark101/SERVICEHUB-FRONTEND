import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InspectionText } from './InspectionLayout';

describe('Inspection text readability', () => {
  it('allows the admin to read the full original text without losing it in a shortened preview', () => {
    const original = `Original complaint: ${'LongUnbrokenText'.repeat(80)}`;
    render(<InspectionText text={original} label="content" />);
    expect(screen.queryByText(original)).not.toBeInTheDocument();
    const read = screen.getByRole('button', { name: 'Read full content' });
    expect(read).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(read);
    expect(screen.getByText(original)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show less content' })).toHaveAttribute('aria-expanded', 'true');
  });
});
