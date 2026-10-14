# Account Settings and User Profile headers

Mode: **Operate**. Preserve the existing account content and controls. Match the workspace and landing header composition with a floating identity card on the left and one rounded utility toolbar on the right, using the incumbent header classes and theme tokens.

- Account headers stick to the viewport at the top; account-page body overflow must not create a competing scroll container.
- Desktop header height is 72px. Sticky profile tabs clear that height. Account Settings uses a 208px left navigation panel beside the forms from 1024px upward, with clearance below the global header and no second horizontal sticky bar.
- The back arrow uses charcoal black with a white glyph, 10px corners, a subtle top highlight and a soft offset shadow in both account headers. Hover lifts the highlight without changing the white glyph, including in dark mode.
- Settings navigation uses the incumbent neutral surface and icons, 44px links, visible focus and a subtle role-accent current-section highlight. `aria-current="location"` follows anchor navigation and manual scrolling. Scroll tracking stays inside the navigation leaf so form state is unaffected. Member-only sections remain hidden for administrators.
- Below 1024px, section links wrap above the forms and scroll normally with the page.
- Phones keep the identity and utility groups in two compact rows within 124px. All existing search, messages, theme, notifications and account-menu controls remain reachable, with 44px touch targets and no horizontal overflow at 320px or 390px.
- Preserve return-to-workspace routing, search behavior, verification status and menus. The community header retains its current composition.
- Use the existing light surfaces, shadows and charcoal dark theme; introduce no entrance animations.

See [local review evidence](../review/account-header-review.json).
