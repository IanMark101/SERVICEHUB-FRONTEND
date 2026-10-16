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

Every physical service/request shows one Discovery location with Change. Search/map select that same point; only failed reverse lookup exposes manual name recovery. Private job/workplace directions remain separate. Physical direction changes keep the point. Provider travel has no radius field or coverage circle. Fixed/rate listings retain direct booking in every arrangement; only BY_AGREEMENT needs a price offer. Both posting roles require a saved valid GCash number when GCash is selected; Cash only needs none.

## Remote location correction

Remote create/edit exposes no location or optional area selector. Physical forms use a discovery pin, with private workplace directions additionally required for Seeker visits/Both. There is no second shop pin or exact-public-pin checkbox. Switching to remote clears old point/venue/travel fields; a later physical save needs a discovery point. Eligible remote results bypass radius and have no distance or marker. Legacy exact provider pins remain API compatibility only.
