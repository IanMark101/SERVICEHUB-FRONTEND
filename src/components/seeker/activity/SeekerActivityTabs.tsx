import { JobEngagement } from '../../../types';
import WorkspaceTabs, { type WorkspaceTabItem } from '../../ui/WorkspaceTabs';
import { SeekerActivityTab } from './types';

interface SeekerActivityTabsProps {
  activeTab: SeekerActivityTab;
  isDark: boolean;
  totalCount: number;
  countStatus: (status: JobEngagement['status'] | 'action_required') => number;
  onTabChange: (tab: SeekerActivityTab) => void;
}

export default function SeekerActivityTabs({
  activeTab,
  totalCount,
  countStatus,
  onTabChange,
}: SeekerActivityTabsProps) {
  const tabs: WorkspaceTabItem<SeekerActivityTab>[] = [
    { value: 'all', label: 'All', count: totalCount },
    { value: 'action_required', label: 'Action Required', count: countStatus('action_required') },
    { value: 'pending', label: 'Pending Provider', count: countStatus('pending_provider') },
    { value: 'active', label: 'Active Now', count: countStatus('in_progress') },
    { value: 'waiting', label: 'In Queue', count: countStatus('queued') },
    { value: 'disputed', label: 'Disputes', count: countStatus('disputed') },
    { value: 'completed', label: 'Completed', count: countStatus('completed') },
    { value: 'canceled', label: 'Canceled', count: countStatus('canceled') },
  ];

  return (
    <WorkspaceTabs
      activeValue={activeTab}
      items={tabs}
      onChange={onTabChange}
      ariaLabel="Filter seeker activity"
      tone="seeker"
    />
  );
}
