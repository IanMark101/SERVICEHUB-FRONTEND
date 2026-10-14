/* eslint-disable @typescript-eslint/no-require-imports -- Node --require requires a synchronous CommonJS entry point. */
// Loaded only by npm run dev, before Next imports its bundled Watchpack.
require('./safe-watchpack.cjs').installWatchpackGuard();
