import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../../lib/api/axios';
import { CommunityHubData } from '../types/community.types';
import { getSocket } from '../../../lib/socket';
import { getApiErrorMessage } from '../../../lib/api/errors';
import { useApiCacheRefresh } from '../../../hooks/useApiCacheRefresh';

async function requestCommunityData(force = false): Promise<CommunityHubData> {
  const response = await api.get('/community/stats', { apiCache: force ? 'reload' : 'default' });
  if (!response.data?.success || !response.data?.data) {
    throw new Error('Unable to load community data. Please try again.');
  }
  return response.data.data as CommunityHubData;
}

export function useCommunityHub() {
  const [data, setData] = useState<CommunityHubData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestRef = useRef<Promise<CommunityHubData> | null>(null);

  const fetchCommunityData = useCallback(async (force = false) => {
    setRefreshing(true);
    setError(null);
    try {
      requestRef.current ??= requestCommunityData(force);
      const nextData = await requestRef.current;
      if (mountedRef.current) setData(nextData);
    } catch (error: unknown) {
      if (mountedRef.current) setError(getApiErrorMessage(error, 'Unable to load community data. Please check your connection.'));
    } finally {
      requestRef.current = null;
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);
  useApiCacheRefresh(['community'], () => fetchCommunityData());

  useEffect(() => {
    mountedRef.current = true;
    const timer = window.setTimeout(() => void fetchCommunityData(), 0);
    return () => {
      mountedRef.current = false;
      window.clearTimeout(timer);
    };
  }, [fetchCommunityData]);

  // Official announcements update immediately for users already viewing the Hub.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const events = ['COMMUNITY_ANNOUNCEMENTS_CHANGED', 'COMMUNITY_CATEGORIES_CHANGED', 'SERVICE_LISTINGS_CHANGED'];
    const refresh = () => { void fetchCommunityData(); };
    events.forEach((event) => socket.on(event, refresh));
    return () => {
      events.forEach((event) => socket.off(event, refresh));
    };
  }, [fetchCommunityData]);

  return {
    data,
    loading,
    refreshing,
    error,
    refetch: () => fetchCommunityData(true),
  };
}
