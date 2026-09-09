"use client";

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { apiUpdateOnboardingStatus, type OnboardingChoice } from '../../../api/onboarding.api';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/ui/Toast';
import type { MarketplaceWorkspace, OnboardingDestination } from '../types/onboarding.types';
import OnboardingDialog from './OnboardingDialog';

export default function OnboardingGate({ workspace }: { workspace: MarketplaceWorkspace }) {
  const { user, setUser, isDark } = useApp();
  const { warning } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [dismissedForSession, setDismissedForSession] = useState(false);

  const forcedOpen = searchParams.get('onboarding') === '1';
  const isPending = user?.onboardingStatus === 'PENDING';
  const isOpen = Boolean(user && user.role !== 'admin' && !dismissedForSession && (isPending || forcedOpen));

  const closeAndCleanUrl = () => {
    setDismissedForSession(true);
    if (!forcedOpen) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('onboarding');
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const persistChoice = async (status: OnboardingChoice) => {
    setSaving(true);
    try {
      const response = await apiUpdateOnboardingStatus(status);
      const savedStatus = response?.data?.onboardingStatus || status;
      setUser((current) => current ? { ...current, onboardingStatus: savedStatus } : current);
    } catch {
      warning('Tour choice was not saved', 'You can continue using ServiceHub, but the introduction may appear again after your next sign-in.');
    } finally {
      setSaving(false);
    }
  };

  const finish = async (status: OnboardingChoice, destination?: OnboardingDestination) => {
    if (status === 'COMPLETED' || isPending) await persistChoice(status);
    closeAndCleanUrl();
    if (destination) {
      router.push(`/${workspace}/user-profile?tab=${destination === 'verification' ? 'verification' : 'settings'}`);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <OnboardingDialog
      user={user}
      workspace={workspace}
      isDark={isDark}
      saving={saving}
      onSkip={() => void finish('SKIPPED')}
      onComplete={() => void finish('COMPLETED')}
      onNavigate={(destination) => void finish('COMPLETED', destination)}
    />
  );
}
