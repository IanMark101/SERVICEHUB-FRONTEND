import React from 'react';
import {
  User,
  ServiceListing,
  JobRequest,
  Bid,
  JobEngagement,
  Transaction,
  Notification,
  CategorySuggestion,
  UserReport
} from '../types';
import { apiCreateRequest, apiUpdateRequest, apiDeleteRequest } from '../api/requests.api';
import type { RequestUrgency } from '../lib/requestUrgency';
import {
  apiBookDirect,
  apiInitiatePayment,
  apiConfirmOnlineBooking,
  apiBookDirectFromOffer,
  apiConfirmCompletion,
  apiDisputeJob
} from '../api/bookings.api';
import { apiRejectOffer } from '../api/offers.api';
import { apiSuggestCategory } from '../api/categories.api';
import { useToast } from '../components/ui/Toast';
import { getApiErrorBody, getApiErrorMessage, getApiErrorStatus } from '../lib/api/errors';
import { paymentReturnPath, rememberGcashCheckout } from '../lib/paymentCheckout';
import { normalizeOfferStatus } from '../lib/offerStatus';

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
  setCategorySuggestions: React.Dispatch<React.SetStateAction<CategorySuggestion[]>>;
  syncRequests: () => Promise<void>;
  syncEngagements: () => Promise<void>;
  syncBids: () => Promise<void>;
  syncNotifications: () => Promise<void>;
  syncTransactions: () => Promise<void>;
  helperAddNotification: (userId: string, title: string, desc: string) => void;
}

export function useSeekerActions({
  jobRequests,
  bids,
  dbCategories,
  setJobRequests,
  setBids,
  setCategorySuggestions,
  syncRequests,
  syncEngagements,
  syncBids,
  syncNotifications,
  syncTransactions,
}: SeekerActionsDeps) {
  const { success, error: toastError, info } = useToast();

  const postJobRequest = async (
    seekerId: string,
    title: string,
    category: string,
    urgency: RequestUrgency,
    budget: number,
    description: string,
    paymentMethods = { cash: true, gcash: true }
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
        });

        if (res.success) {
          await syncRequests();
          success('Request posted', 'Providers can now see your request.');
          return true;
        }
        toastError('Failed to post request', res.error || 'Unable to post the request.');
      } else {
        toastError('Category Error', 'Please select a valid service category.');
      }
    } catch (err: unknown) {
      const body = getApiErrorBody(err);
      const validationIssue = body?.errors?.[0]?.message;
      const message = validationIssue || getApiErrorMessage(err, 'Unable to post the request.');
      toastError(body?.code === 'CONTENT_REVISION_REQUIRED' ? 'Please revise your request' : 'Failed to post request', message);
      if (body?.code === 'CONTENT_REVISION_REQUIRED') return { success: false as const, error: message, field: body.field };
    }
    return false;
  };

  const editJobRequest = async (requestId: string, title: string, budget: number, description: string, urgency?: RequestUrgency): Promise<(Pick<JobRequest, 'title' | 'budget' | 'description'> & { urgency?: string }) | null> => {
    try {
      const res = await apiUpdateRequest(requestId, { title, budgetMin: budget, budgetMax: budget, description, ...(urgency !== undefined && { urgency }) });
      if (res.success) {
        const updated = {
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
    quantity = 1
  ) => {
    try {
      if (paymentMethod === 'On-site Cash') {
        const res = await apiBookDirect({
          serviceId,
          quantity,
          schedule: 'Immediate',
          message: description,
        });
        if (res.success) {
          await syncEngagements();
          await syncNotifications();
          success('Booking request sent', 'Wait for the provider to accept your request.');
          return;
        }
      } else {
        const payRes = await apiInitiatePayment({
          serviceId,
          quantity,
          paymentMethodType: 'gcash',
        });
        if (payRes.success) {
          if (payRes.data.redirectUrl) {
            rememberGcashCheckout({
              seekerId, serviceId, paymentIntentId: payRes.data.paymentIntentId,
              redirectUrl: payRes.data.redirectUrl,
            });
            info('GCash checkout ready', 'Open the payment page to finish your test payment.');
            window.location.href = paymentReturnPath(payRes.data.paymentIntentId);
            return;
          }
          const confirmRes = await apiConfirmOnlineBooking({
            serviceId,
            paymentIntentId: payRes.data.paymentIntentId,
          });
          if (confirmRes.success && confirmRes.data?.status === 'SUCCEEDED') {
            await syncEngagements();
            await syncNotifications();
            success('Test payment confirmed', 'Your booking is now in the provider’s queue.');
            return;
          }
        }
      }
    } catch (err: unknown) {
      toastError('Booking Failed', getApiErrorMessage(err, 'Unable to create the booking.'));
    }
  };

  const acceptBid = async (bidId: string, paymentMethod: 'GCash' | 'On-site Cash' = 'On-site Cash') => {
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
        const res = await apiBookDirectFromOffer(bidId);
        if (res.success) {
          await Promise.allSettled([syncEngagements(), syncBids(), syncRequests()]);
          success('Offer accepted', 'You can now message the provider to arrange the work.');
          return;
        }
      } else {
        const serviceId = targetBid.serviceId;

        const payRes = await apiInitiatePayment({
          ...(serviceId ? { serviceId } : {}),
          offerId: bidId,
          paymentMethodType: 'gcash',
        });

        if (payRes.success) {
          if (payRes.data.redirectUrl) {
            rememberGcashCheckout({
              seekerId: seekerId!, serviceId, offerId: bidId,
              paymentIntentId: payRes.data.paymentIntentId, redirectUrl: payRes.data.redirectUrl,
            });
            info('GCash checkout ready', 'Open the payment page to finish your test payment.');
            window.location.href = paymentReturnPath(payRes.data.paymentIntentId);
            return;
          }
          const confirmRes = await apiConfirmOnlineBooking({
            ...(serviceId ? { serviceId } : {}),
            paymentIntentId: payRes.data.paymentIntentId,
            offerId: bidId
          });

          if (confirmRes.success && confirmRes.data?.status === 'SUCCEEDED') {
            await Promise.allSettled([syncEngagements(), syncBids(), syncRequests()]);
            success('Offer accepted', 'Your test payment is confirmed. You’re now in the provider’s queue.');
            return;
          }
        }
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
        success(status === 'withdrawn' ? 'Offer withdrawn' : 'Offer declined', status === 'withdrawn' ? 'Your offer is no longer available to the seeker.' : 'The provider has been notified.');
        void syncBids().catch(() => { /* The decision is already committed. */ });
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
        await syncEngagements();
        await syncNotifications();
        await syncTransactions();
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
        await syncEngagements();
        success('Dispute Filed', 'Admin has been notified and payment has been frozen.');
        return;
      }
    } catch (err: unknown) {
      toastError('Failed to dispute', getApiErrorMessage(err, 'Unable to submit the dispute.'));
      throw err;
    }
  };

  const suggestCategory = async (seekerName: string, name: string, description: string) => {
    try {
      const res = await apiSuggestCategory({ name, description });
      if (res.success) {
        const newSuggestion: CategorySuggestion = {
          id: res.data.id,
          name,
          description,
          suggestedBy: seekerName,
          status: 'pending'
        };
        setCategorySuggestions(prev => [newSuggestion, ...prev]);
        success('Category Suggested', 'Admin will review your category request.');
        return;
      }
    } catch (err: unknown) {
      toastError('Request Failed', getApiErrorMessage(err, 'Unable to suggest the category.'));
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
    suggestCategory,
    bookProviderDirectly
  };
}
