"use client";

import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { useApiCacheRefresh } from '../../../hooks/useApiCacheRefresh';
import { useRefreshableLoad } from '../../../hooks/useRefreshableLoad';
import { invalidateApiCache } from '../../../lib/api/responseCache';
import { Archive, CheckCircle2, Loader2, Megaphone, RefreshCw, Send } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  apiCreateAnnouncement,
  apiListAnnouncements,
  apiUpdateAnnouncement,
} from '../../../api/admin.api';
import { getApiErrorMessage } from '../../../lib/api/errors';
import AdminPagination from '../../../components/admin/AdminPagination';
import WorkspacePageSkeleton from '../../../components/ui/WorkspacePageSkeleton';

const PAGE_SIZE = 8;

interface AdminAnnouncement {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: { id: string; name: string };
}

export default function AdminAnnouncementsPage() {
  const { isDark } = useApp();
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);
  const { loading, beginLoad } = useRefreshableLoad(String(page));
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadAnnouncements = useCallback(async () => {
    const request = beginLoad();
    let succeeded = false;
    try {
      const response = await apiListAnnouncements({ page, limit: PAGE_SIZE });
      if (!request.current()) return;
      if (!response.success || !Array.isArray(response.data)) throw new Error('Unable to load announcements.');
      setAnnouncements(response.data);
      setTotal(response.pagination?.total || 0);
      setTotalPages(Math.max(1, response.pagination?.totalPages || 1));
      setError('');
      succeeded = true;
    } catch (err: unknown) {
      if (request.current()) setError(getApiErrorMessage(err, 'Unable to load announcements.'));
    } finally {
      request.finish(succeeded);
    }
  }, [page, beginLoad]);

  useApiCacheRefresh(['admin'], () => loadAnnouncements());
  useEffect(() => {
    const timer = window.setTimeout(() => void loadAnnouncements(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAnnouncements]);

  const submitAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (cleanTitle.length < 5 || cleanBody.length < 10) {
      setError('Enter a clear title and an announcement of at least 10 characters.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');
    try {
      await apiCreateAnnouncement({ title: cleanTitle, body: cleanBody, isPublished: true });
      setTitle('');
      setBody('');
      setNotice('Announcement published to the Community Hub.');
      if (page === 1) await loadAnnouncements();
      else setPage(1);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to publish the announcement.'));
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (item: AdminAnnouncement) => {
    setUpdatingId(item.id);
    setError('');
    setNotice('');
    try {
      await apiUpdateAnnouncement(item.id, { isPublished: !item.isPublished });
      setNotice(item.isPublished ? 'Announcement archived.' : 'Announcement republished.');
      await loadAnnouncements();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to update the announcement.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const card = isDark
    ? 'bg-charcoal-surface border-neutral-800/80 text-white'
    : 'bg-white border-slate-200 text-ink';
  const input = isDark
    ? 'bg-charcoal border-neutral-700 text-white placeholder:text-ink-muted'
    : 'bg-white border-slate-300 text-ink placeholder:text-ink-subtle';

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
        <div className="flex items-start gap-3 mb-5">
          <div className="rounded-xl bg-[var(--admin-soft)] p-2.5 text-[var(--admin-accent)]">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold">Publish an official announcement</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
              Keep notices concise and relevant to ServiceHub operations. Published items appear immediately in both user workspaces.
            </p>
          </div>
        </div>

        <form onSubmit={submitAnnouncement} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="Example: Scheduled maintenance notice"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-border)] ${input}`}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">Announcement</label>
              <span className={`text-[10px] ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>{body.length}/1500</span>
            </div>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={1500}
              rows={4}
              placeholder="State what residents need to know, when it applies, and any action they should take."
              className={`w-full resize-y rounded-xl border px-3.5 py-3 text-sm leading-relaxed outline-none focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-border)] ${input}`}
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-solid)] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[var(--admin-solid-hover)] disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{saving ? 'Publishing…' : 'Publish announcement'}</span>
            </button>
          </div>
        </form>
      </div>

      {(error || notice) && (
        <div className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
          error
            ? (isDark ? 'bg-red-950/20 border-red-900/40 text-red-400' : 'bg-red-50 border-red-200 text-red-700')
            : (isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
        }`}>
          {error || notice}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-ink'}`}>Announcement history</h3>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>Published and archived administration notices.</p>
          </div>
          <button
            onClick={() => { invalidateApiCache(['admin']); void loadAnnouncements(); }}
            disabled={loading}
            className={`p-2 rounded-lg border cursor-pointer ${isDark ? 'border-neutral-800 hover:bg-charcoal' : 'border-slate-200 hover:bg-slate-50'}`}
            title="Refresh announcements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <WorkspacePageSkeleton label="Loading announcements" role="admin" variant="announcements" />
        ) : announcements.length === 0 ? (
          <div className={`rounded-2xl border p-8 text-center ${card}`}>
            <Megaphone className="w-8 h-8 mx-auto text-ink-subtle mb-3" />
            <p className="text-sm font-bold">No announcements have been created.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((item) => (
              <article key={item.id} className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] uppercase tracking-wide font-extrabold px-2 py-0.5 rounded-full border ${
                        item.isPublished
                          ? (isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                          : (isDark ? 'bg-charcoal border-neutral-700 text-ink-subtle' : 'bg-slate-100 border-slate-200 text-ink-muted')
                      }`}>
                        {item.isPublished ? 'Published' : 'Archived'}
                      </span>
                      <span className={`text-[10px] ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold">{item.title}</h4>
                    <p className={`text-xs leading-relaxed mt-1.5 whitespace-pre-wrap ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>{item.body}</p>
                    <p className={`text-[10px] mt-3 ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>Authored by {item.author?.name || 'Administrator'}</p>
                  </div>
                  <button
                    onClick={() => togglePublished(item)}
                    disabled={updatingId === item.id}
                    className={`shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-60 ${
                      isDark ? 'border-neutral-700 hover:bg-charcoal' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {updatingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : item.isPublished ? (
                      <Archive className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>{item.isPublished ? 'Archive' : 'Republish'}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemLabel="announcements"
      />
    </div>
  );
}
