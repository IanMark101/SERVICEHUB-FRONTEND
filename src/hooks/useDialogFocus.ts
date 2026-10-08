'use client';

import { useEffect, useRef } from 'react';

/** Keep keyboard focus in an open dialog and return it to its trigger on close. */
export default function useDialogFocus(isOpen: boolean, isBusy: boolean, onClose: () => void, initialFocus: 'field' | 'dialog' = 'field') {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef({ isBusy, onClose });
  useEffect(() => { latest.current = { isBusy, onClose }; }, [isBusy, onClose]);
  useEffect(() => {
    // Disabled controls can lose focus while a request is in flight.
    if (isOpen && isBusy) ref.current?.focus();
  }, [isOpen, isBusy]);
  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const dialog = ref.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const controls = () => Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]'))
      .filter(element => !element.closest('[hidden], [aria-hidden="true"]'));
    if (!dialog.contains(document.activeElement)) {
      // Long forms should open at their summary instead of scrolling to an input.
      (initialFocus === 'dialog' ? dialog : dialog.querySelector<HTMLElement>('textarea:not(:disabled), input:not(:disabled)') || controls()[0] || dialog).focus({ preventScroll: true });
    }
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!latest.current.isBusy) latest.current.onClose();
      }
      if (event.key !== 'Tab') return;
      const targets = controls();
      const first = targets[0], last = targets.at(-1);
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    dialog.addEventListener('keydown', keydown);
    return () => { dialog.removeEventListener('keydown', keydown); if (trigger?.isConnected) trigger.focus(); };
  }, [isOpen, initialFocus]);
  return ref;
}
