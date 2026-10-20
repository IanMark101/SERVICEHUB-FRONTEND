import { useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ListingPhotoGallery from './ListingPhotoGallery';
import ListingPhotoUploader from './ListingPhotoUploader';
import { uploadListingPhoto, discardListingPhoto, type ListingPhoto } from '../../lib/listingPhotos';
import JobRequestCard from '../provider/browse-jobs/JobRequestCard';

vi.mock('../../lib/listingPhotos', async () => ({ ...await vi.importActual('../../lib/listingPhotos'), uploadListingPhoto: vi.fn(), discardListingPhoto: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../moderation/ContentCaseAction', () => ({ default: () => null }));
const photos: ListingPhoto[] = Array.from({ length: 3 }, (_, index) => ({ id: `photo-${index}`, url: `https://res.cloudinary.com/fixture/image/upload/photo-${index}.jpg`, width: 1200, height: 800 }));
const noop = vi.fn();
function UploadFixture({ initial = [] }: { initial?: ListingPhoto[] }) {
  const [value, setValue] = useState(initial); const [busy, setBusy] = useState(false);
  return <><ListingPhotoUploader value={value} onChange={setValue} onBusyChange={setBusy} /><button type="button" disabled={busy}>Publish test listing</button></>;
}
beforeEach(() => { vi.clearAllMocks(); });

describe('listing photo presentation', () => {
  it('keeps listings without photos free of empty galleries', () => { render(<ListingPhotoGallery title="Laptop repair" />); expect(screen.queryByRole('region')).not.toBeInTheDocument(); });
  it.each([1, 2, 3])('makes all %i uploaded photos reachable only inside Details', count => {
    render(<ListingPhotoGallery photos={photos.slice(0, count)} title="Laptop repair" />);
    expect(screen.getByText(`Photo 1 of ${count}`)).toBeInTheDocument();
    if (count === 1) { expect(screen.queryByRole('button', { name: 'Next photo' })).not.toBeInTheDocument(); return; }
    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(screen.getByRole('img', { name: `Laptop repair — photo 2 of ${count}` })).toHaveAttribute('src', expect.stringContaining('photo-1.jpg'));
    fireEvent.click(screen.getByRole('button', { name: `Show photo ${count}` }));
    expect(screen.getByRole('button', { name: `Show photo ${count}` })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(screen.getByRole('button', { name: 'Next photo' }), { key: 'ArrowRight' });
    expect(screen.getByText(`Photo 1 of ${count}`)).toBeInTheDocument();
  });
  it('keeps managed gallery controls working after a photo fails and the list changes', () => {
    const view=render(<ListingPhotoGallery photos={photos} title="Laptop repair" presentation="managed" />);
    fireEvent.error(screen.getByRole('img', {name:'Laptop repair — photo 1 of 3'}));
    expect(screen.getByText(/Photo unavailable/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Next photo'}));
    expect(screen.getByRole('img', {name:'Laptop repair — photo 2 of 3'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Show photo 3'}));
    view.rerender(<ListingPhotoGallery photos={photos.slice(0,1)} title="Laptop repair" presentation="managed" />);
    expect(screen.getByText('Photo 1 of 1')).toBeInTheDocument();
    expect(screen.queryByRole('button',{name:'Next photo'})).not.toBeInTheDocument();
  });
  it('uses only one listing image on a request card with three uploaded photos', () => {
    render(<JobRequestCard request={{ id: 'request', title: 'Laptop repair', category: 'Electrical Repair', seekerId: 'seeker', seekerName: 'Sample User', seekerAvatar: '', description: 'My laptop is broken.', budget: 500, urgency: 'This Week', status: 'OPEN', createdAt: '', photos }} proposalCount={0} isOwned={false} offerState={null} isDark={false} onProfile={noop} onDetails={noop} onSendOffer={noop} />);
    const card = screen.getByRole('article', { name: 'Laptop repair' });
    expect(within(card).getByRole('img', { name: 'Laptop repair, cover photo' })).toHaveAttribute('src', expect.stringContaining('photo-0.jpg'));
    expect(card.querySelectorAll('img[src*="photo-"]')).toHaveLength(1);
    expect(within(card).queryByRole('button', { name: 'Next photo' })).not.toBeInTheDocument();
  });
});

describe('listing photo input', () => {
  it('rejects a fourth file before uploading any of the selection', () => {
    const { container } = render(<UploadFixture />);
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: Array.from({ length: 4 }, (_, index) => new File(['image'], `${index}.jpg`, { type: 'image/jpeg' })) } });
    expect(screen.getByRole('alert')).toHaveTextContent('up to 3 photos');
    expect(uploadListingPhoto).not.toHaveBeenCalled();
  });
  it('blocks publishing while uploading and allows cover selection and removal', async () => {
    let finish!: (photo: ListingPhoto) => void;
    vi.mocked(uploadListingPhoto).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const { container } = render(<UploadFixture initial={photos.slice(0, 2)} />);
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [new File(['image'], 'repair.jpg', { type: 'image/jpeg' })] } });
    expect(screen.getByRole('button', { name: 'Publish test listing' })).toBeDisabled();
    finish(photos[2]);
    await waitFor(() => expect(screen.getByRole('button', { name: '3 photos added' })).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Publish test listing' })).toBeEnabled();
    fireEvent.click(screen.getAllByRole('button', { name: 'Use as cover' })[1]);
    expect(screen.getByRole('img', { name: 'Listing photo 1' })).toHaveAttribute('src', expect.stringContaining('photo-2.jpg'));
    fireEvent.click(screen.getByRole('button', { name: 'Remove photo 1' }));
    expect(discardListingPhoto).toHaveBeenCalledWith('photo-2');
    expect(screen.getByRole('button', { name: 'Add photos' })).toBeEnabled();
  });
  it('retains earlier photos when an upload fails and releases publishing', async () => {
    vi.mocked(uploadListingPhoto).mockRejectedValueOnce(new Error('Upload unavailable. Please try again.'));
    const { container } = render(<UploadFixture initial={photos.slice(0, 1)} />);
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [new File(['image'], 'repair.jpg', { type: 'image/jpeg' })] } });
    await screen.findByRole('alert');
    expect(screen.getByText(/1\/3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish test listing' })).toBeEnabled();
  });
});
