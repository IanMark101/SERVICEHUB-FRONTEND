'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageSquareText } from 'lucide-react';
import { apiGetProviderSummary, apiGetSeekerSummary, getCachedProviderSummary, getCachedSeekerSummary, type ProviderSummaryPayload } from '../../api/ai.api';

interface Props {
  subjectId: string;
  context: 'provider' | 'seeker';
  serviceId?: string;
  isDark?: boolean;
}

// A different subject remounts the loader, preventing previous-account feedback
// from flashing while the new request is pending.
export default function ReviewSummaryPanel(props: Props) {
  return <SummaryContent key={`${props.context}:${props.subjectId}:${props.serviceId ?? ''}`} {...props} />;
}

function SummaryContent({ subjectId, context, serviceId, isDark = false }: Props) {
  const cached = context === 'provider' ? getCachedProviderSummary(subjectId, serviceId)?.data : getCachedSeekerSummary(subjectId)?.data;
  const [data, setData] = useState<ProviderSummaryPayload | undefined>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = (waitForFresh = false) => context === 'provider'
      ? apiGetProviderSummary(subjectId, serviceId, { force: waitForFresh || attempt > 0, waitForFresh })
      : apiGetSeekerSummary(subjectId, { force: waitForFresh || attempt > 0, waitForFresh });
    void load().then(response => {
      if (!active) return;
      if (!response.success) throw new Error('Review summary unavailable');
      setData(response.data);
      if (response.data.refreshing) {
        timer = setTimeout(() => {
          void load(true).then(fresh => {
            if (active && fresh.success) setData(fresh.data);
          }).catch(() => { /* Keep the verified calculated facts if AI refinement fails. */ });
        }, 1800);
      }
    }).catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [subjectId, context, serviceId, attempt]);

  const title = `${context === 'provider' ? 'Provider' : 'Client'} feedback digest`;
  const tone = context === 'provider'
    ? isDark ? 'border-orange-900/30 bg-orange-950/10 text-orange-200' : 'border-orange-100 bg-orange-50/50 text-orange-950'
    : isDark ? 'border-emerald-900/30 bg-emerald-950/10 text-emerald-200' : 'border-emerald-100 bg-emerald-50/50 text-emerald-950';
  return (
    <section aria-label={title} aria-live="polite" aria-busy={loading} className={`rounded-xl border p-4 text-xs leading-relaxed break-words ${tone}`}>
      <h4 className="mb-1.5 flex items-center gap-2 font-bold text-sm"><MessageSquareText className="h-4 w-4 shrink-0" aria-hidden="true" />{title}</h4>
      {loading ? <p className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />Loading completed-booking reviews…</p>
        : error ? <div><p>Could not load reviews. You can continue with your {context === 'provider' ? 'booking' : 'offer'}.</p><button type="button" onClick={() => { setError(false); setLoading(true); setAttempt(n => n + 1); }} className="mt-2 rounded underline underline-offset-4 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4">Retry review summary</button></div>
        : data?.summary ? <><p>{data.summary}</p><p className="mt-2 text-[11px]">{data.source === 'gemini' ? 'AI-assisted selection of original review excerpts.' : 'Calculated from review ratings and tags.'} {context === 'provider' ? 'Across all services.' : 'Feedback received as a client.'} Up to 20 latest visible reviews from completed bookings.</p></>
        : <p>{data?.reason || (context === 'provider' ? 'No client reviews from completed bookings yet.' : 'No provider reviews of this client from completed bookings yet.')}</p>}
    </section>
  );
}
