import type { ProviderActivityTab } from "./types";

interface ProviderActivityTabsProps {
  activeTab: ProviderActivityTab;
  isDark: boolean;
  countTabItems: (tab: ProviderActivityTab) => number;
  onTabChange: (tab: ProviderActivityTab) => void;
}
export default function ProviderActivityTabs({
  activeTab,
  isDark,
  countTabItems,
  onTabChange,
}: ProviderActivityTabsProps) {
  return (
    <>
      {/* Filter Pills */}
      <div className={`flex flex-wrap gap-2 border-b pb-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
        <button
          onClick={() => onTabChange('all')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'all'
              ? isDark
                ? 'bg-[#f2efe9] border-[#f2efe9] text-slate-950 shadow-sm'
                : 'bg-slate-900 border-slate-900 text-white shadow-sm'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          All ({countTabItems('all')})
        </button>

        <button
          onClick={() => onTabChange('in_progress')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'in_progress'
              ? isDark
                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400 font-extrabold'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          In Progress ({countTabItems('in_progress')})
        </button>

        <button
          onClick={() => onTabChange('waiting')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'waiting'
              ? isDark
                ? 'bg-amber-955/20 border-amber-900/30 text-amber-450 font-extrabold'
                : 'bg-amber-50 border-amber-200 text-amber-600 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          Waiting ({countTabItems('waiting')})
        </button>

        <button
          onClick={() => onTabChange('pending_offers')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'pending_offers'
              ? isDark
                ? 'bg-orange-950/20 border-orange-900/30 text-orange-400 font-extrabold'
                : 'bg-orange-50 border-orange-200 text-orange-600 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          Pending Offers ({countTabItems('pending_offers')})
        </button>

        <button
          onClick={() => onTabChange('awaiting_approval')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'awaiting_approval'
              ? isDark
                ? 'bg-purple-950/20 border-purple-900/30 text-purple-400 font-extrabold'
                : 'bg-purple-50 border-purple-200 text-purple-600 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-850 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          Awaiting Approval ({countTabItems('awaiting_approval')})
        </button>

        <button
          onClick={() => onTabChange('disputed')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'disputed'
              ? isDark
                ? 'bg-red-955/20 border-red-900/30 text-red-400 font-extrabold'
                : 'bg-red-50 border-red-200 text-red-655 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-855 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
            }`}
        >
          Disputes ({countTabItems('disputed')})
        </button>

        <button
          onClick={() => onTabChange('completed')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'completed'
              ? isDark
                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400 font-extrabold'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-855 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-550'
            }`}
        >
          Completed ({countTabItems('completed')})
        </button>

        <button
          onClick={() => onTabChange('canceled')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${activeTab === 'canceled'
              ? isDark
                ? 'bg-neutral-800/40 border-neutral-750 text-[#f2efe9] font-extrabold'
                : 'bg-slate-100 border-slate-300 text-slate-700 font-extrabold'
              : isDark
                ? 'bg-[#22211e] hover:bg-[#2c2b27] border-neutral-855 text-[#b4b0a9]'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-550'
            }`}
        >
          Canceled ({countTabItems('canceled')})
        </button>

      </div>


    </>
  );
}
