'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import ProviderWorkloadPanel from './activity/ProviderWorkloadPanel';

export default function ProviderWorkQueue() {
  const { isDark, providerStartJob } = useApp();
  const router = useRouter();
  const [starting, setStarting] = useState<string | null>(null);
  const pending = useRef(false);
  const start = async (id: string) => {
    if (pending.current) return;
    pending.current = true;
    setStarting(id);
    try { await providerStartJob(id); }
    catch { /* The existing booking action presents its failure toast. */ }
    finally { pending.current = false; setStarting(null); }
  };
  return <div className="workspace-page">
    <ProviderWorkloadPanel isDark={isDark} startingBookingId={starting}
      onStart={id => { void start(id); }}
      onOpen={id => router.push(`/provider/provider-activity?tab=all&booking=${encodeURIComponent(id)}`)} />
  </div>;
}
