'use client';
import { useApp } from '../../../context/AppContext';
import SubscriptionsView from '../../../components/admin/subscriptions/SubscriptionsView';
export default function AdminSubscriptionsPage() {
  const { user, isDark } = useApp();
  return <SubscriptionsView userId={user?.role === 'admin' ? user.id : undefined} isDark={isDark} />;
}
