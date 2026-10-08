import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGetRequestRepostTemplate } from '../../api/requests.api';
import RepostRequestForm from './RepostRequestForm';

vi.mock('../../api/requests.api', () => ({ apiGetRequestRepostTemplate: vi.fn() }));
vi.mock('./PostRequest', () => ({ default: ({ initialTemplate }: { initialTemplate: { title: string } }) => <h2>{initialTemplate.title}</h2> }));

const template = { title: 'FIX A LEAK', description: 'Repair the pipe leak.', categoryId: 'category', categoryName: 'Plumbing', budget: 500, paymentMethods: { cash: true, gcash: false } };

describe('repost loading and recovery', () => {
  beforeEach(() => vi.clearAllMocks());
  it('loads only the selected request then opens its draft', async () => {
    vi.mocked(apiGetRequestRepostTemplate).mockResolvedValue({ success: true, data: template });
    render(<RepostRequestForm requestId="request-1" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading your previous request details');
    expect(await screen.findByRole('heading', { name: template.title })).toBeInTheDocument();
    expect(apiGetRequestRepostTemplate).toHaveBeenCalledWith('request-1');
  });
  it('shows access/network errors instead of opening an empty draft and supports retry', async () => {
    vi.mocked(apiGetRequestRepostTemplate).mockRejectedValueOnce(new Error('Request not found or access denied')).mockResolvedValueOnce({ success: true, data: template });
    render(<RepostRequestForm requestId="request-1" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('access denied');
    expect(screen.queryByRole('heading', { name: template.title })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: template.title })).toBeInTheDocument();
  });
  it('ignores a late response after navigating away', async () => {
    let resolve!: (result: { success: boolean; data: typeof template }) => void;
    vi.mocked(apiGetRequestRepostTemplate).mockReturnValue(new Promise(done => { resolve = done; }));
    const { unmount } = render(<RepostRequestForm requestId="request-1" />);
    unmount();
    await act(async () => { resolve({ success: true, data: template }); });
    expect(screen.queryByRole('heading', { name: template.title })).not.toBeInTheDocument();
  });
});
