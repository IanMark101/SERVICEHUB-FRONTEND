# Application data caching

All application JSON reads use the shared Axios client in `src/lib/api/axios.ts`.
The cache is browser-only; server requests do not share account data.

## Coverage and lifetime

| Data | Fresh for | Storage |
| --- | --- | --- |
| Published services and owned listings | 20 seconds | Memory and tab session storage |
| Request board and owned requests | 20 seconds | Memory and tab session storage |
| Categories | 5 minutes | Memory and tab session storage |
| Offers | 15 seconds | Memory |
| Bookings, notifications, transaction history | 10 seconds | Memory |
| Conversation lists and contacts | 5 seconds | Memory |
| Profiles, trust history, reviews, user searches | 30 seconds | Memory |
| Community Hub | 20 seconds | Memory |
| Admin read endpoints | 5 seconds | Memory |
| Content cases owned by a member | 15 seconds | Memory |
| Provider summaries | 5 minutes; 2 seconds while generating | Memory |

The cache returns recent data immediately. Expired reads wait for a fresh server
response. Concurrent identical reads share one network request, including reads
made by different components. Query parameters, pagination, account identity and
server-verified permission state form part of the cache key. Responses are copied
for each caller, so component changes cannot mutate the shared cache.

Session storage only preserves catalog/request data in the same tab. It is loaded
for an account only after a successful server login or `/auth/me` response. It does
not authenticate anyone. Tokens, cookies, profiles, chats, balances, bookings,
notifications, private documents and admin records are never persisted by this
cache. Logging out, session expiry, bans and account switches clear the cache.
Same-account access-token rotation preserves it. Late reads and refreshes cannot
restore data or credentials after sign-out.

## Keeping views current

- Successful POST/PUT/PATCH/DELETE responses invalidate related resources before
  they resolve to the calling screen. Failed saves preserve existing cached data.
- Socket catch-all listeners invalidate resources before feature listeners reload.
- Mounted views use `useApiCacheRefresh` to reload relevant data after invalidation.
  Repeated events are debounced; duplicate GETs still share one request.
- Returning focus after 10 seconds, returning online and socket reconnection
  invalidate data and refresh mounted views. Cross-tab mutation and sign-out
  messages contain invalidation metadata only, never credentials or response data.
- A read started before a mutation cannot overwrite the screen with its old result:
  it waits for the current read instead. Switching accounts cancels old results.

Identity/security checks, account-deletion eligibility, verification status,
signed document/evidence URLs, payment checks, audited admin conversation access,
and conversation GETs that mark messages read always contact the server.
Mutations always contact the server. Unknown endpoints default to uncached.

## Explicit refreshes and future features

```ts
await api.get('/services', { apiCache: 'reload' }); // fetch and replace cache
await api.get('/auth/security', { apiCache: 'no-store' }); // never read/write cache
invalidateApiCache(['services']); // invalidate and notify mounted views
useApiCacheRefresh(['services'], refreshServices); // refresh this mounted view
```

Define new read policies and mutation/socket dependencies in
`src/lib/api/cachePolicy.ts`. Keep permission checks and GET side effects uncached.
Cache errors and unsuccessful API envelopes are never saved. Memory is limited to
150 entries / 5 MB; persisted data to 1 MB per scope, with a 250 KB maximum response size.
Unavailable or full browser storage falls back to memory caching.
Cached GET transports default to a 30-second timeout so a hung request cannot
keep the deduplication pool occupied indefinitely.

This is a data cache, not offline support or a service worker. A first visit still
needs the server, and authorization/payment decisions remain server-controlled.

## Verification

Cache tests cover TTLs, query isolation, deduplication, forced refreshes, account
isolation, persistence, mutation races, cancellation, token retries, sign-out races,
mounted-view refreshes and browser/cross-tab invalidation. Run:

```sh
npx vitest run src/lib/api/responseCache.test.ts src/lib/api/cachedAdapter.test.ts src/lib/api/cacheRuntime.test.ts src/hooks/useApiCacheRefresh.test.tsx
npx tsc --noEmit
```
