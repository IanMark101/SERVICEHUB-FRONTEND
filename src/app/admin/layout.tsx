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
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!shouldRender) return null;

  const activeTab = pathname.split('/').pop() || 'overview';

  return (
    <div className={`h-screen overflow-hidden flex transition-colors duration-200 ${
      isDark ? 'bg-[#191919] text-[#f2efe9]' : 'bg-[#fbfaf7] text-slate-800'
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
          onViewProfile={() => router.push('/admin/users')}
        />

        {/* Warning strip */}
        <div className="flex items-center justify-center gap-2 border-b border-violet-200 bg-violet-50 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-violet-800 dark:border-violet-900/30 dark:bg-violet-950/20 dark:text-violet-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Restricted administrator workspace · Actions are recorded in the audit log</span>
        </div>
 
        {/* Scrollable Layout Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
          
          {/* Page Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 border-b pb-4 border-slate-200 dark:border-neutral-800/80">
            <div>
              <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-950'} flex items-center gap-2`}>
                Administration · {activeTab.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2.5">
              <span className={`text-xs font-medium ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>Workspace:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${
                isDark
                  ? 'bg-violet-950/40 text-violet-300 border-violet-900/40'
                  : 'bg-violet-50 text-violet-700 border-violet-200 shadow-xs'
              }`}>
                Administrator
              </span>
            </div>
          </div>
 
          {/* Dynamic Tab Render Area */}
          {children}
 
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
