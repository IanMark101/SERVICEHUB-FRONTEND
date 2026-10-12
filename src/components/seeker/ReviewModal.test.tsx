import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ReviewModal from './ReviewModal';

describe('review explanation policy', () => {
  it('requires a written explanation for one-star feedback', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewModal isOpen onClose={vi.fn()} onSubmit={submit} initialRating={1} providerName="Provider" />);
    const field = screen.getByRole('textbox', { name: 'Describe your experience' });
    expect(field).toBeRequired(); expect(field).toHaveAttribute('minlength', '10');
    fireEvent.submit(field.closest('form')!);
    expect(await screen.findByRole('alert')).toHaveTextContent('Explain a 1- or 2-star rating');
    expect(submit).not.toHaveBeenCalled();
    fireEvent.change(field, { target: { value: 'The agreed work was incomplete.' } });
    fireEvent.submit(field.closest('form')!);
    await waitFor(() => expect(submit).toHaveBeenCalledWith(1, 'The agreed work was incomplete.', [], undefined));
  });
  it('keeps written feedback optional for five stars and explains trust neutrality', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewModal isOpen onClose={vi.fn()} onSubmit={submit} initialRating={5} />);
    const field = screen.getByRole('textbox'); expect(field).not.toBeRequired();
    expect(screen.getByText(/does not add or deduct Trust Score/)).toBeInTheDocument();
    fireEvent.submit(field.closest('form')!);
    await waitFor(() => expect(submit).toHaveBeenCalledWith(5, '', [], undefined));
  });
});
