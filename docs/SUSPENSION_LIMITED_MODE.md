# Suspension and Limited Mode

Current behavior and release boundary: see CURRENT_SYSTEM.md. Dated implementation checks below retain their original scope. Generated review captures and logs removed during cleanup remain recoverable from the recorded pre-cleanup Git revisions.
Suspended members retain signed-in browsing in both Seeker and Provider workspaces, like members awaiting residency verification. An approved verification record and `isActive=true` do not override `moderationStatus=SUSPENDED`.

The shared frontend permission check matches the API's new-transaction requirements: approved residency, verified email, an active account and active moderation status. Posting, booking, offers, payments, reviews and starting work remain unavailable during suspension. The persistent workspace notice and blocked-action dialog explain suspension, while posting forms disable their fields and publishing actions. Suspended verified members are not asked to verify again as a way to remove suspension.

Existing booking-resolution exceptions remain governed by the current API lifecycle policy: eligible cancellations, ongoing-work completion, disputes, confirmation and existing agreement communication are not turned into new-transaction actions. Banned users retain the separate banned-account flow. This change does not revoke sessions, change verification records or alter map behavior.

Regression coverage checks both workspaces, approved and unapproved suspended accounts, direct workspace access, suspension/restoration updates, disabled posting forms, blocked transaction copy, keyboard dialog dismissal, profile review eligibility and API rejection. Browser verification uses fictional isolated identities and API fixtures rather than modifying real users or bookings.
