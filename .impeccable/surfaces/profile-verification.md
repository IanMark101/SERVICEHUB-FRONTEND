# User Profile verification

Mode: **Operate**. A narrow refinement of the existing profile, preserving the account header, profile identity, tabs, verification data and backend policy.

- Profile verification is a public status summary. Account Settings remains the private place for document submissions, review dates and admin messages.
- One section with a clear heading, compact semantic status badge, readable status explanation and privacy footer. No nested cards or entrance animation.
- Approved is green, waiting for review is amber, an owner's rejected submission needs attention, and other unverified profiles use a neutral incomplete state. Never invent review times or rejection reasons.
- Only an owner sees a next action, linking to `/account/settings#verification`. Pending owners are told they do not need to resubmit. Unknown states are unavailable, not automatically unverified.
- Desktop places the action beside the status. Below 768px it stacks with a full-width 44px action; real copy must fit at 320px and 390px. Reuse workspace colors and button treatment in both themes.
- Public components receive only verification status and ownership, never document URLs or private review details.

## Audit findings addressed

- **P1 · State clarity:** the previous marketplace branch reduced all non-approved states to “Residency not yet verified.” Preserve pending and rejected owner's next steps.
- **P2 · Hierarchy and navigation:** the generic lowercase “residency” heading and text-only manage link did not explain the difference from Account Settings. Name the summary clearly and give owners one visible action.
- **P1 · Legacy factual accuracy:** the alternate profile branch hard-coded a rejection reason and review timeframe, and duplicated private upload UI. Remove that branch and share the public summary across profile variants; keep the actual uploader in Account Settings.
- **Preserved:** the existing marketplace view exposed no document data and linked to the correct private settings section. The existing verification upload component already handles real admin decisions and refreshes; leave that behavior intact.
