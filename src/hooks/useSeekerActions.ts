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
  apiDisputeJob,
  apiCancelQueue
} from '../api/bookings.api';
import { apiRejectOffer } from '../api/offers.api';
import { apiSuggestCategory } from '../api/categories.api';
import { useToast } from '../components/Toast';

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
  users,
  services,
  jobRequests,
  bids,
  jobEngagements,
  dbCategories,
  setJobRequests,
  setBids,
  setJobEngagements,
  setTransactions,
  setUserReports,
  setCategorySuggestions,
  syncRequests,
  syncEngagements,
  syncBids,
  syncNotifications,
  syncTransactions,
  helperAddNotification
}: SeekerActionsDeps) {
  const { success, error: toastError, info } = useToast();

  const postJobRequest = async (
    seekerId: string,
    title: string,
    category: string,
    urgency: 'low' | 'medium' | 'high',
    budget: number,
    description: string
  ) => {
    try {
      const catObj = dbCategories.find(c => c.name.toLowerCase() === category.toLowerCase());
      const catId = catObj ? catObj.id : dbCategories[0]?.id;
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
    } catch (err: any) {
      toastError('Failed to post request', err.response?.data?.error || err.message);
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
    } catch (err: any) {
      toastError('Update Failed', err.response?.data?.error || err.message);
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
    } catch (err: any) {
      toastError('Deletion Failed', err.response?.data?.error || err.message);
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
          agreedPrice: price,
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
          amount: price,
          description: `Direct Booking payment escrow`,
          paymentMethodType: 'gcash',
        });
        if (payRes.success) {
          if (payRes.data.redirectUrl) {
            localStorage.setItem('pending_service_id', serviceId);
            localStorage.setItem('pending_payment_intent_id', payRes.data.paymentIntentId);
            localStorage.removeItem('pending_offer_id');
            info('Redirecting to Payment', 'Please complete the GCash transaction.');
            window.location.href = payRes.data.redirectUrl;
            return;
          }
          const confirmRes = await apiConfirmOnlineBooking({
            serviceId,
            paymentIntentId: payRes.data.paymentIntentId,
          });
          if (confirmRes.success) {
            await syncEngagements();
            await syncNotifications();
            success('Payment Confirmed', 'Booking escrow held and entered queue successfully.');
            return;
          }
        }
      }
    } catch (err: any) {
      toastError('Booking Failed', err.response?.data?.error || err.message);
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
        const providerListing = services.find(s => s.providerId === targetBid.providerId && s.category === targetRequest.category);
        const serviceId = providerListing?.id;

        if (!serviceId) {
          toastError('Error accepting bid', 'This provider does not have an active listing in this category to hold online queue.');
          return;
        }

        const payRes = await apiInitiatePayment({
          serviceId,
          amount: targetBid.price,
          description: `Online escrow hold for bid acceptance on: ${targetRequest.title}`,
          paymentMethodType: 'gcash',
        });

        if (payRes.success) {
          if (payRes.data.redirectUrl) {
            localStorage.setItem('pending_service_id', serviceId);
            localStorage.setItem('pending_payment_intent_id', payRes.data.paymentIntentId);
            localStorage.setItem('pending_offer_id', bidId);
            info('Redirecting to Payment', 'Redirecting you to paymongo...');
            window.location.href = payRes.data.redirectUrl;
            return;
          }
          const confirmRes = await apiConfirmOnlineBooking({
            serviceId,
            paymentIntentId: payRes.data.paymentIntentId,
            offerId: bidId
          });

          if (confirmRes.success) {
            await syncEngagements();
            await syncBids();
            await syncRequests();
            success('Bid Accepted & Escrow Held', 'Queue booking confirmed.');
            return;
          }
        }
      }
    } catch (err: any) {
      toastError('Action Failed', err.response?.data?.error || err.message);
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
    } catch (err: any) {
      toastError('Action Failed', err.response?.data?.error || err.message);
    }
  };

  const confirmJobCompletion = async (jobId: string) => {
    try {
      const res = await apiConfirmCompletion(jobId);
      if (res.success) {
        await syncEngagements();
        await syncNotifications();
        await syncTransactions();
        success('Service Completed', 'Funds released to the provider.');
        return;
      }
    } catch (err: any) {
      toastError('Completion Failed', err.response?.data?.error || err.message);
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
    } catch (err: any) {
      toastError('Failed to dispute', err.response?.data?.error || err.message);
    }
  };

  const cancelQueue = async (id: string) => {
    try {
      const res = await apiCancelQueue(id);
      if (res.success) {
        await syncEngagements();
        success('Queue Entry Cancelled', 'You left the service queue.');
      }
    } catch (err: any) {
      toastError('Cancellation Failed', err.response?.data?.error || err.message);
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
    } catch (err: any) {
      toastError('Request Failed', err.response?.data?.error || err.message);
    }
  };

  return {
    postJobRequest,
    editJobRequest,
    deleteJobRequest,
    acceptBid,
    declineBid,
    confirmJobCompletion,
    disputeJob,
    cancelQueue,
    suggestCategory,
    bookProviderDirectly
  };
}
