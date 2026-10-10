"use client";

import { Briefcase, Clock, Globe, Sparkles, Tag } from 'lucide-react';
import type { useUserProfile } from '../../hooks/useUserProfile';
import { formatRequestUrgency } from '../../lib/requestUrgency';

type ProfileModel = ReturnType<typeof useUserProfile>;

export default function MarketplaceProfileOverview({ model }: { model: ProfileModel }) {
  const {
    bio,
    displayCategories,
    availability,
    languages,
    userRequests: allRequests,
    userServices: allServices,
    role,
  } = model;

  const userServices = (allServices || []).filter(
    (service) => (service.status || '').toUpperCase() === 'ACTIVE' && !service.isPaused
  );
  const userRequests = (allRequests || []).filter(
    (request) => (request.status || '').toLowerCase() === 'open'
  );
  const totalActivityCount = userServices.length + userRequests.length;
  const isProvider = userServices.length > 0 || role === 'provider';

  // Extract categories directly from published services and requests
  const serviceCategories = Array.from(new Set(userServices.map((s) => s.category).filter(Boolean)));
  const requestCategories = Array.from(new Set(userRequests.map((r) => r.category).filter(Boolean)));
  const effectiveCategories = Array.from(
    new Set([...serviceCategories, ...requestCategories, ...(displayCategories || [])])
  );

  const hasBoth = userServices.length > 0 && userRequests.length > 0;

  return (
    <div className="space-y-8">
      {/* 1. Marketplace Activity Section */}
      <section aria-labelledby="marketplace-activity-heading">
        <div className="pb-3 mb-6 border-b border-[color:var(--workspace-border)]">
          <h2 id="marketplace-activity-heading" className="text-lg font-extrabold tracking-tight text-[color:var(--workspace-ink)]">
            Marketplace Activity
          </h2>
          <p className="text-xs text-[color:var(--workspace-muted)] mt-0.5">
            {totalActivityCount > 0
              ? 'Services offered and active community requests'
              : 'Published local services and work offerings'}
          </p>
        </div>

        {totalActivityCount === 0 ? (
          <div className="rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] p-8 text-center shadow-xs">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[color:var(--workspace-surface-muted)] text-[color:var(--workspace-muted)] mb-3">
              {isProvider ? <Briefcase size={22} /> : <Sparkles size={22} />}
            </div>
            <h3 className="text-base font-bold text-[color:var(--workspace-ink)]">
              {isProvider ? 'No public service listings yet' : 'No active marketplace activity yet'}
            </h3>
            <p className="mt-1.5 text-xs text-[color:var(--workspace-muted)] max-w-md mx-auto leading-relaxed">
              {isProvider
                ? 'Services published by this provider will appear here in the showcase.'
                : 'Services published and public service requests posted by this member will appear here.'}
            </p>
          </div>
        ) : hasBoth ? (
          /* Dual-Column Responsive Grid when BOTH services and requests exist */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Column A: Services Offered */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight text-[color:var(--workspace-ink)] flex items-center gap-2">
                  <span>Services Offered</span>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                    {userServices.length}
                  </span>
                </h3>
              </div>
              <div className="space-y-4">
                {userServices.map((service) => (
                  <article
                    key={service.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--workspace-border-strong)] hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          Service
                        </span>
                        <span className="text-lg font-black tabular-nums text-[color:var(--workspace-ink)]">
                          ₱{service.price}
                        </span>
                      </div>
                      <div>
                        <h4 className="uppercase break-words [overflow-wrap:anywhere] text-base font-bold tracking-tight text-[color:var(--workspace-ink)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {service.title}
                        </h4>
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[color:var(--workspace-muted)]">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-[color:var(--workspace-border)] pt-3 text-xs text-[color:var(--workspace-muted)]">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[color:var(--workspace-ink)]">
                        <Tag size={12} className="text-[color:var(--workspace-muted)]" />
                        {service.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Column B: Public Service Requests */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight text-[color:var(--workspace-ink)] flex items-center gap-2">
                  <span>Public Service Requests</span>
                  <span className="rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                    {userRequests.length}
                  </span>
                </h3>
              </div>
              <div className="space-y-4">
                {userRequests.map((request) => (
                  <article
                    key={request.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-700 dark:text-orange-300">
                          Request
                        </span>
                        <span className="text-lg font-black tabular-nums text-brand-text dark:text-orange-400">
                          ₱{request.budget}
                        </span>
                      </div>
                      <div>
                        <h4 className="uppercase break-words [overflow-wrap:anywhere] text-base font-bold tracking-tight text-[color:var(--workspace-ink)] group-hover:text-brand-text dark:group-hover:text-orange-400 transition-colors">
                          {request.title}
                        </h4>
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[color:var(--workspace-muted)]">
                          {request.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-[color:var(--workspace-border)] pt-3 text-xs text-[color:var(--workspace-muted)]">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[color:var(--workspace-ink)]">
                        <Tag size={12} className="text-[color:var(--workspace-muted)]" />
                        {request.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <Clock size={12} /> {formatRequestUrgency(request.urgency)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Single Category Flow when only one type exists */
          <div className="space-y-8">
            {userServices.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-tight text-[color:var(--workspace-ink)] flex items-center gap-2">
                    <span>Services Offered</span>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                      {userServices.length}
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {userServices.map((service) => (
                    <article
                      key={service.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--workspace-border-strong)] hover:shadow-md"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                            Service
                          </span>
                          <span className="text-lg font-black tabular-nums text-[color:var(--workspace-ink)]">
                            ₱{service.price}
                          </span>
                        </div>
                        <div>
                          <h4 className="uppercase break-words [overflow-wrap:anywhere] text-base font-bold tracking-tight text-[color:var(--workspace-ink)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {service.title}
                          </h4>
                          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[color:var(--workspace-muted)]">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-[color:var(--workspace-border)] pt-3 text-xs text-[color:var(--workspace-muted)]">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[color:var(--workspace-ink)]">
                          <Tag size={12} className="text-[color:var(--workspace-muted)]" />
                          {service.category}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {userRequests.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-tight text-[color:var(--workspace-ink)] flex items-center gap-2">
                    <span>Public Service Requests</span>
                    <span className="rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                      {userRequests.length}
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {userRequests.map((request) => (
                    <article
                      key={request.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-700 dark:text-orange-300">
                            Request
                          </span>
                          <span className="text-lg font-black tabular-nums text-brand-text dark:text-orange-400">
                            ₱{request.budget}
                          </span>
                        </div>
                        <div>
                          <h4 className="uppercase break-words [overflow-wrap:anywhere] text-base font-bold tracking-tight text-[color:var(--workspace-ink)] group-hover:text-brand-text dark:group-hover:text-orange-400 transition-colors">
                            {request.title}
                          </h4>
                          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[color:var(--workspace-muted)]">
                            {request.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-[color:var(--workspace-border)] pt-3 text-xs text-[color:var(--workspace-muted)]">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[color:var(--workspace-ink)]">
                          <Tag size={12} className="text-[color:var(--workspace-muted)]" />
                          {request.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <Clock size={12} /> {formatRequestUrgency(request.urgency)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. Member Overview Section (De-cluttered, Balanced & Non-Redundant) */}
      <section aria-labelledby="marketplace-overview-heading">
        <div className="pb-3 mb-5 border-b border-[color:var(--workspace-border)]">
          <h2 id="marketplace-overview-heading" className="text-lg font-extrabold tracking-tight text-[color:var(--workspace-ink)]">
            Member Overview
          </h2>
          <p className="text-xs text-[color:var(--workspace-muted)] mt-0.5">
            Verified communication preferences and community credentials
          </p>
        </div>

        {/* Detailed biographical statement only if extended bio exists (> 90 chars) to prevent empty grey textarea */}
        {bio && bio.trim().length > 90 && (
          <div className="rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] p-5 sm:p-6 mb-4 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--workspace-muted)] block mb-1.5">
              About
            </span>
            <p className="text-sm leading-relaxed text-[color:var(--workspace-ink)] whitespace-pre-line">
              {bio}
            </p>
          </div>
        )}

        {/* Crisp 3-Column Credentials Strip: Languages, Availability, and Specializations */}
        <div className="rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] p-5 sm:p-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-[color:var(--workspace-border)]">
            {/* Languages */}
            <div className="flex items-start gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface-muted)] text-[color:var(--workspace-muted)]">
                <Globe size={16} />
              </span>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--workspace-muted)] block">
                  Languages
                </span>
                <p className="mt-0.5 text-sm font-semibold text-[color:var(--workspace-ink)] truncate">
                  {languages || 'English, Cebuano'}
                </p>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-start gap-3.5 pt-4 sm:pt-0 lg:pl-6">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface-muted)] text-[color:var(--workspace-muted)]">
                <Clock size={16} />
              </span>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--workspace-muted)] block">
                  Availability
                </span>
                <p className="mt-0.5 text-sm font-semibold text-[color:var(--workspace-ink)] truncate">
                  {availability || 'Contact for schedule'}
                </p>
              </div>
            </div>

            {/* Specializations / Categories */}
            <div className="flex items-start gap-3.5 pt-4 sm:pt-0 sm:col-span-2 lg:col-span-1 lg:pl-6">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface-muted)] text-[color:var(--workspace-muted)]">
                <Tag size={16} />
              </span>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--workspace-muted)] block mb-1">
                  Specializations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {effectiveCategories.length > 0 ? (
                    effectiveCategories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 rounded-full border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface-muted)] px-2.5 py-0.5 text-xs font-semibold text-[color:var(--workspace-ink)]"
                      >
                        {category}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[color:var(--workspace-muted)]">
                      General local services
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
