"use client";

import type { KeyboardEvent, ReactNode } from 'react';

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
};

export default function WorkspaceTabs<T extends string>({
  activeValue,
  items,
  onChange,
  ariaLabel,
  tone = 'neutral',
  className = '',
}: WorkspaceTabsProps<T>) {
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
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      .item(nextIndex)
      .focus();
  };

  return (
    <div
      className={`workspace-tabs workspace-tabs--${tone} ${className}`}
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
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className="workspace-tabs__item"
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.icon && <span className="workspace-tabs__icon" aria-hidden="true">{item.icon}</span>}
            <span className="workspace-tabs__label">{item.label}</span>
            {item.count !== undefined && <span className="workspace-tabs__count">{item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
