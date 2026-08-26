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
  'browse-services': {
    title: 'Browse Client Job Requests',
    desc: 'Browse open service tasks posted by Cordova clients. Filter by barangay or urgency and submit your price offers to get hired.',
  },
  'offer-services': {
    title: 'Create a Service Listing',
    desc: 'Publish a new service you offer to the Cordova marketplace. Detail your skills, set your rates, and upload certifications.',
  },
  'service-manager': {
    title: 'My Service Listings',
    desc: 'Manage your active service listings. Edit pricing, update descriptions, or pause listings when your schedule is booked up.',
  },
  'incoming-requests': {
    title: 'Direct Client Bookings',
    desc: 'Review direct bookings sent to your services. Accept bookings to add clients to your queue, or decline if unavailable.',
  },
  'provider-activity': {
    title: 'Job Tracker & Queue',
    desc: 'Manage your active workload, update booking statuses, notify clients when work is complete, and track approvals.',
  },
  'transaction-history': {
    title: 'Earnings & Payouts',
    desc: 'Track your completed jobs, payout history, and incoming payments from clients across Cordova.',
  },
  'messages': {
    title: 'Direct Messages',
    desc: 'Chat directly with your clients to clarify task instructions, send progress photos, and coordinate arrival times.',
  },
  'community-hub': {
    title: 'Community Announcements & Leaders',
    desc: 'Access local Cordova announcements, guidelines, and see how you rank among the top-rated providers this week.',
  },
  'user-profile': {
    title: 'Provider Profile & Portfolio',
    desc: 'View your public profile, ratings, badges, verified skills, and residency verification status.',
  }
};

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, authLoading, user, isDark, setUser, setIsAuthenticated, jobEngagements } = useApp();
  const { shouldRender } = useRouteGuard(['user']);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
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
  const activeTab = pathname.split('/').pop() || 'browse-services';

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

  const currentRole = 'provider';

  return (
    <div className={`h-screen overflow-hidden flex transition-colors duration-200 ${
      isDark ? 'bg-[#191919] text-[#f2efe9]' : 'bg-[#fbfaf7] text-slate-800'
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
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-y-auto transition-all duration-300 ${
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
          onViewProfile={(u: any) => router.push(`/provider/user-profile?id=${u.id}`)}
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
                {activeTab === 'incoming-requests' && (() => {
                  const pendingRequestsCount = jobEngagements.filter(
                    je => je.providerId === user?.id && je.status === 'pending_provider'
                  ).length;
                  return pendingRequestsCount > 0 ? (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isDark 
                        ? 'bg-emerald-950/20 text-emerald-450 border-emerald-900/30' 
                        : 'bg-emerald-55 text-emerald-600 border-emerald-200'
                    }`}>
                      {pendingRequestsCount} Pending
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
