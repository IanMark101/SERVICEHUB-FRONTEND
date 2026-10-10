import TrustScoreBadge from '../../../components/ui/TrustScoreBadge';
import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Briefcase } from '@phosphor-icons/react';
import type { RecentService } from '../types/community.types';
import CommunityEmptyState from './CommunityEmptyState';

interface NewServicesSectionProps {
  services: RecentService[];
  isDark?: boolean;
  onSelectService: (id: string) => void;
  onSelectProvider?: (id: string) => void;
}

function formatPrice(service: RecentService) {
  if (service.priceType === 'CUSTOM' || service.priceType === 'STARTS_AT' || service.price === null) return 'Price unavailable';
  const rawPrice = typeof service.price === 'number' ? service.price : parseFloat(service.price as string) || 0;
  const formatted = `₱${rawPrice.toLocaleString()}`;
  switch (service.priceType) {
    case 'PER_HOUR': return `${formatted} / hr`;
    case 'PER_DAY': return `${formatted} / day`;
    case 'PER_PROJECT': return `${formatted} / project`;
    default: return formatted;
  }
}

export default function NewServicesSection({ services = [], isDark = false, onSelectService, onSelectProvider }: NewServicesSectionProps) {
  return (
    <section className={`min-w-0 rounded-3xl border p-4 sm:p-6 transition-all ${
      isDark
        ? 'bg-charcoal-inset border-neutral-800/90 shadow-xl shadow-black/40'
        : 'bg-white border-slate-200/90 shadow-sm shadow-slate-900/5'
    }`} aria-labelledby="new-services-title">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-neutral-800/80 pb-3.5">
        <div className="flex items-center gap-2">
          <Briefcase size={18} className="text-brand-text" aria-hidden="true" />
          <h3 id="new-services-title" className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-ink'}`}>New services</h3>
        </div>
        <span className={`text-xs font-semibold ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>{services.length} listings</span>
      </div>

      {services.length === 0 ? (
        <div className="pt-4">
          <CommunityEmptyState title="No new services are available to display" description="Services recently published by local providers will appear here." isDark={isDark} />
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-neutral-800/80">
          {services.map((service) => (
            <article key={service.id} className="group/row flex min-w-0 items-start gap-2.5 rounded-xl py-3.5 sm:gap-4">
              <button
                type="button"
                onClick={() => onSelectProvider?.(service.provider.id)}
                aria-label={`View ${service.provider.name} profile`}
                disabled={!onSelectProvider}
                className="shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus disabled:cursor-default"
              >
                {service.provider.avatarUrl ? (
                  <Image src={service.provider.avatarUrl} alt="" width={40} height={40} unoptimized className="size-9 sm:size-10 rounded-xl object-cover" />
                ) : (
                  <span className="grid size-9 sm:size-10 place-items-center rounded-xl bg-orange-100 text-sm font-semibold text-brand-action-hover dark:bg-brand/15 dark:text-orange-300">{service.provider.name?.charAt(0).toUpperCase() || 'P'}</span>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onSelectService(service.id)}
                  className={`block uppercase break-words [overflow-wrap:anywhere] text-left text-sm font-semibold leading-5 tracking-[-0.02em] transition-colors hover:text-brand-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus dark:hover:text-orange-300 ${isDark ? 'text-white' : 'text-ink'}`}
                >
                  {service.title}
                </button>
                <p className={`mt-1 text-xs leading-5 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
                  {service.category?.name || 'Service'} by{' '}
                  <button
                    type="button"
                    onClick={() => onSelectProvider?.(service.provider.id)}
                    disabled={!onSelectProvider}
                    className="font-semibold    transition-colors hover:text-brand-action-hover  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus  dark:hover:text-orange-300"
                  >
                    {service.provider.name || 'Local provider'}
                  </button>
                </p>
                <p className={`mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
                  <span>Published {new Date(service.publishedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {service.provider.trustScore != null && <TrustScoreBadge score={service.provider.trustScore} />}
                </p>
                <span className={`mt-1.5 block text-xs font-semibold sm:hidden ${isDark ? 'text-orange-300' : 'text-brand-action-hover'}`}>{formatPrice(service)}</span>
              </div>

              <button
                type="button"
                onClick={() => onSelectService(service.id)}
                aria-label={`Open ${formatPrice(service)} listing`}
                className="flex shrink-0 items-start gap-2 rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus"
              >
                <span className={`hidden text-xs font-semibold sm:block ${isDark ? 'text-orange-300' : 'text-brand-action-hover'}`}>{formatPrice(service)}</span>
                <ArrowUpRight size={16} className="text-ink-subtle transition-transform group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
