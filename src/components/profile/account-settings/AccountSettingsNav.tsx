'use client';

import { useEffect, useRef, useState } from 'react';
import { User, Edit3, ShieldCheck, Lock, Sun, Shield } from 'lucide-react';

const sections = [
  { id: 'account-identity', label: 'Account', Icon: User },
  { id: 'contact-information', label: 'Profile', Icon: Edit3 },
  { id: 'verification', label: 'Verification', Icon: ShieldCheck, memberOnly: true },
  { id: 'password-security', label: 'Security', Icon: Lock },
  { id: 'appearance', label: 'Appearance', Icon: Sun },
  { id: 'trust-safety', label: 'Trust & safety', Icon: Shield, memberOnly: true },
];

export default function AccountSettingsNav({ isAdmin }: { isAdmin: boolean }) {
  const navRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState('account-identity');

  useEffect(() => {
    const layout = navRef.current?.closest('.account-settings-layout');
    const targets = sections.filter(section => !isAdmin || !section.memberOnly)
      .map(section => layout?.querySelector<HTMLElement>(`#${section.id}`))
      .filter((target): target is HTMLElement => Boolean(target));
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = document.querySelector('.profile-account-header');
      const clearance = Math.max((header?.getBoundingClientRect().bottom ?? 68) + 24,
        Number.parseFloat(getComputedStyle(targets[0]).scrollMarginTop) + 8);
      let current = targets[0]?.id ?? 'account-identity';
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= clearance) current = target.id;
      }
      setActiveSection(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    if (!targets.length) return;
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, [isAdmin]);

  return <nav ref={navRef} className="workspace-section-nav account-settings-nav" aria-label="Account settings sections">
    <h3 className="account-settings-nav__title">Settings</h3>
    {sections.filter(section => !isAdmin || !section.memberOnly).map(({ id, label, Icon }) =>
      <a key={id} href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined}>
        <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
        <span>{label}</span>
      </a>)}
  </nav>;
}
