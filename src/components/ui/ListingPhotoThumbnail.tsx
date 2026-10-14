import Image from 'next/image';
import { listingPhotoUrl, type ListingPhoto } from '../../lib/listingPhotos';

export default function ListingPhotoThumbnail({ photo, title }: { photo?: ListingPhoto; title: string }) {
  return photo ? <Image unoptimized src={listingPhotoUrl(photo.url, 192, true)} width={96} height={60} loading="lazy" alt={`${title} — cover photo`} className="h-[60px] w-24 rounded-lg object-cover" /> : null;
}
