import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BrandLoading from './BrandLoading';

describe('BrandLoading', () => {
  it('gives a blank-page wait a readable status without a redundant logo', () => {
    render(<BrandLoading label="Opening your workspace" role="provider" />);

    expect(screen.getByRole('status')).toHaveTextContent('Opening your workspace');
    expect(document.querySelector('.brand-loading__identity')).not.toBeInTheDocument();
    expect(document.querySelector('.brand-loading__wordmark')).toBeInTheDocument();
    expect(document.querySelector('.brand-loading__wordmark-reveal')).toHaveTextContent('ServiceHub');
    expect(document.querySelector('.brand-loading--provider')).toBeInTheDocument();
  });

  it('keeps compact loading states concise', () => {
    render(<BrandLoading compact label="Loading profile" role="seeker" />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading profile');
    expect(document.querySelector('.brand-loading__detail')).not.toBeInTheDocument();
  });
});
