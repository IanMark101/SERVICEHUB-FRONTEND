# GCash number in listing forms

Mode: **Operate**. Narrow extension of the existing listing Payment section. Preserve wizard fields and submission payloads, headers, navigation, typography, green Provider/orange Seeker accents and neutral dark/light surfaces.

Use the existing TransactionForm panel, fields and actions, the existing dialog focus hook, and a React portal to avoid nested HTML forms. A private account preference is edited in place. Outside the modal show only the final four digits. Require the saved number when GCash is selected; Cash-only posts need none. Reuse the fixed +63 registration formatter and ten national digits starting with 9. Save once across both workspaces. Distinguish contact number, saved preference, hosted checkout and payouts in plain language. Do not imply wallet verification or real transfers in test mode.

Loading, read retry, validation, submit failure/retry, busy duplicate protection, cancellation, edit and removal are explicit states. Preserve the parent listing draft and scroll lock; Escape closes only the child modal. Key state to the account, abort on unmount, and store no wallet number in browser storage. Reuse the same component in Offer Services, Edit Service Listing and Post Request.

Verified in the existing production build with intercepted fixtures in Provider and Seeker at 1440px light, 390px dark and 320px light. All six views fit, focus stays within the modal and returns to its trigger, Back/Next retains the budget, and saving makes only one private preference write. Screenshots and `gcash-number-review.json` are in `.impeccable/review/`. The scoped mechanical detector returned no findings. No global tokens, headers, navigation or unrelated page layouts were redesigned.
