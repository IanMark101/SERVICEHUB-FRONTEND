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
  apiStartJob
} from '../api/bookings.api';
import { useToast } from '../components/ui/Toast';
import { getApiErrorBody, getApiErrorMessage } from '../lib/api/errors';

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
  services,
  jobRequests,
  dbCategories,
  setServices,
  setBids,
  syncEngagements,
  syncNotifications,
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
    paymentMethods: { cash: boolean; gcash: boolean },
    options?: {
      serviceType?: ServiceListing['serviceType'];
      priceType?: ServiceListing['priceType'];
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
          ...(options?.priceType === 'CUSTOM' ? {} : { price }),
          serviceType: options?.serviceType || 'ONE_TIME',
          priceType: options?.priceType || 'FIXED',
          estimatedDurationMins: options?.estimatedDurationMins || 60,
          paymentMethods,
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
            serviceType: item.serviceType || options?.serviceType || 'ONE_TIME',
            priceType: item.priceType || options?.priceType || 'FIXED',
            estimatedDurationMins: item.estimatedDurationMins || options?.estimatedDurationMins || 60,
            queueSize: 0,
            queueLimit: item.queueLimit || options?.queueLimit || 5,
            isPaused: false,
            proofOfSkillUrl: '',
            rating: 5.0,
            status: 'PENDING_REVIEW',
            paymentMethods: {
              cash: paymentMethods.cash,
              gcash: paymentMethods.gcash
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
    } catch (err: unknown) {
      const body = getApiErrorBody(err);
      const errorMsg = body?.errors?.[0]?.message || getApiErrorMessage(err, 'Failed to create listing');
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
      priceType?: ServiceListing['priceType'];
      serviceType?: ServiceListing['serviceType'];
      estimatedDurationMins?: number;
      paymentMethods?: { cash: boolean; gcash: boolean };
    }
  ) => {
    try {
      const res = await apiUpdateService(serviceId, {
        title,
        ...(options?.priceType === 'CUSTOM' ? { price: null } : { price }),
        description,
        ...(options?.priceType ? { priceType: options.priceType } : {}),
        ...(options?.serviceType ? { serviceType: options.serviceType } : {}),
        ...(options?.estimatedDurationMins ? { estimatedDurationMins: options.estimatedDurationMins } : {}),
        ...(options?.paymentMethods ? { paymentMethods: options.paymentMethods } : {}),
      });
      if (res.success) {
        setServices(prev =>
          prev.map(s =>
            s.id === serviceId
              ? {
                  ...s,
                  status: res.data.status,
                  isPaused: !res.data.isAvailable,
                  title,
                  price,
                  description,
                  ...(options?.priceType ? { priceType: options.priceType } : {}),
                  ...(options?.serviceType ? { serviceType: options.serviceType } : {}),
                  ...(options?.estimatedDurationMins ? { estimatedDurationMins: options.estimatedDurationMins } : {}),
                  ...(options?.paymentMethods ? { paymentMethods: options.paymentMethods } : {}),
                }
              : s
          )
        );
        success('Listing Updated', 'Service details modified successfully.');
        return;
      }
    } catch (err: unknown) {
      toastError('Update Failed', getApiErrorMessage(err, 'Unable to update the listing.'));
    }
  };

  const toggleServiceListingStatus = async (serviceId: string) => {
    try {
      const res = await apiToggleServiceAvailability(serviceId);
      if (res.success) {
        const isNowAvailable = res.data?.isAvailable;
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: res.data.status, isPaused: !isNowAvailable } : s));
        if (isNowAvailable) {
          success('Service Activated 🟢', 'Your service listing is now active and visible on the marketplace.');
        } else {
          info('Service Paused ⏸️', 'Your service is paused. Seekers cannot send new bookings.');
        }
        return { success: true };
      }
      return { success: false };
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Unable to update listing availability.');
      toastError('Action Failed', message);
      return { success: false, error: message };
    }
  };

  const submitBid = async (requestId: string, providerId: string, price: number, message: string) => {
    try {
      const request = jobRequests.find(item => item.id === requestId);
      const listing = services.find(item =>
        item.providerId === providerId &&
        item.category.trim().toLowerCase() === request?.category.trim().toLowerCase() &&
        !item.isPaused && item.status === 'ACTIVE'
      );
      if (!listing) {
        toastError('Cannot submit offer', 'Create or activate a listing in this request category first.');
        return;
      }
      const res = await apiSubmitOffer({
        requestId,
        serviceId: listing.id,
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
          serviceId: listing.id,
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
    } catch (err: unknown) {
      toastError('Failed to submit bid', getApiErrorMessage(err, 'Unable to submit the offer.'));
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
    } catch (err: unknown) {
      toastError('Action Failed', getApiErrorMessage(err, 'Unable to respond to the booking.'));
      throw err;
    }
  };

  const requestJobApproval = async (jobId: string) => {
    try {
      const res = await apiCompleteJob(jobId);
      if (res.success) {
        await syncEngagements();
        await syncNotifications();
        success('Completion submitted', 'Awaiting seeker confirmation before the Test Mode payment record is updated.');
        return;
      }
    } catch (err: unknown) {
      toastError('Action Failed', getApiErrorMessage(err, 'Unable to submit completion.'));
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
    } catch (err: unknown) {
      toastError('Failed to start job', getApiErrorMessage(err, 'Unable to start the job.'));
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
    } catch (err: unknown) {
      toastError('Deletion Failed', getApiErrorMessage(err, 'Unable to delete the listing.'));
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
    providerStartJob
  };
}
