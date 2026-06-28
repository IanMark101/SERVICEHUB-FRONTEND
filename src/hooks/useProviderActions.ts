import React from 'react';
import {
  User,
  ServiceListing,
  JobRequest,
  Bid,
  JobEngagement
} from '../types';
import {
  apiCreateService,
  apiUpdateService,
  apiToggleServiceAvailability
} from '../api/services.api';
import { apiSubmitOffer } from '../api/offers.api';
import {
  apiRespondDirectRequest,
  apiCompleteJob,
  apiStartJob,
  apiProviderRemoveQueue
} from '../api/bookings.api';

interface ProviderActionsDeps {
  users: User[];
  services: ServiceListing[];
  jobRequests: JobRequest[];
  bids: Bid[];
  jobEngagements: JobEngagement[];
  dbCategories: { id: string; name: string }[];
  setServices: React.Dispatch<React.SetStateAction<ServiceListing[]>>;
  setBids: React.Dispatch<React.SetStateAction<Bid[]>>;
  setJobEngagements: React.Dispatch<React.SetStateAction<JobEngagement[]>>;
  syncEngagements: () => Promise<void>;
  syncNotifications: () => Promise<void>;
  syncBids: () => Promise<void>;
  helperAddNotification: (userId: string, title: string, desc: string) => void;
}

export function useProviderActions({
  users,
  services,
  jobRequests,
  bids,
  jobEngagements,
  dbCategories,
  setServices,
  setBids,
  setJobEngagements,
  syncEngagements,
  syncNotifications,
  syncBids,
  helperAddNotification
}: ProviderActionsDeps) {

  const createServiceListing = async (
    providerId: string,
    title: string,
    category: string,
    price: number,
    description: string,
    proofUrl: string
  ) => {
    try {
      const catObj = dbCategories.find(c => c.name.toLowerCase() === category.toLowerCase());
      const catId = catObj ? catObj.id : dbCategories[0]?.id;
      if (catId) {
        const res = await apiCreateService({
          categoryId: catId,
          title,
          description,
          price,
          estimatedDurationMins: 60,
          paymentMethods: { cash: true, gcash: true, maya: false },
          queueLimit: 5,
        });

        if (res.success) {
          const item = res.data;
          const newListing: ServiceListing = {
            id: item.id,
            providerId,
            providerName: 'Provider',
            providerAvatar: '',
            title,
            category,
            description,
            price,
            queueSize: 0,
            isPaused: false,
            proofOfSkillUrl: proofUrl,
            rating: 5.0
          };
          setServices(prev => [newListing, ...prev]);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend API failed in createServiceListing, falling back to mock:", err);
    }

    const provider = users.find(u => u.id === providerId);
    if (!provider) return;

    const newListing: ServiceListing = {
      id: `s_${Date.now()}`,
      providerId,
      providerName: `${provider.firstName} ${provider.lastName}`,
      providerAvatar: provider.avatarUrl,
      title,
      category,
      description,
      price,
      queueSize: 0,
      isPaused: false,
      proofOfSkillUrl: proofUrl,
      rating: 5.0
    };

    setServices(prev => [newListing, ...prev]);
  };

  const editServiceListing = async (serviceId: string, title: string, price: number, description: string) => {
    try {
      const res = await apiUpdateService(serviceId, { title, price, description });
      if (res.success) {
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, title, price, description } : s));
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in editServiceListing, falling back to mock:", err);
    }
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, title, price, description } : s));
  };

  const toggleServiceListingStatus = async (serviceId: string) => {
    try {
      const res = await apiToggleServiceAvailability(serviceId);
      if (res.success) {
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, isPaused: !s.isPaused } : s));
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in toggleServiceListingStatus, falling back to mock:", err);
    }
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, isPaused: !s.isPaused } : s));
  };

  const submitBid = async (requestId: string, providerId: string, price: number, message: string) => {
    try {
      const res = await apiSubmitOffer({
        requestId,
        offeredPrice: price,
        estimatedDuration: 60,
        message,
      });
      if (res.success) {
        const p = res.data;
        const newBid: Bid = {
          id: p.id,
          requestId,
          providerId,
          providerName: 'Provider',
          providerAvatar: '',
          providerRating: 5.0,
          price,
          message,
          status: 'pending',
          createdAt: p.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        };
        setBids(prev => [newBid, ...prev]);
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in submitBid, falling back to mock:", err);
    }

    const provider = users.find(u => u.id === providerId);
    if (!provider) return;

    const newBid: Bid = {
      id: `b_${Date.now()}`,
      requestId,
      providerId,
      providerName: `${provider.firstName} ${provider.lastName}`,
      providerAvatar: provider.avatarUrl,
      providerRating: provider.rating,
      price,
      message,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setBids(prev => [newBid, ...prev]);

    const request = jobRequests.find(r => r.id === requestId);
    if (request) {
      helperAddNotification(
        request.seekerId,
        'New Proposal Received',
        `${provider.firstName} bid ₱${price} on your request: "${request.title}".`
      );
    }
  };

  const respondToDirectBooking = async (jobId: string, accept: boolean) => {
    try {
      const res = await apiRespondDirectRequest(jobId, accept);
      if (res.success) {
        await syncEngagements();
        await syncNotifications();
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in respondToDirectBooking, falling back to mock:", err);
    }

    setJobEngagements(prev => prev.map(je => {
      if (je.id === jobId) {
        return { ...je, status: accept ? 'in_progress' : 'canceled' };
      }
      return je;
    }));

    const job = jobEngagements.find(je => je.id === jobId);
    if (job) {
      helperAddNotification(
        job.seekerId,
        accept ? 'Booking Accepted!' : 'Booking Declined',
        `${job.providerName} has ${accept ? 'accepted' : 'declined'} your direct service booking of "${job.title}".`
      );
    }
  };

  const requestJobApproval = async (jobId: string) => {
    try {
      const res = await apiCompleteJob(jobId);
      if (res.success) {
        await syncEngagements();
        await syncNotifications();
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in requestJobApproval, falling back to mock:", err);
    }

    setJobEngagements(prev => prev.map(je => je.id === jobId ? { ...je, status: 'awaiting_seeker_approval' } : je));

    const job = jobEngagements.find(je => je.id === jobId);
    if (job) {
      helperAddNotification(
        job.seekerId,
        'Approval Requested',
        `${job.providerName} marked "${job.title}" as done. Please review and confirm completion to release payment.`
      );
    }
  };

  const providerStartJob = async (id: string) => {
    try {
      const res = await apiStartJob(id);
      if (res.success) {
        await syncEngagements();
      }
    } catch (err) {
      console.warn("Backend API failed in providerStartJob:", err);
    }
  };

  const providerRemoveFromQueue = async (id: string) => {
    try {
      const res = await apiProviderRemoveQueue(id);
      if (res.success) {
        await syncEngagements();
      }
    } catch (err) {
      console.warn("Backend API failed in providerRemoveFromQueue:", err);
    }
  };

  return {
    createServiceListing,
    editServiceListing,
    toggleServiceListingStatus,
    submitBid,
    respondToDirectBooking,
    requestJobApproval,
    providerStartJob,
    providerRemoveFromQueue
  };
}
