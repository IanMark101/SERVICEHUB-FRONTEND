import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { motionValue, type MotionValue } from 'motion/react';
import LandingBookingProgress from './LandingBookingProgress';

const scroll = vi.hoisted(() => ({ progress: null as MotionValue<number> | null }));
vi.mock('motion/react', async (original) => ({
  ...await original<typeof import('motion/react')>(),
  useScroll: () => ({ scrollYProgress: scroll.progress }),
}));

let desktop = true;
let reducedMotion = false;
const removeMediaListener = vi.fn();
const scrollIntoView = vi.fn();
const disconnectResizeObserver = vi.fn();

describe('illustrative landing booking progress', () => {
  beforeEach(() => {
    desktop = true;
    reducedMotion = false;
    scroll.progress = motionValue(0);
    scrollIntoView.mockClear();
    removeMediaListener.mockClear();
    disconnectResizeObserver.mockClear();
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      media: query, matches: query.includes('min-width')
        ? desktop && (!query.includes('min-height') || window.innerHeight >= 720) : reducedMotion,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener: removeMediaListener,
    })));
    vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect = disconnectResizeObserver; });
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
  });

  afterEach(() => vi.restoreAllMocks());

  const preview = () => within(screen.getByRole('region', { name: 'Example booking preview' }));
  const moveScroll = (value: number) => act(() => scroll.progress!.set(value));

  it('synchronizes the actual Activity card with forward and backward scroll', () => {
    render(<LandingBookingProgress isDark={false} />);
    expect(screen.getByRole('list', { name: 'Booking progress stages' }).children).toHaveLength(5);
    expect(preview().getByText("First in this provider's paid queue")).toBeInTheDocument();
    expect(preview().getByRole('button', { name: 'Preview Start Job' })).toBeInTheDocument();
    moveScroll(0.3);
    expect(preview().getByText('This job is in progress')).toBeInTheDocument();
    expect(preview().getByRole('button', { name: 'Preview Mark Work Finished' })).toBeInTheDocument();
    moveScroll(0.45);
    expect(preview().getByText('Work submitted for confirmation')).toBeInTheDocument();
    expect(preview().queryByRole('button', { name: 'Preview Confirm Completion' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Example booking preview' })).toHaveAttribute('data-role', 'provider');
    moveScroll(0.65);
    expect(preview().getByText('Provider marked the work finished')).toBeInTheDocument();
    expect(preview().getByText('The booking is not final until you confirm the result or report an issue.')).toBeInTheDocument();
    expect(preview().queryByText('This booking is complete')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Example booking preview' })).toHaveAttribute('data-role', 'seeker');
    moveScroll(1);
    expect(preview().getByText('This booking is complete')).toBeInTheDocument();
    expect(preview().getByRole('button', { name: 'Restart booking demo' })).toBeInTheDocument();
    moveScroll(0.3);
    expect(preview().getByText('This job is in progress')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stage 2: In progress' })).toHaveAttribute('aria-current', 'step');
  });

  it('offers local demo actions and an issue guide without sending requests', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<LandingBookingProgress isDark={true} />);
    fireEvent.click(preview().getByRole('button', { name: 'Preview Start Job' }));
    expect(preview().getByRole('button', { name: 'Preview Mark Work Finished' })).toHaveFocus();
    fireEvent.click(preview().getByRole('button', { name: 'Preview Mark Work Finished' }));
    fireEvent.click(preview().getByRole('button', { name: 'See Seeker confirmation' }));
    expect(preview().getByRole('link', { name: /What if there is an issue/ })).toHaveAttribute('href', '/help/safety/reporting-users-and-disputes');
    fireEvent.click(preview().getByRole('button', { name: 'Preview Confirm Completion' }));
    expect(preview().getByText('This booking is complete')).toBeInTheDocument();
    expect(preview().getByRole('button', { name: 'Restart booking demo' })).toHaveFocus();
    fireEvent.click(preview().getByRole('button', { name: 'Restart booking demo' }));
    expect(preview().getByRole('button', { name: 'Preview Start Job' })).toBeInTheDocument();
    expect(preview().getByText('Sample booking. No real payments or booking changes.')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'instant' });
  });

  it('keeps mobile stage selection stable instead of overriding it while scrolling', () => {
    desktop = false;
    reducedMotion = true;
    render(<LandingBookingProgress isDark={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Stage 4: Awaiting confirmation' }));
    moveScroll(0.9);
    expect(preview().getByRole('button', { name: 'Preview Confirm Completion' })).toBeInTheDocument();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('continues synchronizing the sticky preview on a short desktop viewport', () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 640 });
    render(<LandingBookingProgress isDark={false} />);
    moveScroll(0.3);
    expect(preview().getByText('This job is in progress')).toBeInTheDocument();
    moveScroll(0.65);
    expect(preview().getByRole('button', { name: 'Preview Confirm Completion' })).toBeInTheDocument();
  });

  it('uses actual row positions so the final hold space does not delay the completed card', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(1600);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const index = this.tagName === 'LI' ? [...this.parentElement!.children].indexOf(this) : 0;
      return { top: index * 250, bottom: index * 250 + 250, height: 250, width: 500,
        left: 0, right: 500, x: 0, y: index * 250, toJSON() {} };
    });
    scroll.progress!.set(0.35);
    render(<LandingBookingProgress isDark={false} />);
    expect(preview().getByText('Work submitted for confirmation')).toBeInTheDocument();
    moveScroll(0.5);
    expect(preview().getByRole('button', { name: 'Preview Confirm Completion' })).toBeInTheDocument();
    moveScroll(0.63);
    expect(preview().getByText('This booking is complete')).toBeInTheDocument();
    moveScroll(0.95);
    expect(preview().getByText('This booking is complete')).toBeInTheDocument();
  });

  it('removes its responsive listener and both size observers on unmount', () => {
    const { unmount } = render(<LandingBookingProgress isDark={false} />);
    unmount();
    expect(removeMediaListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(disconnectResizeObserver).toHaveBeenCalledTimes(2);
  });
});
