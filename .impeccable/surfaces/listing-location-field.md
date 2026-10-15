# Listing form location control

Mode: **Operate**. A narrow refinement of existing listing forms, preserving map search, pin selection, privacy, submission and the existing design language.

- Make the existing inline map disclosure easy to spot: one bordered control, map icon, selected general area, supporting instruction and a clear Choose/Edit on map action.
- Preserve the native details/summary interaction and lazy mounting of the existing LocationEditor. Do not add another map or modal. The whole control works as one keyboard/touch target.
- Orange belongs to Seeker and green to Provider. Charcoal actions and restrained tint keep the picker noticeable without making an inactive field compete with form submission.
- Below 480px, place the action under the location copy. Long area names wrap and the control never overflows. Disabled fields cannot open the editor.
- Soften orange field focus saturation and ring opacity through shared form styles while retaining existing green/red semantic tones and invalid-state styling.
- New seeker request budgets start and reset to zero. Reposts retain their saved budget; the existing valid publishing range remains ₱50–₱50,000 and is stated beside the field.

## Findings addressed

- The previous map disclosure was a plain text row and did not look like a form control.
- A saved area should be visible before opening the map, with a clear action to edit its pin.
- The orange focus border/ring was visually stronger than neighboring form chrome. Hover remains neutral; focus uses a muted edge with sufficient contrast.
- The budget's initial ₱500 value could be mistaken for the seeker's own estimate.

Verification uses real LocationField/LocationEditor components in a temporary local fixture, including both roles, both themes and a 390px viewport. No listing or account data is submitted. The fixture is removed before building for production.

## October 16 simplification

Listing forms show one saved place with Change. Search/map both select it; only failed reverse lookup exposes manual name recovery. Provider base area differs from a shop venue, and seeker job point differs from desired provider area. Provider travel has no radius field or coverage circle. Browsing retains its search radius. Pricing is independent of delivery: fixed/rate listings retain direct booking in every arrangement, while only BY_AGREEMENT requires a provider price offer. Both posting roles must save a private valid GCash number when selecting GCash; Cash only needs none.
