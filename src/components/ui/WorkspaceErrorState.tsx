'use client';

import { ArrowClockwise, WarningCircle } from '@phosphor-icons/react';

interface WorkspaceErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function WorkspaceErrorState({
  title,
  description,
  onRetry,
  retryLabel = 'Try again',
}: WorkspaceErrorStateProps) {
  return (
    <section className="workspace-error-state" role="alert" aria-labelledby="workspace-error-title">
      <span className="workspace-error-state__icon" aria-hidden="true">
        <WarningCircle size={24} weight="duotone" />
      </span>
      <div className="workspace-error-state__copy">
        <h2 id="workspace-error-title">{title}</h2>
        <p>{description}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="workspace-error-state__action">
          <ArrowClockwise size={15} weight="bold" aria-hidden="true" />
          <span>{retryLabel}</span>
        </button>
      )}
    </section>
  );
}
