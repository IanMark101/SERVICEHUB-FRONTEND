# Community Hub and workspace palette

Status: finished scoped extension, 2026-10-12. Authority: `SCOPED_EXISTING_ALLOWED`; existing ServiceHub components plus the user's supplied palette and TasteCode screenshot. PRODUCT.md, DESIGN.md and a QUALITY BAR card were unavailable. This record describes these surfaces only and establishes no global visual world.

## Direction

Intent: Persuade. DESIGN_VARIANCE 5; MOTION_INTENSITY 2; VISUAL_DENSITY 4.

Thesis: give the existing Community Hub invitation a calm, prominent dark panel with an immediate sign-in action and readable feature rows. Adapt the reference's visual grammar rather than reproduce its content or create new imagery.

Own-world: preserve the ServiceHub canvas, inherited type, existing Lucide icons and ScrollReveal. The section remains `#community`, with its existing headline, supporting copy, three informational topics and `/login` action. No new data or product claims were introduced.

Story: the left column carries the two-tone headline, explanation and light pill CTA; the right column presents Official Community Updates, Recently Added Services and Local Provider Directory as three ruled rows. The composition stacks at 900px and below.

Form: one inset panel, maximum 1216px wide, with 24px corners (20px on phones), a near-black ground, warm light ink and muted secondary text. The page canvas remains visible around the panel. No added imagery or decorative card grid.

## Observed implementation

| Surface | Observed colors and type |
| --- | --- |
| Community | Panel #111110 in light theme / #171716 in dark theme; ink #F5F3ED; muted text #AAA79F; rules #333330. Heading 34–52px, weight 750, line-height 1.08; supporting copy 15–16px; row titles 15–16px; row copy 13–14px. Inherits the existing Geist sans stack. |
| Seeker sidebar | Solid surface #D96700 / ink #211810 in both themes. Selected items #FFF1E3 / ink #30251C. |
| Provider sidebar | Solid surface #047857 / white ink in both themes. Selected items #E6F4ED / ink #17372D. |

The Community pill has a 46px minimum height, visible keyboard focus and a short color transition disabled for reduced motion. Standard SidebarView navigation keeps its existing labels, icons, collapse and mobile behavior; administration uses separate classes. Sidebar type remains 13px navigation, 12px role controls and 10px section labels.

Sources: `src/components/landing/LandingCommunity.tsx`, `LandingCommunity.module.css`, `src/components/layout/Sidebar.module.css`; standard/admin boundary checked in `SidebarView.tsx`, inherited font checked in `src/app/layout.tsx` and `globals.css`.

## Sidebar correction

The user clarified on October 12 that the entire sidebar must use the saturated orange or green, rather than pale surfaces. The earlier 18-capture review records the initial version; its sidebar images are historical and superseded by the solid-color captures. Community Hub styling is unchanged.

## Evidence and limits

See [review record](../review/REVIEW.md), [measurement data](../review/design-review.json), [Community contact sheet](../review/community-contact.png) and [sidebar contact sheet](../review/sidebar-contact.png). Six Community section crops cover light/dark themes at 1440, 390 and 320px. Twelve sidebar panel crops cover both roles and themes at 1280px expanded/collapsed and 390px mobile. These are panel/section crops taken at the named viewport widths, not full-viewport screenshots.

Independent finish review: ship; no material fixes. TYPE, MATERIAL and GROUND match the scoped direction; responsive stacking is intact. Recorded checks report zero browser errors, zero overflow and minimum sampled small-text contrast 4.8973:1. Eight landing rendering/content tests passed in the implementation pass.

The original reference exists only as a conversation image, so no local original-image comparison is available. The existing sidebar width transition detector warning remains outside this palette/layout scope; it is not canonized as a new system rule. No global DESIGN.md or design sidecar was created.
