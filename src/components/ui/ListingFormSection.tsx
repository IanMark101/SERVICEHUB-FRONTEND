import type { ReactNode } from 'react';
import styles from './ListingForm.module.css';

export default function ListingFormSection({ number, title, description, children }: {
  number: number; title: string; description: string; children: ReactNode;
}) {
  return <section className={styles.section}>
    <div className={styles.sectionHeading}>
      <span className={styles.sectionNumber} aria-hidden="true">{number}</span>
      <div><h3>{title}</h3><p>{description}</p></div>
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </section>;
}
