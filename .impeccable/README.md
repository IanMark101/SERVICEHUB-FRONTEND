# Design guidance and review evidence

The `surfaces/` directory contains maintained design guidance. Keep it in version control.

The `review/` directory is ignored local output for screenshots, browser fixtures and generated review reports. Historical evidence cited by the surface notes remains in Git history at commit `3411838`, before the October 16, 2026 cleanup. Those captures describe the checks performed at that time, rather than current test results.

Keep repeatable regression tests in `src/**/*.test.{ts,tsx}` and the scripts used by `package.json` or CI. Do not commit generated screenshots, execution logs or disposable browser fixture servers.
