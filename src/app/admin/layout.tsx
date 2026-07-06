"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { apiLogout } from '../../api/auth.api';
import { useRouteGuard } from '../../hooks/useRouteGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, authLoading, user, isDark, setUser, setIsAuthenticated } = useApp();
  const { shouldRender } = useRouteGuard(['admin']);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!shouldRender) return null;

  const activeTab = pathname.split('/').pop() || 'overview';

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      isDark ? 'bg-[#191919] text-[#f2efe9]' : 'bg-[#fbfaf7] text-slate-800'
    }`}>
      
      {/* Sidebar Component */}
      <Sidebar 
        currentRole="admin" 
        setCurrentRole={(role) => router.push(`/${role}`)} 
        activeTab={activeTab} 
        setActiveTab={(tabId) => router.push(`/admin/${tabId}`)} 
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
          currentRole="admin"
          activeTab={activeTab}
          setActiveTab={(tabId) => router.push(`/admin/${tabId}`)}
          setIsMobileOpen={setIsMobileSidebarOpen}
          user={user}
          onSignOut={handleSignOut}
          onViewProfile={(u) => router.push(`/admin/users`)}
        />
 
        {/* Scrollable Layout Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
          
          {/* Page Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 border-b pb-4 border-slate-200 dark:border-neutral-800/80">
            <div>
              <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-955'} flex items-center gap-2`}>
                🛡️ Admin Dashboard: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2.5">
              <span className={`text-xs ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>Workspace:</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize border bg-blue-950/20 text-blue-400 border-blue-900/30">
                Administrator
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
