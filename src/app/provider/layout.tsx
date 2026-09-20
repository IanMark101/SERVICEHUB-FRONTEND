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
import BrandLoading from '@/components/ui/BrandLoading';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authLoading, user, isDark, setUser, setIsAuthenticated, jobEngagements } = useApp();
  const { shouldRender } = useRouteGuard(['user']);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = usePersistentSidebarState();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  // ✅ useEffect MUST come before any conditional early returns
  useEffect(() => {
    document.documentElement.classList.add('workspace-provider');
    document.documentElement.classList.remove('workspace-seeker', 'workspace-admin');
    return () => {
      document.documentElement.classList.remove('workspace-provider');
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
    return <BrandLoading label="Opening your Provider workspace" role="provider" />;
  }

  if (!shouldRender) return <BrandLoading label="Checking workspace access" role="provider" />;

  // Resolve activeTab from pathname
  const activeTab = pathname.split('/').pop() || 'browse-services';

  const currentRole = 'provider';

  return (
    <div className={`workspace-shell workspace-shell--provider h-screen overflow-hidden flex transition-colors duration-200 ${
      isDark ? 'bg-[#141312] text-[#f2efe9]' : 'bg-[#f7f6f3] text-slate-800'
    }`}>
      
      {/* Sidebar Component */}
      <Sidebar 
        currentRole={currentRole} 
        setCurrentRole={(role: string) => router.push(`/${role}`)} 
        activeTab={activeTab} 
        setActiveTab={(tabId: string) => router.push(`/provider/${tabId}`)} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onSignOut={handleSignOut}
        user={user}
      />
 
      {/* Main Content Pane */}
      <div className={`workspace-stage flex-1 flex flex-col min-w-0 h-screen overflow-y-auto transition-all duration-300 ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        
        {/* Sticky Header Component */}
        <Header 
          currentRole={currentRole}
          activeTab={activeTab}
          setActiveTab={(tabId: string) => router.push(`/provider/${tabId}`)}
          setIsMobileOpen={setIsMobileSidebarOpen}
          user={user}
          onSignOut={handleSignOut}
          onViewProfile={(selectedUser) => router.push(`/provider/user-profile?id=${selectedUser.id}`)}
        />
 
        {/* Scrollable Layout Content Canvas */}
        <main className="workspace-content flex-1 w-full max-w-[1440px] mx-auto px-4 pb-5 pt-3 sm:px-6 sm:pb-6 md:px-8 md:pb-6">
          
          {/* The sticky header already identifies the current page. Only show
              actionable status here when a queue needs the user's attention. */}
          {activeTab === 'incoming-requests' && (() => {
            const pendingRequestsCount = jobEngagements.filter(
              je => je.providerId === user?.id && je.status === 'pending_provider'
            ).length;
            return pendingRequestsCount > 0 ? (
              <div className="mb-3 flex justify-end">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isDark
                    ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {pendingRequestsCount} pending requests
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
        <OnboardingGate workspace="provider" />
      </Suspense>

    </div>
  );
}
