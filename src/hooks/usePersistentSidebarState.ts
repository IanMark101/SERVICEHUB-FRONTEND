import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'servicehub:marketplace-sidebar-collapsed';

// Keeps the preference available synchronously while switching between the
// separately mounted Seeker and Provider layouts.
let collapsedMemory: boolean | null = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => {
  if (collapsedMemory === null && typeof window !== 'undefined') {
    collapsedMemory = localStorage.getItem(STORAGE_KEY) === 'true';
  }
  return collapsedMemory ?? false;
};

const getServerSnapshot = () => false;

export function usePersistentSidebarState() {
  const isCollapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setIsCollapsed = useCallback((collapsed: boolean) => {
    collapsedMemory = collapsed;
    localStorage.setItem(STORAGE_KEY, String(collapsed));
    listeners.forEach((listener) => listener());
  }, []);

  return [isCollapsed, setIsCollapsed] as const;
}
