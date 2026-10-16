# Profile reviews

Mode: **Read**. Preserve the existing profile, role-specific ratings, review text, dates and pagination. Profile review cards are read-only. Remove public reply and review-report forms and their client API code; previously recorded replies remain readable for owners and visitors. Completed-booking review submission/editing remains in Activity.

Profile section tabs scroll with the page at every width. The main account header retains its existing behavior. Keep keyboard tab navigation, both themes and the existing mobile horizontal tab layout.

Trust History exposes no new trust-penalty appeal button or form. Existing case handling and backend compatibility remain separate from public reviews. Ban appeals and content-removal appeals retain their own workflows. New review reports are rejected by the API, and the former public reply endpoint is removed. See `../review/profile-readonly-review.json` for bounded local browser verification.
