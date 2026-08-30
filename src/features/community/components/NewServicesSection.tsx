import React from 'react';
import { Wrench } from 'lucide-react';
import { RecentService } from '../types/community.types';
import CommunityEmptyState from './CommunityEmptyState';

interface NewServicesSectionProps {
  services: RecentService[];
  isDark?: boolean;
  onSelectService: (title: string) => void;
}

export default function NewServicesSection({
  services = [],
  isDark = false,
  onSelectService,
}: NewServicesSectionProps) {
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
              onClick={() => onSelectService(service.title)}
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
  );
}
