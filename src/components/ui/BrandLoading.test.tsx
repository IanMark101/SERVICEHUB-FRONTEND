import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BrandLoading from './BrandLoading';

describe('BrandLoading', () => {
  it('gives a blank-page wait a readable status and the shared mark', () => {
    render(<BrandLoading label="Opening your workspace" role="provider" />);

    expect(screen.getByRole('status')).toHaveTextContent('Opening your workspace');
    expect(screen.getByText('ServiceHub')).toBeInTheDocument();
    expect(document.querySelector('.brand-loading__mark')).toHaveAttribute('src', '/logo.svg?v=4');
    expect(document.querySelector('.brand-loading--provider')).toBeInTheDocument();
  });
});
