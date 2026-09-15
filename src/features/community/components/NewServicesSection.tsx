import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Briefcase } from '@phosphor-icons/react';
import type { RecentService } from '../types/community.types';
import CommunityEmptyState from './CommunityEmptyState';

interface NewServicesSectionProps {
  services: RecentService[];
  isDark?: boolean;
  onSelectService: (id: string) => void;
}

function formatPrice(service: RecentService) {
  if (service.priceType === 'CUSTOM' || service.price === null) return 'Request a quote';
  const rawPrice = typeof service.price === 'number' ? service.price : parseFloat(service.price as string) || 0;
  const formatted = `₱${rawPrice.toLocaleString()}`;
  switch (service.priceType) {
    case 'PER_HOUR': return `${formatted} / hr`;
    case 'PER_DAY': return `${formatted} / day`;
    case 'PER_PROJECT': return `${formatted} / project`;
    case 'STARTS_AT': return `From ${formatted}`;
    default: return formatted;
  }
}

export default function NewServicesSection({ services = [], isDark = false, onSelectService }: NewServicesSectionProps) {
  return (
    <section className={`rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-white/10 bg-[#201f1c]' : 'border-black/8 bg-[#fffdfa]'}`} aria-labelledby="new-services-title">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Briefcase size={18} className="text-[#c86544]" aria-hidden="true" />
          <h3 id="new-services-title" className={`text-base font-semibold tracking-[-0.02em] ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>New services</h3>
        </div>
        <span className={`text-xs ${isDark ? 'text-[#aaa59d]' : 'text-[#6f6a64]'}`}>{services.length} listings</span>
      </div>

      {services.length === 0 ? (
        <div className="pt-5">
          <CommunityEmptyState title="No new services are available to display" description="Recently approved and published services from local providers will appear here." isDark={isDark} />
        </div>
      ) : (
        <div className="divide-y divide-black/8 dark:divide-white/10">
          {services.map((service) => (
            <button
              type="button"
              key={service.id}
              onClick={() => onSelectService(service.id)}
              aria-label={`View ${service.title}`}
              className="group flex w-full items-start gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c86544]"
            >
              {service.provider?.avatarUrl ? (
                <Image src={service.provider.avatarUrl} alt="" width={40} height={40} unoptimized className="size-10 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f5ebe6] text-sm font-semibold text-[#aa5032] dark:bg-[#c86544]/15 dark:text-[#e9a58c]">{service.provider?.name?.charAt(0).toUpperCase() || 'P'}</span>
              )}
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold leading-5 tracking-[-0.02em] transition-colors group-hover:text-[#aa5032] dark:group-hover:text-[#e9a58c] ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>{service.title}</span>
                <span className={`mt-1 block text-xs leading-5 ${isDark ? 'text-[#aaa59d]' : 'text-[#625d57]'}`}>{service.category?.name || 'Service'} · {service.provider?.name || 'Local provider'}</span>
                <span className={`mt-2 block text-[11px] ${isDark ? 'text-[#8f8a82]' : 'text-[#6f6a64]'}`}>Published {new Date(service.publishedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}{service.provider?.trustScore != null ? ` · Trust ${service.provider.trustScore}/100` : ''}</span>
                <span className={`mt-2 block text-xs font-semibold sm:hidden ${isDark ? 'text-[#e9a58c]' : 'text-[#aa5032]'}`}>{formatPrice(service)}</span>
              </span>
              <span className="flex shrink-0 items-start gap-2">
                <span className={`hidden text-xs font-semibold sm:block ${isDark ? 'text-[#e9a58c]' : 'text-[#aa5032]'}`}>{formatPrice(service)}</span>
                <ArrowUpRight size={16} className="text-[#827c75] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
