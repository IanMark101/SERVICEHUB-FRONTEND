import IncomingBookingRequestCard from './IncomingBookingRequestCard';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Inbox, Loader2, Search } from 'lucide-react';
import InboxState from '../ui/InboxState';
import styles from '../ui/Inbox.module.css';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import TransactionBlockedModal from '../ui/TransactionBlockedModal';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import LimitedModeDashboardCard from '../landing/LimitedModeDashboardCard';
import ProposalModal from './browse-jobs/ProposalModal';
import IncomingInquiryCard from './IncomingInquiryCard';
import { useToast } from '../ui/Toast';
import { apiGetMyServices } from '../../api/services.api';
import { apiDeclineListingInquiry } from '../../api/requests.api';
import { mapServiceToListing } from '../../context/mappers';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { JobRequest, ServiceListing } from '../../types';
import type { BookingLocationMode } from '../../lib/serviceArrangement';
import type { LocationPoint } from '../../lib/location';

export default function IncomingRequests({ currentProviderId = 'u3' }: { currentProviderId?: string }) {
  const { jobEngagements, jobRequests, bids, submitBid, respondToDirectBooking, isDark, requestsStatus, engagementsStatus, refreshAll } = useApp();
  const toast = useToast();
  const { canTransact } = useTransactionPermission();
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'accepting' | 'declining' | null>(null);
  const [blockedModalOpen, setBlockedModalOpen] = useState<boolean>(false);
  const [referenceTime, setReferenceTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const responseLock = React.useRef(false);
  const [priceRequest, setPriceRequest] = useState<JobRequest | undefined>();
  const [priceListing, setPriceListing] = useState<ServiceListing[]>([]);
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState(60);
  const [includedWork, setIncludedWork] = useState('');
  const [availability, setAvailability] = useState('');
  const [sendingPrice, setSendingPrice] = useState(false);

  const openPriceForm = async (request: JobRequest) => {
    if (!canTransact) { setBlockedModalOpen(true); return; }
    if (responseLock.current) return;
    responseLock.current = true; setLoadingJobId(request.id); setLoadingAction('accepting');
    try {
      const response = await apiGetMyServices();
      const listing = response.data?.map(mapServiceToListing).find((item: ServiceListing) => item.id === request.targetServiceId && item.status === 'ACTIVE' && !item.isPaused);
      if (!response.success || !listing) throw new Error('The requested listing is no longer available.');
      if (listing.priceType !== 'BY_AGREEMENT') throw new Error('This service has a set price. Close the old inquiry and ask the seeker to book at the listed price.');
      setPriceListing([listing]); setPrice(0); setDuration(listing.estimatedDurationMins || 60); setIncludedWork(''); setAvailability(''); setPriceRequest(request);
    } catch (error) { toast.error('Could not open request', getApiErrorMessage(error, 'Try loading your listing again.')); }
    finally { responseLock.current = false; setLoadingJobId(null); setLoadingAction(null); }
  };
  const declineInquiry = async (request: JobRequest) => {
    if (responseLock.current) return;
    responseLock.current = true; setLoadingJobId(request.id); setLoadingAction('declining');
    try { await apiDeclineListingInquiry(request.id); toast.success('Request declined', 'The seeker has been notified. No booking was created.'); await refreshAll(); }
    catch (error) { toast.error('Could not decline request', getApiErrorMessage(error, 'Please try again.')); }
    finally { responseLock.current = false; setLoadingJobId(null); setLoadingAction(null); }
  };
  const sendPrice = async (event: React.FormEvent, arrangement: { serviceLocationMode: BookingLocationMode; providerVenue?: LocationPoint }) => {
    event.preventDefault();
    if (!priceRequest || responseLock.current) return;
    responseLock.current = true; setSendingPrice(true);
    try {
      const sent = await submitBid(priceRequest.id, currentProviderId, priceRequest.targetServiceId!, price, duration, includedWork, availability.trim() || undefined, arrangement);
      if (sent) setPriceRequest(undefined);
    } catch (error) { toast.error('Could not send price', getApiErrorMessage(error, 'Your price has not been sent. Please try again.')); }
    finally { responseLock.current = false; setSendingPrice(false); }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setReferenceTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleRespond = async (jobId: string, accept: boolean) => {
    if (accept && !canTransact) {
      setBlockedModalOpen(true);
      return;
    }
    setLoadingJobId(jobId);
    setLoadingAction(accept ? 'accepting' : 'declining');
    try {
      await respondToDirectBooking(jobId, accept);
    } catch {
      // already toasted
    } finally {
      setLoadingJobId(null);
      setLoadingAction(null);
    }
  };

  // Filter pending direct bookings
  const pendingRequests = jobEngagements.filter(
    je => je.providerId === currentProviderId && je.status === 'pending_provider'
  );
  const agreementRequestIds = new Set(jobRequests.filter(request => request.targetServiceId && !request.preferredPaymentMethod).map(request => request.id));
  const answeredRequestIds = new Set(bids.filter(bid => bid.providerId === currentProviderId &&
    (['pending', 'pending_payment', 'accepted'].includes(bid.status.toLowerCase()) ||
      (agreementRequestIds.has(bid.requestId) && ['declined', 'rejected', 'withdrawn'].includes(bid.status.toLowerCase())))).map(bid => bid.requestId));
  const quoteInquiries = jobRequests.filter((request) =>
    request.targetProviderId === currentProviderId && request.targetServiceId && request.status === 'OPEN' &&
    !answeredRequestIds.has(request.id)
  );
  const inboxItems = [
    ...quoteInquiries.map(request => ({ kind:'inquiry' as const, item:request })),
    ...pendingRequests.map(booking => ({ kind:'booking' as const, item:booking })),
  ].sort((a,b) => (Date.parse(b.item.createdAt) || 0) - (Date.parse(a.item.createdAt) || 0));
  const query = searchQuery.trim().toLowerCase();
  const matchingItems = inboxItems.filter(({item}) => [item.title, item.seekerName, item.description].some(text => text?.toLowerCase().includes(query)));
  const pagination = usePagination(matchingItems, 10);

  // Compute relative time from a full ISO timestamp
  const formatTimeAgo = (isoStr: string): string => {
    if (!isoStr) return 'Just now';
    if (!referenceTime) return 'Recently';
    const diffMs = referenceTime - new Date(isoStr).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return diffSecs <= 1 ? 'Just now' : `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffHrs / 24)} day${Math.floor(diffHrs / 24) > 1 ? 's' : ''} ago`;
  };

  return <div className={`space-y-3 ${isDark ? 'text-white' : 'text-ink'}`}>
    <LimitedModeDashboardCard role="provider" />
    {inboxItems.length > 0 && <div className={styles.toolbar}>
      <input type="search" className={styles.search} aria-label="Search incoming requests" placeholder="Search person, service or work…" value={searchQuery} onChange={e => {setSearchQuery(e.target.value);pagination.reset();}} />
      <span>{matchingItems.length} awaiting response</span>
    </div>}
    {inboxItems.length === 0 && (requestsStatus === 'loading' || engagementsStatus === 'loading') ?
      <InboxState loading icon={Loader2} title="Loading incoming requests..." description="Fetching booking requests and quote inquiries." /> :
      inboxItems.length === 0 && (requestsStatus === 'error' || engagementsStatus === 'error') ?
      <InboxState kind="error" title="Incoming requests could not be loaded." description="Try again to fetch your inbox." actionLabel="Try again" onAction={refreshAll} /> :
      inboxItems.length === 0 ? <InboxState icon={Inbox} title="No Incoming Requests" description="When seekers choose your services, their booking requests and quote inquiries will appear here." /> :
      matchingItems.length === 0 ? <InboxState icon={Search} title="No matching requests" description="Try another person or service name." actionLabel="Clear search" onAction={() => {setSearchQuery('');pagination.reset();}} /> :
      <div className="space-y-2">
        {pagination.paginatedItems.map(entry => entry.kind === 'booking' ?
          <IncomingBookingRequestCard key={`booking-${entry.item.id}`} booking={entry.item} timeLabel={formatTimeAgo(entry.item.createdAt)} disabled={Boolean(loadingJobId)} loadingAction={loadingJobId === entry.item.id ? loadingAction : null} onRespond={accept => void handleRespond(entry.item.id,accept)} /> :
          <IncomingInquiryCard key={`inquiry-${entry.item.id}`} request={entry.item} timeLabel={formatTimeAgo(entry.item.createdAt)} disabled={Boolean(loadingJobId)} loadingAction={loadingJobId === entry.item.id ? loadingAction : null} onDecline={() => void declineInquiry(entry.item)} onSetPrice={() => void openPriceForm(entry.item)} />)}
        <PaginationBar {...pagination} variant="provider" />
      </div>}
    <ProposalModal key={priceRequest?.id || 'closed'} request={priceRequest} listings={priceListing} serviceId={priceRequest?.targetServiceId || ''} onServiceChange={() => {}} isSubmitting={sendingPrice} isDark={isDark} price={price} duration={duration} message={includedWork} availability={availability} onAvailabilityChange={setAvailability} onPriceChange={setPrice} onDurationChange={setDuration} onMessageChange={setIncludedWork} onClose={() => { if (!responseLock.current) setPriceRequest(undefined); }} onSubmit={sendPrice} />
    <TransactionBlockedModal isOpen={blockedModalOpen} onClose={() => setBlockedModalOpen(false)} />
  </div>;
}
