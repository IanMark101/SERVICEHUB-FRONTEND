"use client";
import { useApp } from '../../../context/AppContext';
import { useRouteGuard } from '../../../hooks/useRouteGuard';
import ProfilePageShell from '../../../components/profile/ProfilePageShell';
import AccountSettingsView from '../../../components/profile/AccountSettingsView';
import BrandLoading from '../../../components/ui/BrandLoading';
export default function AccountSettingsPage() {
  const { user } = useApp();
  const { shouldRender } = useRouteGuard(['user']);
  if (!shouldRender || !user) return <BrandLoading label="Opening account settings" />;
  return <ProfilePageShell><AccountSettingsView user={user} /></ProfilePageShell>;
}
