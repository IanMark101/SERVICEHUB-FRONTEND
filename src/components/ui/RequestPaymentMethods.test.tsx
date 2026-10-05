import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RequestPaymentMethods from './RequestPaymentMethods';

describe('request payment badges', () => {
  it.each([false, true])('shows only selected methods in dark=%s', (isDark) => {
    const { rerender } = render(<RequestPaymentMethods request={{ paymentMethods: { cash: true, gcash: false } }} isDark={isDark} />);
    expect(screen.getByText('On-site Cash')).toBeInTheDocument();
    expect(screen.queryByText('GCash · Test Mode')).not.toBeInTheDocument();
    rerender(<RequestPaymentMethods request={{ paymentMethods: { cash: false, gcash: true } }} isDark={isDark} />);
    expect(screen.queryByText('On-site Cash')).not.toBeInTheDocument();
    expect(screen.getByText('GCash · Test Mode')).toBeInTheDocument();
    rerender(<RequestPaymentMethods request={{ paymentMethods: { cash: true, gcash: true } }} isDark={isDark} />);
    expect(screen.getByText('On-site Cash')).toBeInTheDocument();
    expect(screen.getByText('GCash · Test Mode')).toBeInTheDocument();
  });

  it('does not claim an older request selected either method', () => {
    render(<RequestPaymentMethods request={{ paymentMethods: null }} isDark={false} />);
    expect(screen.getByText('Payment methods not specified')).toBeInTheDocument();
    expect(screen.queryByText('On-site Cash')).not.toBeInTheDocument();
    expect(screen.queryByText('GCash · Test Mode')).not.toBeInTheDocument();
  });
});
