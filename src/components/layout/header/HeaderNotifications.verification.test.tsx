import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HeaderNotifications from './HeaderNotifications';

describe('Verification notification actions', () => {
  it.each(['Verification Approved', 'Verification Rejected'])('labels and forwards a legacy %s alert', title => {
    const open = vi.fn();
    render(<HeaderNotifications isDark={false} isOpen notifications={[{
      id: 'notice', userId: 'resident', title, desc: 'Verification decision', time: 'Just now', read: false,
      link: '/seeker/user-profile?id=resident',
    }]} unreadCount={1} badgeClass="bg-orange-500" onToggle={vi.fn()} onClose={vi.fn()}
      onNotificationClick={open} onMarkAllRead={vi.fn()} hasMore={false} onLoadMore={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /View verification decision/ }));
    expect(open).toHaveBeenCalledWith('/seeker/user-profile?id=resident', title);
  });
});
