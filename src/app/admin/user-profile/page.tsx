"use client";

import AdminProfileView from "../../../components/admin/AdminProfileView";
import { useApp } from "../../../context/AppContext";

export default function AdminUserProfilePage() {
  const { user } = useApp();

  if (!user) {
    return <div className="p-8 text-center text-xs text-slate-500 dark:text-neutral-400">Please log in to view your profile.</div>;
  }

  return <AdminProfileView user={user} />;
}
