"use client";
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Header from '../layout/Header';
import ConfirmModal, { type ConfirmModalState } from '../ui/ConfirmModal';
import { apiLogout } from '../../api/auth.api';
import { clearAccessToken } from '../../lib/api/axios';

export default function ProfilePageShell({ children }: { children: React.ReactNode }) {
  const { user, setUser, setIsAuthenticated } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [confirmation, setConfirmation] = useState<ConfirmModalState | null>(null);
  const role = user?.role === 'provider' ? 'provider' : 'seeker';
  const signOut = () => setConfirmation({
    isOpen: true, title: 'Sign out of ServiceHub?', message: 'You can sign back in to access your account.',
    confirmText: 'Sign out', cancelText: 'Stay signed in', variant: 'danger',
    onConfirm: async () => {
      setConfirmation((current) => current ? { ...current, isLoading: true } : null);
      try { await apiLogout(); } catch {}
      clearAccessToken(); setIsAuthenticated(false); setUser(null); router.push('/');
    },
  });
  return (
    <div className="workspace-shell profile-page-shell min-h-[100dvh]">
      <Header currentRole={role} activeTab={pathname.startsWith('/account') ? 'account-settings' : 'user-profile'} accountPage
        user={user} setActiveTab={(tab) => router.push(`/${role}/${tab}`)} setIsMobileOpen={() => {}}
        onSignOut={signOut} onViewProfile={(selected) => router.push(`/profile/${encodeURIComponent(selected.id)}`)} />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">{children}</main>
      <ConfirmModal state={confirmation} onClose={() => setConfirmation(null)} />
    </div>
  );
}
