'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowCounterClockwise, Check, Play, Receipt } from '@phosphor-icons/react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import ActivityDetailLayout, { ActivityDetailActions } from '../activity/ActivityDetailLayout';
import ActivityWorkroomSituation from '../activity/ActivityWorkroomSituation';
import type { JobEngagement } from '@/types';
import ScrollReveal from './ScrollReveal';
import styles from './LandingBookingProgress.module.css';

const desktopQuery = '(min-width: 1024px)';
const cardTransition = { opacity: [0.82, 1], y: [4, 0] };
const transitionEase = [0.16, 1, 0.3, 1] as const;
const cardVariants = {
  provider_queued: cardTransition, provider_in_progress: cardTransition,
  provider_awaiting_seeker_approval: cardTransition, seeker_awaiting_seeker_approval: cardTransition,
  provider_completed: cardTransition,
  reduced: { opacity: 1, y: 0 },
};

const stages = [
  { title: 'Ready when it is your turn.', description: 'A confirmed GCash Test Mode booking reaches the front of the Provider\'s paid queue. Start Job becomes available when no other service is active.', role: 'provider', label: 'Ready to start', status: 'queued', action: 'Start Job' },
  { title: 'The service is underway.', description: 'The Provider starts the service. Activity shows that work is in progress, with the same booking available to both members.', role: 'provider', label: 'In progress', status: 'in_progress', action: 'Mark Work Finished' },
  { title: 'Finished, awaiting a response.', description: 'The Provider marks the work finished. Their booking card changes to waiting on the Seeker; submission alone does not complete the booking.', role: 'provider', label: 'Work submitted', status: 'awaiting_seeker_approval', action: null },
  { title: 'Finished work. Your confirmation.', description: 'Mark Work Finished sends the result to the Seeker. The booking stays open until the Seeker confirms the work or reports an issue.', role: 'seeker', label: 'Awaiting confirmation', status: 'awaiting_seeker_approval', action: 'Confirm Completion' },
  { title: 'Confirmed, then recorded.', description: 'Seeker confirmation completes the booking. Both members can find it in History and leave a review; the Provider can check its payment record.', role: 'provider', label: 'Completed', status: 'completed', action: null },
] as const;

// Deliberately isolated example data. No account, API, payment or socket hooks.
const exampleBooking: JobEngagement = {
  id: 'landing-example-booking', title: 'Aircon cleaning', category: 'Aircon Service',
  seekerId: 'example-seeker', seekerName: 'Alex Reyes', seekerAvatar: '',
  providerId: 'example-provider', providerName: 'Sam Rivera', providerAvatar: '',
  serviceId: 'example-service', price: 800, status: 'queued',
  paymentMethod: 'GCash', paymentStatus: 'PAID_HELD',
  queueStatus: 'WAITING', queuePaymentStatus: 'PAID_HELD', queuePosition: 1,
  createdAt: '2026-01-01T00:00:00.000Z', started: false,
};

const BookingPreview = memo(function BookingPreview({ stageIndex, isDark, onAdvance }: {
  stageIndex: number; isDark: boolean; onAdvance: (index: number) => void;
}) {
  const stage = stages[stageIndex];
  const booking: JobEngagement = {
    ...exampleBooking, status: stage.status, started: stageIndex > 0,
    bookingStatus: ['WAITING', 'ONGOING', 'AWAITING_CONFIRMATION', 'AWAITING_CONFIRMATION', 'COMPLETED'][stageIndex],
    queueStatus: stageIndex === 0 ? 'WAITING' : stageIndex === 1 ? 'SERVING' : 'DONE',
    queuePosition: stageIndex === 0 ? 1 : undefined,
    paymentStatus: stage.status === 'completed' ? 'RELEASED' : 'PAID_HELD',
  };
  const participant = stage.role === 'provider' ? booking.seekerName : booking.providerName;

  return (
    <div className={styles.previewBody} data-preview-status={stage.status}>
      <ActivityDetailLayout id="landing-booking-card" role={stage.role} isDark={isDark}
        title={booking.title} category={booking.category!} date="Example booking"
        closed={stage.status === 'completed'} participant={{ name: participant }} facts={null}>
        <ActivityWorkroomSituation booking={booking} role={stage.role}
          currentUserId={stage.role === 'provider' ? booking.providerId : booking.seekerId} />
        {stage.action && <ActivityDetailActions title="Try this step in the demo">
          <button type="button" className={styles.action} onClick={() => onAdvance(stageIndex + 1)}
            aria-label={`Preview ${stage.action}`}>
            {stageIndex === 0 ? <Play size={16} weight="fill" aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
            {stage.action}
          </button>
          {stage.role === 'seeker' && <Link href="/help/safety/reporting-users-and-disputes" className={styles.issueLink}>
            What if there is an issue? <ArrowRight size={15} aria-hidden="true" />
          </Link>}
        </ActivityDetailActions>}
        {stage.status === 'completed' && <div className={styles.recordNote}>
          <Receipt size={19} aria-hidden="true" />
          <p>Saved in booking History. Payment Records tracks this completed service.</p>
        </div>}
      </ActivityDetailLayout>
    </div>
  );
});

export default function LandingBookingProgress({ isDark }: { isDark: boolean }) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const focusPreview = useRef(false);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const desktop = useRef(false);
  const active = useRef(0);
  const stageStarts = useRef(stages.map((_, index) => index / stages.length));
  const [stageIndex, setStageIndex] = useState(0);
  const [previewHeight, setPreviewHeight] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start center', 'end center'] });

  const updateStage = useCallback((progress: number) => {
    if (!desktop.current) return;
    let index = 0;
    // Match the real row positions, including the final sticky hold space.
    for (let next = 1; next < stages.length; next++) {
      if (progress < stageStarts.current[next]) break;
      index = next;
    }
    // Only rerender at stage boundaries, never for continuous scroll values.
    if (active.current !== index) { active.current = index; setStageIndex(index); }
  }, []);

  useEffect(() => {
    const media = window.matchMedia(desktopQuery);
    const measure = () => {
      const track = timelineRef.current;
      if (!track || !track.offsetHeight) return;
      const top = track.getBoundingClientRect().top;
      stageStarts.current = stepRefs.current.map((step) => step
        ? (step.getBoundingClientRect().top - top) / track.offsetHeight : 0);
      updateStage(scrollYProgress.get());
    };
    const update = () => { desktop.current = media.matches; measure(); };
    update();
    // Measure only on layout changes. The taller final step keeps completion
    // visible while the sticky card is still inside the timeline's bounds.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (timelineRef.current) observer?.observe(timelineRef.current);
    media.addEventListener('change', update);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      media.removeEventListener('change', update);
      window.removeEventListener('resize', measure);
    };
  }, [scrollYProgress, updateStage]);

  useMotionValueEvent(scrollYProgress, 'change', updateStage);

  const measurePreview = useCallback(() => {
    const height = previewContentRef.current?.getBoundingClientRect().height;
    if (height && height > 0) setPreviewHeight(height);
  }, []);

  useEffect(() => { measurePreview(); }, [measurePreview, stageIndex]);

  useEffect(() => {
    const content = previewContentRef.current;
    if (!content) return;
    // Animate the frame's height rather than scaling readable booking text.
    // Observe content, not the animated frame, to avoid a resize feedback loop.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measurePreview);
    observer?.observe(content);
    window.addEventListener('resize', measurePreview);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measurePreview);
    };
  }, [measurePreview]);

  const selectStage = useCallback((index: number) => {
    if (desktop.current) stepRefs.current[index]?.scrollIntoView({ block: 'center', behavior: 'instant' });
    active.current = index;
    setStageIndex(index);
  }, []);

  const advanceStage = useCallback((index: number) => {
    focusPreview.current = true;
    selectStage(index);
  }, [selectStage]);

  useEffect(() => {
    if (!focusPreview.current) return;
    previewRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus({ preventScroll: true });
    focusPreview.current = false;
  }, [stageIndex]);

  const stage = stages[stageIndex];
  return (
    <section id="booking-progress" data-theme={isDark ? 'dark' : 'light'} aria-labelledby="booking-progress-heading" className={styles.section}>
      <div className={styles.inner} data-landing-anchor>
        <ScrollReveal className={styles.heading}>
          <h2 id="booking-progress-heading">Every step, in the same booking.</h2>
          <p>From the Provider starting the service to the Seeker confirming the result. See how the booking changes along the way.</p>
        </ScrollReveal>
        <div className={styles.layout}>
          <div ref={timelineRef} className={styles.timelineTrack} data-booking-timeline>
            <div aria-hidden="true" className={styles.rail}>
              <motion.span style={{ scaleY: reduce ? stageIndex / (stages.length - 1) : scrollYProgress }} />
            </div>
            <ol className={styles.timeline} aria-label="Booking progress stages">
              {stages.map((item, index) => (
                <li key={`${item.role}-${item.status}`} ref={(element) => { stepRefs.current[index] = element; }}
                  data-active={index === stageIndex} data-passed={index < stageIndex} data-role={item.role}>
                  <button type="button" onClick={() => selectStage(index)} aria-current={index === stageIndex ? 'step' : undefined}
                    aria-controls="booking-progress-preview" aria-label={`Stage ${index + 1}: ${item.label}`}>
                    <span className={styles.number} aria-hidden="true">{index < stageIndex ? <Check size={17} weight="bold" /> : `0${index + 1}`}</span>
                    <span className={styles.stepContent}>
                      <span className={styles.role}>{item.role === 'provider' ? 'Provider' : 'Seeker'} <ArrowRight size={13} aria-hidden="true" /> {item.label}</span>
                      <span className={styles.stepTitle}>{item.title}</span>
                      <span className={styles.description}>{item.description}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className={styles.previewColumn}>
            <div ref={previewRef} id="booking-progress-preview" className={styles.preview} data-role={stage.role}
              role="region" aria-label="Example booking preview">
              <div className={styles.previewHeader}>
                <span className={styles.workspace}><span aria-hidden="true" /> {stage.role === 'provider' ? 'Provider' : 'Seeker'} workspace <span className={styles.path}>/ Activity</span></span>
                <span className={styles.demoLabel}>Interactive demo</span>
              </div>
              <motion.div className={styles.previewViewport} initial={false}
                animate={previewHeight === null ? undefined : { height: previewHeight }}
                transition={{ duration: reduce ? 0 : 0.6, ease: transitionEase }}>
                <motion.div ref={previewContentRef} initial={false} variants={cardVariants}
                  animate={reduce ? 'reduced' : `${stage.role}_${stage.status}`}
                  transition={{ duration: reduce ? 0 : 0.6, ease: transitionEase }}>
                  <BookingPreview stageIndex={stageIndex} isDark={isDark} onAdvance={advanceStage} />
                </motion.div>
              </motion.div>
              <div className={styles.previewFooter}>
                <p>Sample booking. No real payments or booking changes.</p>
                {stageIndex === 2 && <button type="button" onClick={() => advanceStage(3)}><span>See Seeker confirmation</span><ArrowRight size={16} aria-hidden="true" /></button>}
                {stage.status === 'completed' && <button type="button" onClick={() => advanceStage(0)} aria-label="Restart booking demo"><ArrowCounterClockwise size={16} aria-hidden="true" /> Restart</button>}
              </div>
              <p className="sr-only" aria-live="polite" aria-atomic="true">Stage {stageIndex + 1} of {stages.length}: {stage.label}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
