"use client";

import AccountSettingsView from "../../../components/profile/AccountSettingsView";
import { useApp } from "../../../context/AppContext";

export default function AdminAccountSettingsPage() {
  const { user } = useApp();

  if (!user) {
    return <div className="p-8 text-center text-xs text-ink-muted dark:text-ink-muted">Please log in to view account settings.</div>;
  }

  return <AccountSettingsView user={user} />;
}
