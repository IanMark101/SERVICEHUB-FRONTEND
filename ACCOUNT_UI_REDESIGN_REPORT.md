# Account profile and navigation update

## Reference decision

The first reference supplies the wide identity composition, prominent portrait, and horizontal profile navigation. The second informs continuity of global navigation. ServiceHub retains its existing typography, cream surfaces, orange accent, and dark actions. No decorative cover image or social-network features were introduced.

## Routes and shared header

- Profile: `/profile/[userId]`. IDs match the existing public-profile API; displayed handles are not unique stored usernames.
- Settings: `/account/settings`.
- Existing seeker/provider profile and settings URLs forward to the account destinations.
- Both account pages render the same `Header` component used by the workspaces, without their sidebar.
- A destination selector provides Seeker, Provider, and Community navigation. Search, messages, theme, notifications, and the account menu remain available.
- Notifications have All, Unread, Seeker, Provider, and Community filters. Context filters use destination links and cover loaded notifications; Load older retains existing pagination behavior.

## Profile

The larger portrait and name lead the page. Bio supports identity; reputation has one summary. Overview presents About, marketplace details, and public activity. Profile tabs use an underline active state and keyboard navigation. Edit Profile is restricted to the owner.

Only active, unpaused services and open requests are shown. Backend request listing already exposes open requests to authenticated marketplace members. Both types can appear for one account.

Verification shows status only. Private uploads live in Settings. Detailed trust history remains restricted to its owner/admin by the existing API behavior. Missing ratings render as Not rated.

## Settings

Settings now has account-level routing and shared global chrome. Existing profile, password, appearance, trust guide, and deletion workflows remain; private verification management was added using the existing uploader. Section links include Account, Profile, Verification, Security, Appearance, and Trust & safety.

## Important files

- `src/components/layout/Header.tsx`
- `src/components/layout/header/HeaderNotifications.tsx`
- `src/components/profile/ProfilePageShell.tsx`
- `src/components/profile/ProfileHeader.tsx`
- `src/components/profile/MarketplaceProfileOverview.tsx`
- `src/components/profile/UserProfile.tsx`
- `src/components/profile/AccountSettingsView.tsx`
- `src/app/profile/[userId]/page.tsx`
- `src/app/account/settings/page.tsx`
- `src/app/globals.css`

## Validation

- TypeScript: passed.
- ESLint: passed.
- Frontend tests: 31 passed across 11 files.
- Production build: passed, including both account routes.
- Runtime request: localhost:3000/account/settings returned HTTP 200.
- Browser appearance and authenticated interactions: not verified; browser tooling reported no available browser session.

No backend files or business-rule calculations were modified. Existing API limits still apply: profile activity uses loaded marketplace data, and reputation counts/averages retain their existing provider-service semantics.

## Manual checks

1. Open your profile from Seeker, Provider, and the account menu. Confirm the shared header remains and workspace sidebar disappears.
2. Open another member from a listing or Community. Confirm Edit Profile and private verification controls are absent.
3. Check Overview, Reviews, Trust History, Verification, social links, and zero-rating states.
4. Open Settings; check section navigation, profile saving, verification, password form, theme, and deletion confirmation without submitting a deletion.
5. Check all header destinations, search, messages, notification filters, notification links, account menu, and sign-out confirmation.
6. Repeat at mobile, tablet, laptop, and short-height laptop sizes, in light and dark modes.

Changes remain on branch `polish/profile-auth-settings-ui`; this update was not pushed.
