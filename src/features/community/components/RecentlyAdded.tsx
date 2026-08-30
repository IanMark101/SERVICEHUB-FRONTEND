import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Calendar, Tag, ArrowUpRight, FolderPlus, Wrench } from 'lucide-react';
import { RecentCategory, RecentService } from '../types/community.types';
import { RecentGridSkeleton } from './CommunitySkeletons';
import CommunityEmptyState from './CommunityEmptyState';

interface RecentlyAddedProps {
  categories: RecentCategory[];
  services: RecentService[];
  loading?: boolean;
  isDark?: boolean;
  workspaceRole?: 'seeker' | 'provider' | 'admin';
}

export default function RecentlyAdded({
  categories = [],
  services = [],
  loading = false,
  isDark = false,
  workspaceRole = 'seeker',
}: RecentlyAddedProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className={`font-extrabold text-sm uppercase tracking-wider flex items-center space-x-2 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Recently Added</span>
          </h2>
          <RecentGridSkeleton isDark={isDark} />
        </div>
      </div>
    );
  }

  const formatPrice = (service: RecentService) => {
    const rawPrice = typeof service.price === 'number' ? service.price : parseFloat(service.price as string) || 0;
    const formatted = `₱${rawPrice.toLocaleString()}`;

    switch (service.priceType) {
      case 'PER_HOUR':
        return `${formatted} / hr`;
      case 'PER_SESSION':
        return `${formatted} / session`;
      case 'STARTS_AT':
        return `From ${formatted}`;
      default:
        return formatted;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <h2 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Recently Added
          </h2>
        </div>
        <span className={`text-[10px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
          Newly approved categories & marketplace listings
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Sub-section 1: New Categories ─────────────────────────────── */}
        <div
          className={`rounded-2xl p-5 border shadow-sm space-y-4 ${
            isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800/80">
            <h3 className={`font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
              <Tag className="w-3.5 h-3.5 text-orange-500" />
              <span>New Categories</span>
            </h3>
            <span className={`text-[10px] font-bold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
              {categories.length} approved
            </span>
          </div>

          {categories.length === 0 ? (
            <CommunityEmptyState
              icon={FolderPlus}
              title="No new categories have been added recently"
              description="When the administration approves community category suggestions, they will be highlighted here."
              isDark={isDark}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    const prefix = workspaceRole === 'provider' ? '/provider/browse-services' : '/seeker/seek-services';
                    router.push(`${prefix}?category=${encodeURIComponent(cat.name)}`);
                  }}
                  className={`border rounded-xl p-3.5 space-y-1.5 transition-all duration-200 cursor-pointer select-none group/cat hover:border-orange-500/50 hover:shadow-sm ${
                    isDark
                      ? 'bg-[#191919] border-neutral-800/80 hover:bg-neutral-800/40 text-[#f2efe9]'
                      : 'bg-slate-50 border-slate-200/80 hover:bg-white text-slate-900'
                  }`}
                  title={`Browse ${cat.name} services`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase tracking-wide truncate group-hover/cat:text-orange-500 transition-colors">
                      {cat.name}
                    </h4>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover/cat:text-orange-500 transition-colors" />
                  </div>
                  {cat.description && (
                    <p className={`text-[10.5px] font-medium leading-relaxed line-clamp-2 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-550'}`}>
                      {cat.description}
                    </p>
                  )}
                  {cat.reviewedAt && (
                    <div className={`text-[9px] font-bold flex items-center pt-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>
                        Approved {new Date(cat.reviewedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sub-section 2: New Services ───────────────────────────────── */}
        <div
          className={`rounded-2xl p-5 border shadow-sm space-y-4 ${
            isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800/80">
            <h3 className={`font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
              <Wrench className="w-3.5 h-3.5 text-emerald-500" />
              <span>New Services</span>
            </h3>
            <span className={`text-[10px] font-bold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-400'}`}>
              {services.length} listings
            </span>
          </div>

          {services.length === 0 ? (
            <CommunityEmptyState
              icon={Wrench}
              title="No new services are available to display"
              description="Recently approved and published services from local providers will appear here."
              isDark={isDark}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => {
                    const prefix = workspaceRole === 'provider' ? '/provider/browse-services' : '/seeker/seek-services';
                    router.push(`${prefix}?search=${encodeURIComponent(service.title)}`);
                  }}
                  className={`border rounded-xl p-3.5 space-y-2 transition-all duration-200 cursor-pointer select-none group/srv hover:border-emerald-500/50 hover:shadow-sm ${
                    isDark
                      ? 'bg-[#191919] border-neutral-800/80 hover:bg-neutral-800/40 text-[#f2efe9]'
                      : 'bg-slate-50 border-slate-200/80 hover:bg-white text-slate-900'
                  }`}
                  title={`View ${service.title}`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                      isDark ? 'bg-neutral-800 border-neutral-700 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-600'
                    }`}>
                      {service.category?.name || 'Service'}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {formatPrice(service)}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs leading-snug line-clamp-1 group-hover/srv:text-emerald-500 transition-colors">
                    {service.title}
                  </h4>

                  {/* Provider Info */}
                  <div className="flex items-center space-x-2 pt-1 border-t border-neutral-700/20 dark:border-neutral-800/60">
                    {service.provider?.avatarUrl ? (
                      <img
                        src={service.provider.avatarUrl}
                        alt={service.provider.name}
                        className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-neutral-700 text-[#f2efe9] text-[9px] font-extrabold flex items-center justify-center flex-shrink-0">
                        {service.provider?.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                    )}
                    <span className={`text-[10px] font-semibold truncate ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
                      {service.provider?.name || 'Local Provider'}
                    </span>
                    <span className={`text-[8px] font-extrabold px-1 rounded border ml-auto ${
                      isDark ? 'bg-emerald-955/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    }`}>
                      {service.provider?.trustScore || 50}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
