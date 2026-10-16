# Codebase maintenance

Keep application source, required public assets, configuration, feature guides and repeatable tests in version control. Scripts used by npm, CI and deployment are maintained tooling, including browser map and Windows development regression checks.

Generated logs, screenshots and local review reports belong in ignored output directories. The October 16, 2026 cleanup removed historical review output, a disposable browser proxy, two unreferenced landing components and public assets that had no source, stylesheet, manifest or tooling references. Earlier evidence is recoverable from Git history at `3411838`.

Unused direct dependencies were removed from the manifest and lockfile. The Windows CSS HMR regression harness also loads the configuration's existing local TypeScript helpers, so its development and production checks can still run. Application configuration and runtime behavior are unchanged.

After cleanup, run:

```sh
npx tsc --noEmit
npm run lint
npm test
npm run test:dev-runtime
npm run build
npm run test:map-browser
```

Retain font and vendor licenses alongside the assets that remain. Before deleting source or public files, check imports, framework file conventions and string-based references as well as build and CI usage.
