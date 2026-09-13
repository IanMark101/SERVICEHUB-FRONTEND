"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import ConfirmModal, { ConfirmModalState } from '../../components/ui/ConfirmModal';
import { apiLogout } from '../../api/auth.api';
import { useRouteGuard } from '../../hooks/useRouteGuard';
import { clearAccessToken } from '../../lib/api/axios';
import { ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authLoading, user, isDark, setUser, setIsAuthenticated } = useApp();
  const { shouldRender } = useRouteGuard(['admin']);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  // ✅ useEffect MUST come before any conditional early returns
  useEffect(() => {
    document.documentElement.classList.add('workspace-admin');
    document.documentElement.classList.remove('workspace-seeker', 'workspace-provider');
    return () => {
      document.documentElement.classList.remove('workspace-admin');
    };
  }, []);

  const handleSignOut = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Sign Out Confirmation',
      message: 'Are you sure you want to sign out of your Administrator account?',
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
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin dark:border-neutral-100 dark:border-t-transparent"></div>
      </div>
    );
  }

  if (!shouldRender) return null;

  const activeTab = pathname.split('/').pop() || 'overview';

  return (
    <div className={`admin-workspace h-screen overflow-hidden flex transition-colors duration-200 ${
      isDark ? 'bg-[#171717] text-[#f2efe9]' : 'bg-[#f5f6f8] text-slate-800'
    }`}>
      
      {/* Sidebar Component */}
      <Sidebar 
        currentRole="admin" 
        setCurrentRole={(role: string) => router.push(`/${role}`)} 
        activeTab={activeTab} 
        setActiveTab={(tabId: string) => router.push(`/admin/${tabId}`)} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onSignOut={handleSignOut}
        user={user}
      />
 
      {/* Main Content Pane */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300 ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        
        {/* Sticky Header Component */}
        <Header 
          currentRole="admin"
          activeTab={activeTab}
          setActiveTab={(tabId: string) => router.push(`/admin/${tabId}`)}
          setIsMobileOpen={setIsMobileSidebarOpen}
          user={user}
          onSignOut={handleSignOut}
          onViewProfile={() => router.push('/admin/user-profile')}
        />

        {/* Warning strip */}
        <div className="flex items-center justify-center gap-2 border-b border-slate-200 bg-white px-4 py-2 text-center text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:border-neutral-800 dark:bg-[#1d1d1d] dark:text-neutral-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Restricted administrator workspace · Actions are recorded in the audit log</span>
        </div>
 
        {/* Scrollable Layout Content Canvas */}
        <main className="admin-content flex-1 w-full max-w-[1440px] mx-auto overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-5">
          {/* Dynamic Tab Render Area */}
          <div className="admin-page-body">{children}</div>
 
        </main>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        state={confirmModal}
        onClose={() => setConfirmModal(null)}
      />
 
    </div>
  );
}
