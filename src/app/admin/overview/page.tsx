"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useRouter } from 'next/navigation';
import { apiGetAdminOverview } from '../../../api/admin.api';
import { Users, Shield, Briefcase, AlertTriangle, HelpCircle, Loader2, RefreshCw, Activity, Database, Radio } from 'lucide-react';
import { getSocket } from '../../../lib/socket';
import AdminOverviewCharts, {
  type AdminActivityPoint,
  type AdminChartMetric,
} from '../../../components/admin/AdminOverviewCharts';

interface StatsData {
  totalUsers: number;
  activeServices: number;
  pendingVerifications: number;
  openReports: number;
  pendingListings: number;
  categorySuggestions: number;
  moderationWorkload: AdminChartMetric[];
  bookingLifecycle: AdminChartMetric[];
  sevenDayActivity: AdminActivityPoint[];
  recentAuditLogs: Array<{
    id: string;
    action: string;
    reason: string;
    createdAt: string;
    actor: { id: string; name: string };
    targetUser?: { id: string; name: string } | null;
  }>;
}

export default function AdminOverview() {
  const { isDark } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchStats = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    apiGetAdminOverview()
      .then(res => {
        if (res.success) {
          setStats(res.data);
          setError('');
        } else {
          setError("Failed to fetch dashboard overview metrics.");
        }
      })
      .catch(err => {
        setError(err.message || "An error occurred.");
      })
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => {
    const initialFetch = setTimeout(fetchStats, 0);
    const socket = getSocket();
    if (!socket) return () => clearTimeout(initialFetch);
    const refresh = () => fetchStats(true);
    socket.on('SERVICE_LISTING_SUBMITTED', refresh);
    socket.on('SERVICE_LISTINGS_CHANGED', refresh);
    socket.on('ADMIN_MODERATION_CHANGED', refresh);
    return () => {
      clearTimeout(initialFetch);
      socket.off('SERVICE_LISTING_SUBMITTED', refresh);
      socket.off('SERVICE_LISTINGS_CHANGED', refresh);
      socket.off('ADMIN_MODERATION_CHANGED', refresh);
    };
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 animate-spin text-slate-900 dark:text-neutral-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-2xl font-medium">
        Error: {error}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      desc: "All registered Seekers & Providers.",
      href: '/admin/users',
    },
    {
      title: "Live Marketplace Listings",
      value: stats?.activeServices ?? 0,
      icon: Briefcase,
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      desc: "Approved, available listings owned by eligible providers.",
      href: '/admin/services?status=LIVE',
    },
    {
      title: "Verification Queue",
      value: stats?.pendingVerifications || 0,
      icon: Shield,
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      desc: "Pending provider document submissions.",
      href: '/admin/verifications',
    },
    {
      title: "Open Reports & Disputes",
      value: stats?.openReports || 0,
      icon: AlertTriangle,
      color: "bg-red-500/10 text-red-500 border-red-500/20",
      desc: "Pending moderator arbitration cases.",
      href: '/admin/reports',
    },
    {
      title: "Suggested Categories",
      value: stats?.categorySuggestions || 0,
      icon: HelpCircle,
      color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
      desc: "New category requests from seekers.",
      href: '/admin/categories',
    },
    {
      title: "Pending Listings Review",
      value: stats?.pendingListings || 0,
      icon: Briefcase,
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      desc: "Services awaiting admin verification.",
      href: '/admin/services?status=PENDING_REVIEW',
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>Live metrics from the database</span>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-[#202020] dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Stats'}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => router.push(item.href)}
              className={`flex w-full cursor-pointer flex-col justify-between space-y-4 rounded-2xl border p-5 text-left shadow-sm transition-colors ${
                isDark ? 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                  {item.title}
                </span>
                <span className={`rounded-lg border p-2 ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div>
                <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-950'}`}>
                  {item.value}
                </h3>
                <p className={`text-[11px] font-medium mt-1.5 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <AdminOverviewCharts
        activity={stats?.sevenDayActivity ?? []}
        bookingLifecycle={stats?.bookingLifecycle ?? []}
        moderationWorkload={stats?.moderationWorkload ?? []}
        isDark={isDark}
      />

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <section className={`rounded-2xl p-5 border shadow-sm ${isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'}`}>
          <h4 className="font-extrabold text-sm mb-4">Operational Status</h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-neutral-800 dark:bg-[#1b1b1b]"><span className="flex items-center gap-2 font-bold"><Radio className="h-4 w-4 text-emerald-500" /> Admin API</span><span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Online</span></div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-neutral-800 dark:bg-[#1b1b1b]"><span className="flex items-center gap-2 font-bold"><Database className="h-4 w-4 text-emerald-500" /> PostgreSQL</span><span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Connected</span></div>
            <p className="text-[10px] leading-4 text-slate-500">Statuses reflect this successful authenticated overview request and its database queries.</p>
          </div>
        </section>

        <section className={`rounded-2xl p-5 border shadow-sm ${isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'}`}>
          <div className="mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-slate-600 dark:text-neutral-400" /><h4 className="font-extrabold text-sm">Recent Administrator Actions</h4></div>
          {!stats?.recentAuditLogs?.length ? <p className="text-xs text-slate-500">No administrator actions have been recorded yet.</p> : (
            <div className="divide-y divide-slate-100 dark:divide-neutral-800">
              {stats.recentAuditLogs.map((log) => (
                <div key={log.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3"><p className="text-[11px] font-bold">{log.action.replace(/_/g, ' ')}</p><time className="shrink-0 text-[9px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</time></div>
                  <p className="mt-0.5 text-[10px] text-slate-500">{log.actor.name}{log.targetUser ? ` → ${log.targetUser.name}` : ''}: {log.reason}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
