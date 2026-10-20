import type { ServiceLocationMode, BookingLocationMode } from '../lib/serviceArrangement';
import type { LocationPoint, BookingLocation } from '../lib/location';
import React from 'react';
import type { BookingActionResult } from '../lib/bookingActionUpdate';
import { User, ServiceListing, JobRequest, Bid, JobEngagement, Transaction, Notification, UserReport } from '../types';
import { apiCreateRequest, apiUpdateRequest, apiDeleteRequest } from '../api/requests.api';
import type { RequestUrgency } from '../lib/requestUrgency';
import {
  apiBookDirect,
  apiInitiatePayment,
  apiBookDirectFromOffer,
  apiConfirmCompletion,
  apiDisputeJob
} from '../api/bookings.api';
import { apiRejectOffer } from '../api/offers.api';
import { useToast } from '../components/ui/Toast';
import { getApiErrorBody, getApiErrorMessage, getApiErrorStatus, getUserFacingErrorMessage } from '../lib/api/errors';
import { isPayMongoCheckoutUrl, rememberGcashCheckout, type PendingGcashCheckout } from '../lib/paymentCheckout';
import { normalizeOfferStatus } from '../lib/offerStatus';
import { mapRequestToJobRequest } from '../context/mappers';

interface SeekerActionsDeps {
  users: User[];
  services: ServiceListing[];
  jobRequests: JobRequest[];
  bids: Bid[];
  jobEngagements: JobEngagement[];
  dbCategories: { id: string; name: string }[];
  setJobRequests: React.Dispatch<React.SetStateAction<JobRequest[]>>;
  setBids: React.Dispatch<React.SetStateAction<Bid[]>>;
  setJobEngagements: React.Dispatch<React.SetStateAction<JobEngagement[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setUserReports: React.Dispatch<React.SetStateAction<UserReport[]>>;
  syncRequests: () => Promise<void>;
  syncEngagements: () => Promise<void>;
  syncBids: () => Promise<void>;
  syncNotifications: () => Promise<void>;
  syncTransactions: () => Promise<void>;
  applyBookingAction: (result: BookingActionResult) => void;
  helperAddNotification: (userId: string, title: string, desc: string) => void;
}

export function useSeekerActions({
  services = [],
  jobRequests,
  bids,
  dbCategories,
  setJobRequests,
  setBids,
  syncRequests,
  syncBids,
  applyBookingAction,
}: SeekerActionsDeps) {
  const { success, error: toastError, info } = useToast();

  const startGcashCheckout = async (context: Omit<PendingGcashCheckout, 'paymentIntentId' | 'redirectUrl'>, jobLocation?: BookingLocation, serviceLocationMode?: BookingLocationMode) => {
    const response = await apiInitiatePayment({
      serviceId: context.serviceId, offerId: context.offerId,
      quantity: context.quantity, paymentMethodType: 'gcash',
      ...(jobLocation && { jobLocation }),
      ...(serviceLocationMode && { serviceLocationMode }),
    });
    if (!response.success || !response.data?.paymentIntentId) throw new Error(response.error || 'GCash checkout could not be started.');
    if (response.data.redirectUrl && !isPayMongoCheckoutUrl(response.data.redirectUrl)) throw new Error('The payment checkout link is unavailable. Please try again.');
    const checkout: PendingGcashCheckout = {
      ...context, paymentIntentId: response.data.paymentIntentId,
      redirectUrl: response.data.redirectUrl, expectedAmount: response.data.expectedAmount, commission: response.data.commission,
      checkoutOpened: false, isTestMode: response.data.isTestMode,
    };
    rememberGcashCheckout(checkout);
    return checkout;
  };

  const postJobRequest = async (
    seekerId: string,
    title: string,
    category: string,
    urgency: RequestUrgency,
    budget: number,
    description: string,
    paymentMethods = { cash: true, gcash: true },
    locationOptions?: { photoIds?: string[]; jobLocation?: LocationPoint | null; serviceLocationMode?: ServiceLocationMode; transportationFee?: number | null }
  ) => {
    try {
      const catId = dbCategories.find(c => c.id === category)?.id;
      if (catId) {
        const res = await apiCreateRequest({
          categoryId: catId,
          title,
          description,
          budgetMin: budget,
          budgetMax: budget,
          urgency,
          paymentMethods,
          ...locationOptions,
        });

        if (res.success) {
          success('Request posted', 'Providers can now see your request.');
          return true;
        }
        toastError('Failed to post request', getUserFacingErrorMessage(res.error, 'We couldn’t post your request. Please try again.'));
      } else {
        toastError('Category Error', 'Please select a valid service category.');
      }
    } catch (err: unknown) {
      const body = getApiErrorBody(err);
      const message = getApiErrorMessage(err, 'We couldn’t post your request. Please try again.');
      toastError(body?.code === 'CONTENT_REVISION_REQUIRED' ? 'Please revise your request' : 'Failed to post request', message);
      if (body?.code === 'CONTENT_REVISION_REQUIRED') return { success: false as const, error: message, field: body.field };
    }
    return false;
  };

  const editJobRequest = async (requestId: string, title: string, budget: number, description: string, urgency?: RequestUrgency, locationOptions?: { photoIds?: string[]; jobLocation?: LocationPoint | null; serviceLocationMode?: ServiceLocationMode; transportationFee?: number | null }): Promise<(Pick<JobRequest, 'title' | 'budget' | 'description'> & { urgency?: string }) | null> => {
    try {
      const res = await apiUpdateRequest(requestId, { title, budgetMin: budget, budgetMax: budget, description, ...locationOptions, ...(urgency !== undefined && { urgency }) });
      if (res.success) {
        const savedLocation = res.data?.serviceLocationMode ? mapRequestToJobRequest(res.data) : undefined;
        const updated = {
          ...(res.data?.photos && { photos: res.data.photos }),
          ...locationOptions,
          ...(locationOptions?.jobLocation === null && {jobLocation:undefined}),
          ...(savedLocation && { serviceLocationMode: savedLocation.serviceLocationMode, jobLocation: savedLocation.jobLocation, transportationFee: savedLocation.transportationFee }),
          title: res.data?.title ?? title.trim().toUpperCase(),
          budget: Number(res.data?.budgetMax ?? res.data?.budgetMin ?? budget),
          description: res.data?.description ?? description,
          ...(res.data?.urgency !== undefined || urgency !== undefined ? { urgency: res.data?.urgency ?? urgency } : {}),
        };
        setJobRequests(prev => prev.map(request => request.id === requestId ? { ...request, ...updated } : request));
        success('Request Updated', 'Your job request was modified successfully.');
        // A confirmed save must not wait for or fail because of a public-board read.
        void syncRequests().catch(() => {});
        return updated;
      }
      toastError('Update Failed', res.error || 'Unable to update the request.');
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Unable to update the request.');
      toastError(getApiErrorStatus(err) === 422 && /revise|cannot be published|selected category/i.test(message) ? 'Please revise your request' : 'Update Failed', message);
    }
    return null;
  };

  const deleteJobRequest = async (requestId: string): Promise<boolean> => {
    try {
      const res = await apiDeleteRequest(requestId);
      if (res.success) {
        // Change local data only after the server commits. Never touch bookings.
        setJobRequests(current => current.filter(request => request.id !== requestId));
        setBids(current => current.map(bid => bid.requestId === requestId
          ? { ...bid, requestStatus: 'CANCELED', ...(bid.status.toUpperCase() === 'PENDING' ? { status: 'declined' as const } : {}) }
          : bid));
        success('Request Deleted', 'Your job request has been removed.');
        void Promise.allSettled([syncRequests(), syncBids()]);
        return true;
      }
      toastError('Request not deleted', res.error || 'Your request was not deleted. Please try again.');
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Your request was not deleted. Please try again.');
      toastError('Request not deleted', /unmatched|selected, paid, or matched/i.test(message)
        ? 'This request can’t be deleted right now because it is already involved in an active service. Review its booking in Activity.'
        : message);
    }
    return false;
  };

  const toggleJobRequestStatus = async (requestId: string, currentStatus?: string): Promise<boolean> => {
    const current = jobRequests.find(r => r.id === requestId);
    const effectiveStatus = currentStatus || (current ? current.status : 'OPEN');
    const isCurrentlyOpen = effectiveStatus === 'OPEN' || effectiveStatus === 'open';
    const nextStatus = isCurrentlyOpen ? 'CLOSED' : 'OPEN';

    try {
      const res = await apiUpdateRequest(requestId, { status: nextStatus });
      if (res.success) {
        const confirmedStatus = res.data?.status ?? nextStatus;
        setJobRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: confirmedStatus } : r));
        if (nextStatus === 'OPEN') {
          success('Request active', 'Providers can see your request again.');
        } else {
          info('Request paused', 'New offers are paused. Existing bookings are unchanged.');
        }
        // Public requests exclude paused items. Refresh them independently;
        // a delayed/failed read must not reverse a confirmed owner-list update.
        void syncRequests().catch(() => {});
        return true;
      }
      return false;
    } catch (err: unknown) {
      toastError('Status Update Failed', getApiErrorMessage(err, 'Unable to update the request status.'));
      return false;
    }
  };

  const bookProviderDirectly = async (
    seekerId: string,
    serviceId: string,
    price: number,
    description: string,
    paymentMethod: 'GCash' | 'On-site Cash',
    quantity = 1,
    jobLocation?: LocationPoint,
    serviceLocationMode?: BookingLocationMode
  ) => {
    try {
      if (paymentMethod === 'On-site Cash') {
        const res = await apiBookDirect({
          serviceId,
          quantity,
          ...(jobLocation && { jobLocation }),
          ...(serviceLocationMode && { serviceLocationMode }),
          schedule: 'Immediate',
          message: description,
        });
        if (res.success) {
          success('Booking request sent', 'Wait for the provider to accept your request.');
          return;
        }
      } else {
        const service = services.find(entry => entry.id === serviceId);
        return await startGcashCheckout({ seekerId, serviceId, quantity, title: service?.title, providerName: service?.providerName }, jobLocation, serviceLocationMode);
      }
    } catch (err: unknown) {
      toastError('Booking Failed', getApiErrorMessage(err, 'Unable to create the booking.'));
      throw err;
    }
  };

  const acceptBid = async (bidId: string, paymentMethod: 'GCash' | 'On-site Cash' = 'On-site Cash', jobLocation?: BookingLocation) => {
    const targetBid = bids.find(b => b.id === bidId);
    if (!targetBid) return;

    const targetRequest = jobRequests.find(r => r.id === targetBid.requestId);
    const seekerId = targetRequest?.seekerId || targetBid.seekerId;
    if (paymentMethod === 'GCash' && !seekerId) {
      toastError('Request details unavailable', 'Refresh your offers and try again.');
      return;
    }

    try {
      if (paymentMethod === 'On-site Cash') {
        const res = await apiBookDirectFromOffer(bidId, ...(jobLocation ? [jobLocation] as const : []));
        if (res.success) {
          setBids(current => current.map(bid => bid.id === bidId ? { ...bid, status: 'accepted' } : bid));
          success('Offer accepted', 'You can now message the provider to arrange the work.');
          return;
        }
      } else {
        return await startGcashCheckout({ seekerId: seekerId!, offerId: bidId, title: targetRequest?.title || targetBid.requestTitle, providerName: targetBid.providerName }, jobLocation);
      }
    } catch (err: unknown) {
      toastError('Action Failed', getApiErrorMessage(err, 'Unable to accept the offer.'));
      throw err;
    }
  };

  const declineBid = async (bidId: string) => {
    try {
      const res = await apiRejectOffer(bidId);
      if (res.success) {
        const status = normalizeOfferStatus(res.data?.status || 'REJECTED');
        setBids(current => current.map(bid => bid.id === bidId ? { ...bid, status, decisionReason: status === 'declined' ? 'DECLINED' : null } : bid));
        success(status === 'withdrawn' ? 'Offer withdrawn' : 'Offer declined', status === 'withdrawn' ? 'Your offer is no longer available to the customer.' : 'The provider has been notified.');
        return;
      }
    } catch (err: unknown) {
      toastError('Action Failed', getApiErrorMessage(err, 'Unable to decline the offer.'));
      throw err;
    }
  };

  const confirmJobCompletion = async (jobId: string) => {
    try {
      const res = await apiConfirmCompletion(jobId);
      if (res.success) {
        if (res.data) applyBookingAction(res.data);
        success('Booking completed', 'You can now leave a review of the service.');
        return;
      }
    } catch (err: unknown) {
      toastError('Completion Failed', getApiErrorMessage(err, 'Unable to confirm completion.'));
      throw err;
    }
  };

  const disputeJob = async (jobId: string, reason: string, description?: string, evidenceUrl?: string) => {
    try {
      const res = await apiDisputeJob(jobId, reason, description, evidenceUrl);
      if (res.success) {
        if (res.data?.booking) applyBookingAction(res.data);
        success('Dispute Filed', 'Admin has been notified and payment has been frozen.');
        return;
      }
    } catch (err: unknown) {
      toastError('Failed to dispute', getApiErrorMessage(err, 'Unable to submit the dispute.'));
      throw err;
    }
  };

  return {
    postJobRequest,
    editJobRequest,
    deleteJobRequest,
    toggleJobRequestStatus,
    acceptBid,
    declineBid,
    confirmJobCompletion,
    disputeJob,
    bookProviderDirectly
  };
}
