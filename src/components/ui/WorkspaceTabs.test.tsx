import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WorkspaceTabs from './WorkspaceTabs';

const items = [
  { value: 'all', label: 'All', count: 2 },
  { value: 'in_progress', label: 'Work Underway', count: 0 },
  { value: 'canceled', label: 'Canceled', count: 123 },
];
let width: number;
let resize: () => void;
let scrollBy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  width = 250;
  resize = () => {};
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback; }
    observe() {}
    disconnect() {}
  });
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) { return this.getAttribute('role') === 'tablist' ? width : 0; });
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(600);
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
    return this.textContent?.includes('Canceled') ? 420 : this.textContent?.includes('Work Underway') ? 100 : 4;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(176);
  scrollBy = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
    this.scrollLeft = Math.max(0, Math.min(600 - width, this.scrollLeft + (options.left || 0)));
    this.dispatchEvent(new Event('scroll'));
  });
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  Object.defineProperty(HTMLElement.prototype, 'scrollBy', { configurable: true, value: scrollBy });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as Partial<HTMLElement>).scrollBy;
});

describe('Scrollable workspace tabs', () => {
  it('pages overflowing tabs without selecting a filter and disables controls at the ends', async () => {
    const change = vi.fn();
    render(<WorkspaceTabs activeValue="all" items={items} onChange={change} ariaLabel="Activity" scrollControls />);
    const left = await screen.findByRole('button', { name: 'Scroll tabs left' });
    const right = screen.getByRole('button', { name: 'Scroll tabs right' });
    expect(left).toBeDisabled();
    expect(right).toBeEnabled();
    fireEvent.click(right);
    expect(scrollBy).toHaveBeenCalledWith({ left: 187.5, behavior: 'smooth' });
    expect(left).toBeEnabled();
    fireEvent.click(right);
    expect(right).toBeDisabled();
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'Canceled 123' })).toBeInTheDocument();
  });

  it('reveals the complete selected tab and count, including after the viewport narrows', async () => {
    const view = render(<WorkspaceTabs activeValue="all" items={items} onChange={vi.fn()} ariaLabel="Activity" scrollControls />);
    await screen.findByRole('button', { name: 'Scroll tabs right' });
    view.rerender(<WorkspaceTabs activeValue="canceled" items={items} onChange={vi.fn()} ariaLabel="Activity" scrollControls />);
    const viewport = screen.getByRole('tablist');
    await waitFor(() => expect(viewport.scrollLeft).toBe(350));
    width = 200;
    act(() => resize());
    expect(viewport.scrollLeft).toBe(400);
  });

  it('keeps keyboard selection and focus visible without scrolling the whole page', async () => {
    const change = vi.fn();
    render(<WorkspaceTabs activeValue="all" items={items} onChange={change} ariaLabel="Activity" scrollControls />);
    await screen.findByRole('button', { name: 'Scroll tabs right' });
    fireEvent.keyDown(screen.getByRole('tab', { name: 'All 2' }), { key: 'End' });
    expect(change).toHaveBeenCalledWith('canceled');
    expect(screen.getByRole('tab', { name: 'Canceled 123' })).toHaveFocus();
    expect(screen.getByRole('tablist').scrollLeft).toBe(350);
  });

  it('hides the arrows when every tab fits', async () => {
    width = 700;
    render(<WorkspaceTabs activeValue="all" items={items} onChange={vi.fn()} ariaLabel="Activity" scrollControls />);
    act(() => resize());
    expect(screen.queryByRole('button', { name: /Scroll tabs/ })).not.toBeInTheDocument();
  });
});
