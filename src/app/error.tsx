'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowClockwise, House, WarningOctagon } from '@phosphor-icons/react';
import SystemState from '@/components/ui/SystemState';

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') console.error(error);
  }, [error]);

  return (
    <SystemState
      code="500"
      tone="danger"
      role="alert"
      icon={<WarningOctagon size={28} weight="duotone" />}
      title="This page could not load"
      description="We could not finish loading this part of ServiceHub. Try the page again, or return home without changing your account data."
      actions={
        <>
          <button type="button" onClick={retry} className="system-state-primary-action">
            <ArrowClockwise size={17} weight="bold" aria-hidden="true" />
            Try again
          </button>
          <Link href="/" className="system-state-secondary-action">
            <House size={17} weight="bold" aria-hidden="true" />
            Return home
          </Link>
        </>
      }
      detail={error.digest ? <p>Reference: <span className="tabular-nums">{error.digest}</span></p> : undefined}
    />
  );
}
