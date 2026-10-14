# Listing creation forms

Mode: **Operate**. Reorganize Post Request and Offer Services within the existing ServiceHub visual system. This is frontend UI/UX work; preserve API payloads, validation, permissions, defaults, privacy and arrangement behavior.

## Layout decision

The previous desktop forms put details and payment in a short left column, while category, location and pricing continued down a long right column. Related decisions were separated, the mobile DOM order showed payment before pricing, and large blank regions interrupted the task.

Use one page with four sequential sections, separated by neutral rules. Numbering communicates the order of the form, without introducing a wizard or hiding required fields.

- Seeker: describe the request → choose where work happens → timing and budget → payment methods, then publish.
- Provider: describe the service → base/venue and coverage → price, pricing unit, duration and travel fee → accepted payments, then publish.
- Pair only closely related short fields. Description and location use the full available width. Arrangement choices sit beside each other on desktop and stack below 700px.
- Keep required map controls and labels visible. Private directions, service coverage and travel amounts remain conditional on the chosen arrangement.
- Place the optional travel amount with the other cost fields. Retain the budget's zero default and existing minimum publishing amount.
- Treat the reusable booking model as explanatory copy beside Publish, rather than a field with no choice.
- Remove the availability dropdown that never entered the submit payload. Link to existing Service Manager pause/resume controls and Provider Activity queue controls instead.
- Maintain orange Seeker and green Provider semantics, charcoal dark surfaces, native validation and linked field labels. Payment labels are at least 44px tall; primary actions are at least 48px tall.

## Verification

Review real components with an illustrative local context in desktop and 390px browser-frame views, both themes and conditional venue states. No listing or account changes are submitted. Remove the temporary preview route and context export before the production build. Preserve pre-existing frontend work and leave the backend untouched.

## Plain-language form copy

Creation and editing use the same wording. Address the person filling in the form as “you”. Keep stored arrangement, urgency, payment and price values unchanged.

- **Who will travel?** Provider choices: “You go to the seeker”, “The seeker comes to you”, “Either option”. Seeker choices: “The provider comes to you”, “You go to the provider”, “Either option”.
- **General area:** “Area where you offer this service” for traveling providers; “Area where you want to find a provider” for traveling seekers. Explain why an area is needed and that no exact address is required here.
- **Exact place:** “Where seekers can visit you” for a provider's location; “Where the provider should come” for a seeker's work location. Flexible requests explicitly identify the location used if the provider travels. Explain that exact locations and directions are shared after booking.
- **Travel distance:** “How far will you travel?” with “Up to … km” or “No distance limit”. Explain where distance starts.
- **Travel costs:** “Your travel fee” is the provider's extra charge once per booking. “Extra budget for the provider’s travel” is a seeker's optional allowance; the provider quotes one total and the allowance is not charged separately.
- Use question headings for work, location, timing, price and payment. Replace “pricing unit”, “urgency”, “scope of work”, “venue”, and “discovery” with familiar wording. State field limits before submission and give a specific next step in validation messages.
- Keep payment test-mode status visible in plain language. “Cash in person” and “GCash (test mode)” are display labels, not new payment methods.
