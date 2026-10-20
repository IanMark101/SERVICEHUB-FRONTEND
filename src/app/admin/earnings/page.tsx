'use client';

import { useApp } from '../../../context/AppContext';
import EarningsView from '../../../components/admin/earnings/EarningsView';

export default function AdminEarningsPage() {
  const { isDark, user } = useApp();
  return <EarningsView isDark={isDark} userId={user?.role === 'admin' ? user.id : undefined} />;
}
