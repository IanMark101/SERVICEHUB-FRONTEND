"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useRouter } from 'next/navigation';
import { apiGetAdminOverview } from '../../../api/admin.api';
import { Users, Shield, Briefcase, AlertTriangle, HelpCircle, Loader2, RefreshCw, Activity, Database, Radio } from 'lucide-react';

interface StatsData {
  totalUsers: number;
  activeServices: number;
  pendingVerifications: number;
  openReports: number;
  pendingListings: number;
  categorySuggestions: number;
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

  const fetchStats = (isRefresh = false) => {
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
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
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
      title: "Active Listings",
      value: stats?.activeServices || 0,
      icon: Briefcase,
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      desc: "Verified & running marketplace listings.",
      href: '/admin/services',
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
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      desc: "New category requests from seekers.",
      href: '/admin/categories',
    },
    {
      title: "Pending Listings Review",
      value: stats?.pendingListings || 0,
      icon: Briefcase,
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      desc: "Services awaiting admin verification.",
      href: '/admin/services',
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>Live metrics from the database</span>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="px-4 py-2 border rounded-xl font-bold text-xs bg-red-500/5 text-red-500 border-red-500/25 cursor-pointer hover:bg-red-500/10 transition-colors flex items-center space-x-1.5 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Stats'}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => router.push(item.href)}
              className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all text-left w-full cursor-pointer hover:shadow-md hover:scale-[1.01] ${
                isDark ? 'bg-[#22211e] border-neutral-800/80 hover:border-neutral-700' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                  {item.title}
                </span>
                <span className={`p-2 rounded-xl border ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </span>
              </div>
              <div>
                <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
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

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className={`rounded-[24px] p-6 border shadow-sm ${isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'}`}>
          <h4 className="font-extrabold text-sm mb-4">Operational Status</h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800"><span className="flex items-center gap-2 font-bold"><Radio className="h-4 w-4" /> Admin API</span><span>Online</span></div>
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800"><span className="flex items-center gap-2 font-bold"><Database className="h-4 w-4" /> PostgreSQL</span><span>Connected</span></div>
            <p className="text-[10px] leading-4 text-slate-500">Statuses reflect this successful authenticated overview request and its database queries.</p>
          </div>
        </section>

        <section className={`rounded-[24px] p-6 border shadow-sm ${isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'}`}>
          <div className="mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-red-600" /><h4 className="font-extrabold text-sm">Recent Administrator Actions</h4></div>
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
