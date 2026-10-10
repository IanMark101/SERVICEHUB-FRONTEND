'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useApiCacheRefresh } from '@/hooks/useApiCacheRefresh';
import { useRefreshableLoad } from '@/hooks/useRefreshableLoad';
import useDialogFocus from '@/hooks/useDialogFocus';
import { apiDecideBanAppeal, apiListBanAppeals } from '@/api/admin.api';
import { invalidateApiCache } from '@/lib/api/responseCache';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/components/ui/Toast';
import BanAppealsView, { type AdminAppeal, type AppealSelection } from './BanAppealsView';

export type { AdminAppeal } from './BanAppealsView';

export default function AdminBanAppeals({ onDecision, initialView = 'pending', onViewChange }: { onDecision?: () => void; initialView?: 'pending' | 'history'; onViewChange?: (view: 'pending' | 'history') => void }) {
  const { success: toastSuccess } = useToast();
  const [appeals, setAppeals] = useState<AdminAppeal[]>([]);
  const [page, setPage] = useState(1);
  const [view, setView] = useState(initialView);
  const [status, setStatus] = useState<'' | 'APPROVED' | 'REJECTED'>('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { loading, beginLoad } = useRefreshableLoad(JSON.stringify([page, status, view]));
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<AppealSelection | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [decisionError, setDecisionError] = useState('');
  const generation = useRef(0);
  const invalidate = useCallback(() => { generation.current++; }, []);
  const load = useCallback(async () => {
    const current = ++generation.current;
    const request = beginLoad();
    let succeeded = false;
    try {
      const result = await apiListBanAppeals({ view, status: view === 'history' && status ? status : undefined, page, limit: 10 });
      if (current !== generation.current || !request.current()) return;
      setAppeals(result.data); setTotal(result.pagination?.total || 0);
      setTotalPages(Math.max(1, result.pagination?.totalPages || 1)); setError('');
      succeeded = true;
    } catch (cause) { if (current === generation.current && request.current()) setError(getApiErrorMessage(cause, 'Could not load ban appeals.')); }
    finally { if (current === generation.current) request.finish(succeeded); }
  }, [page, status, view, beginLoad]);
  useApiCacheRefresh(['admin'], load, !saving && !selected);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => { window.clearTimeout(timer); invalidate(); }; }, [load, invalidate]);
  const close = useCallback(() => { if (saving) return; setSelected(null); setReason(''); setDecisionError(''); }, [saving]);
  const dialogRef = useDialogFocus(Boolean(selected), saving, close, 'dialog');
  const decide = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !selected.decision || selected.appeal.status !== 'PENDING' || selected.appeal.user.moderationStatus !== 'BANNED' || reason.trim().length < 3 || saving) return;
    setSaving(true); setDecisionError('');
    try {
      await apiDecideBanAppeal(selected.appeal.id, selected.decision, reason.trim());
      toastSuccess('Appeal reviewed', selected.decision === 'APPROVED' ? 'Account restored. Normal verification requirements still apply.' : 'Account remains banned.');
      setSelected(null); setReason('');
      await load(); onDecision?.();
    } catch (cause) { setDecisionError(getApiErrorMessage(cause, 'Could not review this appeal. Reload the list if the account status has changed.')); }
    finally { setSaving(false); }
  };
  const changeView = (next: 'pending' | 'history') => { generation.current++; setView(next); setPage(1); setStatus(''); setError(''); onViewChange?.(next); };
  return <BanAppealsView appeals={appeals} view={view} status={status} page={page} total={total} totalPages={totalPages} loading={loading} error={error} selected={selected} reason={reason} saving={saving} decisionError={decisionError} dialogRef={dialogRef} load={() => { invalidateApiCache(['admin']); return load(); }} close={close} decide={decide} changeView={changeView} setStatus={setStatus} setPage={setPage} setSelected={setSelected} setReason={setReason} setDecisionError={setDecisionError} />;
}
