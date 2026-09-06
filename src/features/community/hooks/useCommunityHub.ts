import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../lib/api/axios';
import { CommunityHubData } from '../types/community.types';
import { getSocket } from '../../../lib/socket';
import { getApiErrorMessage } from '../../../lib/api/errors';

async function requestCommunityData(): Promise<CommunityHubData> {
  const response = await api.get('/community/stats');
  if (!response.data?.success || !response.data?.data) {
    throw new Error('Unable to load community data. Please try again.');
  }
  return response.data.data as CommunityHubData;
}

export function useCommunityHub() {
  const [data, setData] = useState<CommunityHubData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunityData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await requestCommunityData());
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, 'Unable to load community data. Please check your connection.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void requestCommunityData()
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setError(getApiErrorMessage(error, 'Unable to load community data. Please check your connection.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
