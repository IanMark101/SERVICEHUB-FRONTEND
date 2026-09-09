import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NewServicesSection from './NewServicesSection';

describe('NewServicesSection', () => {
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
});
