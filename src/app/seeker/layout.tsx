"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { HelpCircle, LogOut } from 'lucide-react';
import { apiLogout } from '../../api/auth.api';

const tabDetails: Record<string, { title: string; desc: string }> = {
  'seek-services': {
    title: 'Seek Services Marketplace',
    desc: 'Interactive grid displaying certified local providers. Features live custom request triggers, search sorting, and quick rating filters.',
  },
  'post-request': {
    title: 'Post Service Request Form',
    desc: 'Broadcast workspace job requests to the community dashboard. Form covers title, specific category select, urgency levels, budget cap, and job description.',
  },
  'request-manager': {
    title: 'Seeker Request Manager',
    desc: 'Dashboard for posted requests. Manage current broadcasts: pause inquiries, edit job budget outlines, or retract community job posts.',
  },
  'incoming-offers': {
    title: 'Incoming Offers (Bids List)',
    desc: 'Compare bids submitted by providers for your requests.',
  },
  'seeker-activity': {
    title: 'Seeker Engagement Lifecycle Tracker',
    desc: 'Visual progress map tracking active bookings through: Action Required, Work In Progress, Queued, Pending Freelancer Response, Disputes, Completed.',
  },
  'suggest-category': {
    title: 'Suggest New Category Form',
    desc: 'Request the creation of specialized community service categories. Submissions route to the Moderator Queue for Admin approval.',
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

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, authLoading, user, isDark, setUser, setIsAuthenticated, jobRequests, bids } = useApp();

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
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Resolve activeTab from pathname
  const activeTab = pathname.split('/').pop() || 'seek-services';

  const accent = {
    border: 'border-orange-500/20',
    borderFocus: 'focus:border-orange-500 focus:ring-orange-500',
    bgLight: 'bg-orange-500/5',
    text: 'text-orange-500 dark:text-orange-400',
    bgButton: 'bg-orange-600 hover:bg-orange-700 text-white',
    badge: 'bg-orange-950/20 text-orange-400 border-orange-900/30',
  };

  const currentRole = 'seeker';

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      isDark ? 'bg-[#191919] text-[#f2efe9]' : 'bg-[#fbfaf7] text-slate-800'
    }`}>
      
      {/* Sidebar Component */}
      <Sidebar 
        currentRole={currentRole} 
        setCurrentRole={(role) => router.push(`/${role}`)} 
        activeTab={activeTab} 
        setActiveTab={(tabId) => router.push(`/seeker/${tabId}`)} 
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
          setActiveTab={(tabId) => router.push(`/seeker/${tabId}`)}
          setIsMobileOpen={setIsMobileSidebarOpen}
          user={user}
          onSignOut={handleSignOut}
          onViewProfile={(u) => router.push(`/seeker/user-profile?id=${u.id}`)}
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
                {activeTab === 'incoming-offers' && (() => {
                  const myRequestIds = jobRequests.filter(r => r.seekerId === user?.id).map(r => r.id);
                  const pendingBidsCount = bids.filter(
                    b => myRequestIds.includes(b.requestId) && b.status === 'pending'
                  ).length;
                  return pendingBidsCount > 0 ? (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isDark 
                        ? 'bg-orange-950/20 text-orange-400 border-orange-900/30' 
                        : 'bg-orange-50 text-orange-600 border-orange-200'
                    }`}>
                      {pendingBidsCount} Pending
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
