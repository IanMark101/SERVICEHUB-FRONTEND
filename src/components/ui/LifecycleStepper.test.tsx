import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LifecycleStepper from './LifecycleStepper';

describe('LifecycleStepper', () => {
  it('shows a queue position for a queued booking', () => {
    render(<LifecycleStepper status="queued" queuePosition={3} isDark={false} />);
    expect(screen.getByText('In Queue')).toBeInTheDocument();
    expect(screen.getByText('#3 spot')).toBeInTheDocument();
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
});
