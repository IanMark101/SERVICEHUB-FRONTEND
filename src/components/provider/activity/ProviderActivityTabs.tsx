import WorkspaceTabs, { type WorkspaceTabItem } from '../../ui/WorkspaceTabs';
import type { ProviderActivityTab } from './types';

interface ProviderActivityTabsProps {
  activeTab: ProviderActivityTab;
  isDark: boolean;
  countTabItems: (tab: ProviderActivityTab) => number;
  onTabChange: (tab: ProviderActivityTab) => void;
}

export default function ProviderActivityTabs({
  activeTab,
  countTabItems,
  onTabChange,
}: ProviderActivityTabsProps) {
  const tabs: WorkspaceTabItem<ProviderActivityTab>[] = [
    { value: 'all', label: 'All', count: countTabItems('all') },
    { value: 'in_progress', label: 'Work Underway', count: countTabItems('in_progress') },
    { value: 'waiting', label: 'Before Work', count: countTabItems('waiting') },
    { value: 'pending_offers', label: 'Pending Offers', count: countTabItems('pending_offers') },
    { value: 'awaiting_approval', label: 'Awaiting Seeker', count: countTabItems('awaiting_approval') },
    { value: 'disputed', label: 'Disputes', count: countTabItems('disputed') },
    { value: 'completed', label: 'Completed', count: countTabItems('completed') },
    { value: 'canceled', label: 'Canceled & closed', count: countTabItems('canceled') },
  ];

  return (
    <WorkspaceTabs
      activeValue={activeTab}
      items={tabs}
      onChange={onTabChange}
      ariaLabel="Filter provider activity"
      tone="provider"
    />
  );
}
