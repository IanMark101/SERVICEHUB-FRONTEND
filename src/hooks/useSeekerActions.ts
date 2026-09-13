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
import { getApiErrorMessage } from '../lib/api/errors';

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
  setCategorySuggestions,
  syncRequests,
  syncEngagements,
  syncBids,
  syncNotifications,
  syncTransactions,
}: SeekerActionsDeps) {
  const { success, error: toastError, info } = useToast();

  const resolveCategoryId = (catName: string): string | undefined => {
    if (!dbCategories || dbCategories.length === 0) return undefined;

    // 0. Direct ID match
    const directMatch = dbCategories.find(c => c.id === catName);
    if (directMatch) return directMatch.id;

    const target = catName.trim().toLowerCase();

    // 1. Exact match
    const exact = dbCategories.find(c => c.name.trim().toLowerCase() === target);
    if (exact) return exact.id;

    // 2. Keyword match
    const match = dbCategories.find(c => {
      const name = c.name.trim().toLowerCase();
      return name.includes(target) || target.includes(name) ||
        (target.includes('electric') && name.includes('electric')) ||
        (target.includes('plumb') && name.includes('plumb')) ||
        (target.includes('clean') && name.includes('clean')) ||
        (target.includes('lawn') && (name.includes('lawn') || name.includes('garden'))) ||
        (target.includes('tutor') && (name.includes('tutor') || name.includes('academic'))) ||
        (target.includes('aircon') && name.includes('aircon')) ||
        (target.includes('appliance') && name.includes('appliance')) ||
        (target.includes('carpent') && name.includes('carpent'));
    });
    if (match) return match.id;

    return dbCategories[0]?.id;
  };

  const postJobRequest = async (
    seekerId: string,
    title: string,
    category: string,
    urgency: string,
    budget: number,
    description: string
  ) => {
    try {
      const catId = resolveCategoryId(category);
      if (catId) {
        const res = await apiCreateRequest({
          categoryId: catId,
          title,
          description,
          budgetMin: budget,
          budgetMax: budget,
          urgency,
        });

        if (res.success) {
          await syncRequests();
          success('Request Posted', 'Your service request has been broadcasted to providers.');
          return;
        }
      } else {
        toastError('Category Error', 'Please select a valid service category.');
      }
    } catch (err: unknown) {
      toastError('Failed to post request', getApiErrorMessage(err, 'Unable to post the request.'));
    }
  };

  const editJobRequest = async (requestId: string, title: string, budget: number, description: string) => {
    try {
      const res = await apiUpdateRequest(requestId, { title, budgetMin: budget, budgetMax: budget, description });
      if (res.success) {
        await syncRequests();
        success('Request Updated', 'Your job request was modified successfully.');
        return;
      }
    } catch (err: unknown) {
      toastError('Update Failed', getApiErrorMessage(err, 'Unable to update the request.'));
    }
  };

  const deleteJobRequest = async (requestId: string) => {
    try {
      const res = await apiDeleteRequest(requestId);
      if (res.success) {
        await syncRequests();
        await syncBids();
        success('Request Deleted', 'Your job request has been removed.');
        return;
      }
    } catch (err: unknown) {
      toastError('Deletion Failed', getApiErrorMessage(err, 'Unable to delete the request.'));
    }
  };

  const toggleJobRequestStatus = async (requestId: string, currentStatus?: string): Promise<boolean> => {
    const current = jobRequests.find(r => r.id === requestId);
    const effectiveStatus = currentStatus || (current ? current.status : 'OPEN');
    const isCurrentlyOpen = effectiveStatus === 'OPEN' || effectiveStatus === 'open';
    const nextStatus = isCurrentlyOpen ? 'CLOSED' : 'OPEN';

    // 1. Instant optimistic state update
    setJobRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: nextStatus } : r));

    try {
      // 2. Perform API update
      const res = await apiUpdateRequest(requestId, { status: nextStatus });
      if (res.success) {
        // 3. Notification fires in sync with the actual confirmed update
        if (nextStatus === 'OPEN') {
          success('Request Activated 🟢', 'Your task request is now active and visible to providers.');
        } else {
          info('Request Paused ⏸️', 'Your task request is paused. Providers cannot submit offers.');
        }
        await syncRequests();
        return true;
      }
      return false;
    } catch (err: unknown) {
      // Revert optimistic update on failure
      setJobRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: effectiveStatus as JobRequest['status'] } : r));
      toastError('Status Update Failed', getApiErrorMessage(err, 'Unable to update the request status.'));
      await syncRequests();
      return false;
    }
  };

  const bookProviderDirectly = async (
    seekerId: string,
    serviceId: string,
    price: number,
    description: string,
    paymentMethod: 'GCash' | 'On-site Cash'
  ) => {
    try {
      if (paymentMethod === 'On-site Cash') {
        const res = await apiBookDirect({
          serviceId,
          schedule: 'Immediate',
          message: description,
        });
        if (res.success) {
          await syncEngagements();
          await syncNotifications();
          success('Direct Booking Sent', 'Direct Cash arrangement requested from provider.');
          return;
        }
      } else {
        const payRes = await apiInitiatePayment({
          serviceId,
          paymentMethodType: 'gcash',
        });
        if (payRes.success) {
          if (payRes.data.redirectUrl) {
            localStorage.setItem('pending_service_id', serviceId);
            localStorage.setItem('pending_payment_intent_id', payRes.data.paymentIntentId);
            localStorage.removeItem('pending_offer_id');
            info('Redirecting to PayMongo Test Mode', `Please complete the ${paymentMethod} test transaction.`);
            window.location.href = payRes.data.redirectUrl;
            return;
          }
          const confirmRes = await apiConfirmOnlineBooking({
            serviceId,
            paymentIntentId: payRes.data.paymentIntentId,
          });
          if (confirmRes.success && confirmRes.data?.status === 'SUCCEEDED') {
            await syncEngagements();
            await syncNotifications();
            success('Test Payment Recorded', 'The internal payment ledger was updated and your booking entered the provider queue.');
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
    if (!targetRequest) return;

    try {
      if (paymentMethod === 'On-site Cash') {
        const res = await apiBookDirectFromOffer(bidId);
        if (res.success) {
          await syncEngagements();
          await syncBids();
          await syncRequests();
          success('Bid Accepted', 'Direct Cash arrangement initiated for this offer.');
          return;
        }
      } else {
        const serviceId = targetBid.serviceId;

        if (!serviceId) {
          toastError('Error accepting bid', 'This provider does not have an active listing in this category to hold online queue.');
          return;
        }

        const payRes = await apiInitiatePayment({
          serviceId,
          offerId: bidId,
          paymentMethodType: 'gcash',
        });

        if (payRes.success) {
          if (payRes.data.redirectUrl) {
            localStorage.setItem('pending_service_id', serviceId);
            localStorage.setItem('pending_payment_intent_id', payRes.data.paymentIntentId);
            localStorage.setItem('pending_offer_id', bidId);
            info('Redirecting to PayMongo Test Mode', `Please complete the ${paymentMethod} test transaction.`);
            window.location.href = payRes.data.redirectUrl;
            return;
          }
          const confirmRes = await apiConfirmOnlineBooking({
            serviceId,
            paymentIntentId: payRes.data.paymentIntentId,
            offerId: bidId
          });

          if (confirmRes.success && confirmRes.data?.status === 'SUCCEEDED') {
            await syncEngagements();
            await syncBids();
            await syncRequests();
            success('Bid Accepted', 'The Test Mode payment was recorded and the queue booking was created.');
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
        await syncBids();
        success('Bid Declined', 'Offer rejected successfully.');
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
        success('Service Completed', 'The internal payment ledger was marked RELEASED. No provider payout is performed by this capstone.');
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
