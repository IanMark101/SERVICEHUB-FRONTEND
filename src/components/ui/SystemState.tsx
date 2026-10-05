import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type SystemStateTone = 'neutral' | 'seeker' | 'provider' | 'warning' | 'danger';

interface SystemStateProps {
  code?: string;
  title: string;
  description: string;
  icon: ReactNode;
  actions: ReactNode;
  detail?: ReactNode;
  tone?: SystemStateTone;
  role?: 'alert' | 'status';
}

export default function SystemState({
  code,
  title,
  description,
  icon,
  actions,
  detail,
  tone = 'neutral',
  role = 'status',
}: SystemStateProps) {
  return (
    <main className="system-state-page" data-tone={tone}>
      <header className="system-state-header">
        <Link href="/" className="system-state-brand" aria-label="ServiceHub Cordova home">
          <Image src="/logo.svg?v=6" alt="" width={34} height={34} priority />
          <span>
            <strong>ServiceHub</strong>
            <small>Cordova</small>
          </span>
        </Link>
        <Link href="/help" className="system-state-help-link">
          Help center
        </Link>
      </header>

      <section
        className="system-state-layout"
        role={role}
        aria-labelledby="system-state-title"
        aria-describedby="system-state-description"
      >
        <div className="system-state-content">
          <div className="system-state-content-main">
            <div className="system-state-status" aria-hidden="true">
              <span className="system-state-icon">{icon}</span>
              <span className="system-state-code">{code || '!'}</span>
            </div>

            <div className="system-state-copy">
              <h1 id="system-state-title">{title}</h1>
              <p id="system-state-description">{description}</p>
            </div>
            <div className="system-state-actions">{actions}</div>
          </div>

          {detail && <div className="system-state-detail">{detail}</div>}
        </div>

      </section>
    </main>
  );
}
