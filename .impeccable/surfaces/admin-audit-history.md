# Administrator audit history

Mode: Operate. Extend the existing admin audit page with sign-in/security history, preserving the admin identity and authorization gates.

Use compact rows with user, event, precise time, approximate area, IP and browser/device. Keep session references and raw browser reports in expandable details. Administrator actions and user security events use separate views on the same page. Server-side filters and 20-row pagination support large histories. Red denotes failed authentication, green denotes successful authentication; selection/focus uses the existing admin red. Local/private networks and unknown areas are explicit, never guessed from the user's profile. No GPS or map is shown.

Check empty/error/loading states, both themes, phone overflow, filter pagination/reset, stale request isolation, and date filter validation. History starts when enabled; old session tokens cannot reconstruct historical sign-ins.
