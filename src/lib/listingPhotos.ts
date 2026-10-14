import { api } from './api/axios';

export interface ListingPhoto { id: string; url: string; width: number; height: number }
export const MAX_LISTING_PHOTOS = 3;

export function listingPhotoUrl(url: string, width: number, cover = false) {
  if (!url.startsWith('https://res.cloudinary.com/')) return url;
  const transform = cover ? `f_auto,q_auto,c_fill,g_auto,w_${width},h_${Math.round(width * 0.625)}` : `f_auto,q_auto,c_limit,w_${width}`;
  return url.replace('/image/upload/', `/image/upload/${transform}/`);
}

export async function prepareListingPhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG, or WebP photo.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Choose a photo no larger than 5 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare this photo. Try another browser or image.');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally { bitmap.close(); }
}

export async function uploadListingPhoto(file: File, signal?: AbortSignal): Promise<ListingPhoto> {
  const image = await prepareListingPhoto(file);
  if (signal?.aborted) throw new DOMException('Upload canceled', 'AbortError');
  const response = await api.post('/upload/listing-photo', { image }, { signal, timeout: 65_000 });
  return response.data.data;
}

export async function discardListingPhoto(id: string) { await api.delete(`/upload/listing-photo/${encodeURIComponent(id)}`); }
