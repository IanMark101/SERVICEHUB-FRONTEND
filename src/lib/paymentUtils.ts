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
  return 'Book Service';
}

export function shouldShowPaymentSelector(service: ServiceListing | any): boolean {
  const { cash, gcash } = getServicePaymentMethods(service);
  return cash && gcash;
}

// Returns a human-readable pricing unit label for display.
// e.g. priceType "PER_SESSION" → "/ session", "PER_HOUR" → "/ hour"
export function getPriceLabel(priceType?: string): string {
  switch (priceType) {
    case 'PER_SESSION':  return '/ session';
    case 'PER_HOUR':     return '/ hour';
    case 'PER_DAY':      return '/ day';
    case 'PER_PROJECT':  return '/ project';
    case 'STARTS_AT':    return 'starting at';
    case 'CUSTOM':       return '';
    case 'FIXED':
    default:             return '';
  }
}

// Returns the full formatted price string, e.g. "₱200 / session" or "₱500".
export function getFormattedPrice(price: number | string, priceType?: string): string {
  const label = getPriceLabel(priceType);
  return label ? `₱${price} ${label}` : `₱${price}`;
}

// Returns a display label for the service type badge.
export function getServiceTypeLabel(serviceType?: string): string {
  return serviceType === 'SESSION_BASED' ? 'Session-based' : 'One-time';
}

