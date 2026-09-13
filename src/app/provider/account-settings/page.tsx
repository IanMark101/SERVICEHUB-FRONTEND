"use client";
import React from 'react';
import AccountSettingsView from '../../../components/profile/AccountSettingsView';
import { useApp } from '../../../context/AppContext';

export default function ProviderAccountSettingsPage() {
  const { user } = useApp();

  if (!user) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 dark:text-neutral-400">
        Please log in to view account settings.
      </div>
    );
  }

  return <AccountSettingsView user={user} />;
}
