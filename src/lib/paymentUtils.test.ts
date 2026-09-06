import { describe, expect, it } from 'vitest';
import {
  getPriceLabel,
  getPrimaryBookingCTA,
  getServicePaymentMethods,
  getServiceTypeLabel,
  shouldShowPaymentSelector,
} from './paymentUtils';

describe('service booking presentation rules', () => {
  it('does not invent payment methods when a listing has none', () => {
    expect(getServicePaymentMethods(null)).toEqual({ cash: false, gcash: false, maya: false });
  });

  it('preserves the listing payment methods and shows a selector only for choices', () => {
    const service = { paymentMethods: { cash: true, gcash: true, maya: false } };
    expect(getServicePaymentMethods(service)).toEqual({ cash: true, gcash: true, maya: false });
    expect(shouldShowPaymentSelector(service)).toBe(true);
    expect(shouldShowPaymentSelector({ paymentMethods: { cash: true } })).toBe(false);
  });

  it('uses consistent service and pricing labels', () => {
    expect(getPrimaryBookingCTA({})).toBe('Book Service');
    expect(getPriceLabel('PER_HOUR')).toBe('/ hour');
    expect(getPriceLabel('CUSTOM')).toBe('');
    expect(getServiceTypeLabel('SESSION_BASED')).toBe('Reusable one-time listing');
    expect(getServiceTypeLabel('ONE_TIME')).toBe('Reusable one-time listing');
  });
});
