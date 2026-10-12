# Trust, Community and workspace palette review

Date: 2026-10-12. Scope: public `#trust` / `#reviews`, `#community`, and standard Seeker/Provider SidebarView colors. Authority: `SCOPED_EXISTING_ALLOWED`; incumbent ServiceHub system retained. Sources: [direction contract](TRUST_DIRECTION.md), [Trust surface](../surfaces/landing-trust.md), [Community/sidebar surface](../surfaces/landing-community.md).

Previous 28-capture disposition (historical for superseded palette/icons): **ship within the then-requested visual, content and tab scope**. The fresh independent finish reviewer opened all 28 final captures individually and found no material fixes. Trust follows the supplied split composition, with actions left and real tabs above one open-facts panel right. That version used orange/brown/cream Community styling and Provider of the Week. Both sidebar palettes are visually identical across light/dark themes, matching the brown/orange Seeker and forest/green Provider references before the latest white-label correction.

## Landing lighting and repeatable motion ? 2026-10-12

The Community panel retains #0A0A0A / white / #FF6B00, with two static neutral lighting fields: a broad lower-left white glow (12% peak alpha) and a faint upper-right highlight (6%). Layout, feature claims and actions are unchanged.

Added repeatable entrances to Benefits copy/mobile track, How It Works cards and the active Workspaces panel. Comparison rows now replay. Existing ScrollReveal sections already use once:false; Trust, Community, FAQ, CTA and Booking heading retain those entrances. Hero groups now observe entry/exit, use partial opacity and small movement from a visible CSS default, respond to reduced-motion preference changes and clean up observers/controls. Footer heading/actions use restart/complete entry and exit actions. The Booking walkthrough, tablet perspective, tickers and footer parallax keep their existing behavior.

Validation: 29 tests passed across hero lifecycle, public server rendering, content controls, Workspaces and Booking Progress. Scoped ESLint and the 107-page production build passed. [Browser evidence](landing-motion-review.json) records eleven content targets with two entry runs each: 1440px and 390px in both themes replayed every target; 320px in both themes stayed stationary with reduced motion. No horizontal page overflow was measured. Six Community panel captures use viewport crops at 1440/390/320, both themes, with reduced motion for clean stills. The initial offscreen mobile crops were replaced after correcting the capture coordinates; no product layout change was needed. Existing anonymous landing React #418 remains recorded in the browser evidence, without an error-free runtime claim.

The detector found the existing CTA charcoal text on pale-orange hover and two existing footer-font warnings. These unchanged colors/type remain outside this motion/lighting scope. No new dependencies, account access, database changes or deployment. Both master prompts are aligned.

## Charcoal sidebar restoration ? 2026-10-12

Both standard workspace sidebars now share #0A0A0A charcoal, white labels, #C9C9C9 secondary text, neutral #1E1E1E controls / #292929 hover fills and subtle white lighting at the bottom. The lighting is a static radial gradient: ellipse 110% 28%, centered at 50% 108%, white at 8% alpha fading to transparent. Seeker orange #D96700 and Provider green #047857 selections remain, with white active and workspace-switch labels. No dark-theme overrides change these colors. Active badges are charcoal/white; Admin remains separate.

The landing Workspaces tab container and expanded previews reuse SidebarView and inherit the same restoration. Verified on the production build using a clean headless Edge profile without account access: eight role/theme/width combinations at 1440px and 390px, with eight sidebar crops and eight Workspaces container captures. Computed background is rgb(10,10,10), active and both switch labels are white in every combination, and actual themes match the requested themes. Opened both contact sheets and checked all sixteen captures. See [sidebar matrix](charcoal-sidebar-contact.png), [Workspaces matrix](charcoal-workspaces-contact.png) and [measurements](charcoal-sidebar-review.json). These previews establish shared styling, not certification of signed-in mobile navigation or the full footer. The existing preview caption overlaps parts of expanded sidebar crops.

Ten focused existing tests passed (WorkspaceDashboardPreview and LandingWorkspaces), the 107-page production build passed, and the scoped SidebarView detector returned no findings. An initial build encountered a temporary review-browser profile file lock; the profile was removed and the rerun passed. Existing anonymous landing hydration #418 was recorded again; no error-free runtime claim. The user-pinned white-on-Seeker-orange contrast exception remains unchanged. Community and Trust colors are unchanged by this restoration.

## Previous white-label and landing correction - sidebar backgrounds superseded

The user explicitly pins white sidebar active labels and white text on both workspace switch buttons in both states, roles and themes. Seeker retains #D96700 selections, now with #FFFFFF ink; Provider retains #047857/white. Active count badges use brown/forest with white ink. Sidebar background, control, shadow and avatar styling remains theme invariant.

Public Community and Trust reuse existing landing charcoal/white/brand tokens from `src/app/brand.css` and `globals.css`, rather than the sidebar brown palette. Community uses #0A0A0A panel, #FF6B00 headline emphasis, white body/titles and white/charcoal CTA; outer canvas is #FCFBFA or charcoal. Trust uses landing charcoal/white surfaces, black body ink in light theme and white in dark. Repeated decorative icons are removed from Community rows and both landing workspace summary role labels/features/tips. Existing controls/navigation icons, copy, routes, Provider of the Week and tabs remain.

| Latest evidence | Coverage |
| --- | --- |
| `color-icons-{community,trust}-{light,dark}-{1440,320}.png` | Eight section crops. |
| `color-icons-workspace-{seeker,provider}-{light,dark}-{1440,320}.png` | Eight workspace crops. |
| `color-icons-sidebar-{seeker,provider}-{light,dark}.png` | Four sidebar color crops. |
| [color-icons-review.json](color-icons-review.json) | 20 captures; zero element horizontal overflow; Community panel rgb(10,10,10), accent rgb(255,107,0), body white; zero Community feature icons and zero SVGs in both workspace summary role cards across the role/theme/width sets; sidebar active and switch labels white in both roles/themes. |

White on Seeker #D96700 is approximately 3.565:1 and white on public #FF6B00 approximately 2.84:1, both below 4.5:1 for normal text. The user explicitly pins these colors; no AA contrast pass is claimed or canonized. Fresh independent disposition: **ship within the requested correction**. All 20 captures were opened individually and found valid, with no material fixes. Twenty targeted tests, scoped ESLint, the 107-page production build and git diff check passed. QA server/runtime were cleaned up without package edits. React #418 remains recorded in both themes; this is not an error-free runtime certification.

## Previous 28-capture evidence - historical

| Evidence | Coverage |
| --- | --- |
| `trust-reference-{light,dark}-{1440,390,320}-{overview,reviews,score}.png` | 18 section crops: every Trust tab, three widths, both themes. |
| `community-brand-{light,dark}-{1440,390,320}.png` | Six Community section crops. |
| `sidebar-reference-{seeker,provider}-{light,dark}.png` | Four color crops of the real shared SidebarView in the existing expanded public product preview. |
| [trust-community-sidebar-review.json](trust-community-sidebar-review.json) | 28 capture records plus two keyboard checks; zero measured section horizontal overflow; minimum sampled small-text contrast **4.8973:1**. React #418 is retained in pageErrors. |
| [Desktop Trust matrix](trust-desktop-contact-final.png), [390px Trust matrix](trust-390-contact-final.png), [320px Trust matrix](trust-320-contact-final.png) | All three tabs in both themes at each width. |
| [Community matrix](community-brand-contact-final.png), [sidebar matrix](sidebar-reference-contact-final.png) | Overviews of the final individual crops. |

Previous-version implementation validation: 20 targeted SSR/content/workspace tests, scoped ESLint, `git diff --check` and the final production build passed; the build generated 107 pages. Browser keyboard checks selected and focused the Reviews tab in both themes. The captures are section/panel crops, not full-viewport or signed-in acceptance evidence. QA runtime/server were cleaned up; no temporary source fixture/route/package edits, account/database writes or deployment were part of this pass.

## Historical evidence

`design-review.json`, `community-contact.png`, `sidebar-contact.png` and their 18 initial crops describe the earlier gray Community/pale sidebar version. The four `sidebar-solid-*.png` crops and `sidebar-solid-review.json` describe the intermediate full-orange/full-green correction. Both sidebar versions are superseded by the latest brown/forest backgrounds with saturated selections. Historical zero-error statements do not apply to current captures; the solid correction and current reports both record React #418. All 28 captures and the five contact matrices above are now historical for the latest palette/icon correction; preserve them as evidence of the prior version.

## Limits and uncanonized findings

The anonymous landing bootstrap emitted React hydration error #418 in both themes; the unresolved cause is not attributed to this work or claimed fixed. The historical visual ship verdict does not certify error-free runtime behavior; the latest correction also retains React #418 and the user-pinned contrast exception. Sidebar preview crops may include caption overlap at the bottom; they do not certify the complete footer, signed-in account flows or responsive navigation. The pre-existing sidebar `transition: width` detector warning remains unchanged outside palette scope. Administration stays separate.

The user references were supplied only in the conversation, without local originals, so no pixel comparison is claimed. No global PRODUCT.md, DESIGN.md, QUALITY BAR or design sidecar was required or created for this scoped extension. Neither runtime findings nor preview artifacts are promoted into the design system.


## Current scroll-linked sections and eGov hero motion ? 2026-10-12

This correction supersedes the earlier short, partial-opacity viewport entrance record for the shared landing groups. The user could not perceive the prior effect and explicitly requested visible scroll-dependent motion plus the hero animation from https://e.gov.ph/. The public reference hero and its delivered JavaScript were inspected: badge descends 20px over 0.5s; copy rises 32px over 0.6s with 100ms stagger; the presenter/phone slide in from the right by 48px over 0.7s with a 0.3s delay and cubic-bezier(0.22,1,0.36,1). ServiceHub uses that sequence, with the Help Center row in the final supporting slot and replay on viewport re-entry. Existing particle assets/runtime and landing colors remain the incumbent version.

The reusable useScrollEntrance hook now follows target layout position from viewport bottom to midpoint, with bounded transform/opacity Motion values, an already-visible server fallback, no entry timer and no per-frame React updates. How It Works retains semantic list cards with a scroll stagger; Trust has opposing column motion; FAQ rows have independent progress. Narrow screens use vertical motion capped at 48px. Focused groups stay stationary. A direct media-query subscription fixes the installed Motion hook's startup-only reduced-motion snapshot for these new effects.

Evidence: [scroll measurements](scroll-linked-review.json), [desktop scroll frames](scroll-linked-desktop-contact.png), [mobile scroll frames](scroll-linked-mobile-contact.png), [hero measurements](hero-egov-review.json), [desktop hero frames](hero-egov-desktop-contact.png), [mobile hero frames](hero-egov-mobile-contact.png). Scroll checks cover 14 targets, seven positions including reversal/repeat, six theme/device/preference contexts, actual wheel input and keyboard Trust navigation. Hero checks cover both themes at 1440px and 390px, plus reduced-motion at 320px: live entry/re-entry observed, finished content readable, no measured horizontal overflow. Both frame sheets for each mechanism were opened and inspected. Viewport frames intentionally include preceding content during entry; they are not full-section crops.

Validation: 34 targeted tests across six files passed; after the live-preference correction, the 10 hook/SSR tests passed again. Scoped ESLint and the final 107-page production build passed. Both master prompts and the scoped motion surface record were aligned. No packages, accounts, database records or deployment were changed.

Limits: both browser reports retain the previously observed React hydration error #418; this task does not establish its cause or claim it fixed. Existing user-pinned palette contrast exceptions and the unchanged CTA hover-color detector warning remain outside this motion correction. No pixel-identical layout, error-free runtime or AA contrast certification is claimed. Older timed motion evidence remains historical.

Final confirmation: all six scroll contexts pass the repeated-position, wheel, keyboard and overflow checks. At a fixed partial entrance the 18.83px transform and 0.764625 opacity remained identical after 800ms. The live reduced-motion check passes after waiting for MediaQueryList change dispatch; the initial 120ms timing assumption and its readings remain preserved as initialLivePreferenceProbe in the report. Native event telemetry confirms stationary opacity-1 content after the event, followed by restored scroll motion when the preference is disabled.

After the final hook change, the remaining 24 role/booking/workspace/hero tests also passed: all 34 targeted tests now cover the final source. Temporary browser profiles, scripts, reference capture and local QA server were removed/stopped.
