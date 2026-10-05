'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminUserProfileView from '@/components/admin/users/AdminUserProfileView';
import { adminUsersReturnPath, type AdminUserProfileData } from '@/components/admin/users/types';
import { apiGetAdminUserProfile } from '@/api/admin.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useApiCacheRefresh } from '@/hooks/useApiCacheRefresh';

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  return <AdminUserDetail key={userId} userId={userId} />;
}

function AdminUserDetail({ userId }: { userId: string }) {
  const params = useSearchParams();
  const backHref = adminUsersReturnPath(params.get('returnTo'));
  const [data, setData] = useState<AdminUserProfileData | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useApiCacheRefresh(['admin', 'profiles', 'reviews'], refresh);
  useEffect(() => {
    const controller = new AbortController();
    void apiGetAdminUserProfile(userId, controller.signal).then(result => { if (!controller.signal.aborted) { setData(result.data); setError(''); } })
      .catch(cause => { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Could not load this user profile.')); });
    return () => controller.abort();
  }, [userId, revision]);
  if (error) return <div className="au-panel au-page"><h1 className="au-heading">Profile unavailable</h1><p role="alert">{error}</p><div className="flex flex-wrap gap-3"><button className="au-button" onClick={refresh}>Try again</button><Link className="au-button" href={backHref}>Back to users</Link></div></div>;
  if (!data || data.user.id !== userId) return <div className="au-panel"><p role="status">Loading user profile…</p></div>;
  return <AdminUserProfileView key={userId} data={data} backHref={backHref} onRefresh={refresh} />;
}
