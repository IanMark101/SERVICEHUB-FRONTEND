'use client';

import Link from 'next/link';
import { DownloadSimple } from '@phosphor-icons/react';
import SystemState from '@/components/ui/SystemState';
import { usePwa } from './PwaProvider';
import styles from './Pwa.module.css';

export default function InstallPage() {
  const { installed, canInstall, installing, installMessage, install, updateAvailable, updating, updateMessage, update, offline } = usePwa();
  return <SystemState
    prefetchLinks={false}
    code="APP"
    title={installed ? 'ServiceHub is ready on your device.' : 'Keep ServiceHub a tap away.'}
    description="Install ServiceHub for home-screen access to both your Customer and Provider workspaces."
    icon={<DownloadSimple size={30} aria-hidden="true" />}
    actions={<>
      {!installed && canInstall && <button type="button" className="system-state-primary-action" onClick={() => void install()} disabled={installing} aria-busy={installing}>
        {installing ? 'Opening installation…' : 'Install ServiceHub'}
      </button>}
      <Link href="/dashboard" prefetch={false} className={installed ? 'system-state-primary-action' : 'system-state-secondary-action'}>Open ServiceHub</Link>
      {updateAvailable && <button type="button" className="system-state-secondary-action" onClick={update} disabled={updating || offline}>
        {updating ? 'Updating…' : 'Update ServiceHub'}
      </button>}
    </>}
    detail={<div className={styles.guide}>
      {installMessage && <p role="status">{installMessage}</p>}
      {updateMessage && <p role="status">{updateMessage}</p>}
      {updateAvailable && <p>Save your current work before updating. The app will reload.</p>}
      {!installed && <>
        <div><h2>On iPhone or iPad</h2><ol>
          <li>Open ServiceHub in Safari and open the Share menu.</li>
          <li>Choose <strong>Add to Home Screen</strong>. You may need to open More to find it.</li>
          <li>If shown, keep <strong>Open as Web App</strong> enabled, then tap <strong>Add</strong>.</li>
        </ol></div>
        <div><h2>On Android or a computer</h2><p>Use <strong>Install ServiceHub</strong> above when available. Otherwise, look in your browser menu or address bar for <strong>Install app</strong> or <strong>Add to Home screen</strong>. Available options depend on your browser.</p></div>
      </>}
      <p>Booking, payments, messages and current availability need an internet connection. If the connection drops, ServiceHub shows an offline screen and does not submit changes in the background.</p>
    </div>}
  />;
}
