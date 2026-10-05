import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Loading from './loading';

describe('Help Center route loading', () => {
  it('covers the viewport with the same full-page brand loader as the dashboard', () => {
    render(<Loading />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading help guide');
    expect(status).toHaveClass('brand-loading--page');
    expect(status.parentElement).toHaveClass('fixed', 'inset-0', 'z-50');
  });
});
