'use client';

import { useId } from 'react';
import { MapPin, House, ArrowsLeftRight, Monitor } from '@phosphor-icons/react';
import type { ServiceLocationMode } from '../../lib/serviceArrangement';
import styles from './ServiceArrangementField.module.css';

const choices: Record<'seeker' | 'provider', Record<ServiceLocationMode, { title: string; description: string }>> = {
  seeker: {
    PROVIDER_VISITS: { title: 'The provider comes to you', description: 'The work happens at the place you choose.' },
    SEEKER_VISITS: { title: 'You go to the provider', description: 'The work happens at the provider’s shop or chosen location.' },
    BOTH: { title: 'Either option', description: 'Providers can offer either option.' },
    REMOTE: { title: 'Online / remote', description: 'Work online without meeting or travelling. Coordinate through Messages and Activity.' },
  },
  provider: {
    PROVIDER_VISITS: { title: 'You go to the seeker', description: 'You work at the place the seeker chooses.' },
    SEEKER_VISITS: { title: 'The seeker comes to you', description: 'You work at your shop or chosen location.' },
    BOTH: { title: 'Either option', description: 'Offer both. Choose one for each booking.' },
    REMOTE: { title: 'Online / remote', description: 'Deliver the work online. Neither person needs to travel.' },
  },
};
const icons = { PROVIDER_VISITS: MapPin, SEEKER_VISITS: House, BOTH: ArrowsLeftRight, REMOTE: Monitor };

export default function ServiceArrangementField({ value, onChange, options = ['PROVIDER_VISITS', 'SEEKER_VISITS', 'BOTH', 'REMOTE'], disabled = false, label = 'How will the service be delivered?', layout = 'stacked', workspace = 'seeker' }: {
  value: ServiceLocationMode; onChange: (mode: ServiceLocationMode) => void;
  options?: ServiceLocationMode[]; disabled?: boolean; label?: string; layout?: 'stacked' | 'responsive'; workspace?: 'seeker' | 'provider';
}) {
  const id = useId();
  return <fieldset className={styles.fieldset} disabled={disabled}>
    <legend className={styles.legend}>{label}</legend>
    <div className={`${styles.choices} ${layout === 'responsive' ? styles.responsiveChoices : ''}`}>
      {options.map(mode => {
        const Icon = icons[mode];
        return <label key={mode} className={styles.choice} data-selected={value === mode}>
          <input type="radio" name={id} value={mode} checked={value === mode} onChange={() => onChange(mode)} />
          <Icon size={20} aria-hidden="true" />
          <span><strong>{choices[workspace][mode].title}</strong><small>{choices[workspace][mode].description}</small></span>
        </label>;
      })}
    </div>
  </fieldset>;
}
