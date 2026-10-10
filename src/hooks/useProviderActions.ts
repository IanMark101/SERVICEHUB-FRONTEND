import type { LocationPoint } from '../lib/location';
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
import { apiGetMyOffers, apiSubmitOffer } from '../api/offers.api';
import { mapOfferToBid } from '../context/mappers';
import { invalidateApiCache } from '../lib/api/responseCache';
import {
  apiRespondDirectRequest,
  apiCompleteJob,
  apiStartJob
} from '../api/bookings.api';
import { useToast } from '../components/ui/Toast';
import { getApiErrorBody, getApiErrorMessage, getApiErrorStatus } from '../lib/api/errors';
import type { BookingActionResult } from '../lib/bookingActionUpdate';

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
  applyBookingAction: (result: BookingActionResult) => void;
  helperAddNotification: (userId: string, title: string, desc: string) => void;
}

export function useProviderActions({
  dbCategories,
  setServices,
  setBids,
  applyBookingAction,
}: ProviderActionsDeps) {
  const { success, error: toastError, info } = useToast();
  const submissions = React.useRef(new Set<string>());

  const createServiceListing = async (
    providerId: string,
    title: string,
    category: string,
    price: number,
    description: string,
    paymentMethods: { cash: boolean; gcash: boolean },
    options?: {
      serviceLocation?: LocationPoint;
      coverageRadiusKm?: number | null;
      transportationFee?: number | null;
      serviceType?: ServiceListing['serviceType'];
      priceType?: ServiceListing['priceType'];
      estimatedDurationMins?: number;
      queueLimit?: number;
    }
  ) => {
    try {
      const catId = dbCategories.find(c => c.id === category)?.id;
      if (catId) {
        const res = await apiCreateService({
          categoryId: catId,
          title,
          description,
          price,
          ...(options?.serviceLocation && { serviceLocation: options.serviceLocation }),
          ...(options?.coverageRadiusKm !== undefined && { coverageRadiusKm: options.coverageRadiusKm }),
          ...(options?.transportationFee !== undefined && { transportationFee: options.transportationFee }),
          serviceType: options?.serviceType || 'ONE_TIME',
          priceType: options?.priceType || 'FIXED',
          estimatedDurationMins: options?.estimatedDurationMins || 60,
          paymentMethods,
        });

        if (res.success) {
          const item = res.data;
          const newListing: ServiceListing = {
            id: item.id,
            providerId,
            providerName: 'My Service',
            serviceLocation: options?.serviceLocation,
            locationLabel: options?.serviceLocation?.label,
            coverageRadiusKm: options?.coverageRadiusKm,
            transportationFee: options?.transportationFee,
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
            isPaused: !item.isAvailable,
            proofOfSkillUrl: '',
            rating: 5.0,
            status: item.status,
            paymentMethods: {
              cash: paymentMethods.cash,
              gcash: paymentMethods.gcash
            }
          };
          setServices(prev => [newListing, ...prev]);
          if (item.status === 'ACTIVE') success('Listing Published', 'Your service is now visible to customers.');
          else info('Listing needs attention', 'Open Service Manager to check the details and publish your listing.');
          return { success: true, data: item };
        }
      } else {
        toastError('Category Required', 'Please select a valid service category.');
        return { success: false, error: 'Please select a valid service category.' };
      }
    } catch (err: unknown) {
      const body = getApiErrorBody(err);
      const errorMsg = body?.errors?.[0]?.message || getApiErrorMessage(err, 'Failed to create listing');
      toastError(body?.code === 'CONTENT_REVISION_REQUIRED' ? 'Check your service details' : 'Failed to create listing', errorMsg);
      return { success: false, error: errorMsg, field: body?.code === 'CONTENT_REVISION_REQUIRED' ? body.field : undefined };
    }
  };

  const editServiceListing = async (
    serviceId: string,
    title: string,
    price: number,
    description: string,
    options?: {
      serviceLocation?: LocationPoint;
      coverageRadiusKm?: number | null;
      transportationFee?: number | null;
      priceType?: ServiceListing['priceType'];
      serviceType?: ServiceListing['serviceType'];
      estimatedDurationMins?: number;
      paymentMethods?: { cash: boolean; gcash: boolean };
    }
  ) => {
    try {
      const res = await apiUpdateService(serviceId, {
        title,
        price,
        description,
        ...(options?.serviceLocation && { serviceLocation: options.serviceLocation }),
        ...(options?.coverageRadiusKm !== undefined && { coverageRadiusKm: options.coverageRadiusKm }),
        ...(options?.transportationFee !== undefined && { transportationFee: options.transportationFee }),
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
                  ...(options?.serviceLocation && { serviceLocation: options.serviceLocation, locationLabel: options.serviceLocation.label }),
                  ...(options?.coverageRadiusKm !== undefined && { coverageRadiusKm: options.coverageRadiusKm }),
                  ...(options?.transportationFee !== undefined && { transportationFee: options.transportationFee }),
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
        success('Listing Updated', res.data.status === 'ACTIVE' ? 'Your updated service is now visible to customers.' : 'Your changes have been saved.');
        return true;
      }
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Unable to update the listing.');
      toastError(getApiErrorStatus(err) === 422 && /revise|cannot be published/i.test(message) ? 'Please revise your listing' : 'Update Failed', message);
    }
    return false;
  };

  const toggleServiceListingStatus = async (serviceId: string) => {
    try {
      const res = await apiToggleServiceAvailability(serviceId);
      if (res.success) {
        const isNowAvailable = res.data?.isAvailable;
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: res.data.status, isPaused: !isNowAvailable } : s));
        if (isNowAvailable) {
          success('Service active', 'Seekers can now find and book your service.');
        } else {
          info('Service paused', 'New bookings are paused. Existing bookings are unchanged.');
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

  const submitBid = async (requestId: string, providerId: string, serviceId: string | undefined, price: number, estimatedDuration: number, message: string, availability?: string): Promise<boolean> => {
    const key = `${providerId}:${requestId}`;
    if (submissions.current.has(key)) return false;
    submissions.current.add(key);
    const recordConfirmedOffer = (offer: Parameters<typeof mapOfferToBid>[0]) => {
      const bid = mapOfferToBid({ ...offer, requestId, providerId, serviceId: offer.serviceId || serviceId, offeredPrice: offer.offeredPrice ?? price, estimatedDuration: offer.estimatedDuration ?? estimatedDuration, message: offer.message ?? message, availability: offer.availability ?? availability, status: offer.status || 'PENDING' });
      setBids(prev => [bid, ...prev.filter(item => item.id !== bid.id)]);
      success('Offer sent', 'Your offer was sent to the seeker.');
    };
    try {
      const res = await apiSubmitOffer({
        requestId,
        ...(serviceId ? { serviceId } : {}),
        offeredPrice: price,
        estimatedDuration,
        message,
        ...(availability ? { availability } : {}),
      });
      if (res.success) {
        recordConfirmedOffer(res.data);
        return true;
      }
      toastError('Cannot send offer', res.error || 'Please try again.');
    } catch (err: unknown) {
      // Recover a committed offer after a lost response or a duplicate retry.
      // Do not claim success unless the server returns the same proposal.
      const status = getApiErrorStatus(err);
      if (status === undefined || status >= 500 || getApiErrorBody(err)?.code === 'DUPLICATE_OFFER') {
        try {
          invalidateApiCache(['offers']);
          const response = await apiGetMyOffers();
          const offer = response?.success && Array.isArray(response.data) ? response.data.find((item: Parameters<typeof mapOfferToBid>[0]) => item.requestId === requestId && item.providerId === providerId && item.status === 'PENDING'
            && (item.serviceId || null) === (serviceId || null) && Number(item.offeredPrice) === price && item.estimatedDuration === estimatedDuration
            && (item.message || '') === message.trim() && (item.availability || '') === (availability || '').trim()) : undefined;
          if (offer) { recordConfirmedOffer(offer); return true; }
        } catch { /* Retain the draft if confirmation is unavailable. */ }
      }
      toastError('Cannot send offer', getApiErrorMessage(err, 'Unable to submit the offer.'));
    } finally {
      submissions.current.delete(key);
    }
    return false;
  };

  const respondToDirectBooking = async (jobId: string, accept: boolean) => {
    try {
      const res = await apiRespondDirectRequest(jobId, accept);
      if (res.success) {
        if (res.data) applyBookingAction(res.data);
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
        if (res.data) applyBookingAction(res.data);
        success('Work marked finished', 'Waiting for the seeker to confirm that the work is complete.');
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
        if (res.data) applyBookingAction(res.data);
        success('Job started', 'This booking is now in progress.');
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
