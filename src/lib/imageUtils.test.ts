import { describe, expect, it } from 'vitest';
import { processAvatarFile } from './imageUtils';

describe('Profile photo validation', () => {
  it.each([['photo.svg', 'image/svg+xml'], ['photo.pdf', 'application/pdf']])('gives a readable replacement instruction for %s', async (name, type) => {
    await expect(processAvatarFile(new File(['photo'], name, { type })))
      .rejects.toThrow('This file can’t be used. Choose a JPG, PNG, or WebP photo.');
  });

  it('gives the profile photo size limit before trying to process the file', async () => {
    const photo = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(photo, 'size', { value: 10 * 1024 * 1024 + 1 });
    await expect(processAvatarFile(photo)).rejects.toThrow('Choose a photo no larger than 10 MB.');
  });
});
