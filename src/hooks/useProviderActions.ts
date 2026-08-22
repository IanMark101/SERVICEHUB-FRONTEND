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
  apiToggleServiceAvailability,
  apiDeleteService
} from '../api/services.api';
import { apiSubmitOffer } from '../api/offers.api';
import {
  apiRespondDirectRequest,
  apiCompleteJob,
  apiStartJob,
  apiProviderRemoveQueue
} from '../api/bookings.api';
import { useToast } from '../components/ui/Toast';

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

  const createServiceListing = async (
    providerId: string,
    title: string,
    category: string,
    price: number,
    description: string,
    proofUrl: string,
    paymentMethods: { cash: boolean; gcash: boolean },
    options?: {
      serviceType?: string;
      priceType?: string;
      estimatedDurationMins?: number;
      queueLimit?: number;
    }
  ) => {
    try {
      const catId = resolveCategoryId(category);
      if (catId) {
        const res = await apiCreateService({
          categoryId: catId,
          title,
          description,
          price,
          serviceType: options?.serviceType || 'ONE_TIME',
          priceType: options?.priceType || 'FIXED',
          estimatedDurationMins: options?.estimatedDurationMins || 60,
          paymentMethods: { cash: paymentMethods.cash, gcash: paymentMethods.gcash, maya: false },
          queueLimit: options?.queueLimit || 5,
        });

        if (res.success) {
          const item = res.data;
          const newListing: ServiceListing = {
            id: item.id,
            providerId,
            providerName: 'My Service',
            providerAvatar: '',
            title,
            category: item.category?.name || category,
            description,
            price,
            serviceType: item.serviceType || (options?.serviceType as any) || 'ONE_TIME',
            priceType: item.priceType || (options?.priceType as any) || 'FIXED',
            estimatedDurationMins: item.estimatedDurationMins || options?.estimatedDurationMins || 60,
            queueSize: 0,
            queueLimit: item.queueLimit || options?.queueLimit || 5,
            isPaused: false,
            proofOfSkillUrl: proofUrl,
            rating: 5.0,
            status: 'PENDING_REVIEW',
            paymentMethods: {
              cash: paymentMethods.cash,
              gcash: paymentMethods.gcash,
              maya: false
            }
          };
          setServices(prev => [newListing, ...prev]);
          success('Listing Submitted', 'Your service listing has been sent to admins for approval.');
          return { success: true, data: item };
        }
      } else {
        toastError('Category Required', 'Please select a valid service category.');
        return { success: false, error: 'Please select a valid service category.' };
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to create listing';
      toastError('Failed to create listing', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const editServiceListing = async (
    serviceId: string,
    title: string,
    price: number,
    description: string,
    options?: {
      priceType?: string;
      serviceType?: string;
      estimatedDurationMins?: number;
    }
  ) => {
    try {
      const res = await apiUpdateService(serviceId, {
        title,
        price,
        description,
        ...(options?.priceType ? { priceType: options.priceType } : {}),
        ...(options?.serviceType ? { serviceType: options.serviceType } : {}),
        ...(options?.estimatedDurationMins ? { estimatedDurationMins: options.estimatedDurationMins } : {}),
      });
      if (res.success) {
        setServices(prev =>
          prev.map(s =>
            s.id === serviceId
              ? {
                  ...s,
                  title,
                  price,
                  description,
                  ...(options?.priceType ? { priceType: options.priceType as any } : {}),
                  ...(options?.serviceType ? { serviceType: options.serviceType as any } : {}),
                  ...(options?.estimatedDurationMins ? { estimatedDurationMins: options.estimatedDurationMins } : {}),
                }
              : s
          )
        );
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
      throw err;
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
      throw err;
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
      throw err;
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
      throw err;
    }
  };

  const deleteServiceListing = async (serviceId: string) => {
    try {
      const res = await apiDeleteService(serviceId);
      if (res.success) {
        setServices(prev => prev.filter(s => s.id !== serviceId));
        success('Listing Deleted', 'Your service listing has been removed.');
        return;
      }
    } catch (err: any) {
      toastError('Deletion Failed', err.response?.data?.error || err.message);
    }
  };

  return {
    createServiceListing,
    editServiceListing,
    toggleServiceListingStatus,
    deleteServiceListing,
    submitBid,
    respondToDirectBooking,
    requestJobApproval,
    providerStartJob,
    providerRemoveFromQueue
  };
}
