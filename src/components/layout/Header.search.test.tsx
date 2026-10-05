import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from './Header';
import { useApp } from '../../context/AppContext';
import { apiSearchUsers } from '../../api/users.api';
import type { UserSession } from '../auth/LoginContainer';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../api/users.api', () => ({ apiSearchUsers: vi.fn() }));
vi.mock('../../hooks/useTransactionPermission', () => ({ useTransactionPermission: () => ({ navigateToVerification: vi.fn() }) }));
vi.mock('./header/HeaderNotifications', () => ({ default: () => null }));
vi.mock('./header/HeaderProfileMenu', () => ({ default: () => null }));

const viewer: UserSession = {
  id: 'viewer-id', firstName: 'Current', lastName: 'Member', email: '',
  role: 'provider', avatarUrl: '', bio: '', phone: '', verificationStatus: 'APPROVED',
};
// Matches GET /users: the server returns `name`, not firstName/lastName.
const serverResults = [
  { id: 'member-one', name: 'john  sefuesca', role: 'user', avatarUrl: '', location: 'Cordova', bio: '' },
  { id: 'member-two', name: 'John Vincent Santos', role: 'user', avatarUrl: '', location: 'Cordova', bio: '' },
  { id: 'member-three', name: 'John Carlo Buenaflor', role: 'user', avatarUrl: '', location: 'Cordova', bio: '' },
];

describe('header people-search names', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({
      notifications: [], users: [], services: [], jobRequests: [], isDark: false,
      markNotificationsRead: vi.fn(), toggleTheme: vi.fn(), unreadMessagesCount: 0,
      hasMoreNotifications: false, loadMoreNotifications: vi.fn(),
    } as unknown as ReturnType<typeof useApp>);
    vi.mocked(apiSearchUsers).mockResolvedValue({ success: true, data: serverResults });
  });

  const mount = (role: 'provider' | 'admin' = 'provider', onViewProfile = vi.fn()) => {
    render(<Header currentRole={role} activeTab="browse-services" setActiveTab={vi.fn()} setIsMobileOpen={vi.fn()} user={viewer} onSignOut={vi.fn()} onViewProfile={onViewProfile} />);
    return onViewProfile;
  };

  it('displays API names on desktop and opens the selected profile with normalized name fields', async () => {
    const onViewProfile = mount();
    fireEvent.change(screen.getByRole('combobox', { name: 'Search people' }), { target: { value: 'john' } });
    const results = await screen.findByRole('listbox', { name: 'People search results' });
    await within(results).findByText('John Vincent Santos');
    expect(within(results).getByText('john sefuesca')).toBeInTheDocument();
    expect(within(results).getByText('John Carlo Buenaflor')).toBeInTheDocument();
    expect(within(results).queryByText('Unknown user')).not.toBeInTheDocument();
    fireEvent.click(within(results).getByRole('button', { name: /John Vincent Santos/ }));
    expect(push).toHaveBeenCalledWith('/profile/member-two');
    expect(onViewProfile).toHaveBeenCalledWith(expect.objectContaining({ id: 'member-two', firstName: 'John', lastName: 'Vincent Santos' }));
  });

  it('displays API names in mobile search', async () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Search people' }));
    const input = screen.getByRole('textbox', { name: 'Search people' });
    const mobilePanel = within(input.parentElement!.parentElement!);
    fireEvent.change(input, { target: { value: 'john' } });
    const result = await mobilePanel.findByText('John Vincent Santos');
    expect(mobilePanel.queryByText('Unknown user')).not.toBeInTheDocument();
    fireEvent.click(result.closest('button')!);
    expect(push).toHaveBeenCalledWith('/profile/member-two');
  });

  it('keeps legacy first and last names readable', async () => {
    vi.mocked(apiSearchUsers).mockResolvedValue({ success: true, data: [{ id: 'legacy-user', firstName: 'John Mark', lastName: 'Buenaflor', role: 'provider' }] });
    mount();
    fireEvent.change(screen.getByRole('combobox', { name: 'Search people' }), { target: { value: 'john' } });
    const result = await screen.findByText('John Mark Buenaflor');
    fireEvent.click(result.closest('button')!);
    expect(push).toHaveBeenCalledWith('/profile/legacy-user');
  });
});
