'use client';

import { useEffect, useId, useRef, useState, type ComponentPropsWithRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

type Props = ComponentPropsWithRef<'select'> & { tone?: 'seeker' | 'provider' | 'admin'; compact?: boolean };
type Menu = {
  options: { value: string; label: string; disabled: boolean }[];
  parent: Element;
  style: CSSProperties;
  label: string;
  value: string;
};

/** Preserve the native select, refs, validation and events; share menu presentation. */
export default function FormSelect({ children, className = '', ref, tone, compact, onChange, onKeyDown, onKeyDownCapture, onClick, onMouseDown, onPointerDown, onBlur, ...props }: Props) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [active, setActive] = useState(0);
  const typeAhead = useRef({ text: '', time: 0 });
  const isOpen = Boolean(menu);

  function enabled() { return selectRef.current && !selectRef.current.matches(':disabled'); }
  function placement(select: HTMLSelectElement): CSSProperties {
    const rect = select.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const upwards = below < 180 && above > below;
    return {
      left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      width: Math.min(rect.width, window.innerWidth - 16),
      maxHeight: Math.max(80, Math.min(240, upwards ? above : below)),
      ...(upwards ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
      '--form-accent': getComputedStyle(select).getPropertyValue('--form-accent'),
    } as CSSProperties & { '--form-accent': string };
  }
  function open() {
    const select = selectRef.current;
    if (!select || !enabled()) return;
    const options = Array.from(select.options, option => ({ value: option.value, label: option.label, disabled: option.disabled }));
    const selected = options.findIndex(option => option.value === select.value && !option.disabled);
    setActive(selected >= 0 ? selected : Math.max(0, options.findIndex(option => !option.disabled)));
    // Stay inside a modal's focus boundary, outside its scrolling form body.
    setMenu({ options, value: select.value, parent: select.closest('[role="dialog"]') || document.body, style: placement(select), label: props['aria-label'] || select.labels?.[0]?.firstChild?.textContent?.trim() || 'Choose an option' });
    select.focus();
  }
  function choose(index: number) {
    const select = selectRef.current;
    const option = menu?.options[index];
    if (!select || !enabled() || !option || option.disabled) return;
    if (!Array.from(select.options).some(current => current.value === option.value && !current.disabled)) { setMenu(null); return; }
    // The original native change event keeps React Hook Form and callbacks intact.
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set?.call(select, option.value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
    setMenu(null);
    select.focus();
  }
  useEffect(() => {
    if (!isOpen) return;
    function outside(event: MouseEvent) {
      if (!selectRef.current?.parentElement?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) setMenu(null);
    }
    function reposition(event: Event) {
      if (menuRef.current?.contains(event.target as Node)) return;
      const select = selectRef.current;
      if (select) setMenu(current => current ? { ...current, style: placement(select) } : null);
    }
    document.addEventListener('mousedown', outside);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('mousedown', outside);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [isOpen]);
  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>(`[data-option-index="${active}"]`)?.scrollIntoView?.({ block: 'nearest' });
  }, [active, menu?.options]);

  return <span className={`form-select${compact ? ' form-select--compact' : ''}`} data-form-tone={tone}>
    <select
      {...props}
      ref={node => {
        selectRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={`form-select__control ${className}`}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isOpen && !props.disabled}
      aria-controls={menu ? id : undefined}
      aria-activedescendant={menu ? `${id}-${active}` : undefined}
      onChange={onChange}
      onPointerDown={event => {
        onPointerDown?.(event);
        if (!event.defaultPrevented && enabled()) event.preventDefault();
      }}
      onMouseDown={event => {
        onMouseDown?.(event);
        if (!event.defaultPrevented && enabled()) event.preventDefault();
      }}
      onClick={event => {
        onClick?.(event);
        if (!event.defaultPrevented) { if (menu) setMenu(null); else open(); }
      }}
      onBlur={event => { onBlur?.(event); setMenu(null); }}
      onKeyDownCapture={event => {
        onKeyDownCapture?.(event);
        // Close the popup before a parent dialog's native Escape listener runs.
        if (!event.defaultPrevented && event.key === 'Escape' && menu) { event.preventDefault(); event.stopPropagation(); setMenu(null); }
      }}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !enabled()) return;
        const key = event.key;
        if (key === 'Tab') { setMenu(null); return; }
        if (key === 'Escape' && menu) { event.preventDefault(); event.stopPropagation(); setMenu(null); return; }
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
          event.preventDefault();
          event.stopPropagation();
          if (!menu) { open(); return; }
          if (key === 'Enter' || key === ' ') { choose(active); return; }
          const indices = menu.options.flatMap((option, index) => option.disabled ? [] : [index]);
          const current = indices.indexOf(active);
          setActive(key === 'Home' ? indices[0] ?? active : key === 'End' ? indices.at(-1) ?? active : indices[Math.max(0, Math.min(indices.length - 1, current + (key === 'ArrowDown' ? 1 : -1)))] ?? active);
        } else if (menu && key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          const now = Date.now();
          typeAhead.current = { text: now - typeAhead.current.time < 700 ? typeAhead.current.text + key.toLowerCase() : key.toLowerCase(), time: now };
          const next = menu.options.findIndex(option => !option.disabled && option.label.toLowerCase().startsWith(typeAhead.current.text));
          if (next >= 0) setActive(next);
        }
      }}
    >{children}</select>
    <ChevronDown aria-hidden className={`form-select__chevron ${menu ? 'is-open' : ''}`} size={16} />
    {menu && !props.disabled && createPortal(<div ref={menuRef} id={id} role="listbox" aria-label={menu.label} className="form-select__menu rounded-2xl" style={menu.style}>
      {menu.options.map((option, index) => option.disabled && option.value === '' ? null : <div
        key={`${option.value}-${index}`} id={`${id}-${index}`} role="option" aria-selected={option.value === menu.value} aria-disabled={option.disabled || undefined} data-option-index={index} data-active={index === active || undefined}
        className="form-select__option"
        onMouseDown={event => event.preventDefault()}
        onMouseEnter={() => !option.disabled && setActive(index)}
        onClick={() => choose(index)}
      ><span>{option.label}</span>{option.value === menu.value && <Check aria-hidden size={16} />}</div>)}
    </div>, menu.parent)}
  </span>;
}
