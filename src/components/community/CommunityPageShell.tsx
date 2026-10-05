"use client";

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Header from '../layout/Header';
import ConfirmModal, { type ConfirmModalState } from '../ui/ConfirmModal';
import { apiLogout } from '../../api/auth.api';
import { clearAccessToken } from '../../lib/api/axios';

function subscribeWorkspaceRole(listener: () => void) {
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}

function getWorkspaceRole(): 'seeker' | 'provider' {
  return localStorage.getItem('workspaceRole') === 'provider' ? 'provider' : 'seeker';
}

function getServerWorkspaceRole(): 'seeker' | 'provider' {
  return 'seeker';
}

export default function CommunityPageShell({ children }: { children: React.ReactNode }) {
  const { user, isDark, setUser, setIsAuthenticated } = useApp();
  const router = useRouter();
  const [confirmation, setConfirmation] = useState<ConfirmModalState | null>(null);
  const role = useSyncExternalStore(subscribeWorkspaceRole, getWorkspaceRole, getServerWorkspaceRole);

  const signOut = () => setConfirmation({
    isOpen: true,
    title: 'Sign out of ServiceHub?',
    message: 'You can sign back in to access your account.',
    confirmText: 'Sign out',
    cancelText: 'Stay signed in',
    variant: 'danger',
    onConfirm: async () => {
      setConfirmation((current) => current ? { ...current, isLoading: true } : null);
      try { await apiLogout(); } catch {}
      clearAccessToken();
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    },
  });

  return (
    <div className={`workspace-shell community-page-shell min-h-[100dvh] transition-colors duration-200 ${isDark ? 'bg-[#141312] text-white' : 'bg-[#f7f6f3] text-ink'}`}>
      <Header
        currentRole={role}
        activeTab="community-hub"
        communityPage
        user={user}
        setActiveTab={(tab) => router.push(tab === 'community-hub' ? '/community' : `/${role}/${tab}`)}
        setIsMobileOpen={() => {}}
        onSignOut={signOut}
        onViewProfile={(selected) => router.push(`/profile/${encodeURIComponent(selected.id)}`)}
      />
      <main className="mx-auto w-full max-w-[1360px] px-3.5 py-4 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
      <ConfirmModal state={confirmation} onClose={() => setConfirmation(null)} />
    </div>
  );
}
