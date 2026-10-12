'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import WorkspaceDashboardPreview from './WorkspaceDashboardPreview';
import { BriefcaseBusiness, Maximize2, Search, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import ScrollReveal from './ScrollReveal';
import sectionStyles from './LandingRefinement.module.css';
import styles from './LandingWorkspaces.module.css';

const workspaces = {
  seeker: {
    label: 'Seeker',
    icon: Search,
    heading: 'Find help or post what you need.',
    description: 'Keep nearby services, incoming offers and your booking activity together in the Seeker workspace.',
    features: [
      'Browse nearby services',
      'Post requests and compare offers',
      'Follow bookings and confirm completion',
    ],
    tip: 'Choose your search location and radius to find services near you.',
  },
  provider: {
    label: 'Provider',
    icon: BriefcaseBusiness,
    heading: 'Offer services and manage your work.',
    description: 'Keep your service listings, Seeker requests and booking activity together in the Provider workspace.',
    features: [
      'Publish and manage service listings',
      'Browse Service Requests and send offers',
      'Track completed bookings and recorded earnings',
    ],
    tip: 'Update pricing, payment options and availability in Service Manager.',
  },
} as const;

type WorkspaceTab = keyof typeof workspaces;
const tabs: WorkspaceTab[] = ['seeker', 'provider'];

export default function LandingWorkspaces({ isDark }: { isDark: boolean }) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('seeker');
  const [isExpanded, setIsExpanded] = useState(false);
  const tabRefs = useRef<Partial<Record<WorkspaceTab, HTMLButtonElement | null>>>({});
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduce = useReducedMotion();
  const current = workspaces[activeTab];
  const CurrentIcon = current.icon;

  useEffect(() => {
    if (!isExpanded) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [isExpanded]);

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, tab: WorkspaceTab) {
    let next: WorkspaceTab;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      next = tabs[(tabs.indexOf(tab) + 1) % tabs.length];
    } else if (event.key === 'Home') {
      next = 'seeker';
    } else if (event.key === 'End') {
      next = 'provider';
    } else {
      return;
    }
    event.preventDefault();
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  }

  function openPreview(trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    dialogRef.current?.showModal();
    setIsExpanded(true);
    closeRef.current?.focus();
  }

  function closePreview() {
    dialogRef.current?.close();
    setIsExpanded(false);
    triggerRef.current?.focus();
  }

  return (
    <section id="workspaces" className={sectionStyles.section} data-theme={isDark ? 'dark' : 'light'} aria-labelledby="workspaces-heading">
      <div className={sectionStyles.container} data-landing-anchor>
        <ScrollReveal>
          <h2 id="workspaces-heading" className={sectionStyles.heading}>One resident account. Two focused workspaces.</h2>
          <p className={sectionStyles.intro}>Switch between finding help and offering your services. Your profile, verification and trust history stay with you.</p>
        </ScrollReveal>

        <div className={styles.tabs} role="tablist" aria-label="Workspace previews">
          {tabs.map((tab) => {
            const workspace = workspaces[tab];
            const Icon = workspace.icon;
            return (
              <button
                key={tab}
                ref={(element) => { tabRefs.current[tab] = element; }}
                type="button"
                role="tab"
                id={'workspace-tab-' + tab}
                aria-label={workspace.label + ' Workspace'}
                aria-selected={activeTab === tab}
                aria-controls={'workspace-panel-' + tab}
                tabIndex={activeTab === tab ? 0 : -1}
                data-role={tab}
                className={styles.tab}
                onClick={() => setActiveTab(tab)}
                onKeyDown={(event) => handleTabKeyDown(event, tab)}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{workspace.label}<span className={styles.tabSuffix}> Workspace</span></span>
              </button>
            );
          })}
        </div>

        {tabs.map((tab) => {
          const workspace = workspaces[tab];
          const Icon = workspace.icon;
          const isActive = activeTab === tab;
          return (
            <motion.div
              key={tab}
              id={'workspace-panel-' + tab}
              role="tabpanel"
              aria-labelledby={'workspace-tab-' + tab}
              hidden={!isActive}
              data-role={tab}
              className={styles.panel}
              initial={false}
              animate={isActive && !reduce ? { opacity: [0.8, 1], y: [4, 0] } : { opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.details}>
                <div className={styles.detailsIntro}>
                  <span className={styles.roleLabel}>{workspace.label} workspace</span>
                  <h3>{workspace.heading}</h3>
                  <p>{workspace.description}</p>
                </div>
                <div className={styles.detailsBody}>
                  <ul aria-label={workspace.label + ' workspace features'}>
                    {workspace.features.map(text => <li key={text}>{text}</li>)}
                  </ul>
                  <p className={styles.tip}>{workspace.tip}</p>
                </div>
              </div>

              <figure className={styles.preview}>
                <ContainerScroll
                  titleComponent={null}
                  className={styles.scrollContainer}
                  innerClassName={styles.perspective}
                  cardClassName={styles.tablet}
                  contentClassName={styles.tabletScreen}
                  offset={['start end', 'center center']}
                >
                  <div className={styles.previewHeader}>
                    <span><Icon size={15} aria-hidden="true" />{workspace.label} workspace</span>
                    <button type="button" className={styles.expand} onClick={(event) => openPreview(event.currentTarget)} aria-haspopup="dialog" aria-label={'Expand ' + workspace.label + ' dashboard preview'}>
                      <Maximize2 size={15} aria-hidden="true" /><span>Expand preview</span>
                    </button>
                  </div>
                  <div className={styles.screen}>
                    {activeTab === tab && <WorkspaceDashboardPreview role={tab} isDark={isDark} />}
                    <button type="button" className={styles.screenTrigger} onClick={event => openPreview(event.currentTarget)} aria-haspopup="dialog" aria-label={`View ${workspace.label} dashboard full size`} />
                  </div>
                </ContainerScroll>
                <figcaption>Current workspace UI with fictional sample data. Sign in to use your own workspace.</figcaption>
              </figure>
            </motion.div>
          );
        })}

      </div>

      <dialog
        ref={dialogRef}
        data-lenis-prevent
        className={styles.lightbox}
        data-role={activeTab}
        aria-labelledby="workspace-preview-title"
        onCancel={(event) => { event.preventDefault(); closePreview(); }}
        onClose={() => { setIsExpanded(false); triggerRef.current?.focus(); }}
        onClick={(event) => { if (event.target === event.currentTarget) closePreview(); }}
      >
        <div>
          <div className={styles.lightboxHeader}>
            <h3 id="workspace-preview-title"><CurrentIcon size={18} aria-hidden="true" />{current.label} workspace preview</h3>
            <button ref={closeRef} type="button" className={styles.close} onClick={closePreview} aria-label="Close dashboard preview"><X size={20} aria-hidden="true" /></button>
          </div>
          <div className={styles.imageViewport}>
            {isExpanded && <div className={styles.fullPreview}><WorkspaceDashboardPreview role={activeTab} isDark={isDark} /></div>}
          </div>
          <p className={styles.lightboxCaption}>Read-only example using the current workspace components. Scroll to inspect; sign in to use the controls.</p>
        </div>
      </dialog>
    </section>
  );
}
