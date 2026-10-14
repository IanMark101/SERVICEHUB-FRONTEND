import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NewServicesSection from './NewServicesSection';

describe('NewServicesSection', () => {
  it('shows agreement pricing without a zero amount and retains the original service navigation', () => {
    const onSelectService = vi.fn();
    render(<NewServicesSection onSelectService={onSelectService} services={[{ id: 'agreement-service', title: 'Laptop Repair', description: 'Repair after reviewing the problem.', price: null, priceType: 'BY_AGREEMENT', publishedAt: '2026-10-14T00:00:00Z', category: { id: 'repair', name: 'Computer & Laptop Repair' }, provider: { id: 'provider', name: 'Ian', avatarUrl: null, trustScore: 70, verificationStatus: 'APPROVED' } }]} />);
    expect(screen.getByRole('button', { name: 'Open Price by agreement listing' })).toBeVisible();
    expect(screen.queryByText('₱0')).not.toBeInTheDocument();
    expect(screen.queryByText('Price unavailable')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Laptop Repair/i }));
    expect(onSelectService).toHaveBeenCalledWith('agreement-service');
  });
  it('uses an accessible control and navigates by stable service id', () => {
    const onSelectService = vi.fn();
    render(
      <NewServicesSection
        onSelectService={onSelectService}
        services={[{
          id: 'service-123',
          title: 'Home Plumbing Repair',
          description: 'Repair service',
          price: '500',
          priceType: 'FIXED',
          publishedAt: '2026-09-08T00:00:00.000Z',
          category: { id: 'category-1', name: 'Plumbing' },
          provider: { id: 'provider-1', name: 'Local Provider', avatarUrl: null, trustScore: 80, verificationStatus: 'APPROVED' },
        }]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /home plumbing repair/i }));
    expect(onSelectService).toHaveBeenCalledWith('service-123');
    expect(screen.getByText(/published sep 8, 2026/i)).toBeInTheDocument();
  });

  it('opens the established profile route callback from provider identity controls', () => {
    const onSelectProvider = vi.fn();
    render(
      <NewServicesSection
        onSelectService={vi.fn()}
        onSelectProvider={onSelectProvider}
        services={[{
          id: 'service-123',
          title: 'Home Plumbing Repair',
          description: 'Repair service',
          price: '500',
          priceType: 'FIXED',
          publishedAt: '2026-09-08T00:00:00.000Z',
          category: { id: 'category-1', name: 'Plumbing' },
          provider: { id: 'provider-1', name: 'Local Provider', avatarUrl: null, trustScore: 80, verificationStatus: 'APPROVED' },
        }]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /view local provider profile/i }));
    expect(onSelectProvider).toHaveBeenCalledWith('provider-1');
  });
});
