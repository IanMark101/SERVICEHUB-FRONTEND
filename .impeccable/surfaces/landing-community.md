# Community Hub and workspace palette

Status: finished scoped extension, 2026-10-12. Authority: `SCOPED_EXISTING_ALLOWED`; existing ServiceHub identity and the user's latest references. This record describes these surfaces only. No global PRODUCT.md, DESIGN.md or design sidecar was required or created.

## Direction

Intent: Persuade for Community, Operate for sidebar. DESIGN_VARIANCE 5; MOTION_INTENSITY 2; VISUAL_DENSITY 4.

The Community invitation keeps `#community` and its `/login` action. Its left column carries the two-tone heading, explanation and cream pill action; the right column has three ruled rows: Official Community Updates, Recently Added Services and Provider of the Week. Weekly recognition replaces the former Local Provider Directory claim and follows the actual Community feature's trust score, completed work and client ratings wording. Source: `src/features/community/components/TopProviders.tsx`.

The inset panel remains at most 1216px wide, with 24px corners, reducing to 20px on phones. Columns stack at 900px; 480px phone styles use tighter padding and a full-width sign-in action. Existing Geist type, Lucide icons and reduced-motion-aware ScrollReveal remain. No new imagery, statistics or testimonials were introduced.

## Current implementation

| Surface | Colors and source-defined type |
| --- | --- |
| Community | Panel #30251C, ink #FFF1E3, secondary #E4C6AA, orange emphasis/icons #FFB37A, rules #76543B in both themes. Outer canvas #FAF9F7 light / #211A14 dark. Heading 34-52px, weight 750, line-height 1.08; supporting copy 15-16px; row titles 15-16px and copy 13-14px. |
| Seeker sidebar | Brown ground #30251C; cream ink #FFF1E3 and secondary #E4C6AA; orange selections #D96700 with #211810 ink. |
| Provider sidebar | Forest ground #17372D; white ink and secondary #E6F4ED; green selections #047857 with white ink. |

The Community action has a 46px minimum height, visible keyboard focus and a short color transition disabled for reduced motion. Sidebar CSS retains 13px navigation, 12px role controls and 10px section labels; this is a palette record, not certification of every rendered text size.

**Theme-invariant sidebar rule.** Both standard workspace palettes retain their background, controls, text, role-tinted shadow and avatar colors in light and dark mode. The theme toggle may change its label/icon. Seeker control/hover fills mix cream into brown; Provider fills mix pale mint into forest. Avatars use the role's active fill and active ink, with the role border and no avatar shadow. Existing menu, badge, collapse and mobile behavior remains; Admin is separate.

Sources: `src/components/landing/LandingCommunity.tsx`, `LandingCommunity.module.css`, `src/components/layout/Sidebar.module.css`; shared view boundary checked in `SidebarView.tsx`. See [Trust surface](landing-trust.md) for the companion split/tab section.

## Evidence and history

The [current review](../review/REVIEW.md) and [final measurement report](../review/trust-community-sidebar-review.json) cover 28 corrected captures, including six Community crops at 1440/390/320px in both themes and four sidebar color crops from the existing expanded public product preview. The fresh independent reviewer opened all 28 captures individually and returned ship with no material fixes within the requested scope. Sampled small-text contrast is at least 4.8973:1; measured section horizontal overflow is zero.

The original `design-review.json` / `community-contact.png` / `sidebar-contact.png` and later `sidebar-solid-review.json` captures are historical. Their gray Community, pale sidebar or solid-full-orange/green sidebar descriptions are superseded by this record and the final report; their runtime verdicts do not describe the current build.

References exist only in the conversation, so this is structural adaptation without local original-image comparison. Sidebar crops can include preview-caption overlap at the bottom and do not certify the full footer, signed-in navigation or responsive behavior. React hydration error #418 remains recorded in current and earlier correction evidence with unresolved cause. The existing sidebar width-transition detector warning is unchanged outside this palette scope. Neither issue is canonized as design guidance.
