'use client';

import { useId, useRef } from 'react';
import SidebarView from '@/components/layout/SidebarView';
import DashboardHeader from '@/components/layout/DashboardHeader';
import HeaderDesktopSearch from '@/components/layout/header/HeaderDesktopSearch';
import HeaderProfileMenu from '@/components/layout/header/HeaderProfileMenu';
import HeaderNotifications from '@/components/layout/header/HeaderNotifications';
import MarketplaceSearchHeader from '@/components/marketplace/MarketplaceSearchHeader';
import MarketplacePresentation from '@/components/marketplace/MarketplacePresentation';
import MarketplaceLocationControl from '@/components/location/MarketplaceLocationControl';
import MarketplaceResultsSummary from '@/components/location/MarketplaceResultsSummary';
import ServiceMarketplaceGrid from '@/components/seeker/seek-services/ServiceMarketplaceGrid';
import JobRequestCard from '@/components/provider/browse-jobs/JobRequestCard';
import { PaginationBarView } from '@/components/ui/PaginationBar';
import ScaledPreview from './ScaledPreview';
import { previewCategories, previewLocation, previewRequests, previewServices, previewUser } from './workspacePreviewData';
import styles from './WorkspaceDashboardPreview.module.css';

const noop = () => {};

/** The current product components, with isolated example data and inert controls. */
export default function WorkspaceDashboardPreview({ role, isDark }: { role: 'seeker' | 'provider'; isDark: boolean }) {
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsId = useId();
  const user = { ...previewUser, role };
  const activeTab = role === 'seeker' ? 'seek-services' : 'browse-services';
  const pageName = role === 'seeker' ? 'Find Services' : 'Find Work';
  const filters = role === 'seeker' ? ['All', 'Available Now', 'Top Rated', 'Low Queue'] : ['All', 'Urgent', 'High Budget', 'Few Offers'];
  return <ScaledPreview width={1440} label={`${role === 'seeker' ? 'Customer' : 'Provider'} dashboard — current UI with fictional sample data`}>
    <div className={`workspace-shell ${role === 'provider' ? 'workspace-shell--provider' : ''} ${styles.dashboard}`} data-current-workspace={role}>
      <SidebarView currentRole={role} setCurrentRole={noop} activeTab={activeTab} setActiveTab={noop}
        isCollapsed={false} setIsCollapsed={noop} isMobileOpen={false} setIsMobileOpen={noop}
        onSignOut={noop} user={user} isDark={isDark} toggleTheme={noop}
        pendingBidsCount={0} pendingRequestsCount={0} pendingAppeals={0} unreadMessagesCount={0} preview />
      <div className="workspace-stage">
        <DashboardHeader currentRole={role} pageName={pageName} isDark={isDark} user={user}
          unreadMessagesCount={0} isMobileSearchOpen={false} theme={{ badge: '' }}
          setIsMobileOpen={noop} navigateToVerification={noop} toggleTheme={noop} onMessages={noop} onMobileSearch={noop}
          desktopSearch={<HeaderDesktopSearch model={{ userSearchRef: searchRef, userSearch: '', setUserSearch: noop,
            setShowUserSearchResults: noop, showUserSearchResults: false, userSearchLoading: false, userSearchResults: [], isDark,
            getDisplayName: person => `${person.firstName} ${person.lastName}`, handleOpenUserProfile: noop }} />}
          notifications={<HeaderNotifications isDark={isDark} isOpen={false} notifications={[]} unreadCount={0} badgeClass=""
            onToggle={noop} onClose={noop} onNotificationClick={noop} onMarkAllRead={noop} hasMore={false} onLoadMore={noop} />}
          profileMenu={<HeaderProfileMenu currentRole={role} user={user} isDark={isDark} isOpen={false} borderHoverClass=""
            onToggle={noop} onClose={noop} onOpenSettings={noop} onSignOut={noop} />}
          mobileSearch={null} />
        <div className={`workspace-page space-y-8 ${styles.page}`}>
          <MarketplaceSearchHeader role={role} isDark={isDark} value="" onQueryChange={noop} onSubmit={event => event.preventDefault()}
            resultsId={resultsId} locationControl={<MarketplaceLocationControl workspace={role} value={previewLocation} open={false} onOpenChange={noop} onApply={noop} />} />
          <MarketplacePresentation role={role} readOnly>
            <div className="marketplace-filter-row"><span className="marketplace-filter-label">Quick filters</span>
              {filters.map((label, index) => <button key={label} type="button" className="marketplace-chip" aria-pressed={index === 0}>{label}</button>)}
            </div>
            <div className="marketplace-category-row">
              {previewCategories.map((label, index) => <button key={label} type="button" className="marketplace-chip" aria-pressed={index === 0}>{label}</button>)}
            </div>
            <div id={resultsId} className="marketplace-results">
              <div className="marketplace-result-context">
                <MarketplaceResultsSummary workspace={role} location={previewLocation} search="" category="All Categories" total={3} loading={false} />
                <span className="marketplace-count">3 {role === 'seeker' ? 'Services' : 'Service Requests'} Available</span>
              </div>
              {role === 'seeker' ? <ServiceMarketplaceGrid readOnly model={{ router: { push: noop }, isDark, isLoading: false,
                activeFilter: 'all', setActiveFilter: noop, searchQuery: '', setSearchQuery: noop, selectedCategory: 'All Categories', setSelectedCategory: noop,
                totalItems: 3, searchLocation: previewLocation, filteredServices: previewServices, paginatedServices: previewServices,
                currentPage: 1, totalPages: 1, goToPage: noop, nextPage: noop, prevPage: noop, startIndex: 0, endIndex: 3,
                getProviderDetails: () => undefined, user, jobEngagements: [], canTransact: true, setBlockedModalOpen: noop,
                handleBookListing: noop, handleJoinWaitlist: noop, joiningWaitlistId: null, prefetchProviderSummary: noop,
              }} /> : <div className="space-y-6">
                <div className="marketplace-results-grid">{previewRequests.map(request => <JobRequestCard key={request.id} request={request}
                  proposalCount={request.offersCount || 0} isOwned={false} offerState={null} isDark={isDark} readOnly onProfile={noop} onDetails={noop} onSendOffer={noop} />)}</div>
                <PaginationBarView variant="provider" currentPage={1} totalPages={1} startIndex={0} endIndex={3} totalItems={3} goToPage={noop} nextPage={noop} prevPage={noop} isDark={isDark} />
              </div>}
            </div>
          </MarketplacePresentation>
        </div>
      </div>
    </div>
  </ScaledPreview>;
}
