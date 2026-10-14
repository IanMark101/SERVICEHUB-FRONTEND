import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SidebarView from './SidebarView';

vi.mock('next/image', () => ({ default: () => null }));

describe('workspace navigation', () => {
  for (const [role, manager] of [['seeker', 'Request Manager'], ['provider', 'Service Manager']] as const) {
    it(`places Saved directly after ${manager} and preserves role-specific destinations`, () => {
      const select = vi.fn();
      render(<SidebarView currentRole={role} setCurrentRole={vi.fn()} activeTab="saved" setActiveTab={select} isCollapsed={false} setIsCollapsed={vi.fn()} isMobileOpen={false} setIsMobileOpen={vi.fn()} onSignOut={vi.fn()} user={null} isDark={false} toggleTheme={vi.fn()} pendingBidsCount={0} pendingRequestsCount={0} unreadMessagesCount={0} />);
      const buttons = screen.getAllByRole('button');
      const managerIndex = buttons.indexOf(screen.getByRole('button', { name: manager }));
      expect(buttons[managerIndex + 1]).toHaveTextContent('Saved');
      fireEvent.click(screen.getByRole('button', { name: 'Saved' }));
      expect(select).toHaveBeenCalledWith('saved');
      expect(screen.getByRole('button', { name: 'Activity' })).toBeVisible();
      if (role === 'provider') {
        expect(screen.getByRole('button', { name: 'Payment Records' })).toBeVisible();
        fireEvent.click(screen.getByRole('button', { name: 'Work Queue' }));
        expect(select).toHaveBeenLastCalledWith('work-queue');
      } else {
        expect(screen.queryByRole('button', { name: 'Work Queue' })).not.toBeInTheDocument();
      }
    });
  }
});
