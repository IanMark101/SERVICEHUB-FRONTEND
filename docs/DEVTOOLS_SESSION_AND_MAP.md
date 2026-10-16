# Session, map and PWA console audit

Current behavior and release boundary: see CURRENT_SYSTEM.md. Dated implementation checks below retain their original scope. Generated review captures and logs removed during cleanup remain recoverable from the recorded pre-cleanup Git revisions.
The reported screenshots show repeated private API 401s, a numeric map-worker warning, and Chrome's deferred-install notice.

## Authentication

The previous interceptor refreshed after a 401, but did not invalidate the local session when the replay also returned 401. Notifications and message polling could keep running with a refused credential. It also waited for the server to reject an already-expired JWT before recovering it.

Workspace requests now share one recovery before dispatch when the JWT expires within 30 seconds. Decoding is only a scheduling hint; server signature/session verification remains authoritative. Known private feeds without a token are canceled locally. A replay refused after recovery clears the session and triggers the existing sign-in redirect. Late failures reuse a concurrently replaced token; logout/account changes cancel pending recovery. Network/503 failures preserve the session and surface the existing retry/error states.

A newly revoked or invalid signed token can still produce a genuine first 401: the browser cannot know server-side revocation in advance. Errors are not hidden or converted to successful responses.

## Map

OpenFreeMap Positron's `boundary_3` filter orders `admin_level` against 3 and 6, and `label_country_3` orders `rank` against 3. Tile features can omit these properties; MapLibre then reports an expected-number/null warning. The style loader now guards numeric ordered property comparisons, excludes missing/null/non-numeric values, and retains valid numeric selection. English labels, tile sources, road numbers and attribution remain unchanged. No console or worker logging is suppressed.

Reference: [MapLibre expression types and comparisons](https://maplibre.org/maplibre-style-spec/expressions/).

## PWA

Chrome's "Banner not shown" notice explains the intentionally deferred native install prompt. The production app continues to offer installation on the Install page and invokes the native prompt only on the user's click. Development does not cancel install events or register a ServiceHub worker, avoiding the misleading deferred-install notice during localhost development. Production may still show the informational notice until the user elects to install.

Reference: [Chrome install prompt behavior](https://developer.chrome.com/blog/a2hs-updates).

## Verification

Regression tests cover concurrent preflight recovery, late 401s, refused replay, private request gating, logout during recovery, transient outage, and missing/numeric map properties. Existing cookie recovery, login, cache, permission and PWA suites run alongside them. Browser review uses isolated sample transport for private data and the live public map style; no real accounts or listings are created.
