import { getAccessToken } from './api/axios';

/**
 * Utility to process and compress an uploaded image file into a square avatar data URL.
 * Automatically crops from center and resizes to specified dimensions (default: 400x400).
 */
export async function processAvatarFile(file: File, size: number = 400, quality: number = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return reject(new Error('This file can’t be used. Choose a JPG, PNG, or WebP photo.'));
    }

    // Max 10MB input limit
    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('This photo is too large. Choose a photo no larger than 10 MB.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('We couldn’t prepare your photo. Please try again or choose another photo.'));
        }

        // Center square crop calculations
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

        // Convert to lightweight JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('We couldn’t open this photo. Choose another JPG, PNG, or WebP photo.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('We couldn’t open this photo. Choose it again or use another photo.'));
    reader.readAsDataURL(file);
  });
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Upload an avatar to Cloudinary via the backend /api/upload/avatar endpoint.
 * Returns the optimized Cloudinary CDN URL (e.g. https://res.cloudinary.com/...).
 * Automatically falls back to the compressed data URL if offline.
 */
export async function uploadAvatarToCloudinary(fileOrDataUrl: File | string): Promise<string> {
  let dataUrl: string;
  if (typeof fileOrDataUrl !== 'string') {
    dataUrl = await processAvatarFile(fileOrDataUrl, 500, 0.90);
  } else {
    dataUrl = fileOrDataUrl;
  }

  try {
    const res = await fetch(`${API_BASE}/upload/avatar`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ image: dataUrl }),
    });

    const data = await res.json();
    if (data?.success && data?.url) {
      return data.url;
    }
    return dataUrl;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.warn('[Cloudinary Upload Notice] Backend upload fallback used:', err);
    return dataUrl;
  }
}
