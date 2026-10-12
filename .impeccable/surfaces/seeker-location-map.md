# Seeker search location and public provider areas

Mode: **Operate**. Reuse the incumbent Change search location dialog and its LocationEditor/Leaflet map. Seeker has no separate nearby-provider map or toggle. Provider's BrowseJobs still uses MarketplaceMap; retain that shared component and its existing behavior.

- The selected Seeker location and radius remain orange. Map clicks and dragging keep the existing preview/confirm flow; Apply location commits the draft and Cancel discards it. Panning, zooming and opening a provider preview never commit a location.
- Provider listing markers are green (#047857) at the existing public approximate area coordinates, including outside the selected radius. Never clamp them inside the circle or expose an exact/private provider address.
- Viewport queries reuse /services/nearby with the same text/category/quick filters. Cover the visible area using overlapping 30 km query windows, independent of the selected radius. Debounce, abort stale requests, deduplicate IDs and bound concurrency to four. At very wide zooms, limit the query plan and show the zoom-in hint.
- Group listings at the same public area. Popup text uses service title, public area, optional provider name, privacy context and View listing. The action opens the existing service details dialog without applying a location draft. Booking and marketplace-feed radius behavior remain unchanged.
- The existing map loading/search fallback, keyboard controls, fullscreen and themes remain. No new map, backend endpoint or exact location field is introduced.

Evidence: [fixture browser report](../review/seeker-map-phone-review.json). Backend responses in that report are intercepted local fixtures, not live account or production data. Existing external base-map tile delivery was not certified by this check.
