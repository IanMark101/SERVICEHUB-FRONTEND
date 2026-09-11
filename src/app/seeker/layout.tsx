"use client";
import React, { Suspense, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import ConfirmModal, { ConfirmModalState } from '../../components/ui/ConfirmModal';
import { apiLogout } from '../../api/auth.api';

import { useRouteGuard } from '../../hooks/useRouteGuard';
import { clearAccessToken } from '../../lib/api/axios';
import OnboardingGate from '../../features/onboarding/components/OnboardingGate';
import { usePersistentSidebarState } from '../../hooks/usePersistentSidebarState';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] dark:bg-[#191919]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!shouldRender) return null;

  // Resolve activeTab from pathname
  const activeTab = pathname.split('/').pop() || 'seek-services';

  const currentRole = 'seeker';

  return (
    <div className={`h-screen overflow-hidden flex transition-colors duration-200 ${
      isDark ? 'bg-[#191919] text-[#f2efe9]' : 'bg-[#fbfaf7] text-slate-800'
    }`}>
      
      {/* Sidebar Component */}
      <Sidebar 
        currentRole={currentRole} 
        setCurrentRole={(role: string) => router.push(`/${role}`)} 
        activeTab={activeTab} 
        setActiveTab={(tabId: string) => router.push(`/seeker/${tabId}`)} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onSignOut={handleSignOut}
        user={user}
      />
 
      {/* Main Content Pane */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-y-auto transition-all duration-300 ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        
        {/* Sticky Header Component */}
        <Header 
          currentRole={currentRole}
          activeTab={activeTab}
          setActiveTab={(tabId: string) => router.push(`/seeker/${tabId}`)}
          setIsMobileOpen={setIsMobileSidebarOpen}
          user={user}
          onSignOut={handleSignOut}
          onViewProfile={(selectedUser) => router.push(`/seeker/user-profile?id=${selectedUser.id}`)}
        />
 
        {/* Scrollable Layout Content Canvas */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-5">
          
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
