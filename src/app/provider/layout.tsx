"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { HelpCircle, LogOut } from 'lucide-react';
import { apiLogout } from '../../api/auth.api';

const tabDetails: Record<string, { title: string; desc: string }> = {
  'browse-services': {
    title: 'Browse Service Requests Board',
    desc: 'Community board displaying local client inquiries. Sort tasks by urgency, proximity, and submit proposals/bids immediately.',
  },
  'offer-services': {
    title: 'Offer Active Services Listing',
    desc: 'Create public service offerings. Key feature includes uploading proof of valid credentials/certificates for Admin validation review.',
  },
  'service-manager': {
    title: 'Provider Service Manager',
    desc: 'Control center for active service offerings. Toggle list status, edit descriptions, adjust listing rates, or remove offerings.',
  },
  'incoming-requests': {
    title: 'Incoming Direct Bookings',
    desc: 'Review direct job bookings from seekers. Evaluate custom job parameters, and accept bookings (adds to queue) or reject them.',
  },
  'provider-activity': {
    title: 'Provider Job Tracking & Queue',
    desc: 'Workspace checklist to schedule active projects: In Progress, Waiting Queue position tracker, Pending Offers, Awaiting Seeker Approvals, and Disputes.',
  },
  'transaction-history': {
    title: 'Transaction History & Financial Ledger',
    desc: 'Detailed earnings record keeping track of payouts, services rendered, GCash/On-site tags, and mini-calendar date inputs for filters.',
  },
  'messages': {
    title: 'Direct Split-Screen Chat Interface',
    desc: 'Split-screen communications center allowing clients and providers to message, share file screenshots, and finalize transaction rates.',
  },
  'community-hub': {
    title: 'Community Announcement Hub & Leaderboard',
    desc: 'Local announcement board showing platform news, safety guidelines, and the Weekly Top 10 High-Rated Providers leaderboards.',
  }
};

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, authLoading, user, isDark, setUser, setIsAuthenticated, jobEngagements } = useApp();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSignOut = () => {
    apiLogout().catch(() => {});
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] dark:bg-[#191919]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Resolve activeTab from pathname
  const activeTab = pathname.split('/').pop() || 'browse-services';

  const accent = {
    border: 'border-emerald-500/20',
    borderFocus: 'focus:border-emerald-500 focus:ring-emerald-500',
    bgLight: 'bg-emerald-500/5',
    text: 'text-emerald-500 dark:text-emerald-400',
    bgButton: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    badge: 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30',
  };

  const currentRole = 'provider';

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      isDark ? 'bg-[#191919] text-[#f2efe9]' : 'bg-[#fbfaf7] text-slate-800'
    }`}>
      
      {/* Sidebar Component */}
      <Sidebar 
        currentRole={currentRole} 
        setCurrentRole={(role) => router.push(`/${role}`)} 
        activeTab={activeTab} 
        setActiveTab={(tabId) => router.push(`/provider/${tabId}`)} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onSignOut={handleSignOut}
        user={user}
      />
 
      {/* Main Content Pane */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        
        {/* Sticky Header Component */}
        <Header 
          currentRole={currentRole}
          activeTab={activeTab}
          setActiveTab={(tabId) => router.push(`/provider/${tabId}`)}
          setIsMobileOpen={setIsMobileSidebarOpen}
          user={user}
          onSignOut={handleSignOut}
          onViewProfile={(u) => router.push(`/provider/user-profile?id=${u.id}`)}
        />
 
        {/* Scrollable Layout Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
          
          {/* Breadcrumbs / Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 border-b pb-4 border-slate-200 dark:border-neutral-800/80">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-950'} flex items-center gap-2`}>
                  <span>{activeTab === 'user-profile' ? 'User Profile' : activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                  {tabDetails[activeTab] && (
                    <div className="relative group flex items-center">
                      <HelpCircle className={`w-4 h-4 cursor-help transition-colors duration-150 ${isDark ? 'text-[#b4b0a9] hover:text-[#f2efe9]' : 'text-slate-400 hover:text-slate-600'}`} />
                      <div className={`absolute left-0 top-full mt-2 w-72 p-3 rounded-xl shadow-lg border text-xs font-normal leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
                        isDark 
                          ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' 
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        {tabDetails[activeTab].desc}
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
              <span className={`text-xs ${isDark ? 'text-[#b4b0a9]' : 'text-slate-550'}`}>Viewing as:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${accent.badge}`}>
                {currentRole}
              </span>
            </div>
          </div>
 
          {/* Dynamic Tab Render Area */}
          {children}
 
        </main>
      </div>
 
    </div>
  );
}
