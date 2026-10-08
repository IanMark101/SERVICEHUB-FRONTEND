export type ProfileReviewContext = 'PROVIDER' | 'SEEKER';

export interface ProfileReviewStats {
  reviewCount: number;
  averageRating: number;
  ratingDistribution: { star: number; count: number }[];
}

export type ProfileReviewStatsByContext = Record<ProfileReviewContext, ProfileReviewStats>;
