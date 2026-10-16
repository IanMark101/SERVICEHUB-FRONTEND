# Map rendering regression and release checks — 15 October 2026

The blank basemap was reproduced in Chrome against the deployed site. Leaflet controls and listing pins rendered, while the MapLibre canvas stayed blank. The earlier upgrade from MapLibre 5.24.0 to 6.4.1 did not configure the separate v6 worker for the bundled application. Style downloads and mocked renderer tests therefore passed without verifying a rendered map. This was separate from the subsequent first-party session transport fix.

## Correction

- Development startup and production prebuild copy the installed MapLibre worker, shared ESM module and license into a versioned public directory. The client explicitly selects that same-origin worker using the installed library version.
- Basemap readiness waits for the renderer, with cancellation and bounded loading. Style, worker, GPU or initial rendering failures switch to Leaflet raster tiles on the existing map. If both providers fail, the picker displays its existing recovery message.
- The Leaflet adapter safely removes a partially initialized GPU layer. Closing a picker cancels pending work and removes readiness listeners and timers.
- Map rendering retains pins, radius calculations, confirmation, clustering, marketplace API routing and session transport. Current forms use one physical discovery point, no remote location and no public-pin checkbox. Only legacy provider consent remains compatible; CURRENT_SYSTEM.md defines these location rules.

The raster fallback defaults to OpenStreetMap, includes attribution, uses normal browser HTTP caching and requests only visible tiles. `NEXT_PUBLIC_MAP_FALLBACK_TILE_URL` can select another compatible tile provider; its licensing and usage rules must be respected. No offline tile downloading was added.

## Maintained regression checks

`npm run test:map-browser` runs against a production build. It uses fictional API responses and deterministic geographic data, while running the real Leaflet adapter, WebGL renderer and deployed worker modules. Screenshot pixels must contain the rendered geography; controls or markers alone cannot pass. It checks both workspaces, their appropriate listing endpoints, zoom, fullscreen, closing/reopening, an unavailable style host and a device without WebGL2. GitHub CI installs Chromium and runs this check after building.

Local validation: 1,362 frontend tests passed; all four production-build browser scenarios passed; TypeScript, ESLint and the production build passed. The backend's 233 contract/regression tests also passed. Browser fixtures do not establish that every real account or every production business action was manually tested; live rendering checks and isolated database workflow results are recorded separately in the release audit evidence.
