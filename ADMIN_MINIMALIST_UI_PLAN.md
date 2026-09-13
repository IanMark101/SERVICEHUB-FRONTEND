# ServiceHub Cordova Admin Minimalist UI Plan

Status: **DEFERRED UNTIL FUNCTIONAL AND RELEASE-READINESS WORK IS COMPLETE**  
Reference: the user-provided Pedrx dashboard screenshot  
Scope: Administrator workspace only for the first rollout

## Start gate

Do not begin this redesign until the defense-critical workflows, Admin accuracy, notifications, automated tests, migration readiness, and Phase 9 release documentation are complete or explicitly accepted with recorded external blockers. Visual work must not be used to conceal incomplete, static, or inaccurate functionality.

## Visual direction

- Quiet, spacious canvas with white or near-white surfaces and a soft cool-gray page background.
- Primarily neutral ink colors; restrained violet is reserved for administrator identity and selected navigation.
- Red is reserved for destructive actions, unresolved risk, and error states.
- Compact sans-serif interface typography with strong numeric hierarchy and short labels.
- Thin low-contrast borders, subtle shadows, moderate corner radii, and consistent spacing.
- Modular dashboard panels inspired by the reference: clear grouping, mixed panel sizes, compact tables, and data-first presentation.
- Minimal decorative effects. No gradients, glassmorphism, oversized pills, excessive badges, or hover scaling.
- Dark mode must remain supported with the same hierarchy and contrast.

## Shared Admin foundation

Create reusable Admin-only primitives before restyling individual pages:

- `AdminPageHeader`: title, concise description, optional primary action.
- `AdminPanel`: consistent surface, border, radius, padding, loading, error, and empty states.
- `AdminMetricCard`: database-backed value, label, supporting text, icon, and navigation target.
- `AdminToolbar`: search, filters, refresh, pagination summary, and primary action.
- `AdminTable` and responsive record cards with consistent density.
- `AdminStatusBadge`: semantic neutral, success, warning, danger, and informational variants.
- `AdminEmptyState`, `AdminErrorState`, and `AdminSkeleton`.
- Shared confirmation/reason dialogs for every mutating moderation action.

The shared Seeker and Provider components must not be globally restyled during this first rollout.

## Information architecture

### Shell

- Narrower, quieter sidebar with a black/near-black selected state and a small violet Admin indicator.
- Compact top bar containing page context, search, notifications, theme, and profile controls.
- Replace the full-width warning strip with a subtle security indicator that remains accessible.
- Increase desktop content width while preserving readable maximum widths and responsive mobile navigation.

### Overview

- Use a deliberate panel grid rather than six identical large cards.
- Prioritize moderation workload: pending verifications, pending listings, open reports, deletion requests, and category suggestions.
- Keep total users and live listings as secondary marketplace-health metrics.
- Preserve database-backed drilldowns for every metric.
- Present recent administrator actions as a compact audit table/timeline.
- Keep operational status factual; do not simulate monitoring that is not backed by health checks.

### Management pages

Apply the same toolbar, panel, table/card, status, empty, loading, and error patterns to:

1. User Management
2. Verifications
3. Service Listings
4. Category Suggestions
5. Announcements
6. Disputes & Reports
7. Review Moderation
8. Audit Log
9. Deletion Requests

High-risk actions must remain visually distinct and must preserve reason capture, authorization, audit logging, and confirmation behavior.

## Functional constraints

- Do not change API requests, authorization, validation, filters, pagination semantics, realtime subscriptions, or moderation outcomes as part of the visual pass.
- Do not replace live values with fixtures, estimates, or animated placeholder numbers.
- Do not remove provider/admin messages, audit details, payment-state qualifications, or Test Mode wording for visual simplicity.
- Preserve keyboard operation, visible focus, screen-reader labels, mobile layouts, and minimum touch targets.
- Prefer CSS and reusable component extraction over duplicating page-specific class strings.

## Delivery sequence

1. Record before screenshots at desktop, tablet, and mobile widths in light and dark mode.
2. Add design tokens and Admin primitives.
3. Restyle the Admin shell and Overview as the approval slice.
4. Verify drilldowns, notifications, loading/error/empty states, and responsive behavior.
5. Apply the approved system to the remaining Admin pages in small groups.
6. Run targeted lint, component tests, the complete frontend suite, and production build after each group.
7. Perform browser regression testing against the live backend for every Admin mutation.
8. Capture after screenshots and update the capstone tracker only after verification.

## Acceptance criteria

- All Admin pages look like one coherent product at desktop, tablet, and mobile sizes.
- No reported Admin workflow or metric regresses.
- Every metric and moderation queue remains database-backed and navigable.
- All actions retain required reasons, user-visible feedback, notifications, and audit records.
- No unexplained browser console errors or repeated request loops appear while navigating Admin pages.
- Light and dark themes meet readable contrast and visible-focus requirements.
- Frontend automated tests and production build pass.
- The redesign is implemented on a dedicated branch created from the latest verified functional branch.

## Explicitly deferred

- Seeker and Provider redesigns.
- New charts or analytics without backend-supported metrics.
- Motion-heavy transitions and decorative map/vehicle graphics from the reference.
- Any feature, workflow, or schema change bundled into the visual redesign.
