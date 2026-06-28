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
          return;
        }
      }
    } catch (err) {
      console.warn("Backend API failed in postJobRequest, falling back to mock:", err);
    }

    const seeker = users.find(u => u.id === seekerId);
    if (!seeker) return;

    const newRequest: JobRequest = {
      id: `jr_${Date.now()}`,
      seekerId,
      seekerName: `${seeker.firstName} ${seeker.lastName}`,
      seekerAvatar: seeker.avatarUrl,
      title,
      category,
      urgency,
      budget,
      description,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setJobRequests(prev => [newRequest, ...prev]);
    users.filter(u => u.role === 'provider').forEach(prov => {
      helperAddNotification(prov.id, 'New Matching Job Broadcasted', `A new request for "${category}" was posted by ${seeker.firstName}.`);
    });
  };

  const editJobRequest = async (requestId: string, title: string, budget: number, description: string) => {
    try {
      const res = await apiUpdateRequest(requestId, { title, budgetMin: budget, budgetMax: budget, description });
      if (res.success) {
        setJobRequests(prev => prev.map(r => r.id === requestId ? { ...r, title, budget, description } : r));
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in editJobRequest, falling back to mock:", err);
    }
    setJobRequests(prev => prev.map(r => r.id === requestId ? { ...r, title, budget, description } : r));
  };

  const deleteJobRequest = async (requestId: string) => {
    try {
      const res = await apiDeleteRequest(requestId);
      if (res.success) {
        setJobRequests(prev => prev.filter(r => r.id !== requestId));
        setBids(prev => prev.filter(b => b.requestId !== requestId));
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in deleteJobRequest, falling back to mock:", err);
    }
    setJobRequests(prev => prev.filter(r => r.id !== requestId));
    setBids(prev => prev.filter(b => b.requestId !== requestId));
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
          return;
        }
      } else {
        const payRes = await apiInitiatePayment({
          serviceId,
          amount: price,
          description: `Booking for service ID ${serviceId}`,
          paymentMethodType: 'gcash',
        });
        if (payRes.success) {
          if (payRes.data.redirectUrl) {
            localStorage.setItem('pending_service_id', serviceId);
            localStorage.setItem('pending_payment_intent_id', payRes.data.paymentIntentId);
            localStorage.removeItem('pending_offer_id');
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
            return;
          }
        }
      }
    } catch (err) {
      console.warn("Backend API failed in bookProviderDirectly, falling back to mock:", err);
    }

    const seeker = users.find(u => u.id === seekerId);
    const service = services.find(s => s.id === serviceId);
    if (!seeker || !service) return;

    const newEngagement: JobEngagement = {
      id: `je_${Date.now()}`,
      title: service.title,
      seekerId,
      seekerName: `${seeker.firstName} ${seeker.lastName}`,
      providerId: service.providerId,
      providerName: service.providerName,
      providerAvatar: service.providerAvatar,
      serviceId: service.id,
      price,
      status: 'pending_provider',
      paymentMethod,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setJobEngagements(prev => [newEngagement, ...prev]);
    helperAddNotification(
      service.providerId,
      'New Direct Booking Request',
      `${seeker.firstName} requested a direct booking for "${service.title}" at ₱${price}.`
    );
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
          setJobRequests(prev => prev.map(r => r.id === targetBid.requestId ? { ...r, status: 'filled' } : r));
          return;
        }
      } else {
        const providerListing = services.find(s => s.providerId === targetBid.providerId && s.category === targetRequest.category);
        const serviceId = providerListing?.id;

        if (!serviceId) {
          alert("This provider does not have an active listing in this category to hold online queue.");
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
            setJobRequests(prev => prev.map(r => r.id === targetBid.requestId ? { ...r, status: 'filled' } : r));
            return;
          }
        }
      }
    } catch (err) {
      console.warn("Backend API failed in acceptBid, falling back to mock:", err);
    }

    // Mock fallback
    setJobRequests(prev => prev.map(r => r.id === targetRequest.id ? { ...r, status: 'filled' } : r));
    setBids(prev => prev.map(b => {
      if (b.id === bidId) return { ...b, status: 'accepted' };
      if (b.requestId === targetRequest.id) return { ...b, status: 'declined' };
      return b;
    }));

    const newEngagement: JobEngagement = {
      id: `je_${Date.now()}`,
      title: targetRequest.title,
      seekerId: targetRequest.seekerId,
      seekerName: targetRequest.seekerName,
      providerId: targetBid.providerId,
      providerName: targetBid.providerName,
      providerAvatar: targetBid.providerAvatar,
      serviceId: null,
      price: targetBid.price,
      status: paymentMethod === 'GCash' ? 'queued' : 'in_progress',
      paymentMethod,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setJobEngagements(prev => [newEngagement, ...prev]);
    helperAddNotification(
      targetBid.providerId,
      'Bid Accepted!',
      `${targetRequest.seekerName} accepted your bid of ₱${targetBid.price} for "${targetRequest.title}".`
    );
  };

  const declineBid = async (bidId: string) => {
    try {
      const res = await apiRejectOffer(bidId);
      if (res.success) {
        setBids(prev => prev.map(b => b.id === bidId ? { ...b, status: 'declined' } : b));
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in declineBid, falling back to mock:", err);
    }
    setBids(prev => prev.map(b => b.id === bidId ? { ...b, status: 'declined' } : b));
  };

  const confirmJobCompletion = async (jobId: string) => {
    try {
      const res = await apiConfirmCompletion(jobId);
      if (res.success) {
        await syncEngagements();
        await syncNotifications();
        await syncTransactions();
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in confirmJobCompletion, falling back to mock:", err);
    }

    const job = jobEngagements.find(je => je.id === jobId);
    if (!job) return;

    setJobEngagements(prev => prev.map(je => je.id === jobId ? {
      ...je,
      status: 'completed',
      completedAt: new Date().toISOString().split('T')[0]
    } : je));

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      jobId,
      seekerId: job.seekerId,
      providerId: job.providerId,
      amount: job.price,
      paymentMethod: job.paymentMethod,
      serviceTitle: job.title,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTransactions(prev => [newTx, ...prev]);
    helperAddNotification(
      job.providerId,
      'Payout Completed',
      `${job.seekerName} approved the completion of "${job.title}" and released ₱${job.price} via ${job.paymentMethod}.`
    );
  };

  const disputeJob = async (jobId: string, reason: string) => {
    try {
      const res = await apiDisputeJob(jobId, reason);
      if (res.success) {
        await syncEngagements();
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in disputeJob, falling back to mock:", err);
    }

    setJobEngagements(prev => prev.map(je => je.id === jobId ? { ...je, status: 'disputed', disputeReason: reason } : je));

    const job = jobEngagements.find(je => je.id === jobId);
    if (!job) return;

    const newReport: UserReport = {
      id: `ur_${Date.now()}`,
      reportedUserId: job.providerId,
      reportedUserName: job.providerName,
      reporterUserId: job.seekerId,
      reporterUserName: job.seekerName,
      reason: 'Job Performance Dispute',
      details: reason,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUserReports(prev => [newReport, ...prev]);
  };

  const cancelQueue = async (id: string) => {
    try {
      const res = await apiCancelQueue(id);
      if (res.success) {
        await syncEngagements();
      }
    } catch (err) {
      console.warn("Backend API failed in cancelQueue:", err);
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
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in suggestCategory, falling back to mock:", err);
    }

    const newSuggestion: CategorySuggestion = {
      id: `cs_${Date.now()}`,
      name,
      description,
      suggestedBy: seekerName,
      status: 'pending'
    };
    setCategorySuggestions(prev => [newSuggestion, ...prev]);
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
