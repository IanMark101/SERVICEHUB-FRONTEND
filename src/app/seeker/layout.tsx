"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import ConfirmModal, { ConfirmModalState } from '../../components/ui/ConfirmModal';
import { HelpCircle, LogOut } from 'lucide-react';
import { apiLogout } from '../../api/auth.api';

import { useRouteGuard } from '../../hooks/useRouteGuard';

const tabDetails: Record<string, { title: string; desc: string }> = {
  'seek-services': {
    title: 'Seek Services Marketplace',
    desc: 'Browse and hire verified local service providers across Cordova. Filter by category, compare ratings, and book directly or join a queue.',
  },
  'post-request': {
    title: 'Post a Custom Job Request',
    desc: 'Describe the task or repair you need and set your budget. Nearby Cordova providers will review your request and send you direct price offers.',
  },
  'incoming-offers': {
    title: 'Incoming Service Offers',
    desc: 'Review price quotes and proposals sent by providers for your posted jobs. Accept an offer to start your project safely.',
  },
  'request-manager': {
    title: 'Request Manager',
    desc: 'Manage your broadcasted job requests. Edit budgets, close completed requests, and view incoming proposals from local providers.',
  },
  'seeker-activity': {
    title: 'My Bookings & Tasks',
    desc: 'Track your ongoing services in real time, view your queue position, approve completed work, and leave provider reviews.',
  },
  'transaction-history': {
    title: 'Transaction History & Receipts',
    desc: 'View your complete payment records, receipts, wallet deposits, and refunds for completed Cordova marketplace services.',
  },
  'messages': {
    title: 'Direct Messages',
    desc: 'Chat directly with your service providers to ask questions, share task photos, and coordinate service schedules in real time.',
  },
  'community-hub': {
    title: 'Community Announcements & Leaders',
    desc: 'Stay informed with Cordova town announcements, service guidelines, and view the top-rated local providers of the week.',
  },
  'user-profile': {
    title: 'User Profile & Verification',
    desc: 'Manage your verified Cordova residency credentials, contact info, and account security preferences.',
  }
};

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, authLoading, user, isDark, setUser, setIsAuthenticated, jobRequests, bids } = useApp();
  const { shouldRender } = useRouteGuard(['user']);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
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
        setConfirmModal((prev: any) => prev ? { ...prev, isLoading: true } : null);
        try {
          await apiLogout();
        } catch (_) {}
        localStorage.removeItem('accessToken');
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
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!shouldRender) return null;

  // Resolve activeTab from pathname
  const activeTab = pathname.split('/').pop() || 'seek-services';

  const accent = {
    border: 'border-emerald-500/20',
    borderFocus: 'focus:border-emerald-500 focus:ring-emerald-500',
    bgLight: 'bg-emerald-500/5',
    text: 'text-emerald-500 dark:text-emerald-400',
    bgButton: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    badge: isDark
      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs',
  };

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
          onViewProfile={(u: any) => router.push(`/seeker/user-profile?id=${u.id}`)}
        />
 
        {/* Scrollable Layout Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto">
          
          {/* Breadcrumbs / Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 border-b pb-4 border-slate-200 dark:border-neutral-800/80">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-950'} flex items-center gap-2`}>
                  <span>{activeTab === 'user-profile' ? 'User Profile' : activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                  {tabDetails[activeTab] && (
                    <div className="relative group flex items-center font-sans">
                      <HelpCircle className={`w-4 h-4 cursor-help transition-colors duration-150 ${isDark ? 'text-[#b4b0a9] hover:text-[#f2efe9]' : 'text-slate-400 hover:text-slate-600'}`} />
                      <div className={`absolute left-0 top-full mt-2.5 w-80 p-3.5 rounded-2xl shadow-2xl border text-xs font-sans font-normal leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none backdrop-blur-md ${
                        isDark 
                          ? 'bg-[#1c1b18]/95 border-neutral-800 text-[#f2efe9] shadow-black/60' 
                          : 'bg-white/95 border-slate-200 text-slate-700 shadow-slate-200/80'
                      }`}>
                        <p className="font-bold text-xs text-slate-900 dark:text-[#f2efe9] mb-1">
                          {tabDetails[activeTab].title}
                        </p>
                        <p className="text-slate-600 dark:text-[#b4b0a9] leading-relaxed">
                          {tabDetails[activeTab].desc}
                        </p>
                      </div>
                    </div>
                  )}
                </h2>
                {activeTab === 'incoming-offers' && (() => {
                  const myRequestIds = jobRequests.filter(r => r.seekerId === user?.id).map(r => r.id);
                  const pendingBidsCount = bids.filter(
                    b => myRequestIds.includes(b.requestId) && b.status === 'pending'
                  ).length;
                  return pendingBidsCount > 0 ? (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isDark 
                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {pendingBidsCount} Pending
                    </span>
                  ) : null;
                })()}
              </div>
            </div>
            
            {/* Quick action buttons aligned with role */}
            <div className="flex items-center space-x-2.5">
              <span className={`text-xs font-medium ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>Viewing as:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${accent.badge}`}>
                {currentRole}
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
