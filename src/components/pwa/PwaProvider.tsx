'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowClockwise, ArrowsClockwise, WarningCircle } from '@phosphor-icons/react';
import styles from './Pwa.module.css';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
interface PwaState {
  installed: boolean;
  canInstall: boolean;
  installing: boolean;
  installMessage: string;
  install: () => Promise<void>;
  updateAvailable: boolean;
  updating: boolean;
  updateMessage: string;
  update: () => void;
  offline: boolean;
}
const PwaContext = createContext<PwaState | null>(null);

export function usePwa() {
  const value = useContext(PwaContext);
  if (!value) throw new Error('usePwa requires PwaProvider');
  return value;
}

export default function PwaProvider({ children }: { children: ReactNode }) {
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installMessage, setInstallMessage] = useState('');
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [needsReload, setNeedsReload] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [offline, setOffline] = useState(false);
  const prompt = useRef<InstallPromptEvent | null>(null);
  const requestedUpdate = useRef(false);
  const updateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)');
    const syncInstalled = () => setInstalled(standalone.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const receivePrompt = (event: Event) => {
      // Development has no ServiceHub worker. Leave Chrome's native install
      // behavior alone instead of deferring a prompt for a development build.
      if (process.env.NODE_ENV !== 'production') return;
      event.preventDefault();
      prompt.current = event as InstallPromptEvent;
      setCanInstall(true);
    };
    const didInstall = () => {
      prompt.current = null;
      setCanInstall(false);
      setInstalled(true);
      setInstallMessage('ServiceHub has been installed.');
    };
    const syncConnection = () => setOffline(!navigator.onLine);
    syncInstalled(); syncConnection();
    standalone.addEventListener('change', syncInstalled);
    window.addEventListener('beforeinstallprompt', receivePrompt);
    window.addEventListener('appinstalled', didInstall);
    window.addEventListener('online', syncConnection);
    window.addEventListener('offline', syncConnection);
    return () => {
      standalone.removeEventListener('change', syncInstalled);
      window.removeEventListener('beforeinstallprompt', receivePrompt);
      window.removeEventListener('appinstalled', didInstall);
      window.removeEventListener('online', syncConnection);
      window.removeEventListener('offline', syncConnection);
    };
  }, []);

  useEffect(() => {
    // Never let a development worker cache localhost resources or survive HMR.
    if (process.env.NODE_ENV !== 'production' || !window.isSecureContext || !('serviceWorker' in navigator)) return;
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    let lastChecked = Date.now();
    let hadController = Boolean(navigator.serviceWorker.controller);
    const observed = new Map<ServiceWorker, () => void>();
    const showWaiting = () => {
      if (registration?.waiting) {
        setWaiting(registration.waiting);
        setDismissed(false);
      }
    };
    const trackInstalling = () => {
      const worker = registration?.installing;
      if (!worker || observed.has(worker)) return;
      const changed = () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) showWaiting();
      };
      observed.set(worker, changed);
      worker.addEventListener('statechange', changed);
    };
    const controllerChanged = () => {
      if (requestedUpdate.current) {
        requestedUpdate.current = false;
        if (updateTimeout.current) clearTimeout(updateTimeout.current);
        window.location.reload();
      } else if (hadController) {
        setWaiting(null);
        setNeedsReload(true);
        setDismissed(false);
      }
      hadController = true;
    };
    const checkForUpdate = () => {
      if (!registration || !navigator.onLine || document.visibilityState !== 'visible' || Date.now() - lastChecked < 60_000) return;
      lastChecked = Date.now();
      void registration.update().catch(() => { /* Try on the next online visit. */ });
    };
    const register = async () => {
      try {
        const result = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
        if (disposed) return;
        registration = result;
        showWaiting(); trackInstalling();
        registration.addEventListener('updatefound', trackInstalling);
      } catch {
        if (!disposed) setUpdateMessage("Offline support couldn't be prepared. You can still use ServiceHub online.");
      }
    };
    navigator.serviceWorker.addEventListener('controllerchange', controllerChanged);
    document.addEventListener('visibilitychange', checkForUpdate);
    window.addEventListener('online', checkForUpdate);
    if (document.readyState === 'complete') void register();
    else window.addEventListener('load', register, { once: true });
    return () => {
      disposed = true;
      window.removeEventListener('load', register);
      navigator.serviceWorker.removeEventListener('controllerchange', controllerChanged);
      registration?.removeEventListener('updatefound', trackInstalling);
      document.removeEventListener('visibilitychange', checkForUpdate);
      window.removeEventListener('online', checkForUpdate);
      observed.forEach((handler, worker) => worker.removeEventListener('statechange', handler));
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
    };
  }, []);

  const install = useCallback(async () => {
    const event = prompt.current;
    if (!event || installing) return;
    prompt.current = null;
    setCanInstall(false);
    setInstalling(true);
    setInstallMessage('');
    try {
      await event.prompt();
      const choice = await event.userChoice;
      setInstallMessage(choice.outcome === 'accepted'
        ? 'Installation requested. Follow any remaining device instructions.'
        : 'Installation cancelled. You can install later from your browser menu.');
    } catch {
      setInstallMessage("Installation couldn't be opened. Use your browser's install option instead.");
    } finally { setInstalling(false); }
  }, [installing]);

  const update = useCallback(() => {
    if (updating || offline) return;
    if (needsReload) { window.location.reload(); return; }
    if (!waiting) return;
    requestedUpdate.current = true;
    setUpdating(true);
    setUpdateMessage('');
    waiting.postMessage({ type: 'SKIP_WAITING' });
    updateTimeout.current = setTimeout(() => {
      requestedUpdate.current = false;
      setUpdating(false);
      setUpdateMessage("The update hasn't finished. Reconnect and try again.");
    }, 10_000);
  }, [waiting, needsReload, updating, offline]);

  const updateAvailable = Boolean(waiting) || needsReload;
  const value = useMemo(() => ({ installed, canInstall, installing, installMessage, install, updateAvailable, updating, updateMessage, update, offline }),
    [installed, canInstall, installing, installMessage, install, updateAvailable, updating, updateMessage, update, offline]);

  return <PwaContext.Provider value={value}>
    {children}
    {offline ? <aside className={styles.notice} aria-label="Connection status">
      <p role="status">You&apos;re offline. Reconnect to send messages or change bookings.</p>
    </aside> : updateAvailable && !dismissed ? <aside className={`${styles.notice} ${styles.updateNotice}`} aria-label="ServiceHub update">
      <div className={styles.updateHeader}>
        <span className={styles.updateIcon} aria-hidden="true"><ArrowsClockwise size={21} weight="regular" /></span>
        <div className={styles.updateCopy} role="status" aria-atomic="true">
          <h2>{updating ? 'Updating ServiceHub' : 'ServiceHub update ready'}</h2>
          <p>{updating ? 'Applying the update. This page will reload.' : 'Save your work, then reload to get the latest version.'}</p>
        </div>
      </div>
      {updateMessage && <p className={styles.updateFeedback} role="status"><WarningCircle size={17} aria-hidden="true" /><span>{updateMessage}</span></p>}
      <div className={styles.updateActions}>
        <button className={styles.updateNow} type="button" onClick={update} disabled={updating} aria-busy={updating}>
          <ArrowClockwise size={17} className={updating ? styles.updatingIcon : undefined} aria-hidden="true" />
          {updating ? 'Updating…' : 'Update now'}
        </button>
        <button className={styles.updateLater} type="button" onClick={() => setDismissed(true)} disabled={updating}>Later</button>
      </div>
    </aside> : null}
  </PwaContext.Provider>;
}
