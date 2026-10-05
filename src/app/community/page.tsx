"use client";

import { useApp } from '../../context/AppContext';
import { useRouteGuard } from '../../hooks/useRouteGuard';
import CommunityHub from '../../components/community/CommunityHub';
import CommunityPageShell from '../../components/community/CommunityPageShell';
import BrandLoading from '../../components/ui/BrandLoading';

export default function CommunityPage() {
  const { user } = useApp();
  const { shouldRender } = useRouteGuard(['user']);

  if (!shouldRender || !user) {
    return <BrandLoading label="Opening Community Hub" />;
  }

  return (
    <CommunityPageShell>
      <CommunityHub />
    </CommunityPageShell>
  );
}
