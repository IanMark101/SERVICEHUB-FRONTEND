import React from 'react';
import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LandingScrollProgress from './LandingScrollProgress';
import LandingBenefits from './LandingBenefits';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock('motion/react', async importOriginal => ({
  ...await importOriginal<typeof import('motion/react')>(),
  useReducedMotion: () => preference.reduced,
}));

describe('landing reduced motion hydration', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each([false, true])('retains the server-rendered hero when reduced motion is %s', async reduced => {
    preference.reduced = false; // The server cannot read the device setting.
    const element = <main><LandingScrollProgress /><h1>ServiceHub</h1><LandingBenefits isDark={false} /><ContainerScroll titleComponent={null}>Workspace preview</ContainerScroll></main>;
    const container = document.createElement('div');
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const originalHeading = container.querySelector('h1');
    const errors: unknown[] = [];
    const consoleError = vi.spyOn(console, 'error');
    let root: ReturnType<typeof hydrateRoot> | undefined;
    preference.reduced = reduced;
    try {
      await act(async () => {
        root = hydrateRoot(container, element, { onRecoverableError: error => errors.push(error) });
      });
      expect(errors).toEqual([]);
      expect(consoleError).not.toHaveBeenCalled();
      expect(container.querySelector('h1')).toBe(originalHeading);
      const button = container.querySelector('button');
      expect(button?.textContent).toBe(reduced ? 'Motion off' : 'Pause cards');
      expect(button?.disabled).toBe(reduced);
      expect(container.querySelector('[data-hero-track]')?.getAttribute('data-running')).toBe(reduced ? 'false' : 'true');
    } finally {
      await act(async () => root?.unmount());
      container.remove();
      preference.reduced = false;
      consoleError.mockRestore();
    }
  });
});
