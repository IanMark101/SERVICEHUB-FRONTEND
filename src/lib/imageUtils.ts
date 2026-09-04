import { getAccessToken } from './api/axios';

/**
 * Utility to process and compress an uploaded image file into a square avatar data URL.
 * Automatically crops from center and resizes to specified dimensions (default: 400x400).
 */
export async function processAvatarFile(file: File, size: number = 400, quality: number = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file (JPEG, PNG, or WebP).'));
    }

    // Max 10MB input limit
    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('Image size must be less than 10MB.'));
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
          return reject(new Error('Failed to create canvas context.'));
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
      img.onerror = () => reject(new Error('Failed to load selected image.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Utility to process and compress an uploaded message attachment image (preserves aspect ratio).
 * Resizes image so maximum dimension is at most maxDim (default: 1200px) and quality 0.82.
 */
export async function processMessageImage(file: File, maxDim: number = 1200, quality: number = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file (JPEG, PNG, or WebP).'));
    }

    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('Image size must be less than 10MB.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to create canvas context.'));
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load selected image.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
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
    console.warn('[Cloudinary Upload Notice] Backend upload fallback used:', err);
    return dataUrl;
  }
}

/**
 * Upload a general image attachment to Cloudinary via /api/upload/image endpoint.
 */
export async function uploadAttachmentToCloudinary(fileOrDataUrl: File | string): Promise<string> {
  let dataUrl: string;
  if (typeof fileOrDataUrl !== 'string') {
    dataUrl = await processMessageImage(fileOrDataUrl, 1200, 0.85);
  } else {
    dataUrl = fileOrDataUrl;
  }

  try {
    const res = await fetch(`${API_BASE}/upload/image`, {
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
    console.warn('[Cloudinary Upload Notice] Backend upload fallback used:', err);
    return dataUrl;
  }
}
