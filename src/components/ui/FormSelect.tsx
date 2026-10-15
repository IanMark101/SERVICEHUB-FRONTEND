'use client';

import { useCallback, useEffect, useId, useRef, useState, type ComponentPropsWithRef, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';

type Props = ComponentPropsWithRef<'select'> & {
  tone?: 'seeker' | 'provider' | 'admin'; compact?: boolean;
  searchable?: boolean; searchLabel?: string; searchTerms?: Readonly<Record<string, string>>;
};
type Menu = {
  options: { value: string; label: string; disabled: boolean }[];
  parent: Element;
  style: CSSProperties;
  label: string;
  value: string;
};

/** Preserve the native select, refs, validation and events; share menu presentation. */
export default function FormSelect({ children, className = '', ref, tone, compact, searchable = false, searchLabel = 'Search options', searchTerms, onChange, onKeyDown, onKeyDownCapture, onClick, onMouseDown, onPointerDown, onBlur, ...props }: Props) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState('');
  const typeAhead = useRef({ text: '', time: 0 });
  const isOpen = Boolean(menu);
  const visibleOptions = menu?.options.flatMap((option, index) => {
    if (option.disabled && option.value === '') return [];
    const text = `${option.label} ${searchTerms?.[option.value] ?? ''}`.normalize('NFKC').toLocaleLowerCase();
    return !searchable || text.includes(query.trim().normalize('NFKC').toLocaleLowerCase()) ? [{ ...option, index }] : [];
  }) ?? [];

  function enabled() { return selectRef.current && !selectRef.current.matches(':disabled'); }
  const placement = useCallback((select: HTMLSelectElement): CSSProperties => {
    const rect = select.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const upwards = below < 180 && above > below;
    return {
      left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      width: Math.min(rect.width, window.innerWidth - 16),
      maxHeight: Math.max(80, Math.min(searchable ? 320 : 240, upwards ? above : below)),
      ...(upwards ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
      '--form-accent': getComputedStyle(select).getPropertyValue('--form-accent'),
    } as CSSProperties & { '--form-accent': string };
  }, [searchable]);
  function open() {
    const select = selectRef.current;
    if (!select || !enabled()) return;
    const options = Array.from(select.options, option => ({ value: option.value, label: option.label, disabled: option.disabled }));
    const selected = options.findIndex(option => option.value === select.value && !option.disabled);
    setQuery('');
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
      if (event.target instanceof Node && menuRef.current?.contains(event.target)) return;
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
  }, [isOpen, placement]);
  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>(`[data-option-index="${active}"]`)?.scrollIntoView?.({ block: 'nearest' });
  }, [active, menu?.options]);
  useEffect(() => {
    if (isOpen && searchable) searchRef.current?.focus();
  }, [isOpen, searchable]);

  function searchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); setMenu(null); selectRef.current?.focus(); return;
    }
    if (event.key === 'Tab') { setMenu(null); selectRef.current?.focus(); return; }
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key) || event.nativeEvent.isComposing) return;
    event.preventDefault(); event.stopPropagation();
    const indices = visibleOptions.filter(option => !option.disabled).map(option => option.index);
    if (event.key === 'Enter') { choose(indices.includes(active) ? active : indices[0] ?? -1); return; }
    const current = indices.indexOf(active);
    setActive(indices[current < 0 ? (event.key === 'ArrowDown' ? 0 : indices.length - 1) : Math.max(0, Math.min(indices.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1)))] ?? -1);
  }

  const options = visibleOptions.map((option) => <div
    key={`${option.value}-${option.index}`} id={`${id}-${option.index}`} role="option" aria-selected={option.value === menu?.value} aria-disabled={option.disabled || undefined} data-option-index={option.index} data-active={option.index === active || undefined}
    className="form-select__option"
    onMouseDown={event => event.preventDefault()}
    onMouseEnter={() => !option.disabled && setActive(option.index)}
    onClick={() => choose(option.index)}
  ><span>{option.label}</span>{option.value === menu?.value && <Check aria-hidden size={16} />}</div>);

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
      aria-activedescendant={menu && active >= 0 ? `${id}-${active}` : undefined}
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
      onBlur={event => {
        onBlur?.(event);
        if (searchable && event.relatedTarget instanceof Node && menuRef.current?.contains(event.relatedTarget)) return;
        setMenu(null);
      }}
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
    {menu && !props.disabled && createPortal(<div ref={menuRef} id={searchable ? undefined : id} role={searchable ? undefined : 'listbox'} aria-label={searchable ? undefined : menu.label} className={`form-select__menu rounded-2xl${searchable ? ' form-select__menu--searchable' : ''}`} style={menu.style}>
      {searchable ? <>
        <label className="form-select__search form-control-group">
          <Search size={16} aria-hidden="true" />
          <input ref={searchRef} data-form-unstyled type="search" aria-label={searchLabel} placeholder={searchLabel} autoComplete="off" value={query} aria-controls={id} aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
            onChange={event => { setQuery(event.target.value); setActive(-1); }} onKeyDownCapture={event => { if (event.key === 'Escape') searchKeyDown(event); }} onKeyDown={searchKeyDown}
            onBlur={event => { if (!(event.relatedTarget instanceof Node) || (!menuRef.current?.contains(event.relatedTarget) && !selectRef.current?.parentElement?.contains(event.relatedTarget))) setMenu(null); }} />
        </label>
        <div id={id} role="listbox" aria-label={menu.label} className="form-select__options">
          {options}
          {!options.length && <p className="form-select__empty" role="status">No matching categories. Try another word.</p>}
        </div>
      </> : options}
    </div>, menu.parent)}
  </span>;
}
