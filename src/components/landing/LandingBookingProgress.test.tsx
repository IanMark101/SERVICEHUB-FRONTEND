import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { motionValue, type MotionValue } from 'motion/react';
import LandingBookingProgress from './LandingBookingProgress';
import { LandingScrollContext } from './useLandingSmoothScroll';
import type { LandingScrollTo } from './useLandingSmoothScroll';

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
  const expectProgress = (percentage: number) => expect(screen.getByRole('progressbar', { name: 'Booking walkthrough progress' })).toHaveAttribute('aria-valuenow', String(percentage));

  it('interrupts smooth wheel motion through the shared controller for desktop demo actions', () => {
    const scrollTo = vi.fn<LandingScrollTo>(() => true);
    render(<LandingScrollContext.Provider value={scrollTo}><LandingBookingProgress isDark={false} /></LandingScrollContext.Provider>);
    fireEvent.click(preview().getByRole('button', { name: 'Preview Start Job' }));
    const secondFrame = screen.getByRole('list', { name: 'Booking progress stages' }).children[1];
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith(secondFrame, { block: 'center', behavior: 'instant' });
    expect(scrollIntoView).not.toHaveBeenCalled();
    expectProgress(20);
    expect(preview().getByRole('button', { name: 'Preview Finish Work' })).toHaveFocus();
  });

  it('keeps mobile timeframe selection in place without a scroll or pin', () => {
    desktop = false;
    const scrollTo = vi.fn<LandingScrollTo>(() => true);
    render(<LandingScrollContext.Provider value={scrollTo}><LandingBookingProgress isDark={false} /></LandingScrollContext.Provider>);
    fireEvent.click(screen.getByRole('button', { name: 'Stage 3: Provider started' }));
    expectProgress(40);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('synchronizes the actual Activity card with forward and backward scroll', () => {
    render(<LandingBookingProgress isDark={false} />);
    expect(screen.getByRole('list', { name: 'Booking progress stages' }).children).toHaveLength(6);
    expectProgress(0);
    expect(preview().getByText("First in this provider's paid queue")).toBeInTheDocument();
    expect(preview().getByRole('button', { name: 'Preview Start Job' })).toBeInTheDocument();
    moveScroll(0.22);
    expectProgress(20);
    expect(preview().getByRole('heading', { name: 'In progress' })).toBeInTheDocument();
    expect(preview().getByRole('button', { name: 'Preview Finish Work' })).toBeInTheDocument();
    moveScroll(0.4);
    expectProgress(40);
    expect(preview().getByRole('heading', { name: 'In progress' })).toBeInTheDocument();
    expect(preview().getByText('The provider has started work on this booking.')).toBeInTheDocument();
    expect(preview().queryByRole('button', { name: 'Preview Finish Work' })).not.toBeInTheDocument();
    expect(preview().queryByRole('button', { name: 'Preview Confirm Completion' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Example booking preview' })).toHaveAttribute('data-role', 'seeker');
    moveScroll(0.57);
    expectProgress(60);
    expect(preview().getByRole('heading', { name: 'Awaiting confirmation' })).toBeInTheDocument();
    expect(preview().queryByRole('button', { name: 'Preview Confirm Completion' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Example booking preview' })).toHaveAttribute('data-role', 'provider');
    moveScroll(0.74);
    expectProgress(80);
    expect(preview().getByRole('heading', { name: 'Awaiting confirmation' })).toBeInTheDocument();
    expect(preview().getByText('The booking is not final until you confirm the result or report an issue.')).toBeInTheDocument();
    expect(preview().queryByText('Completed')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Example booking preview' })).toHaveAttribute('data-role', 'seeker');
    moveScroll(1);
    expectProgress(100);
    expect(preview().getByRole('heading', { name: 'Completed' })).toBeInTheDocument();
    expect(preview().getByRole('button', { name: 'Restart booking demo' })).toBeInTheDocument();
    moveScroll(0.22);
    expectProgress(20);
    expect(preview().getByRole('heading', { name: 'In progress' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stage 2: In progress' })).toHaveAttribute('aria-current', 'step');
  });

  it('offers local demo actions and an issue guide without sending requests', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<LandingBookingProgress isDark={true} />);
    fireEvent.click(preview().getByRole('button', { name: 'Preview Start Job' }));
    expect(preview().getByRole('button', { name: 'Preview Finish Work' })).toHaveFocus();
    fireEvent.click(preview().getByRole('button', { name: 'See Customer progress' }));
    expect(preview().getByText('The provider has started work on this booking.')).toBeInTheDocument();
    expect(preview().getByRole('button', { name: 'See work submitted' })).toHaveFocus();
    expectProgress(40);
    fireEvent.click(preview().getByRole('button', { name: 'See work submitted' }));
    fireEvent.click(preview().getByRole('button', { name: 'See Customer confirmation' }));
    expect(preview().getByRole('link', { name: /What if there is an issue/ })).toHaveAttribute('href', '/help/safety/reporting-users-and-disputes');
    fireEvent.click(preview().getByRole('button', { name: 'Preview Confirm Completion' }));
    expect(preview().getByRole('heading', { name: 'Completed' })).toBeInTheDocument();
    expectProgress(100);
    expect(preview().getByRole('button', { name: 'Restart booking demo' })).toHaveFocus();
    fireEvent.click(preview().getByRole('button', { name: 'Restart booking demo' }));
    expectProgress(0);
    expect(preview().getByRole('button', { name: 'Preview Start Job' })).toBeInTheDocument();
    expect(preview().getByText('Sample booking. No real payments or booking changes.')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'instant' });
  });

  it('keeps Finish Work linked to submitted work rather than the Customer started preview', () => {
    render(<LandingBookingProgress isDark={false} />);
    fireEvent.click(preview().getByRole('button', { name: 'Preview Start Job' }));
    fireEvent.click(preview().getByRole('button', { name: 'Preview Finish Work' }));
    expect(preview().getByRole('heading', { name: 'Awaiting confirmation' })).toBeInTheDocument();
    expect(preview().queryByText('In progress')).not.toBeInTheDocument();
    expectProgress(60);
  });

  it('synchronizes the compact mobile progress summary with forward and backward scroll', () => {
    desktop = false;
    reducedMotion = true;
    render(<LandingBookingProgress isDark={false} />);
    expectProgress(0);
    moveScroll(0.4);
    expectProgress(40);
    expect(screen.getByRole('button', { name: 'Stage 3: Provider started' })).toHaveAttribute('aria-current', 'step');
    moveScroll(1);
    expectProgress(100);
    expect(screen.getByRole('button', { name: 'Stage 6: Completed' })).toHaveAttribute('aria-current', 'step');
    moveScroll(0.22);
    expectProgress(20);
    fireEvent.click(screen.getByRole('button', { name: 'Stage 5: Awaiting confirmation' }));
    expectProgress(80);
    moveScroll(0.9);
    expectProgress(100);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('continues synchronizing the sticky preview on a short desktop viewport', () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 640 });
    render(<LandingBookingProgress isDark={false} />);
    moveScroll(0.3);
    expect(preview().getByRole('heading', { name: 'In progress' })).toBeInTheDocument();
    moveScroll(0.74);
    expect(preview().getByRole('button', { name: 'Preview Confirm Completion' })).toBeInTheDocument();
  });

  it.each([true, false])('uses actual row positions for desktop=%s instead of assuming equal stage heights', (isDesktop) => {
    desktop = isDesktop;
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(2200);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const index = this.tagName === 'LI' ? [...this.parentElement!.children].indexOf(this) : 0;
      return { top: index * 320, bottom: index * 320 + 320, height: 320, width: 500,
        left: 0, right: 500, x: 0, y: index * 320, toJSON() {} };
    });
    scroll.progress!.set(0.47);
    render(<LandingBookingProgress isDark={false} />);
    expect(preview().getByRole('heading', { name: 'Awaiting confirmation' })).toBeInTheDocument();
    moveScroll(0.6);
    expect(preview().getByRole('button', { name: 'Preview Confirm Completion' })).toBeInTheDocument();
    moveScroll(0.73);
    expect(preview().getByRole('heading', { name: 'Completed' })).toBeInTheDocument();
    moveScroll(0.95);
    expect(preview().getByRole('heading', { name: 'Completed' })).toBeInTheDocument();
  });

  it('removes its responsive listener and both size observers on unmount', () => {
    const { unmount } = render(<LandingBookingProgress isDark={false} />);
    unmount();
    expect(removeMediaListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(disconnectResizeObserver).toHaveBeenCalledTimes(2);
  });

  it('releases beside the final step before a full card-height hold and keeps that alignment through animation and resizing', () => {
    let animatedHeight = 100;
    let naturalHeight = 430;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const height = this.id === 'booking-progress-preview' ? animatedHeight + 80
        : this.parentElement?.id === 'booking-progress-preview' && this.querySelector('[data-preview-status]') ? animatedHeight
        : this.firstElementChild?.hasAttribute('data-preview-status') ? naturalHeight : 0;
      return { top: 0, bottom: height, height, width: 500, left: 0, right: 500, x: 0, y: 0, toJSON() {} };
    });
    const { container } = render(<LandingBookingProgress isDark={false} />);
    moveScroll(1);
    expect(preview().getByRole('heading', { name: 'Completed' })).toBeInTheDocument();
    const timeline = container.querySelector<HTMLElement>('[data-booking-timeline]')!;
    expect(timeline.style.getPropertyValue('--booking-final-stage-space')).toBe('388px');
    animatedHeight = 210;
    fireEvent(window, new Event('resize'));
    expect(timeline.style.getPropertyValue('--booking-final-stage-space')).toBe('388px');
    naturalHeight = 480;
    fireEvent(window, new Event('resize'));
    // A 560px card releases with the final divider 134px below its top,
    // matching the supplied reference instead of waiting for top-edge alignment.
    expect(timeline.style.getPropertyValue('--booking-final-stage-space')).toBe('426px');
  });
});
