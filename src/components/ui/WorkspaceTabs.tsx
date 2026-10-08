"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type WorkspaceTabItem<T extends string> = {
  value: T;
  label: string;
  count?: number;
  icon?: ReactNode;
};

type WorkspaceTabsProps<T extends string> = {
  activeValue: T;
  items: WorkspaceTabItem<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  tone?: 'seeker' | 'provider' | 'neutral';
  className?: string;
  idPrefix?: string;
  scrollControls?: boolean;
};

export default function WorkspaceTabs<T extends string>({
  activeValue,
  items,
  onChange,
  ariaLabel,
  tone = 'neutral',
  className = '',
  idPrefix,
  scrollControls = false,
}: WorkspaceTabsProps<T>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportId = useId();
  const [scrollState, setScrollState] = useState({ overflow: false, left: false, right: false });
  const itemKey = items.map(item => `${item.value}:${item.label}:${item.count ?? ''}`).join('|');

  const revealTab = useCallback((tab: HTMLButtonElement) => {
    const viewport = viewportRef.current;
    if (!scrollControls || !viewport) return;
    const start = tab.offsetLeft - 4;
    const end = tab.offsetLeft + tab.offsetWidth + 4;
    if (start < viewport.scrollLeft) viewport.scrollLeft = Math.max(0, start);
    else if (end > viewport.scrollLeft + viewport.clientWidth) viewport.scrollLeft = end - viewport.clientWidth;
  }, [scrollControls]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!scrollControls || !viewport) return;
    let active = true;
    const measure = () => {
      if (!active) return;
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      const next = { overflow: maxScroll > 1, left: viewport.scrollLeft > 1, right: viewport.scrollLeft < maxScroll - 1 };
      setScrollState(previous => previous.overflow === next.overflow && previous.left === next.left && previous.right === next.right ? previous : next);
    };
    const resize = () => {
      const selected = viewport.querySelector<HTMLButtonElement>('[aria-selected="true"]');
      if (selected) revealTab(selected);
      measure();
    };
    const frame = requestAnimationFrame(resize);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(viewport);
    viewport.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', resize);
    void document.fonts?.ready.then(resize);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      viewport.removeEventListener('scroll', measure);
      window.removeEventListener('resize', resize);
    };
  }, [scrollControls, itemKey, revealTab]);

  useEffect(() => {
    if (!scrollControls) return;
    const frame = requestAnimationFrame(() => {
      const tab = viewportRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
      if (tab) revealTab(tab);
    });
    return () => cancelAnimationFrame(frame);
  }, [activeValue, scrollControls, itemKey, revealTab, scrollState.overflow]);

  const scrollTabs = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({
      left: direction * Math.max(120, viewport.clientWidth * .75),
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % items.length;

    const nextItem = items[nextIndex];
    if (!nextItem) return;
    onChange(nextItem.value);
    const nextTab = viewportRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]').item(nextIndex);
    nextTab?.focus({ preventScroll: scrollControls });
    if (nextTab) revealTab(nextTab);
  };

  const tablist = (
    <div
      ref={viewportRef}
      id={viewportId}
      className={scrollControls ? 'workspace-tabs__viewport' : `workspace-tabs workspace-tabs--${tone} ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item, index) => {
        const isActive = item.value === activeValue;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={idPrefix ? `${idPrefix}-tab-${item.value}` : undefined}
            aria-controls={idPrefix ? `${idPrefix}-panel-${item.value}` : undefined}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className="workspace-tabs__item"
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onFocus={(event) => revealTab(event.currentTarget)}
          >
            {item.icon && <span className="workspace-tabs__icon" aria-hidden="true">{item.icon}</span>}
            <span className="workspace-tabs__label">{item.label}</span>
            {item.count !== undefined && <span className="workspace-tabs__count">{item.count}</span>}
          </button>
        );
      })}
    </div>
  );

  if (!scrollControls) return tablist;

  return <div className={`workspace-tabs workspace-tabs--${tone} workspace-tabs--scrollable ${className}`}>
    {scrollState.overflow && <button type="button" className="workspace-tabs__scroll" aria-label="Scroll tabs left" aria-controls={viewportId} disabled={!scrollState.left} onClick={() => scrollTabs(-1)}>
      <ChevronLeft size={18} aria-hidden="true" />
    </button>}
    {tablist}
    {scrollState.overflow && <button type="button" className="workspace-tabs__scroll" aria-label="Scroll tabs right" aria-controls={viewportId} disabled={!scrollState.right} onClick={() => scrollTabs(1)}>
      <ChevronRight size={18} aria-hidden="true" />
    </button>}
  </div>;
}
