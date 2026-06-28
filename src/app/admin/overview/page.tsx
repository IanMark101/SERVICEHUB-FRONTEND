"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { apiGetAdminOverview } from '../../../api/admin.api';
import { Users, Shield, Briefcase, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';

interface StatsData {
  totalUsers: number;
  activeServices: number;
  pendingVerifications: number;
  openReports: number;
  pendingListings: number;
  categorySuggestions: number;
}

export default function AdminOverview() {
  const { isDark } = useApp();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    apiGetAdminOverview()
      .then(res => {
        if (res.success) {
          setStats(res.data);
        } else {
          setError("Failed to fetch dashboard overview metrics.");
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "An error occurred.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
      color: "bg-blue-550/10 text-blue-500 border-blue-500/20",
      desc: "All registered Seekers & Providers."
    },
    {
      title: "Active Listings",
      value: stats?.activeServices || 0,
      icon: Briefcase,
      color: "bg-emerald-550/10 text-emerald-500 border-emerald-500/20",
      desc: "Verified & running marketplace listings."
    },
    {
      title: "Verification Queue",
      value: stats?.pendingVerifications || 0,
      icon: Shield,
      color: "bg-orange-550/10 text-orange-500 border-orange-500/20",
      desc: "Pending provider document submissions."
    },
    {
      title: "Open Reports & Disputes",
      value: stats?.openReports || 0,
      icon: AlertTriangle,
      color: "bg-red-550/10 text-red-500 border-red-500/20",
      desc: "Pending moderator arbitration cases."
    },
    {
      title: "Suggested Categories",
      value: stats?.categorySuggestions || 0,
      icon: HelpCircle,
      color: "bg-purple-550/10 text-purple-500 border-purple-500/20",
      desc: "New category requests from seekers."
    },
    {
      title: "Pending Listings Review",
      value: stats?.pendingListings || 0,
      icon: Briefcase,
      color: "bg-amber-550/10 text-amber-500 border-amber-500/20",
      desc: "Services awaiting admin verification."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200'
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
            </div>
          );
        })}
      </div>

      <div className={`rounded-[24px] p-6 border shadow-sm transition-all ${
        isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <h4 className="font-extrabold text-sm mb-3">System Health Overview</h4>
        <p className={`text-xs leading-relaxed ${isDark ? 'text-[#b4b0a9]' : 'text-slate-550'}`}>
          Welcome to the ServiceHub Admin Panel. Here you can perform verification audits, service catalog moderation, custom category provisioning, user trust engine tuning, and active contract arbitration. Select a tab from the sidebar to begin moderating.
        </p>
      </div>
    </div>
  );
}
