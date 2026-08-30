import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../../lib/api/axios';
import { CommunityHubData, CommunityUpdateItem } from '../types/community.types';

export function useCommunityHub(userRole: 'seeker' | 'provider' | 'admin' = 'seeker') {
  const [data, setData] = useState<CommunityHubData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunityData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/community/stats');
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        setError('Unable to load community data. Please try again.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Unable to load community data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  // Build Community Updates by combining:
  // 1. Real database-backed milestones (e.g. newly approved categories with exact reviewedAt dates)
  // 2. Clear static informational platform feature guides (zero fake dates/authors)
  const communityUpdates = useMemo<CommunityUpdateItem[]>(() => {
    const updates: CommunityUpdateItem[] = [];

    // Real dynamic milestones from database (if categories were approved)
    if (data?.recentCategories && data.recentCategories.length > 0) {
      data.recentCategories.slice(0, 2).forEach((cat) => {
        updates.push({
          id: `milestone-${cat.id}`,
          title: `New Category Available: ${cat.name}`,
          summary: cat.description || `The "${cat.name}" category is now live in the Cordova marketplace. Providers can post listings and seekers can request services.`,
          category: 'milestone',
          badgeLabel: 'New Category Live',
          isLiveMilestone: true,
          eventDate: cat.reviewedAt,
          actionText: 'Browse Category',
          actionLink: `/${userRole === 'provider' ? 'provider/offer-services' : 'seeker/seek-services'}?category=${encodeURIComponent(cat.name)}`,
        });
      });
    }

    // Static platform guides with explicit action links (no fake dates)
    updates.push(
      {
        id: 'guide-session-based',
        title: 'Session-Based & Repeatable Services Active',
        summary: 'Providers can now offer repeatable services like tutoring, coaching, and fitness training. Seekers can book multiple sessions with trusted local specialists.',
        category: 'feature',
        badgeLabel: 'Platform Feature',
        isLiveMilestone: false,
        actionText: 'Explore Services',
        actionLink: `/${userRole === 'provider' ? 'provider/browse-services' : 'seeker/seek-services'}`,
      },
      {
        id: 'guide-verification-protocol',
        title: 'Cordova Residency Verification Guide',
        summary: 'Verified residents receive a +5 trust boost, higher marketplace ranking, and increased community credibility by uploading a PhilSys or Barangay ID.',
        category: 'guide',
        badgeLabel: 'Community Trust',
        isLiveMilestone: false,
        actionText: 'Residency Verification',
        actionLink: `/${userRole === 'provider' ? 'provider' : 'seeker'}/user-profile?tab=verification`,
      },
      {
        id: 'guide-escrow-protection',
        title: 'Escrow Payment & Cashless Protection',
        summary: 'Online payments through GCash/Maya are held securely in platform Escrow and only released when the seeker confirms satisfactory job completion.',
        category: 'security',
        badgeLabel: 'Safety & Escrow',
        isLiveMilestone: false,
        actionText: 'Learn About Escrow',
        actionLink: '/help?category=escrow',
      }
    );

    return updates;
  }, [data?.recentCategories, userRole]);

  return {
    data,
    loading,
    error,
    refetch: fetchCommunityData,
    communityUpdates,
  };
}
