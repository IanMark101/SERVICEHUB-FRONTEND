import { ServiceListing } from '../types';

export interface ResolvedPaymentMethods {
  cash: boolean;
  gcash: boolean;
}

type ServicePaymentSource = {
  paymentMethods?: Partial<NonNullable<ServiceListing['paymentMethods']>>;
};

export function getServicePaymentMethods(service?: ServicePaymentSource | null): ResolvedPaymentMethods {
  if (!service) return { cash: false, gcash: false };
  
  // Resolve paymentMethods from mapping or fallback to raw backend json or pricing logic
  const rawMethods = service.paymentMethods;
  if (rawMethods && (typeof rawMethods.cash === 'boolean' || typeof rawMethods.gcash === 'boolean')) {
    return {
      cash: !!rawMethods.cash,
      gcash: !!rawMethods.gcash
    };
  }

  // Fallback to price-based logic or default if not set
  return {
    cash: false,
    gcash: false
  };
}

export function getPrimaryBookingCTA(service?: unknown): string {
  void service;
  return 'Book Service';
}

export function shouldShowPaymentSelector(service?: ServicePaymentSource | null): boolean {
  return Object.values(getServicePaymentMethods(service)).filter(Boolean).length > 1;
}

// Returns a human-readable pricing unit label for display.
// PER_SESSION is decoded as a fixed price for legacy records.
export function getPriceLabel(priceType?: string): string {
  switch (priceType) {
    case 'PER_SESSION':  return '';
    case 'PER_HOUR':     return '/ hour';
    case 'PER_DAY':      return '/ day';
    case 'PER_PROJECT':  return '/ project';
    case 'STARTS_AT':    return 'starting at';
    case 'CUSTOM':       return '';
    case 'FIXED':
    default:             return '';
  }
}

// Returns the full formatted price string.
export function getFormattedPrice(price: number | string, priceType?: string): string {
  const label = getPriceLabel(priceType);
  return label ? `₱${price} ${label}` : `₱${price}`;
}

// Returns a display label for the service type badge.
export function getServiceTypeLabel(serviceType?: string): string {
  void serviceType;
  return 'Reusable one-time listing';
}
