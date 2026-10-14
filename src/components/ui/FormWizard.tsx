'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import styles from './FormWizard.module.css';

export function FormWizardProgress({ steps, currentStep, workspace = 'seeker' }: { steps: readonly string[]; currentStep: number; workspace?: 'seeker' | 'provider' }) {
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(currentStep);
  const progress = Math.round(currentStep / (steps.length - 1) * 100);

  useEffect(() => {
    if (previous.current === currentStep) return;
    previous.current = currentStep;
    const panel = root.current?.closest('form')?.querySelector<HTMLElement>(`[data-wizard-step="${currentStep}"]`);
    panel?.focus({ preventScroll: true });
    const scrollBody = panel?.closest<HTMLElement>('[data-wizard-scroll]');
    if (scrollBody) scrollBody.scrollTop = 0;
    else root.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' });
  }, [currentStep]);

  return <div ref={root} className={styles.progress} data-workspace={workspace}>
    <div className={styles.caption}>
      <p aria-live="polite" aria-atomic="true">Step {currentStep + 1} of {steps.length} <span>· {steps[currentStep]}</span></p>
      <span className={styles.percentage} aria-hidden="true">{progress}%</span>
    </div>
    <div role="progressbar" aria-label="Form progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}
      aria-valuetext={`Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep]}`} className={styles.track}>
      <span className={styles.fill} style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
    <ol className={styles.steps} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((label, index) => <li key={label} aria-current={index === currentStep ? 'step' : undefined} data-complete={index < currentStep}>
        <span className={styles.marker} aria-hidden="true">{index < currentStep ? <Check size={14} /> : index + 1}</span>
        <span>{label}<span className={styles.srOnly}>{index < currentStep ? ', completed' : index === currentStep ? ', current step' : ', upcoming'}</span></span>
      </li>)}
    </ol>
  </div>;
}

// Keep fields, map selection and photo uploads mounted when a step is hidden.
export function WizardStep({ index, currentStep, label, children }: { index: number; currentStep: number; label: string; children: ReactNode }) {
  return <div hidden={index !== currentStep} data-wizard-step={index} tabIndex={-1} role="group" aria-label={label} className={styles.step}>{children}</div>;
}

export function WizardReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return <section className={styles.reviewSection}>
    <div className={styles.reviewHeading}><h4>{title}</h4><button type="button" onClick={onEdit} aria-label={`Edit ${title.toLowerCase()}`}>Edit</button></div>
    {children}
  </section>;
}
