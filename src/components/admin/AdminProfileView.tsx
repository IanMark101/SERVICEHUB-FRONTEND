"use client";

import Link from "next/link";
import { AtSign, CheckCircle2, FileClock, MapPin, Phone, Settings, ShieldCheck, UserRound } from "lucide-react";
import type { UserSession } from "../auth/LoginContainer";
import { useApp } from "../../context/AppContext";
import UserAvatar from "../ui/UserAvatar";

export default function AdminProfileView({ user }: { user: UserSession }) {
  const { isDark } = useApp();
  const displayName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Administrator";
  const cardClass = isDark ? "border-neutral-800 bg-charcoal-surface" : "border-slate-200 bg-white";
  const labelClass = isDark ? "text-ink-subtle" : "text-ink-muted";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className={`rounded-2xl border p-6 shadow-sm ${cardClass}`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar src={user.avatarUrl} name={displayName} alt={`${displayName} profile`} size={72} role="admin" shape="soft" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-xl font-bold tracking-tight">{displayName}</h3>
                <span className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-soft)] px-2.5 py-1 text-[9px] font-bold uppercase text-[var(--admin-accent)]">Administrator</span>
              </div>
              <p className={`mt-1 text-xs ${labelClass}`}>Authorized ServiceHub Cordova administration account</p>
            </div>
          </div>
          <Link href="/admin/account-settings" className="flex items-center justify-center gap-2 rounded-lg bg-[var(--admin-solid)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--admin-solid-hover)]">
            <Settings className="h-4 w-4" /> Edit Account
          </Link>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className={`rounded-2xl border p-5 shadow-sm ${cardClass}`}>
          <h4 className="flex items-center gap-2 text-sm font-extrabold"><UserRound className="h-4 w-4 text-[var(--admin-accent)]" /> Account Identity</h4>
          <dl className="mt-4 space-y-3 text-xs">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-neutral-800"><dt className={`flex items-center gap-2 ${labelClass}`}><AtSign className="h-3.5 w-3.5" /> Email</dt><dd className="break-all text-right font-semibold">{user.email}</dd></div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-neutral-800"><dt className={`flex items-center gap-2 ${labelClass}`}><Phone className="h-3.5 w-3.5" /> Phone</dt><dd className="text-right font-semibold">{user.phone || "Not provided"}</dd></div>
            <div className="flex items-start justify-between gap-4"><dt className={`flex items-center gap-2 ${labelClass}`}><MapPin className="h-3.5 w-3.5" /> Location</dt><dd className="text-right font-semibold">{user.location || "Cordova, Cebu"}</dd></div>
          </dl>
        </section>

        <section className={`rounded-2xl border p-5 shadow-sm ${cardClass}`}>
          <h4 className="flex items-center gap-2 text-sm font-extrabold"><ShieldCheck className="h-4 w-4 text-[var(--admin-accent)]" /> Administrative Status</h4>
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-neutral-700 dark:bg-charcoal"><span className={labelClass}>Account</span><span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> {user.isActive === false ? "Inactive" : "Active"}</span></div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-neutral-700 dark:bg-charcoal"><span className={labelClass}>Email verification</span><span className="font-bold">{user.emailVerified === false ? "Not verified" : "Verified"}</span></div>
            <p className={`flex items-start gap-2 text-[10px] leading-4 ${labelClass}`}><FileClock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Privileged moderation activity is recorded separately in the immutable Admin Audit Log.</p>
            <Link href="/admin/audit-logs" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--admin-accent)] underline-offset-4 hover:underline">Open Audit Log</Link>
          </div>
        </section>
      </div>

      {user.bio && <section className={`rounded-2xl border p-5 shadow-sm ${cardClass}`}><h4 className="text-sm font-extrabold">Profile Note</h4><p className={`mt-2 text-xs leading-5 ${labelClass}`}>{user.bio}</p></section>}
    </div>
  );
}
