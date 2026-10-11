import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import LandingWorkspaces from './LandingWorkspaces';

const dialogPrototype = HTMLDialogElement.prototype;
const originalShowModal = Object.getOwnPropertyDescriptor(dialogPrototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(dialogPrototype, 'close');

describe('tabbed workspace dashboard previews', () => {
  beforeAll(() => {
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    vi.stubGlobal('matchMedia', vi.fn((media: string) => ({
      media, matches: true, addListener() {}, removeListener() {},
      addEventListener() {}, removeEventListener() {},
    })));
    // jsdom does not implement native modal opening/closing. Browser focus
    // trapping is provided by showModal; verify our controls and cleanup here.
    Object.defineProperty(dialogPrototype, 'showModal', { configurable: true, value(this: HTMLDialogElement) { this.setAttribute('open', ''); } });
    Object.defineProperty(dialogPrototype, 'close', { configurable: true, value(this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    } });
  });

  afterAll(() => {
    if (originalShowModal) Object.defineProperty(dialogPrototype, 'showModal', originalShowModal);
    else Reflect.deleteProperty(dialogPrototype, 'showModal');
    if (originalClose) Object.defineProperty(dialogPrototype, 'close', originalClose);
    else Reflect.deleteProperty(dialogPrototype, 'close');
    vi.unstubAllGlobals();
  });

  it('switches the current dashboard and its matching features together', () => {
    render(<LandingWorkspaces isDark={false} />);
    const seeker = screen.getByRole('tab', { name: 'Seeker Workspace' });
    const provider = screen.getByRole('tab', { name: 'Provider Workspace' });
    expect(seeker).toHaveAttribute('aria-selected', 'true');
    expect(provider).toHaveAttribute('tabindex', '-1');
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    let panel = within(screen.getByRole('tabpanel', { name: 'Seeker Workspace' }));
    expect(panel.getByRole('img', { name: /^Seeker dashboard/ })).toBeVisible();
    expect(panel.getByRole('img').querySelector('[data-current-workspace="seeker"]')).not.toBeNull();
    expect(panel.getByRole('heading', { name: 'Find help or post what you need.' })).toBeVisible();
    expect(panel.getAllByRole('listitem')).toHaveLength(3);

    fireEvent.click(provider);
    expect(provider).toHaveAttribute('aria-selected', 'true');
    expect(seeker).toHaveAttribute('aria-selected', 'false');
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    panel = within(screen.getByRole('tabpanel', { name: 'Provider Workspace' }));
    expect(panel.getByRole('img', { name: /^Provider dashboard/ })).toBeVisible();
    expect(panel.getByRole('img').querySelector('[data-current-workspace="provider"]')).not.toBeNull();
    expect(panel.getByText('Browse Service Requests and send offers')).toBeVisible();
    expect(panel.getByText('Track completed bookings and recorded earnings')).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Find help or post what you need.' })).not.toBeInTheDocument();
  });

  it('supports arrow keys, Home and End with one active keyboard tab', () => {
    render(<LandingWorkspaces isDark={true} />);
    const seeker = screen.getByRole('tab', { name: 'Seeker Workspace' });
    const provider = screen.getByRole('tab', { name: 'Provider Workspace' });
    seeker.focus();
    fireEvent.keyDown(seeker, { key: 'ArrowRight' });
    expect(provider).toHaveFocus();
    expect(provider).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(provider, { key: 'ArrowLeft' });
    expect(seeker).toHaveFocus();
    fireEvent.keyDown(seeker, { key: 'End' });
    expect(provider).toHaveFocus();
    fireEvent.keyDown(provider, { key: 'Home' });
    expect(seeker).toHaveFocus();
    expect(seeker).toHaveAttribute('tabindex', '0');
    expect(provider).toHaveAttribute('tabindex', '-1');
    expect(seeker.closest('section')).toHaveAttribute('data-theme', 'dark');
  });

  it('expands the selected workspace, restores focus on dismissal and releases scroll lock', () => {
    document.body.style.overflow = 'visible';
    render(<LandingWorkspaces isDark={false} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Provider Workspace' }));
    const expand = screen.getByRole('button', { name: 'Expand Provider dashboard preview' });
    fireEvent.click(expand);
    const dialog = screen.getByRole('dialog', { name: 'Provider workspace preview' });
    expect(dialog).toHaveAttribute('data-lenis-prevent');
    expect(within(dialog).getByRole('img', { name: /^Provider dashboard/ })).toBeVisible();
    expect(within(dialog).getByRole('img').querySelector('[data-current-workspace="provider"]')).not.toBeNull();
    expect(within(dialog).getByRole('button', { name: 'Close dashboard preview' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close dashboard preview' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(expand).toHaveFocus();
    expect(document.body.style.overflow).toBe('visible');

    const imageTrigger = screen.getByRole('button', { name: 'View Provider dashboard full size' });
    fireEvent.click(imageTrigger);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(imageTrigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('visible');
    document.body.style.overflow = '';
  });

  it('restores the existing overflow style when an expanded preview unmounts', () => {
    document.body.style.overflow = 'clip';
    const { unmount } = render(<LandingWorkspaces isDark={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand Seeker dashboard preview' }));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('clip');
    document.body.style.overflow = '';
  });
});
