'use client';

import { useEffect } from 'react';
import { ArrowClockwise, WarningOctagon } from '@phosphor-icons/react';
import SystemState from '@/components/ui/SystemState';
import './globals.css';

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t==='dark'?'dark':'light'}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans">
        <SystemState
          code="500"
          tone="danger"
          role="alert"
          icon={<WarningOctagon size={28} weight="duotone" />}
          title="ServiceHub could not open"
          description="A system error prevented the application from opening correctly. Reload the experience and your saved account data will remain unchanged."
          actions={
            <button type="button" onClick={retry} className="system-state-primary-action">
              <ArrowClockwise size={17} weight="bold" aria-hidden="true" />
              Reload ServiceHub
            </button>
          }
          detail={error.digest ? <p>Reference: <span className="tabular-nums">{error.digest}</span></p> : undefined}
        />
      </body>
    </html>
  );
}
