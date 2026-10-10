import { fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '@/context/AppContext';
import LandingHeader from './LandingHeader';

vi.mock('@/context/AppContext', () => ({ useApp: vi.fn() }));

describe('landing navigation session awareness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('matchMedia', vi.fn((media: string) => ({
      media, matches: false, addListener() {}, removeListener() {},
      addEventListener() {}, removeEventListener() {},
    })));
    vi.mocked(useApp).mockReturnValue({ authLoading: true, isAuthenticated: false, user: null } as ReturnType<typeof useApp>);
  });

  it('starts with guest actions in the server HTML before session recovery', () => {
    const html = renderToString(<LandingHeader isDark={false} toggleTheme={vi.fn()} />);
    expect(html).toContain('Get started');
    expect(html).toContain('Log in');
    expect(html).not.toContain('Open ServiceHub');
    expect(html).not.toContain('Open workspace');
  });

  it('keeps guest actions usable while session recovery runs, including mobile', () => {
    render(<LandingHeader isDark={false} toggleTheme={vi.fn()} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText(/Checking session/)).not.toBeInTheDocument();
    expect(screen.queryByText('Open ServiceHub')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/get-started');
    expect(screen.getByRole('link', { name: 'How it works' })).toHaveAttribute('href', '#how-it-works');
    expect(screen.getByRole('link', { name: 'Booking progress' })).toHaveAttribute('href', '#booking-progress');
    expect(screen.getByRole('navigation', { name: 'Main navigation' }).querySelectorAll('a')).toHaveLength(6);
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
    expect(screen.queryByText('Open ServiceHub')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Log in' })).toHaveLength(2);
    const compareLinks = screen.getAllByRole('link', { name: 'Compare' });
    expect(compareLinks).toHaveLength(2);
    expect(compareLinks[1]).toHaveAttribute('href', '#comparison');
    fireEvent.click(compareLinks[1]);
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument();
  });

  it('shows login and registration actions after recovery settles for a guest', () => {
    const props = { isDark: false, toggleTheme: vi.fn() };
    const { rerender } = render(<LandingHeader {...props} />);
    const initialAction = screen.getByRole('link', { name: 'Get started' });
    vi.mocked(useApp).mockReturnValue({ authLoading: false, isAuthenticated: false, user: null } as ReturnType<typeof useApp>);
    rerender(<LandingHeader {...props} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get started' })).toBe(initialAction);
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(initialAction).toHaveAttribute('href', '/register');
  });

  it.each(['seeker', 'provider', 'admin'])('offers workspace navigation to a recovered %s on desktop and mobile', role => {
    const props = { isDark: false, toggleTheme: vi.fn() };
    const { rerender } = render(<LandingHeader {...props} />);
    vi.mocked(useApp).mockReturnValue({ authLoading: false, isAuthenticated: true, user: { role, emailVerified: true } } as ReturnType<typeof useApp>);
    rerender(<LandingHeader {...props} />);
    expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Get started' })).not.toBeInTheDocument();
    const path = role === 'admin' ? '/admin/overview' : role === 'provider' ? '/provider/browse-services' : '/seeker/seek-services';
    expect(screen.getByRole('link', { name: 'Open workspace' })).toHaveAttribute('href', path);
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(screen.getAllByRole('link', { name: 'Open workspace' })).toHaveLength(2);
    for (const link of screen.getAllByRole('link', { name: 'Open workspace' })) expect(link).toHaveAttribute('href', path);
    expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument();
  });

  it.each([
    ['Compare', '#comparison'],
    ['Booking progress', '#booking-progress'],
  ])('links to %s from both menus and closes mobile navigation after choosing it', (label, href) => {
    render(<LandingHeader isDark={false} toggleTheme={vi.fn()} />);
    const desktop = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(desktop).getByRole('link', { name: label })).toHaveAttribute('href', href);
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const mobile = screen.getByRole('navigation', { name: 'Mobile navigation' });
    const shortcut = within(mobile).getByRole('link', { name: label });
    expect(shortcut).toHaveAttribute('href', href);
    fireEvent.click(shortcut);
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
  });
});
