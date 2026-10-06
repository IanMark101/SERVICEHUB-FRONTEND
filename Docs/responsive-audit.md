# ServiceHub responsive audit

Completed 6 October 2026 on `FEATURE/mobile-hero-responsiveness`. This is a frontend presentation change. The desktop landing composition is preserved. The changes are local to this branch and have not been deployed.

## 1. Root causes found

- The authentication shell constrained desktop content to `100dvh` and hid overflow. Its flexible body could shrink below its contents, letting the access section collide with the footer. The shared auth correction already on this branch removes that height constraint and keeps the header and footer from shrinking. At 1366×768, the document is 803px tall and scrolls naturally; the last access row ends 41px before the footer begins.
- Messages combined a 580px minimum height with a two-pane layout starting at 768px. An expanded workspace sidebar left too little room for the chat pane. Flex children also resisted shrinking, and long unbroken message text could overflow.
- Several custom dialogs had no viewport height limit. The category suggestion dialog limited only its body, without accounting for the header and tabs. Phone confirmation actions could compress on narrow screens.
- Listing action rows, activity sort controls, and pagination could exceed their available width. Long names needed a flexible container; account popovers and stacked toasts needed height bounds.
- Existing responsive grids, bounded dialogs, local table/tab scrolling, and workspace scrolling were retained where they already worked.

## 2. Files and components changed

The following 24 files were changed or added in this audit. Only JSX presentation attributes changed in the 21 existing TSX files.

| File | Change |
| --- | --- |
| [src/app/admin/layout.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/admin/layout.tsx) | Dynamic viewport height; preserve warning strip; allow content pane to shrink and scroll. |
| [src/app/admin/categories/page.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/admin/categories/page.tsx) | Bound category review dialog. |
| [src/app/admin/verifications/page.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/admin/verifications/page.tsx) | Bound verification review dialog. |
| [src/app/globals.css](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/globals.css) | Import scoped responsive helpers; allow admin pagination wrapping. |
| [src/app/seeker/messages/page.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/seeker/messages/page.tsx) | Responsive chat panes, height, header, composer, and message wrapping. |
| [src/app/provider/messages/page.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/provider/messages/page.tsx) | Same presentation correction for provider chat. |
| [src/components/messages/ConversationNavigation.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/messages/ConversationNavigation.tsx) | Match chat breakpoint; preserve header/ribbon height; contain long names and pagination. |
| [src/components/layout/Sidebar.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/layout/Sidebar.tsx) | Give long profile names a flexible text container. |
| [src/components/layout/header/HeaderProfileMenu.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/layout/header/HeaderProfileMenu.tsx) | Viewport bounds and scrolling for account popover. |
| [src/components/admin/AdminCategoryCatalog.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/admin/AdminCategoryCatalog.tsx) | Bound create and edit dialogs. |
| [src/components/admin/AdminPagination.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/admin/AdminPagination.tsx) | Contain page controls; preserve button widths. |
| [src/components/admin/users/AdminUserModals.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/admin/users/AdminUserModals.tsx) | Bound trust, suspension, ban, and restore dialogs. |
| [src/components/profile/PhonePasswordConfirmModal.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/profile/PhonePasswordConfirmModal.tsx) | Scrollable dialog and stacked mobile actions. |
| [src/components/provider/ServiceManager.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/provider/ServiceManager.tsx) | Wrap listing actions on narrow cards. |
| [src/components/provider/activity/ProviderActivityList.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/provider/activity/ProviderActivityList.tsx) | Wrap and constrain sort controls. |
| [src/components/seeker/activity/SeekerActivityList.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/seeker/activity/SeekerActivityList.tsx) | Wrap sort controls. |
| [src/components/seeker/IncomingOffers.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/seeker/IncomingOffers.tsx) | Bound payment selection dialog. |
| [src/components/seeker/ReviewModal.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/seeker/ReviewModal.tsx) | Bound review dialog. |
| [src/components/seeker/SuggestCategoryModal.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/seeker/SuggestCategoryModal.tsx) | Bound entire dialog, keep header/tabs visible, scroll remaining body. |
| [src/components/ui/PaginationBar.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/ui/PaginationBar.tsx) | Wrap pagination layout; contain horizontal page-control scrolling. |
| [src/components/ui/Toast.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/ui/Toast.tsx) | Bound feedback stack and wrap long message tokens. |
| [src/components/ui/TransactionBlockedModal.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/ui/TransactionBlockedModal.tsx) | Bound transaction restriction dialog. |
| [src/components/ui/responsive.css](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/ui/responsive.css) | New scoped dialog and feedback scroll helpers. |
| [src/components/profile/PhonePasswordConfirmModal.test.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/profile/PhonePasswordConfirmModal.test.tsx) | Three behavior regression tests. |

This report is the additional documentation file. The earlier authentication correction in [AuthLayout.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/auth/AuthLayout.tsx) and [AuthLeftPanel.tsx](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/auth/AuthLeftPanel.tsx) was verified and retained without further edits. Existing unrelated working-tree changes were excluded.

## 3. Responsive fixes introduced

- Use natural document height for authentication; retain internal scrolling for workspace shells.
- Apply `.viewport-dialog-scroll` only to affected dialogs: `max-height: calc(100dvh - 2rem)`, `overflow-y: auto`, `min-width: 0`, and contained overscroll. Existing dialogs with suitable scroll bodies keep their current layout.
- Use `min-h-0`, `min-w-0`, and non-shrinking headers/actions where flex children must share limited space.
- Messages use one pane below 1280px and both panes from 1280px, with the existing back action available in the one-pane layout. Message content wraps without changing sending or realtime behavior.
- Allow controls to wrap or stack; keep pagination scrolling inside its control container. Toasts remain reachable when the stack exceeds a short viewport.
- Preserve existing colors, fonts, workflows, and wide-desktop landing proportions. No global scaling or font-size reduction was introduced.

## 4. Routes and states tested

Public authentication and landing pages were checked against the local production build. Protected pages were rendered from the actual source components with isolated sample API responses; no production accounts, bookings, payments, or moderation actions were changed.

| Area | Pages and states checked |
| --- | --- |
| Authentication | `/login`, its forgot-password mode, `/register` (all three steps), `/reset-password` form with a dummy token, `/verify-email` missing-token state, `/email-verification-required`. |
| Seeker | `/seeker/seek-services`, `/seeker/post-request`, `/seeker/request-manager`, `/seeker/incoming-offers`, `/seeker/seeker-activity`, `/seeker/messages`, `/seeker/community-hub`, `/seeker/suggest-category`, `/seeker/account-settings`, `/seeker/user-profile`, `/seeker/payment-return` missing-intent state. |
| Provider | `/provider/browse-services`, `/provider/offer-services`, `/provider/service-manager`, `/provider/incoming-requests`, `/provider/provider-activity`, `/provider/messages`, `/provider/community-hub`, `/provider/account-settings`, `/provider/user-profile`, `/provider/transaction-history`. |
| Workrooms and queues | Seeker and provider booking workrooms in queued, in-progress, and awaiting-seeker-approval states; provider paid workload and queue presentation; admin dispute workroom. Active work is part of provider Activity rather than a separate Active Services route. |
| Administrator | `/admin/overview`, `/admin/users`, `/admin/users/[userId]` account and populated trust-history views, `/admin/verifications`, `/admin/reports`, `/admin/categories`, `/admin/content-cases`, `/admin/audit-logs`, `/admin/announcements`, `/admin/ban-appeals`, `/admin/reviews`, `/admin/user-profile`, `/admin/account-settings`. Legacy `/admin/requests` and `/admin/services` use the content-case destination. |
| Shared | `/account/settings`, `/profile/[userId]`, verification upload, password security, profile cards, phone/review/category/booking/restriction/trust/onboarding dialogs, loading and empty states. Mobile drawer, collapsed/expanded sidebar, account menu, notifications, form selections, pagination, and five stacked toasts. |
| Desktop preservation | `/` at all 11 requested sizes, plus the original 1440×750 desktop composition. The hero heading remains 69.84px at 1440px. |

The final matrix contains **726 viewport cases**, plus **72 zoom-equivalent cases** and **11 focused interaction checks**. No accidental document/container width overflow, unexpected measured text overflow, or out-of-viewport measured dialogs remained in those checks. Auth header/content/footer separation and dialog/feedback action reachability were checked separately. Local measurements and screenshots are recorded in the evidence files linked below.

## 5. Viewports tested

320×568, 375×667, 390×844, 430×932, 768×1024, 1024×768, 1280×720, 1366×768, 1440×900, 1536×864, and 1920×1080. All final matrix checks passed, including the two short laptop sizes.

## 6. Zoom levels inspected

The available browser tool controls viewport size but does not expose browser zoom. The following are **equivalent CSS viewport tests**, not actual browser zoom tests. They check layout and breakpoint behavior for six representative pages: login, messages, service manager, reports, phone confirmation, and account settings.

| Zoom equivalent | Base 1280×720 | Base 1366×768 | Base 1920×1080 | Layout result |
| --- | --- | --- | --- | --- |
| 90% | 1422×800 | 1518×853 | 2133×1200 | Pass |
| 100% | 1280×720 | 1366×768 | 1920×1080 | Pass |
| 110% | 1164×655 | 1242×698 | 1745×982 | Pass |
| 125% | 1024×576 | 1093×614 | 1536×864 | Pass |

Actual 90%, 100%, 110%, and 125% browser zoom remains a manual check, including font rasterization, browser chrome, and operating-system display scaling.

## 7. Functionality regression check

- Existing full suite: **99 test files / 579 tests passed** with `npm test -- --reporter=dot`.
- New phone confirmation regression checks: **3 tests passed**, covering blank-password protection and exact callback input, visibility/cancel behavior, and loading guards. Focused confirmation across phone/admin dialogs, FormSelect, and the messages hook: **4 files / 20 tests passed**.
- `npm run build` passed, including TypeScript and generation of all 104 pages. `npx tsc --noEmit` passed after adding the new test file.
- An AST comparison against baseline `0a2399e` verified all **21 modified existing TSX files** are identical after excluding JSX `className`, `style`, and `sizes` attributes and comments. Event handlers, state, queries, APIs, route behavior, guards, schemas, validation, and submissions were unchanged.
- Browser checks confirmed registration step navigation, mobile form selections, drawer/menu opening and closing, sidebar collapse/expansion, internal dialog scrolling, and toast scrolling/dismissal. Existing tests cover authentication, permissions, bookings, queues, payments, cancellation/disputes, navigation, and other workflows. Existing tests were not edited to suppress failures.

## 8. Remaining manual checks

- Actual browser zoom and OS display scaling on the classmate's laptop; confirm the usable viewport with `window.innerWidth` and `window.innerHeight`.
- Safari/iOS and Android devices with native keyboards, address-bar resizing, and safe-area insets.
- Authenticated production accounts with real data, slow/failing responses, uploaded media, and longer labels. Fixture checks exercise protected presentation but do not establish live deployment behavior.
- Successful email verification/reset, real login, checkout/GCash completion, messaging, and moderation end to end. These actions were deliberately not executed against production during a presentation audit.
- Recheck the deployed app after this feature branch is reviewed and deployed. The live site still runs its existing deployment.

Local evidence: [measurement results](C:/Users/Administrator/.codex/visualizations/2026/10/05/01a10ae5-18f7-77b2-8886-fe3134b5deac/responsive-audit-results.json), [logic comparison](C:/Users/Administrator/.codex/visualizations/2026/10/05/01a10ae5-18f7-77b2-8886-fe3134b5deac/responsive-logic-check.json), [laptop footer](C:/Users/Administrator/.codex/visualizations/2026/10/05/01a10ae5-18f7-77b2-8886-fe3134b5deac/responsive-login-footer-1366x768.png), [mobile login](C:/Users/Administrator/.codex/visualizations/2026/10/05/01a10ae5-18f7-77b2-8886-fe3134b5deac/responsive-login-mobile.png), [scrollable phone dialog](C:/Users/Administrator/.codex/visualizations/2026/10/05/01a10ae5-18f7-77b2-8886-fe3134b5deac/responsive-phone-dialog-320x568.png), [preserved desktop](C:/Users/Administrator/.codex/visualizations/2026/10/05/01a10ae5-18f7-77b2-8886-fe3134b5deac/responsive-desktop-preserved.png).

### Follow-up: mobile notification width

The user's subsequent phone screenshot exposed a width problem missed by the initial bounds check: a narrow panel could remain inside the viewport while still being unusable. Reproduction at 360px showed the notification panel was only 118px wide. `backdrop-filter` on the toolbar and mobile header established a containing block for fixed descendants, so the panel and dismissal backdrop were sized against the toolbar.

[globals.css](C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/globals.css) now removes that backdrop filter below 640px from the dashboard header, toolbar, and account header. The panel uses its existing viewport positioning and 12px side margins: 336px wide at a 360px viewport. The dismissal backdrop covers the full viewport. Desktop blur and positioning are retained. No notification component logic, filters, pagination, marking-read behavior, or navigation handlers changed.

Confirmation: **112 checks passed** across seeker, provider, admin, and account settings, in empty and populated states, at the original 11 sizes plus 360×740, 639×768, and 640×768. Pagination, unread filtering/page reset, close button, and Escape dismissal passed browser checks. The existing header and notification-copy suites passed **8 tests**, and the production build passed with all 104 pages generated. This follow-up is still local to the feature branch.

Evidence: [notification measurements](C:/Users/Administrator/.codex/visualizations/2026/10/05/01a10ae5-18f7-77b2-8886-fe3134b5deac/notification-responsive-results.json), [fixed mobile panel](C:/Users/Administrator/.codex/visualizations/2026/10/05/01a10ae5-18f7-77b2-8886-fe3134b5deac/notification-mobile-fixed.png).
