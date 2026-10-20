import type { ReactNode } from 'react';
import styles from './ListingForm.module.css';

export default function ListingFormSection({ title, description, children }: {
  number: number; title: string; description?: string; children: ReactNode;
}) {
  return <section className={styles.section}>
    <div className={styles.sectionHeading}>
      <div><h3>{title}</h3>{description && <p>{description}</p>}</div>
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </section>;
}
