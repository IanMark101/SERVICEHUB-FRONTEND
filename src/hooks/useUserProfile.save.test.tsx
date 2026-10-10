import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../context/AppContext';
import { apiGetPublicProfile, apiGetTrustHistory, apiUpdateProfile } from '../api/auth.api';
import type { UserSession } from '../components/auth/LoginContainer';
import { useUserProfile } from './useUserProfile';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => '/seeker/account-settings' }));
vi.mock('../api/auth.api', () => ({ apiGetPublicProfile: vi.fn(), apiGetTrustHistory: vi.fn(), apiUpdateProfile: vi.fn() }));
vi.mock('../api/ai.api', () => ({ apiGetProviderSummary: vi.fn() }));
vi.mock('../components/ui/Toast', () => ({ useToast: () => toast }));

const account = {
  id: 'profile-owner', role: 'seeker', firstName: 'John', lastName: 'Client',
  phone: '09171234567', location: '', bio: '', avatarUrl: '',
} as UserSession;
// The public-profile endpoint deliberately excludes the private phone field.
const publicProfile = {
  id: account.id, name: 'John Client', bio: '', location: '', avatarUrl: '',
  facebookUrl: '', instagramUrl: '', websiteUrl: '',
};

async function loadProfile(targetUser = account) {
  const hook = renderHook(() => useUserProfile({ targetUser, isOwnProfile: true }));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe('saving independent profile edits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({ user: account, setUser: vi.fn(), isDark: false } as unknown as ReturnType<typeof useApp>);
    vi.mocked(apiGetPublicProfile).mockResolvedValue({ success: true, data: publicProfile });
    vi.mocked(apiGetTrustHistory).mockResolvedValue({ success: true, data: [] });
    vi.mocked(apiUpdateProfile).mockImplementation(async changes => ({
      success: true, data: { ...publicProfile, phone: account.phone, ...changes },
    }));
  });

  it('preserves the session phone when loading public details and sends only edited links', async () => {
    const { result } = await loadProfile();
    expect(result.current.editForm.phone).toBe(account.phone);
    act(() => result.current.setEditForm(form => ({
      ...form, facebookUrl: 'https://www.facebook.com/john',
      instagramUrl: 'https://www.instagram.com/john/', websiteUrl: 'https://john.vercel.app/',
    })));
    await act(() => result.current.handleSaveProfile());
    expect(apiUpdateProfile).toHaveBeenCalledExactlyOnceWith({
      facebookUrl: 'https://www.facebook.com/john',
      instagramUrl: 'https://www.instagram.com/john/', websiteUrl: 'https://john.vercel.app/',
    });
    expect(result.current.phonePasswordModalOpen).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
  });

  it('allows a links-only save when phone and profile area have never been filled in', async () => {
    const { result } = await loadProfile({ ...account, phone: '' });
    act(() => result.current.setEditForm(form => ({ ...form, websiteUrl: 'https://portfolio.example/' })));
    await act(() => result.current.handleSaveProfile());
    expect(apiUpdateProfile).toHaveBeenCalledExactlyOnceWith({ websiteUrl: 'https://portfolio.example/' });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('saves a general profile area independently and immediately updates the profile label', async () => {
    const { result } = await loadProfile({ ...account, phone: '' });
    act(() => result.current.setEditForm(form => ({ ...form, location: '  Day-as, Cordova, Cebu  ' })));
    await act(() => result.current.handleSaveProfile());
    expect(apiUpdateProfile).toHaveBeenCalledExactlyOnceWith({ location: 'Day-as, Cordova, Cebu' });
    expect(result.current.location).toBe('Day-as, Cordova, Cebu');
  });

  it('retains unchanged legacy contact values while explicitly clearing a saved link', async () => {
    vi.mocked(apiGetPublicProfile).mockResolvedValue({ success: true, data: { ...publicProfile, websiteUrl: 'https://old.example/' } });
    const { result } = await loadProfile({ ...account, phone: 'legacy contact' });
    act(() => result.current.setEditForm(form => ({ ...form, websiteUrl: '' })));
    await act(() => result.current.handleSaveProfile());
    expect(apiUpdateProfile).toHaveBeenCalledExactlyOnceWith({ websiteUrl: '' });
  });

  it('rejects an invalid edited mobile number before asking for a password or making a request', async () => {
    const { result } = await loadProfile();
    act(() => result.current.setEditForm(form => ({ ...form, phone: '123' })));
    await act(() => result.current.handleSaveProfile());
    expect(apiUpdateProfile).not.toHaveBeenCalled();
    expect(result.current.phonePasswordModalOpen).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Enter a valid Philippine mobile number, such as 0917 123 4567 or +63 917 123 4567.');
  });

  it('still requires password confirmation for a valid phone change and sends it only with that change', async () => {
    const { result } = await loadProfile();
    act(() => result.current.setEditForm(form => ({ ...form, phone: '09181234567' })));
    await act(() => result.current.handleSaveProfile());
    expect(result.current.phonePasswordModalOpen).toBe(true);
    expect(apiUpdateProfile).not.toHaveBeenCalled();
    await act(() => result.current.handleSaveProfile('confirmed-password'));
    expect(apiUpdateProfile).toHaveBeenCalledExactlyOnceWith({ phone: '09181234567', currentPassword: 'confirmed-password' });
    expect(result.current.phonePasswordModalOpen).toBe(false);
  });

  it('keeps the active-engagement phone lock while allowing unrelated link edits', async () => {
    vi.mocked(useApp).mockReturnValue({
      user: account, setUser: vi.fn(), isDark: false,
      jobEngagements: [{ providerId: account.id, seekerId: 'another-user', status: 'ongoing' }],
    } as unknown as ReturnType<typeof useApp>);
    const { result } = await loadProfile();
    act(() => result.current.setEditForm(form => ({ ...form, websiteUrl: 'https://john.example/' })));
    await act(() => result.current.handleSaveProfile());
    expect(apiUpdateProfile).toHaveBeenCalledExactlyOnceWith({ websiteUrl: 'https://john.example/' });
    vi.mocked(apiUpdateProfile).mockClear();
    act(() => result.current.setEditForm(form => ({ ...form, phone: '09181234567' })));
    await act(() => result.current.handleSaveProfile('confirmed-password'));
    expect(apiUpdateProfile).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Mobile number cannot be changed while you have active service engagements in progress.');
  });

  it('keeps secure-link validation and shows a readable error without a request', async () => {
    const { result } = await loadProfile();
    act(() => result.current.setEditForm(form => ({ ...form, websiteUrl: 'javascript:alert(1)' })));
    await act(() => result.current.handleSaveProfile());
    expect(apiUpdateProfile).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Links must start with https://.');
  });

  it('rejects a malformed link without throwing, and leaves the edits available to correct', async () => {
    const { result } = await loadProfile();
    act(() => result.current.setEditForm(form => ({ ...form, websiteUrl: 'not a url' })));
    await act(() => result.current.handleSaveProfile());
    expect(apiUpdateProfile).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Enter a valid link, such as https://example.com.');
    expect(result.current.editForm.websiteUrl).toBe('not a url');
    expect(result.current.saving).toBe(false);
  });
});
