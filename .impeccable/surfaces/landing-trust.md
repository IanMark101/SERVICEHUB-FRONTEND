# Landing Trust and Reviews

Status: latest explicit color correction, 2026-10-12; new independent visual review returned ship; 20 targeted tests, scoped ESLint, 107-page production build and git diff check passed. Authority: `SCOPED_EXISTING_ALLOWED`; retain the ServiceHub system. Direction: [COLOR_ICONS_DIRECTION.md](../review/COLOR_ICONS_DIRECTION.md). The supplied Taste Skill split reference is a conversation image; this is a structural adaptation, not a pixel match or new global identity.

## Composition and interaction

A left headline, explanation, note and Help Center actions sit beside Overview, Reviews and Trust score tabs above one bordered content panel. Facts are open text in two columns, without nested cards. Overview and Trust score each contain six facts; Reviews contains the Provider submission, Seeker confirmation and mutual review sequence plus responses/disputes. A private-document note and trust-rules guide remain beneath the active panel.

The layout is at most 1216px wide, with .9fr/1.1fr columns, stacking at 900px. Facts become one column at 480px; the panel uses 16px corners. Source-defined heading is 36-52px, weight 750, line-height 1.08; body is 15-16px, facts 14px and titles 15px. Existing Geist and Lucide families remain. Pill actions are at least 46px tall, tabs 44px, and visible focus uses the scoped accent. Color transitions and ScrollReveal respect reduced motion.

**One active topic rule.** Real tabs expose their selected state and linked panels, use roving tab focus, and support Left/Right and Home/End. All content is server rendered; inactive panels are hidden. `#trust` and `#reviews` remain, and the Reviews deep link selects that topic after bootstrap. Existing verification/review Help Center routes remain, with the trust-score guide added.

## Palette

| Role | Light | Dark |
| --- | --- | --- |
| Canvas / panel | Existing landing white-surface tokens | Existing landing charcoal/white surface tokens |
| Body ink | Black | White |
| Brand emphasis / filled controls | Existing var(--color-brand), #FF6B00 | Existing var(--color-brand), #FF6B00 |

The latest user correction reuses the landing palette from `src/app/brand.css` and `globals.css`, including charcoal #0A0A0A, white and brand orange. Custom brown/cream/pale-orange surface colors are superseded. The split, tabs, panel, copy and routes remain. White labels on public #FF6B00 are approximately 2.84:1, below 4.5:1 for normal text; this user-pinned pairing is not documented as an AA contrast pass.

## Product truth

Trust and satisfaction ratings remain separate. The account score starts at 50 and stays within 0-100; approved verification earns +5 once; an eligible settled completion earns +3 per eligible participant, with one rewarded completion per account pair in a rolling 30 days, including switched roles. Ratings add or deduct zero trust points. Documented at-fault cancellation after work starts deducts 5, serious misconduct 10, with one penalty per booking/participant and penalty appeals available. Provider submission precedes Seeker confirmation and review eligibility. No invented ratings, statistics, testimonials or account data appear.

Sources: `src/components/landing/LandingTrust.tsx` and `LandingTrust.module.css`; `SERVICEHUB-BACKEND/docs/TRUST_POLICY_V2.md` and frontend `src/features/help/data/trustScore.ts` / `reviews.ts`.

## Evidence and limits

[Review record](../review/REVIEW.md): the new 20-capture color/icon review returned ship after the fresh independent reviewer opened every capture individually, with no material fixes within the requested correction. The [measurement report](../review/color-icons-review.json) records zero element horizontal overflow. Twenty targeted tests, scoped ESLint, the 107-page production build and git diff check passed; QA server/runtime were cleaned up without package edits. The previous 28-capture report, 18 Trust crops covering all tabs at 1440/390/320px in both themes, ship verdict and tests/build results are historical for the superseded palette. Anonymous landing bootstrap React #418 was previously observed and remains unresolved/out of scope, with no claim that this correction introduced or fixed it. No pixel-match, AA contrast or error-free runtime certification is made.
