import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../lib/api/axios';
import { CommunityHubData } from '../types/community.types';
import { getSocket } from '../../../lib/socket';

export function useCommunityHub() {
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

  // Official announcements update immediately for users already viewing the Hub.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('COMMUNITY_ANNOUNCEMENTS_CHANGED', fetchCommunityData);
    return () => {
      socket.off('COMMUNITY_ANNOUNCEMENTS_CHANGED', fetchCommunityData);
    };
  }, [fetchCommunityData]);

  return {
    data,
    loading,
    error,
    refetch: fetchCommunityData,
  };
}
