import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LifecycleStepper from './LifecycleStepper';

describe('LifecycleStepper', () => {
  it('shows a queue position for a queued booking', () => {
    render(<LifecycleStepper status="queued" queuePosition={3} isDark={false} />);
    expect(screen.getByText('In Queue')).toBeInTheDocument();
    expect(screen.getByText('Position #3')).toBeInTheDocument();
  });

  it('shows the first paid seeker as waiting for the provider rather than in progress', () => {
    render(<LifecycleStepper status="queued" queuePosition={1} role="seeker" isDark={false} />);
    expect(screen.getByText('First in Queue')).toBeInTheDocument();
    expect(screen.getByText('Waiting for provider')).toBeInTheDocument();
    expect(screen.queryByText('In Progress')).not.toHaveClass('font-black');
  });

  it('shows the terminal canceled state without active lifecycle steps', () => {
    render(<LifecycleStepper status="canceled" />);
    expect(screen.getByText('Booking Canceled')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.queryByText('In Progress')).not.toBeInTheDocument();
  });

  it('clearly identifies a disputed engagement', () => {
    render(<LifecycleStepper status="disputed" />);
    expect(screen.getByText('Engagement Paused in Dispute')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
  });

  it('does not show accepted onsite work as underway before Start Job', () => {
    const { rerender } = render(<LifecycleStepper status="in_progress" started={false} isOnline={false} compact isDark={false} />);
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toHaveClass('text-orange-700');
    rerender(<LifecycleStepper status="in_progress" started isOnline={false} compact isDark={false} />);
    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toHaveClass('text-orange-700');
  });

  it('lays out the compact journey as readable rows on narrow screens and five steps when wide', () => {
    render(<LifecycleStepper status="completed" role="seeker" compact isDark={false} isOnline />);
    const journey = screen.getByRole('list', { name: 'Booking journey' });
    expect(journey).toHaveClass('grid-cols-1', 'sm:grid-cols-5');
    expect(journey.children).toHaveLength(5);
    expect(screen.getByText('Confirmation').closest('li')).not.toBe(screen.getByText('Completed').closest('li'));
    expect(screen.getByText('Step 5 of 5')).toBeInTheDocument();
  });
});
