"use client";

import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { Archive, CheckCircle2, Loader2, Megaphone, RefreshCw, Send } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  apiCreateAnnouncement,
  apiListAnnouncements,
  apiUpdateAnnouncement,
} from '../../../api/admin.api';
import { getApiErrorMessage } from '../../../lib/api/errors';
import AdminPagination from '../../../components/admin/AdminPagination';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiListAnnouncements({ page, limit: PAGE_SIZE });
      setAnnouncements(response.success && Array.isArray(response.data) ? response.data : []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(Math.max(1, response.pagination?.totalPages || 1));
      setError('');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to load announcements.'));
    } finally {
      setLoading(false);
    }
  }, [page]);

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
    ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]'
    : 'bg-white border-slate-200 text-slate-900';
  const input = isDark
    ? 'bg-[#191919] border-neutral-700 text-[#f2efe9] placeholder:text-neutral-600'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
        <div className="flex items-start gap-3 mb-5">
          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-violet-950/30 text-violet-400' : 'bg-violet-50 text-violet-700'}`}>
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold">Publish an official announcement</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
              Keep notices concise and relevant to ServiceHub Cordova operations. Published items appear immediately in both user workspaces.
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
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${input}`}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide">Announcement</label>
              <span className={`text-[10px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>{body.length}/1500</span>
            </div>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={1500}
              rows={4}
              placeholder="State what residents need to know, when it applies, and any action they should take."
              className={`w-full resize-y rounded-xl border px-3.5 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${input}`}
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
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
            <h3 className={`text-sm font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>Announcement history</h3>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>Published and archived administration notices.</p>
          </div>
          <button
            onClick={loadAnnouncements}
            disabled={loading}
            className={`p-2 rounded-lg border cursor-pointer ${isDark ? 'border-neutral-800 hover:bg-neutral-800' : 'border-slate-200 hover:bg-slate-50'}`}
            title="Refresh announcements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
        ) : announcements.length === 0 ? (
          <div className={`rounded-2xl border p-8 text-center ${card}`}>
            <Megaphone className="w-8 h-8 mx-auto text-slate-400 mb-3" />
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
                          : (isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-slate-100 border-slate-200 text-slate-600')
                      }`}>
                        {item.isPublished ? 'Published' : 'Archived'}
                      </span>
                      <span className={`text-[10px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold">{item.title}</h4>
                    <p className={`text-xs leading-relaxed mt-1.5 whitespace-pre-wrap ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>{item.body}</p>
                    <p className={`text-[10px] mt-3 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Authored by {item.author?.name || 'Administrator'}</p>
                  </div>
                  <button
                    onClick={() => togglePublished(item)}
                    disabled={updatingId === item.id}
                    className={`shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-60 ${
                      isDark ? 'border-neutral-700 hover:bg-neutral-800' : 'border-slate-200 hover:bg-slate-50'
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
