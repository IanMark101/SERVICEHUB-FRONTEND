import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useLandingSectionNavigation from './useLandingSectionNavigation';

function NavigationFixture() {
  const { shellRef, handleSectionClick } = useLandingSectionNavigation();
  return (
    <div ref={shellRef} onClick={handleSectionClick}>
      <header style={{ top: 16 }}><div data-landing-header-bar /></header>
      <a href="#reviews">Reviews</a>
      <a href="#queue">Queue</a>
      <a href="#problem">Why ServiceHub</a>
      <a href="#top">Home</a>
      <section id="top">Hero</section>
      <section id="problem"><div><div data-landing-anchor>Benefits</div></div></section>
      <section id="reviews"><div>Review steps</div></section>
      <section id="queue"><div>Queue steps</div></section>
    </div>
  );
}

describe('landing section framing', () => {
  let reducedMotion: boolean;
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    reducedMotion = false;
    scrollIntoView.mockClear();
    window.history.replaceState(null, '', '/');
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: reducedMotion })));
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('uses native content alignment and moves keyboard focus to the section', () => {
    render(<NavigationFixture />);
    fireEvent.click(screen.getByRole('link', { name: 'Reviews' }));
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'start', behavior: 'smooth' });
    expect(scrollIntoView.mock.instances.at(-1)).toBe(document.querySelector('#reviews > div'));
    expect(window.location.hash).toBe('#reviews');
    expect(document.activeElement).toBe(document.getElementById('reviews'));
  });

  it('lets Next synchronize section URLs rather than marking the push as an internal router action', () => {
    const internalTree = { tree: 'current-route' };
    window.history.replaceState({ __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: internalTree }, '', '/');
    const nativePush = window.history.pushState.bind(window.history);
    const synchronizeRouterUrl = vi.fn();
    // Installed Next patches native history. Passing its private marker back
    // bypasses URL synchronization because it is reserved for internal actions.
    vi.spyOn(window.history, 'pushState').mockImplementation((data, unused, url) => {
      if (data?.__NA || data?._N) return nativePush(data, unused, url);
      synchronizeRouterUrl(url);
      nativePush({ ...data, __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: internalTree }, unused, url);
    });
    render(<NavigationFixture />);
    fireEvent.click(screen.getByRole('link', { name: 'Reviews' }));
    expect(synchronizeRouterUrl).toHaveBeenCalledExactlyOnceWith('#reviews');
    expect(window.history.state.__PRIVATE_NEXTJS_INTERNALS_TREE).toEqual(internalTree);
    expect(window.location.hash).toBe('#reviews');
  });

  it('uses the dedicated Benefits anchor so the previous strip is above the viewport', () => {
    render(<NavigationFixture />);
    fireEvent.click(screen.getByRole('link', { name: 'Why ServiceHub' }));
    expect(scrollIntoView.mock.instances.at(-1)).toBe(document.querySelector('[data-landing-anchor]'));
  });

  it('preserves navigation to other sections without calculating pixel offsets', () => {
    render(<NavigationFixture />);
    fireEvent.click(screen.getByRole('link', { name: 'Queue' }));
    expect(scrollIntoView.mock.instances.at(-1)).toBe(document.querySelector('#queue > div'));
  });

  it('restores a direct hash and browser history to the content anchor', () => {
    window.history.replaceState(null, '', '/#reviews');
    render(<NavigationFixture />);
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'start', behavior: 'auto' });
    expect(scrollIntoView.mock.instances.at(-1)).toBe(document.querySelector('#reviews > div'));
    window.history.replaceState(null, '', '/#queue');
    fireEvent.popState(window);
    expect(scrollIntoView.mock.instances.at(-1)).toBe(document.querySelector('#queue > div'));
  });

  it('honors reduced motion when following the Reviews link', () => {
    reducedMotion = true;
    render(<NavigationFixture />);
    fireEvent.click(screen.getByRole('link', { name: 'Reviews' }));
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'start', behavior: 'auto' });
  });

  it('returns Home to the hero boundary', () => {
    render(<NavigationFixture />);
    fireEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(scrollIntoView.mock.instances.at(-1)).toBe(document.getElementById('top'));
  });

  it('leaves modified clicks to the browser', () => {
    render(<NavigationFixture />);
    fireEvent.click(screen.getByRole('link', { name: 'Queue' }), { ctrlKey: true });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
