"use client";
import React, { Suspense, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import ConfirmModal, { ConfirmModalState } from '../../components/ui/ConfirmModal';
import { apiLogout } from '../../api/auth.api';

import { useRouteGuard } from '../../hooks/useRouteGuard';
import AccountSuspensionBanner from '../../components/layout/AccountSuspensionBanner';
import { clearAccessToken } from '../../lib/api/axios';
import OnboardingGate from '../../features/onboarding/components/OnboardingGate';
import { usePersistentSidebarState } from '../../hooks/usePersistentSidebarState';
import BrandLoading from '@/components/ui/BrandLoading';

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authLoading, user, isDark, setUser, setIsAuthenticated, jobRequests, bids } = useApp();
  const { shouldRender } = useRouteGuard(['user']);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = usePersistentSidebarState();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  // ✅ useEffect MUST come before any conditional early returns
  useEffect(() => {
    document.documentElement.classList.add('workspace-seeker');
    document.documentElement.classList.remove('workspace-provider', 'workspace-admin');
    return () => {
      document.documentElement.classList.remove('workspace-seeker');
    };
  }, []);

  const handleSignOut = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Sign Out Confirmation',
      message: 'Are you sure you want to sign out of your ServiceHub account?',
      confirmText: 'Sign Out',
      cancelText: 'Stay Logged In',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal((prev) => prev ? { ...prev, isLoading: true } : null);
        try {
          await apiLogout();
        } catch {}
        clearAccessToken();
        setIsAuthenticated(false);
        setUser(null);
        setConfirmModal(null);
        router.push('/');
      }
    });
  };

  if (authLoading) {
    return <BrandLoading label="Opening your Seeker workspace" role="seeker" />;
  }

  if (!shouldRender) return <BrandLoading label="Checking workspace access" role="seeker" />;

  // Resolve activeTab from pathname
  const activeTab = pathname.split('/').pop() || 'seek-services';

  const currentRole = 'seeker';
  const navigateWorkspaceTab = (tabId: string) => {
    router.push(tabId === 'community-hub' ? '/community' : `/seeker/${tabId}`);
  };

  return (
    <div className={`workspace-shell workspace-shell--seeker h-dvh overflow-hidden flex transition-colors duration-200 ${
      isDark ? 'bg-[#141312] text-white' : 'bg-[#f7f6f3] text-ink'
    }`}>
      
      {/* Sidebar Component */}
      <Sidebar 
        currentRole={currentRole} 
        setCurrentRole={(role: string) => router.push(`/${role}`)} 
        activeTab={activeTab} 
        setActiveTab={navigateWorkspaceTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onSignOut={handleSignOut}
        user={user}
      />
 
      {/* Main Content Pane */}
      <div className={`workspace-stage flex-1 flex flex-col min-w-0 h-dvh overflow-y-auto transition-all duration-300 ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        
        {/* Sticky Header Component */}
        <Header 
          currentRole={currentRole}
          activeTab={activeTab}
          setActiveTab={navigateWorkspaceTab}
          setIsMobileOpen={setIsMobileSidebarOpen}
          user={user}
          onSignOut={handleSignOut}
          onViewProfile={(selectedUser) => router.push(`/profile/${encodeURIComponent(selectedUser.id)}`)}
        />
 
        {/* Scrollable Layout Content Canvas */}
        <AccountSuspensionBanner />
        <main className="workspace-content min-w-0 flex-1 w-full max-w-[1440px] mx-auto px-4 pb-5 pt-3 sm:px-6 sm:pb-6 md:px-8 md:pb-6">
          
          {/* The sticky header already identifies the current page. Only show
              actionable status here when a queue needs the user's attention. */}
          {activeTab === 'incoming-offers' && (() => {
            const myRequestIds = jobRequests.filter(r => r.seekerId === user?.id).map(r => r.id);
            const pendingBidsCount = bids.filter(
              b => myRequestIds.includes(b.requestId) && b.status === 'pending'
            ).length;
            return pendingBidsCount > 0 ? (
              <div className="mb-3 flex justify-end">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isDark
                    ? 'bg-orange-950/20 text-orange-400 border-orange-900/30'
                    : 'bg-orange-50 text-orange-600 border-orange-200'
                }`}>
                  {pendingBidsCount} pending offers
                </span>
              </div>
            ) : null;
          })()}
 
          {/* Dynamic Tab Render Area */}
          {children}
 
        </main>
      </div>
 
      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        state={confirmModal}
        onClose={() => setConfirmModal(null)}
      />

      <Suspense fallback={null}>
        <OnboardingGate workspace="seeker" />
      </Suspense>

    </div>
  );
}
