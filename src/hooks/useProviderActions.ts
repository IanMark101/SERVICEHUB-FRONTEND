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
import { useToast } from '../components/Toast';

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
  const { success, error: toastError, info } = useToast();

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
            providerName: 'My Service',
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
          success('Listing Created', 'Your service listing has been sent to admins for approval.');
          return;
        }
      } else {
        toastError('Category Error', 'Selected category does not exist.');
      }
    } catch (err: any) {
      toastError('Failed to create listing', err.response?.data?.error || err.message);
    }
  };

  const editServiceListing = async (serviceId: string, title: string, price: number, description: string) => {
    try {
      const res = await apiUpdateService(serviceId, { title, price, description });
      if (res.success) {
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, title, price, description } : s));
        success('Listing Updated', 'Service details modified successfully.');
        return;
      }
    } catch (err: any) {
      toastError('Update Failed', err.response?.data?.error || err.message);
    }
  };

  const toggleServiceListingStatus = async (serviceId: string) => {
    try {
      const res = await apiToggleServiceAvailability(serviceId);
      if (res.success) {
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, isPaused: !s.isPaused } : s));
        success('Availability Toggled', 'Your service availability has been updated.');
        return;
      }
    } catch (err: any) {
      toastError('Action Failed', err.response?.data?.error || err.message);
    }
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
          providerName: 'Me',
          providerAvatar: '',
          providerRating: 5.0,
          price,
          message,
          status: 'pending',
          createdAt: p.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        };
        setBids(prev => [newBid, ...prev]);
        success('Bid Submitted', 'Your proposal was sent to the seeker.');
        return;
      }
    } catch (err: any) {
      toastError('Failed to submit bid', err.response?.data?.error || err.message);
    }
  };

  const respondToDirectBooking = async (jobId: string, accept: boolean) => {
    try {
      const res = await apiRespondDirectRequest(jobId, accept);
      if (res.success) {
        await syncEngagements();
        await syncNotifications();
        success(accept ? 'Booking Accepted' : 'Booking Declined', 'Seeker has been notified.');
        return;
      }
    } catch (err: any) {
      toastError('Action Failed', err.response?.data?.error || err.message);
    }
  };

  const requestJobApproval = async (jobId: string) => {
    try {
      const res = await apiCompleteJob(jobId);
      if (res.success) {
        await syncEngagements();
        await syncNotifications();
        success('Job Completed', 'Awaiting seeker approval and release of payment.');
        return;
      }
    } catch (err: any) {
      toastError('Action Failed', err.response?.data?.error || err.message);
    }
  };

  const providerStartJob = async (id: string) => {
    try {
      const res = await apiStartJob(id);
      if (res.success) {
        await syncEngagements();
        success('Job Started', 'You began the service booking.');
      }
    } catch (err: any) {
      toastError('Failed to start job', err.response?.data?.error || err.message);
    }
  };

  const providerRemoveFromQueue = async (id: string) => {
    try {
      const res = await apiProviderRemoveQueue(id);
      if (res.success) {
        await syncEngagements();
        success('Queue Entry Removed', 'Booking was removed from queue.');
      }
    } catch (err: any) {
      toastError('Failed to remove from queue', err.response?.data?.error || err.message);
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
