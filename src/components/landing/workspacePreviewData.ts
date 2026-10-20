import type { ServiceListing, JobRequest } from '@/types';
import type { MarketplaceLocation } from '@/lib/location';
import type { UserSession } from '@/components/auth/LoginContainer';

// Fictional fixtures only. Landing previews never query the marketplace or an account.
export const previewLocation: MarketplaceLocation = {
  point: { latitude: 10.25, longitude: 123.95, label: 'Cordova, Cebu' }, radiusKm: 10,
};

export const previewUser: UserSession = {
  id: 'preview-member', firstName: 'Alex', lastName: 'Reyes', email: '', role: 'seeker',
  avatarUrl: '', bio: '', phone: '', verificationStatus: 'APPROVED', emailVerified: true,
};

export const previewServices: ServiceListing[] = [
  { id: 'preview-aircon', providerId: 'preview-maya', providerName: 'Maya Santos', providerAvatar: '',
    title: 'Aircon cleaning', category: 'Aircon Service', description: 'Cleaning and maintenance for your home air-conditioning unit.',
    price: 500, priceType: 'FIXED', estimatedDurationMins: 90, locationLabel: 'Cordova, Cebu', distanceKm: 1.2,
    coverageRadiusKm: 10, queueSize: 0, queueLimit: 5, providerWaitingCount: 0, isPaused: false, proofOfSkillUrl: '',
    rating: 5, reviewCount: 12, providerTrustScore: 75, providerVerificationStatus: 'APPROVED',
    paymentMethods: { cash: true, gcash: true }, status: 'ACTIVE', serviceType: 'ONE_TIME' },
  { id: 'preview-cleaning', providerId: 'preview-daniel', providerName: 'Daniel Cruz', providerAvatar: '',
    title: 'Home cleaning', category: 'House Cleaning', description: 'A careful clean for your kitchen, living room and shared spaces.',
    price: 650, priceType: 'FIXED', estimatedDurationMins: 120, locationLabel: 'Cordova, Cebu', distanceKm: 2.4,
    coverageRadiusKm: 10, queueSize: 1, queueLimit: 5, providerWaitingCount: 1, isPaused: false, proofOfSkillUrl: '',
    rating: 4.8, reviewCount: 8, providerTrustScore: 70, providerVerificationStatus: 'APPROVED',
    paymentMethods: { cash: true, gcash: true }, status: 'ACTIVE', serviceType: 'ONE_TIME' },
  { id: 'preview-plumbing', providerId: 'preview-jamie', providerName: 'Jamie Lim', providerAvatar: '',
    title: 'Faucet repair', category: 'Plumbing', description: 'Repair a leaking kitchen or bathroom faucet and check its fittings.',
    price: 350, priceType: 'FIXED', estimatedDurationMins: 60, locationLabel: 'Cordova, Cebu', distanceKm: 3.1,
    coverageRadiusKm: 5, queueSize: 0, queueLimit: 5, isPaused: false, proofOfSkillUrl: '',
    rating: 4.9, reviewCount: 6, providerTrustScore: 65, providerVerificationStatus: 'APPROVED',
    paymentMethods: { cash: true, gcash: false }, status: 'ACTIVE', serviceType: 'ONE_TIME' },
];

export const previewRequests: JobRequest[] = previewServices.map((service, index) => ({
  id: `preview-request-${index}`, seekerId: `preview-customer-${index}`, seekerName: ['Sam Rivera', 'Chris Tan', 'Taylor Cruz'][index],
  seekerAvatar: '', seekerTrustScore: 65, seekerVerificationStatus: 'APPROVED', seekerRating: 5, seekerReviewCount: 3,
  title: ['Aircon needs cleaning', 'Help with home cleaning', 'Fix a leaking kitchen faucet'][index],
  category: service.category, description: service.description, urgency: ['ASAP / Today', 'This Week', 'Flexible Schedule'][index],
  budget: service.price, locationLabel: service.locationLabel, distanceKm: service.distanceKm,
  status: 'open', createdAt: '2026-10-01T08:00:00.000Z', offersCount: [1, 2, 0][index],
  paymentMethods: { cash: true, gcash: true },
}));

export const previewCategories = ['All Categories', 'Aircon Service', 'Appliance Repair', 'Carpentry & Woodwork', 'Electrical', 'Haircut', 'House Cleaning', 'Lawn Care', 'Plumbing', 'Tutoring'];
