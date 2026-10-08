'use client';

import { useId, useState, type ReactNode } from 'react';
import styles from './inspection-layout.module.css';

export { styles as inspectionStyles };

export function InspectionTabs({ tabs, value, onChange, label = 'Case sections' }: {
  tabs: { id: string; label: string }[]; value: string; onChange: (value: string) => void; label?: string;
}) {
  return <nav className={styles.tabs} aria-label={label}>{tabs.map(tab => <button type="button" key={tab.id}
    aria-current={value === tab.id ? 'page' : undefined} onClick={() => onChange(tab.id)}>{tab.label}</button>)}</nav>;
}

export function InspectionPanel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return <section className={`${styles.panel} ${className}`}><h3>{title}</h3>{children}</section>;
}

export function InspectionFacts({ facts }: { facts: { label: string; value: ReactNode }[] }) {
  return <dl className={styles.facts}>{facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>;
}

export function InspectionText({ text, label = 'explanation' }: { text: string; label?: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const long = text.length > 480;
  return <div className={styles.textBlock}><p id={id} className={styles.prose}>{long && !expanded ? `${text.slice(0, 480).trimEnd()}…` : text || 'No written explanation was provided.'}</p>
    {long && <button type="button" className={styles.textToggle} aria-expanded={expanded} aria-controls={id}
      onClick={() => setExpanded(value => !value)}>{expanded ? `Show less ${label}` : `Read full ${label}`}</button>}</div>;
}
