import { ServiceListing } from '../types';

export interface ResolvedPaymentMethods {
  cash: boolean;
  gcash: boolean;
}

export function getServicePaymentMethods(service: ServiceListing | any): ResolvedPaymentMethods {
  if (!service) return { cash: true, gcash: false };
  
  // Resolve paymentMethods from mapping or fallback to raw backend json or pricing logic
  const rawMethods = service.paymentMethods;
  if (rawMethods && (typeof rawMethods.cash === 'boolean' || typeof rawMethods.gcash === 'boolean')) {
    return {
      cash: !!rawMethods.cash,
      gcash: !!rawMethods.gcash
    };
  }

  // Fallback to price-based logic or default if not set
  const supportsGCash = Number(service.price) >= 1000;
  return {
    cash: true,
    gcash: supportsGCash
  };
}

export function getPrimaryBookingCTA(service: ServiceListing | any): string {
  const { cash, gcash } = getServicePaymentMethods(service);
  if (cash && !gcash) return 'Request On-Site';
  if (!cash && gcash) return 'Book with GCash';
  return 'Book Service';
}

export function shouldShowPaymentSelector(service: ServiceListing | any): boolean {
  const { cash, gcash } = getServicePaymentMethods(service);
  return cash && gcash;
}
