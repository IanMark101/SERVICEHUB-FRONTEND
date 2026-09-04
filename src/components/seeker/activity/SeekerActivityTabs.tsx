import { JobEngagement } from '../../../types';
import { SeekerActivityTab } from './types';

interface SeekerActivityTabsProps {
  activeTab: SeekerActivityTab;
  isDark: boolean;
  totalCount: number;
  countStatus: (status: JobEngagement['status'] | 'action_required') => number;
  onTabChange: (tab: SeekerActivityTab) => void;
}

export default function SeekerActivityTabs({
  activeTab,
  isDark,
  totalCount,
  countStatus,
  onTabChange
}: SeekerActivityTabsProps) {
  const getTabClass = (tab: SeekerActivityTab) => {
    const baseStyles = 'px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ';

    if (activeTab !== tab) {
      return baseStyles + (isDark
        ? 'bg-[#22211e] border-neutral-850 text-[#b4b0a9] hover:bg-[#2c2b27]'
        : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50');
    }

    if (tab === 'all') {
      return baseStyles + (isDark
        ? 'bg-[#f2efe9] border-[#f2efe9] text-slate-950 shadow-sm'
        : 'bg-slate-900 border-slate-900 text-white shadow-sm');
    }
    if (tab === 'action_required') {
      return baseStyles + (isDark
        ? 'bg-orange-950/20 border-orange-900/30 text-orange-400 font-extrabold'
        : 'bg-orange-50 border-orange-200 text-orange-600 font-extrabold');
    }
    if (tab === 'active') {
      return baseStyles + (isDark
        ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-455 font-extrabold'
        : 'bg-emerald-50 border-emerald-200 text-emerald-600 font-extrabold');
    }
    if (tab === 'waiting') {
      return baseStyles + (isDark
        ? 'bg-amber-950/20 border-amber-900/30 text-amber-450 font-extrabold'
        : 'bg-amber-50 border-amber-200 text-amber-600 font-extrabold');
    }
    if (tab === 'disputed') {
      return baseStyles + (isDark
        ? 'bg-red-950/20 border-red-900/30 text-red-400 font-extrabold'
        : 'bg-red-50 border-red-200 text-red-650 font-extrabold');
    }
    if (tab === 'completed') {
      return baseStyles + (isDark
        ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400 font-extrabold'
        : 'bg-emerald-50 border-emerald-200 text-emerald-600 font-extrabold');
    }

    return baseStyles + (isDark
      ? 'bg-neutral-800/40 border-neutral-750 text-[#f2efe9] font-extrabold'
      : 'bg-slate-100 border-slate-300 text-slate-700 font-extrabold');
  };

  const tabs: Array<{ tab: SeekerActivityTab; label: string; count: number }> = [
    { tab: 'all', label: 'All', count: totalCount },
    { tab: 'action_required', label: 'Action Required', count: countStatus('action_required') },
    { tab: 'pending', label: 'Pending Provider', count: countStatus('pending_provider') },
    { tab: 'active', label: 'Active Now', count: countStatus('in_progress') },
    { tab: 'waiting', label: 'In Queue', count: countStatus('queued') },
    { tab: 'disputed', label: 'Disputes', count: countStatus('disputed') },
    { tab: 'completed', label: 'Completed', count: countStatus('completed') },
    { tab: 'canceled', label: 'Canceled', count: countStatus('canceled') }
  ];

  return (
    <div className={`flex flex-wrap gap-2 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
      {tabs.map(({ tab, label, count }) => (
        <button key={tab} onClick={() => onTabChange(tab)} className={getTabClass(tab)}>
          {label} ({count})
        </button>
      ))}
    </div>
  );
}
