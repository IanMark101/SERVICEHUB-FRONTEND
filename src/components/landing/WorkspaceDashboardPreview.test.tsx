import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WorkspaceDashboardPreview from './WorkspaceDashboardPreview';
import LandingServicePreview from './LandingServicePreview';
import ScaledPreview from './ScaledPreview';

// A public preview must render without an account, permission or toast provider.
vi.mock('@/context/AppContext', () => ({ useApp: () => { throw new Error('Preview read account state'); } }));
vi.mock('@/components/ui/Toast', () => ({ useToast: () => { throw new Error('Preview mounted a transaction flow'); } }));

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('current UI previews on the public landing page', () => {
  it.each([['seeker', false], ['provider', false], ['seeker', true], ['provider', true]] as const)('renders the current %s UI (dark: %s) with isolated fixtures and no API calls', (role, isDark) => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const xhr = vi.spyOn(XMLHttpRequest.prototype, 'open');
    const { container } = render(<WorkspaceDashboardPreview role={role} isDark={isDark} />);
    const preview = screen.getByRole('img', { name: /current UI with fictional sample data/ });
    expect(preview.querySelector('[inert][aria-hidden="true"]')).not.toBeNull();
    expect(preview.querySelector('[data-current-workspace]')).toHaveAttribute('data-current-workspace', role);
    expect(preview.textContent).toContain('Search location');
    expect(preview.textContent).toContain('Within 10 km');
    expect(preview.querySelectorAll('[data-marketplace-card]')).toHaveLength(3);
    expect(preview.textContent).toContain(role === 'seeker' ? 'Book Service' : 'Payment Records');
    expect(preview.textContent).toContain(role === 'seeker' ? 'Aircon cleaning' : 'Aircon needs cleaning');
    expect(container.querySelector('img[src*="dashboard.png"]')).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    expect(xhr).not.toHaveBeenCalled();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('uses the current mobile details panel, including coverage, queue and payment context', () => {
    const { container } = render(<LandingServicePreview isDark />);
    const preview = screen.getByRole('img', { name: /Current mobile service details/ });
    const panel = preview.querySelector('[data-layout="compact"]');
    expect(panel).toHaveAttribute('data-theme', 'dark');
    expect(preview.textContent).toContain('Service coverage: 10 km');
    expect(preview.textContent).toContain('GCash bookings only');
    expect(preview.textContent).toContain('settled in person upon completion');
    expect(preview.textContent).toContain('Maya Santos');
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(preview.querySelector('[inert]')).not.toBeNull();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('fits the complete UI when the device narrows or its content height changes', () => {
    let fit: () => void = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { fit = callback; }
      observe() {}
      disconnect = disconnect;
    });
    const { unmount } = render(<ScaledPreview width={1440} label="Scaling example"><div>Current UI</div></ScaledPreview>);
    const viewport = screen.getByRole('img');
    const canvas = viewport.firstElementChild as HTMLElement;
    let width = 720;
    let height = 1000;
    Object.defineProperty(viewport, 'clientWidth', { get: () => width });
    Object.defineProperty(canvas, 'offsetHeight', { get: () => height });
    fit();
    expect(viewport.style.height).toBe('500px');
    expect(canvas.style.transform).toBe('scale(0.5)');
    width = 360;
    height = 1200;
    fit();
    expect(viewport.style.height).toBe('300px');
    expect(canvas.style.transform).toBe('scale(0.25)');
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
