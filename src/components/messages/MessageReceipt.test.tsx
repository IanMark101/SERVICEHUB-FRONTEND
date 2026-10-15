import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MessageReceipt from './MessageReceipt';

describe('durable seen information', () => {
  it('shows the actual timestamp, while historical read flags never invent one', () => {
    const { rerender } = render(<MessageReceipt isRead={false}/>);
    expect(screen.getByText('Sent')).toBeInTheDocument();
    rerender(<MessageReceipt isRead readAt="2026-10-15T04:42:00.000Z"/>);
    expect(screen.getByText(/^Seen /)).toHaveAttribute('datetime','2026-10-15T04:42:00.000Z');
    rerender(<MessageReceipt isRead readAt={null}/>);
    expect(screen.getByText('Seen').tagName).toBe('SPAN');
  });
});
