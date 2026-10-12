# Community Hub and workspace palette

Status: sidebar charcoal restoration, 2026-10-12. The earlier independent color/icon review is historical for sidebar backgrounds; Community colors and icon cleanup are unchanged. Authority: `SCOPED_EXISTING_ALLOWED`; existing ServiceHub identity and the user's latest references. This record describes these surfaces only. No global PRODUCT.md, DESIGN.md or design sidecar was required or created.

## Direction

Intent: Persuade for Community, Operate for sidebar. DESIGN_VARIANCE 5; MOTION_INTENSITY 2; VISUAL_DENSITY 4.

The Community invitation keeps `#community` and its `/login` action. Its left column carries the two-tone heading, explanation and white pill action; the right column has three ruled rows: Official Community Updates, Recently Added Services and Provider of the Week. Weekly recognition replaces the former Local Provider Directory claim and follows the actual Community feature's trust score, completed work and client ratings wording. Source: `src/features/community/components/TopProviders.tsx`.

The inset panel remains at most 1216px wide, with 24px corners, reducing to 20px on phones. Columns stack at 900px; 480px phone styles use tighter padding and a full-width sign-in action. Existing Geist type, control/navigation icons and reduced-motion-aware ScrollReveal remain. Community lighting uses a static broad white glow from the lower left (ellipse 85% 85% at 12% 112%, 12% alpha) and a faint upper-right highlight (ellipse 65% 90% at 104% 0%, 6% alpha), each fading to transparent at 75%. Its panel entrance replays on viewport re-entry, with content visible by default. Repeated decorative icons are removed from Community feature rows and both landing workspace summaries' role labels, features and tips. No new imagery, statistics or testimonials were introduced.

## Current implementation

| Surface | Colors and source-defined type |
| --- | --- |
| Community | Panel var(--color-charcoal), #0A0A0A, with static broad neutral white lighting from the lower left (12% peak alpha) and a faint upper-right highlight (6% peak alpha); headline accent var(--color-brand), #FF6B00; body and row titles white; white CTA with charcoal ink. Outer canvas uses var(--landing-surface), #FCFBFA light / charcoal dark. Heading 34-52px, weight 750, line-height 1.08; supporting copy 15-16px; row titles 15-16px and copy 13-14px. |
| Seeker sidebar | Charcoal ground #0A0A0A, subtle neutral bottom lighting, white ink and secondary #C9C9C9; orange selections #D96700 with white #FFFFFF ink. |
| Provider sidebar | Charcoal ground #0A0A0A, subtle neutral bottom lighting, white ink and secondary #C9C9C9; green selections #047857 with white ink. |

The Community action has a 46px minimum height, visible keyboard focus and a short color transition disabled for reduced motion. Sidebar CSS retains 13px navigation, 12px role controls and 10px section labels; this is a palette record, not certification of every rendered text size.

**Theme-invariant sidebar rule.** Both standard workspaces retain the same charcoal background, white bottom lighting, neutral controls/shadow, text and avatar colors in light and dark mode. This shared view also updates both landing Workspaces tab previews and expanded previews. The theme toggle may change its label/icon. Both roles use neutral #1E1E1E controls and #292929 hover fills. Avatars use the role's active fill and active ink, with the role border and no avatar shadow. Both workspace switch buttons use white text in active and inactive states, for both roles/themes. Active count badges use charcoal with white text. Existing menus, collapse and mobile behavior remains; Admin is separate.

Sources: `src/components/landing/LandingCommunity.tsx`, `LandingCommunity.module.css`, `LandingWorkspaces.tsx`, `LandingWorkspaces.module.css`, `src/components/layout/Sidebar.module.css`; landing token authority: `src/app/brand.css` and `globals.css`; shared view boundary checked in `SidebarView.tsx`. See [Trust surface](landing-trust.md) for the companion split/tab section.

## Evidence and history

Latest sidebar restoration: sixteen production captures across both roles, both themes and 1440px/390px hosts were inspected in two contact sheets. Shared colors remain identical across themes, including the landing Workspaces tab container and expanded previews. Ten existing preview tests and the 107-page production build passed; the scoped SidebarView detector returned no findings. See [charcoal measurements](../review/charcoal-sidebar-review.json) and [review record](../review/REVIEW.md). Earlier color/icon evidence below remains applicable to unchanged Community/icon cleanup, but its sidebar backgrounds are historical.

The [review record](../review/REVIEW.md) records the new 20-capture color/icon review as ship, with [color-icons-review.json](../review/color-icons-review.json). The fresh independent reviewer opened all 20 captures individually, found them valid and requested no material fixes within the correction scope. Measurements report zero element horizontal overflow, no Community feature icons and no SVGs in either landing workspace summary role card across the role/theme/width sets. Both sidebar active labels and switch-button states are white in both roles/themes. QA server/runtime were cleaned up without package edits. The previous [28-capture report](../review/trust-community-sidebar-review.json), its ship verdict and minimum sampled small-text contrast of 4.8973:1 are historical for the superseded palette/icons; they do not certify this correction. The explicit user correction restores existing landing charcoal/white/brand tokens and pins sidebar active/switch labels white. White on Seeker #D96700 is approximately 3.565:1; white on public #FF6B00 is approximately 2.84:1. Both are below 4.5:1 for normal text. These user-pinned colors are recorded without canonizing an AA contrast pass.

The original `design-review.json` / `community-contact.png` / `sidebar-contact.png` and later `sidebar-solid-review.json` captures are historical. Their gray Community, pale sidebar or solid-full-orange/green sidebar descriptions are superseded by the latest correction; their runtime verdicts do not describe the current build.

References exist only in the conversation, so this is structural adaptation without local original-image comparison. Sidebar crops can include preview-caption overlap at the bottom and do not certify the full footer, signed-in navigation or responsive behavior. React hydration error #418 was recorded in previous correction evidence and remains unresolved/out of scope. The existing sidebar width-transition detector warning is unchanged outside this palette scope. Neither issue is canonized as design guidance.
