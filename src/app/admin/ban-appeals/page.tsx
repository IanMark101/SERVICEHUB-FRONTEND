'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminBanAppeals from '@/components/admin/users/AdminBanAppeals';

export default function AdminBanAppealsPage() {
  const params = useSearchParams();
  const router = useRouter();
  return <AdminBanAppeals initialView={params.get('view') === 'history' ? 'history' : 'pending'} onViewChange={view => router.replace(`/admin/ban-appeals?view=${view}`, { scroll: false })} />;
}
