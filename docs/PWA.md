# ServiceHub PWA

ServiceHub is one installable web app for both Seeker and Provider workspaces. Existing sign-in, verification and role checks still apply. The first phase provides app icons, installation guidance, an offline fallback and user-controlled updates. It does not implement web push notifications.

## Try it locally

From `SERVICEHUB-FRONTEND`, run:

```powershell
npm run build
npm start
```

Open `http://localhost:3000/install`. **Install app** also appears in the landing footer and the Connect group of both workspace sidebars. Supported browsers show an **Install ServiceHub** button when they provide a native installation prompt. The page also explains Safari's Add to Home Screen flow and browser-menu alternatives.

As of October 14, the `beforeinstallprompt` handler retains the event without cancelling Chrome's native install UI. This removes the app's cause of the recurring **Banner not shown** diagnostic. Chrome can offer its normal installation banner, and the existing **Install ServiceHub** button can still open a pending prompt. If the browser's own UI consumes the event, the button retires that event; stale choices cannot replace a newer prompt. Installation never starts automatically from application code. Service-worker updates and offline handling are independent of this change.

The install page opts out of automatic Link prefetch for its home/help header and workspace entry action. Prefetch previously loaded three unused workspace/form CSS chunks and emitted warnings again after the entry action redirected an anonymous visitor to Sign In. Routes and styles load normally when selected; other SystemState pages retain their existing prefetch policy.

On Windows, use the npm commands above. Their `scripts/next.mjs` launcher resolves the actual directory and Next CLI spelling before starting Next. A lowercase terminal path such as `servicehub-frontend` can otherwise load framework modules under different path spellings from the actual `SERVICEHUB-FRONTEND` directory and reproduce `Expected workStore to be initialized` during prerendering. The existing development launcher uses the same normalization. [Next.js documents directory-casing mismatches](https://nextjs.org/docs/messages/invalid-project-dir-casing).

The service worker registers only in production on a secure origin. `localhost` is suitable for local testing; a deployed site needs HTTPS. `npm run dev` deliberately does not register a worker, avoiding development assets being controlled by a new development worker. If the same origin already has a production worker, use a separate browser profile or unregister it in DevTools before development.

On Windows, `npm run dev` also preloads a guard for Next's bundled Watchpack so configured ignores apply before initial filesystem scans. Webpack publishes generated development JSON manifests through temporary files and rename, preventing requests from reading a truncated manifest during compilation. These guards are limited to Windows development; restarting `npm run dev` is required after changing the preload. Run `npm run test:dev-runtime` to verify the watcher, manifest publication and CSS HMR regressions. Review the Watchpack transform when upgrading Next.js; it fails explicitly if the installed scan implementation changes.

Installation choices depend on the browser and device. Chromium installability checks are not evidence of an actual operating-system installation or an iOS device test.

## Offline behavior

The worker precaches only `/offline.html` and four public app icons, using requests without credentials. A full-page navigation that fails to reach the network receives the generic offline screen at the attempted URL. **Try again** reloads that URL after reconnection. A page already open when the device goes offline receives a connection notice; client-side navigation and API calls remain dependent on the network.

Authenticated HTML, API/RSC responses, maps, sockets, bookings, messages, payments and account data are not stored in the worker's Cache Storage. Live HTTP errors are preserved. No write request is intercepted, queued or replayed. This feature does not replace existing application error handling or cache policies outside the service worker.

## Updates

`npm run build` runs `scripts/build-pwa.mjs` first. It creates the ignored `public/sw.js` from `src/pwa/service-worker.js`, stamping a unique build version. Do not bypass the npm build lifecycle with a direct `next build` deployment command.

Replacement workers wait. The app offers **Update now** and **Later**, telling users to save work before reloading. **Later** dismisses the notice; `/install` retains the update action. Updating explicitly activates the worker and reloads the current page. Other open tabs offer a reload rather than reloading automatically. Unsaved forms are not automatically persisted by this feature.

The nonblocking update notice uses a consistent charcoal surface in both themes and 44px actions on desktop and phone. During activation it announces the pending reload, shows progress and disables duplicate clicks. If activation stalls, it restores the actions and shows retry guidance. Reduced-motion preferences disable the progress spinner and button transitions.

The app checks for updates on registration and when a visible page reconnects or regains visibility, throttled to once per minute. Activation removes only obsolete caches beginning with `servicehub-pwa-`.

## Deployment

Deploy the generated `/sw.js`, `/offline.html`, `/pwa/*` and Next's `/manifest.webmanifest` together with the application. Worker responses use JavaScript content type, root scope permission and no-store headers. Keep these routes reachable without sign-in and avoid proxy/CDN rules that serve stale worker bytes. The existing Dockerfile already runs `npm run build` and copies `public`, the standalone output and static assets into its runner image.

The manifest uses `/` as its entry point and supplies workspace shortcuts. `/install` is a public entry route so failed session recovery cannot replace its instructions. Metadata includes an Apple touch icon and a charcoal browser theme.

## Validation

Targeted tests cover worker cache boundaries, offline fallback, explicit activation, app metadata/icons, installation events, update notices and session recovery. Browser evidence lives in `.impeccable/review/pwa-review.json` and accompanying captures. Runtime checks use a production build; OS-level installation, physical iOS/Android devices and a deployed HTTPS origin require separate validation.

## Console cleanup verification, October 14

26 PWA/worker tests passed, including uncancelled production events, native accepted/dismissed choices, the existing Install button, stale events and update/offline handling. TypeScript, scoped lint and the production build passed. An isolated production-preview browser reproduced six unused-CSS warnings before the targeted prefetch change and reported none after Install-to-dashboard-to-Sign-In navigation. Normal stylesheet loading and the existing anonymous redirect remained. Evidence: .pwa-console-review.json.

The headless browser did not emit a trusted beforeinstallprompt event; uncancelled events and native/custom choice behavior were verified in component tests. An actual operating-system installation was not performed. This frontend change needs deployment; old console entries are not erased by the application.
