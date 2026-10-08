import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGetRequestRepostTemplate, type RequestRepostTemplate } from '../../api/requests.api';
import { getApiErrorMessage } from '../../lib/api/errors';
import PostRequest from './PostRequest';

export default function RepostRequestForm({ requestId }: { requestId: string }) {
  const [template, setTemplate] = useState<RequestRepostTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    apiGetRequestRepostTemplate(requestId)
      .then(response => {
        if (!response.success || !response.data) throw new Error('Request details could not be loaded.');
        if (active) setTemplate(response.data);
      })
      .catch(error => { if (active) setError(getApiErrorMessage(error, 'Request details could not be loaded. Try again.')); });
    return () => { active = false; };
  }, [requestId, attempt]);

  if (template) return <PostRequest initialTemplate={template} />;
  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] p-6 text-[color:var(--workspace-ink)] sm:p-8">
      <h2 className="text-lg font-bold">Repost a request</h2>
      {error ? <div role="alert" className="mt-4 space-y-4">
        <p className="text-sm leading-6">{error}</p>
        <button type="button" onClick={() => { setError(null); setAttempt(value => value + 1); }} className="min-h-11 rounded-xl bg-orange-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">Try again</button>
      </div> : <p role="status" className="mt-4 text-sm text-[color:var(--workspace-muted)]">Loading your previous request details…</p>}
      <Link href="/seeker/request-manager" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">Return to Request Manager</Link>
    </div>
  );
}
