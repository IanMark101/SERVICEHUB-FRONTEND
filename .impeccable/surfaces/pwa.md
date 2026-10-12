# PWA installation and connection states

Mode: **Operate**. Extend the incumbent ServiceHub interface with installation, connection recovery and explicit update choices. Preserve the landing palette, charcoal workspace sidebars, white navigation labels and orange/green role accents. The app installation is shared by both roles.

- `/install` uses the existing neutral SystemState shell, ServiceHub logo, typography and theme-aware actions. Installation remains available to guests and after a failed hinted-session recovery. Existing sign-in and role guards continue at workspace entry.
- Installation starts only from a user action. Offer the browser's native prompt when available, plus readable Safari and browser-menu instructions. Never promise universal browser support or request notification permission.
- The update notice is nonmodal, has accessible status text and 44px actions, and reserves space for the device's bottom safe area. Save-work guidance precedes the explicit reload. Later dismisses the notice while `/install` retains the update action. No timed reload interrupts a form.
- The offline document is self-contained and uses cached public branding. It preserves the attempted navigation URL and has one retry action. Existing live APIs and client-side navigation retain their error handling. No saved account content is shown or changes queued.
- Worker caching is limited to the generic fallback and four icons. Current bookings, payment state, chat, availability, private documents and maps require the network. Registration is production-only on a secure origin.
- Desktop and phone layouts support both existing themes. No entrance animation or decorative icon series is introduced. `/install` links are excluded from read-only landing workspace preview sidebars.

See [PWA implementation notes](../../docs/PWA.md) and [browser evidence](../review/pwa-review.json). A browser installability check does not establish an OS or physical-device installation.
