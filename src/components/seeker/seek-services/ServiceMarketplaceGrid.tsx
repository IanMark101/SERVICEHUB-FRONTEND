"use client";

import TrustScoreBadge from '../../ui/TrustScoreBadge';
import MarketplaceRating from '../../ui/MarketplaceRating';
import { useState } from 'react';
import {
  Bell,
  Clock,
  Eye,
  MapPin,
  MagnifyingGlass as Search,
  ShieldCheck,
  DeviceMobile as Smartphone,
} from '@phosphor-icons/react';
import type { ServiceListing } from '../../../types';
import PaginationBar from '../../ui/PaginationBar';
import EmptyState from '../../ui/EmptyState';
import { ServiceListingSkeleton } from '../../ui/SkeletonCard';
import { getServicePaymentMethods } from '../../../lib/paymentUtils';
import type { Dispatch, SetStateAction } from 'react';
import type { JobEngagement, User } from '../../../types';
import type { UserSession } from '../../auth/LoginContainer';
import UserAvatar from '../../ui/UserAvatar';
import ContentCaseAction from '../../moderation/ContentCaseAction';
import ServiceDetailsModal from './ServiceDetailsModal';

type MarketplaceFilter = 'all' | 'available' | 'rated' | 'low-queue';
type PaymentMethod = 'GCash' | 'On-site Cash';

interface ServiceMarketplaceGridModel {
  router: { push: (href: string) => void };
  isDark: boolean;
  isLoading: boolean;
  servicesError?: boolean;
  refreshServices?: () => void;
  activeFilter: MarketplaceFilter;
  setActiveFilter: Dispatch<SetStateAction<MarketplaceFilter>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  filteredServices: ServiceListing[];
  paginatedServices: ServiceListing[];
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  startIndex: number;
  endIndex: number;
  getProviderDetails: (providerId: string) => User | undefined;
  user: UserSession | null;
  jobEngagements: JobEngagement[];
  canTransact: boolean;
  setBlockedModalOpen: Dispatch<SetStateAction<boolean>>;
  handleBookListing: (listing: ServiceListing, method?: PaymentMethod) => void;
  handleJoinWaitlist: (listing: ServiceListing) => void;
  joiningWaitlistId: string | null;
  setIsSuggestModalOpen: Dispatch<SetStateAction<boolean>>;
  prefetchProviderSummary: (listing: ServiceListing) => void;
}

export default function ServiceMarketplaceGrid({ model }: { model: ServiceMarketplaceGridModel }) {
  const {
    router,
    isDark,
    isLoading,
    servicesError,
    refreshServices,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredServices,
    paginatedServices,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    getProviderDetails,
    user,
    jobEngagements,
    handleBookListing,
    handleJoinWaitlist,
    joiningWaitlistId,
    setIsSuggestModalOpen,
    prefetchProviderSummary
  } = model;

  const [previewListing, setPreviewListing] = useState<ServiceListing | null>(null);

  return (
    <>
      {servicesError && filteredServices.length > 0 && <div role="alert" className="workspace-surface rounded-xl border p-4 text-sm">
        Could not refresh services. Showing the last loaded listings.{' '}
        <button type="button" className="underline" onClick={refreshServices}>Try again</button>
      </div>}
      {/* Provider Services Card Grid */}
      {isLoading ? (
        <ServiceListingSkeleton count={6} />
      ) : servicesError && filteredServices.length === 0 ? (
        <div role="alert"><EmptyState icon={Search} title="Services could not be loaded" description="Check your connection and try again." actionLabel="Try again" onAction={refreshServices} /></div>
      ) : filteredServices.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={Search}
            title="No Services Found"
            description={
              searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all'
                ? `No services matched your current filters ("${searchQuery || selectedCategory}"). Try adjusting your search keywords or clearing your category filters.`
                : 'There are currently no active service listings published in Cordova. Check back soon or post a custom service request!'
            }
            actionLabel={searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all' ? 'Clear All Filters' : 'Post a Custom Request'}
            onAction={() => {
              if (searchQuery || selectedCategory !== 'All Categories' || activeFilter !== 'all') {
                setSearchQuery('');
                setSelectedCategory('All Categories');
                setActiveFilter('all');
              } else {
                router.push('/seeker/post-request');
              }
            }}
            accentColor="orange"
          />

          {/* Contextual Category Suggestion Prompt */}
          <div
            className={`p-4 rounded-2xl border text-center flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors ${
              isDark
                ? 'bg-charcoal-inset border-neutral-800 text-neutral-300'
                : 'bg-slate-50 border-slate-200 text-ink-secondary'
            }`}
          >
            <div className="text-left text-xs">
              <span className="font-extrabold block text-ink dark:text-white">
                Can&apos;t find what you&apos;re looking for?
              </span>
              <span className="text-[11px] text-ink-muted dark:text-ink-muted">
                Suggest a new service category for Cordova, and we will source local providers.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSuggestModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs transition-all shadow-sm active:scale-95 flex-shrink-0 cursor-pointer"
            >
              + Suggest a Category
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="marketplace-results-grid">
            {paginatedServices.map((service: ServiceListing) => {
              const provider = getProviderDetails(service.providerId);
              const trustScore = service.providerTrustScore ?? provider?.trustScore;
              const isVerified = service.providerVerificationStatus === 'APPROVED' || provider?.isVerified === true;
              const { cash, gcash } = getServicePaymentMethods(service);
              const isOwned = !!(user && service.providerId === user.id);
              const activeEngagement = jobEngagements.find((je) =>
                je.seekerId === user?.id &&
                je.serviceId === service.id &&
                ['pending_provider', 'queued', 'in_progress', 'awaiting_seeker_approval', 'disputed'].includes(je.status)
              );
              const queueCount = service.providerWaitingCount ?? service.queueSize;
              const queueLimit = service.queueLimit || 5;
              const isQueueFull = queueCount >= queueLimit;
              const priceUnavailable =
                service.priceType === 'STARTS_AT' ||
                service.priceType === 'CUSTOM' ||
                Number(service.price) < 50;

              return (
                <div
                  key={service.id}
                  onClick={() => setPreviewListing(service)}
                  className={`group relative min-w-0 rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between h-full cursor-pointer ${
                    isDark
                      ? 'bg-charcoal-surface border-neutral-800 hover:border-neutral-700 hover:bg-charcoal-hover'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs'
                  }`}
                >
                  <div className="min-w-0 space-y-3">
                    {/* Top Row: Provider Identity & Refined Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/profile/${encodeURIComponent(service.providerId)}`);
                        }}
                        disabled={!service.providerId}
                        aria-label={`View ${service.providerName}'s profile`}
                        className="group/author flex min-w-0 items-center gap-2.5 rounded-lg text-left transition-colors focus-visible:outline-2 focus-visible:outline-[#aa5032] disabled:cursor-default"
                        title={`View ${service.providerName}'s profile`}
                      >
                        <UserAvatar
                          src={service.providerAvatar}
                          name={service.providerName || 'Provider'}
                          alt=""
                          size={36}
                          role="provider"
                          className="shrink-0 ring-1 ring-slate-200 dark:ring-neutral-700 transition-transform duration-200 group-hover/author:scale-105"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span
                              className={`block truncate text-xs font-semibold leading-tight transition-colors duration-200 group-hover/author:text-orange-600 dark:group-hover/author:text-orange-400 ${
                                isDark ? 'text-white' : 'text-ink'
                              }`}
                            >
                              {service.providerName}
                            </span>
                            {isVerified && (
                              <span title="Verified Provider" aria-label="Verified resident" className="inline-flex shrink-0 text-emerald-700 dark:text-emerald-400">
                                <ShieldCheck
                                  size={14}
                                  weight="fill"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </div>
                          <span className="mt-1 block">{typeof trustScore === 'number' ? <TrustScoreBadge score={trustScore} /> : 'Cordova local'}</span>
                        </div>
                      </button>

                      {/* Refined Rating & Report Action */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/profile/${encodeURIComponent(service.providerId)}?tab=reviews&reviewRole=provider`);
                          }}
                          disabled={!service.providerId}
                          aria-label={`View reviews for ${service.providerName}`}
                          className="shrink-0 transition-opacity hover:opacity-80"
                          title="View provider reviews"
                        >
                          <MarketplaceRating rating={service.rating} reviewCount={service.reviewCount} context="provider" />
                        </button>
                        {!isOwned && (
                          <ContentCaseAction
                            caseType="REPORT"
                            contentType="SERVICE_LISTING"
                            resourceId={service.id}
                            label="Report listing"
                            variant="icon"
                            isDark={isDark}
                          />
                        )}
                      </div>
                    </div>

                    {/* Category Tag & Live Queue Status — Calm Neutral Harmony */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`inline-block truncate max-w-[150px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${
                            isDark
                              ? 'text-neutral-300 bg-charcoal/80 border-neutral-700/80'
                              : 'text-ink-muted bg-slate-100 border-slate-200/80'
                          }`}
                        >
                          {service.category}
                        </span>
                        {isOwned && (
                          <span className="text-[10px] font-medium text-ink-subtle dark:text-ink-subtle">
                            (Your listing)
                          </span>
                        )}
                      </div>

                      {/* Live Queue Status */}
                      {isQueueFull ? (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ${
                            isDark ? 'text-rose-400' : 'text-rose-600'
                          }`}
                        >
                          <span className="size-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span>Queue full ({queueCount}/{queueLimit})</span>
                        </span>
                      ) : queueCount > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ${
                            isDark ? 'text-ink-subtle' : 'text-ink-muted'
                          }`}
                        >
                          <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{queueCount} waiting</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ${
                            isDark ? 'text-emerald-400' : 'text-emerald-700'
                          }`}
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>Available</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Description with Vertical Word Wrapping */}
                    <div className="space-y-1">
                      <h3
                        className={`uppercase font-semibold text-sm leading-snug line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors break-words [overflow-wrap:anywhere] ${
                          isDark ? 'text-white' : 'text-ink'
                        }`}
                      >
                        {service.title}
                      </h3>
                      <p
                        className={`text-xs line-clamp-2 leading-relaxed break-words [overflow-wrap:anywhere] ${
                          isDark ? 'text-ink-subtle' : 'text-ink-muted'
                        }`}
                      >
                        {service.description}
                      </p>
                    </div>

                    {/* Price Block & Duration */}
                    <div className="pt-2 flex items-baseline justify-between border-t border-slate-100 dark:border-neutral-800">
                      <div>
                        {priceUnavailable ? (
                          <span className={`text-xs font-medium ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
                            Price unavailable
                          </span>
                        ) : service.priceType && service.priceType !== 'FIXED' ? (
                          <div className="flex items-baseline gap-1">
                            <span className={`text-base font-bold tabular-nums ${isDark ? 'text-white' : 'text-ink'}`}>
                              ₱{Number(service.price).toLocaleString()}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
                              {service.priceType === 'PER_HOUR'
                                ? '/ hour'
                                : service.priceType === 'PER_DAY'
                                ? '/ day'
                                : service.priceType === 'PER_PROJECT'
                                ? '/ project'
                                : ''}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className={`text-base font-bold tabular-nums ${isDark ? 'text-white' : 'text-ink'}`}>
                              ₱{Number(service.price).toLocaleString()}
                            </span>
                            <span className={`text-xs font-normal ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
                              fixed
                            </span>
                          </div>
                        )}
                      </div>

                      {service.estimatedDurationMins ? (
                        <span className={`flex items-center gap-1 text-[11px] font-medium ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
                          <Clock className="size-3 text-ink-subtle dark:text-ink-subtle" />
                          <span>{service.estimatedDurationMins}m</span>
                        </span>
                      ) : null}
                    </div>

                    {/* Accepted Payment Methods — Unified Neutral Professional Badges */}
                    <div className="pt-1 space-y-1">
                      <p className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
                        Accepted payment methods
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cash && (
                          <span
                            className={`inline-flex items-center gap-1 border text-[10px] font-medium px-2 py-0.5 rounded-md ${
                              isDark
                                ? 'bg-charcoal/60 border-neutral-700/80 text-neutral-300'
                                : 'bg-slate-50 border-slate-200 text-ink-muted'
                            }`}
                          >
                            <MapPin className="w-2.5 h-2.5 text-ink-subtle dark:text-ink-muted" />
                            <span>On-site Cash</span>
                          </span>
                        )}
                        {gcash && (
                          <span
                            className={`inline-flex items-center gap-1 border text-[10px] font-medium px-2 py-0.5 rounded-md ${
                              isDark
                                ? 'bg-charcoal/60 border-neutral-700/80 text-neutral-300'
                                : 'bg-slate-50 border-slate-200 text-ink-muted'
                            }`}
                          >
                            <Smartphone className="w-2.5 h-2.5 text-ink-subtle dark:text-ink-muted" />
                            <span>GCash · Test Mode</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div
                    className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800 space-y-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isOwned ? (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/provider/service-manager?id=${service.id}`)}
                            className={`flex-1 font-medium text-xs py-2 rounded-xl border transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-charcoal border-neutral-700 text-neutral-200 hover:bg-charcoal'
                                : 'bg-white border-slate-200 text-ink-secondary hover:bg-slate-50'
                            }`}
                          >
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewListing(service)}
                            className={`flex-1 font-medium text-xs py-2 rounded-xl border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                              isDark
                                ? 'bg-charcoal border-neutral-700 text-neutral-300 hover:bg-charcoal'
                                : 'bg-slate-50 border-slate-200 text-ink-secondary hover:bg-slate-100'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5 text-ink-subtle" />
                            <span>Details</span>
                          </button>
                        </div>
                        <p className={`text-[10px] text-center ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`}>
                          Your own listing
                        </p>
                      </div>
                    ) : activeEngagement ? (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => router.push(`/seeker/seeker-activity?tab=all&booking=${activeEngagement.id}`)}
                          className="w-full bg-charcoal hover:bg-charcoal dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-charcoal font-semibold text-xs py-2 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {activeEngagement.status === 'in_progress' ? 'In Progress - View Activity' :
                             activeEngagement.status === 'queued' ? 'In Queue - View Activity' :
                             activeEngagement.status === 'pending_provider' ? 'Pending Approval - View Activity' :
                             activeEngagement.status === 'awaiting_seeker_approval' ? 'Approval Needed - View Activity' :
                             'Active Booking - View Activity'}
                          </span>
                        </button>
                        <p className={`text-[10px] text-center ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
                          Active booking in progress
                        </p>
                      </div>
                    ) : priceUnavailable ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewListing(service)}
                          className={`w-full font-medium text-xs py-2.5 rounded-xl border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                            isDark
                              ? 'border-neutral-700 bg-charcoal text-neutral-300 hover:bg-charcoal'
                              : 'border-slate-200 bg-slate-50 text-ink-secondary hover:bg-slate-100'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5 text-ink-subtle" />
                          <span>View Details & Request Quote</span>
                        </button>
                      </div>
                    ) : isQueueFull ? (
                      cash ? (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleJoinWaitlist(service)}
                            disabled={joiningWaitlistId === service.id}
                            className={`flex-1 border text-xs font-medium py-2 rounded-xl transition-colors flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-60 ${
                              isDark
                                ? 'border-neutral-700 bg-charcoal text-neutral-300 hover:bg-charcoal'
                                : 'border-slate-200 bg-slate-50 text-ink-secondary hover:bg-slate-100'
                            }`}
                          >
                            <Bell className="w-3 h-3 text-ink-subtle" />
                            <span>{joiningWaitlistId === service.id ? 'Joining...' : 'Notify Me'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBookListing(service, 'On-site Cash')}
                            onMouseEnter={() => prefetchProviderSummary(service)}
                            onFocus={() => prefetchProviderSummary(service)}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs py-2 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Direct Cash</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleJoinWaitlist(service)}
                          disabled={joiningWaitlistId === service.id}
                          className={`w-full border text-xs font-medium py-2 rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60 ${
                            isDark
                              ? 'border-neutral-700 bg-charcoal text-neutral-300 hover:bg-charcoal'
                              : 'border-slate-200 bg-slate-50 text-ink-secondary hover:bg-slate-100'
                          }`}
                        >
                          <Bell className="w-3.5 h-3.5 text-ink-subtle" />
                          <span>{joiningWaitlistId === service.id ? 'Joining Waitlist...' : 'Notify Me When Open'}</span>
                        </button>
                      )
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewListing(service)}
                          aria-label={`Inspect ${service.title} details`}
                          className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                            isDark
                              ? 'border-neutral-700 bg-charcoal text-neutral-200 hover:bg-charcoal'
                              : 'border-slate-200 bg-slate-50 text-ink-secondary hover:bg-slate-100 hover:text-ink'
                          }`}
                          title="View all details"
                        >
                          <Eye className="w-3.5 h-3.5 text-ink-subtle" />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBookListing(service, cash ? 'On-site Cash' : 'GCash')}
                          onMouseEnter={() => prefetchProviderSummary(service)}
                          onFocus={() => prefetchProviderSummary(service)}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs py-2 rounded-xl transition-all shadow-xs active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Book Service</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            nextPage={nextPage}
            prevPage={prevPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredServices.length}
            variant="seeker"
          />
        </div>
      )}

      {/* Service Details Inspection Modal */}
      <ServiceDetailsModal
        listing={previewListing}
        isOpen={!!previewListing}
        onClose={() => setPreviewListing(null)}
        onBookListing={handleBookListing}
        onJoinWaitlist={handleJoinWaitlist}
        joiningWaitlistId={joiningWaitlistId}
        isOwned={!!(user && previewListing && previewListing.providerId === user.id)}
        activeEngagement={
          previewListing
            ? jobEngagements.find(
                (je) =>
                  je.seekerId === user?.id &&
                  je.serviceId === previewListing.id &&
                  ['pending_provider', 'queued', 'in_progress', 'awaiting_seeker_approval', 'disputed'].includes(je.status)
              )
            : undefined
        }
        isDark={isDark}
        router={router}
        prefetchProviderSummary={prefetchProviderSummary}
      />
    </>
  );
}
