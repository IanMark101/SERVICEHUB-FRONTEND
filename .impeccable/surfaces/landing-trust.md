# Landing Trust and Reviews

Status: finished scoped extension, 2026-10-12. Authority: `SCOPED_EXISTING_ALLOWED`; retain the ServiceHub system. Direction: [TRUST_DIRECTION.md](../review/TRUST_DIRECTION.md). The supplied Taste Skill split reference is a conversation image; this is a structural adaptation, not a pixel match or new global identity.

## Composition and interaction

A left headline, explanation, note and Help Center actions sit beside Overview, Reviews and Trust score tabs above one bordered content panel. Facts are open text in two columns, without nested cards. Overview and Trust score each contain six facts; Reviews contains the Provider submission, Seeker confirmation and mutual review sequence plus responses/disputes. A private-document note and trust-rules guide remain beneath the active panel.

The layout is at most 1216px wide, with .9fr/1.1fr columns, stacking at 900px. Facts become one column at 480px; the panel uses 16px corners. Source-defined heading is 36-52px, weight 750, line-height 1.08; body is 15-16px, facts 14px and titles 15px. Existing Geist and Lucide families remain. Pill actions are at least 46px tall, tabs 44px, and visible focus uses the scoped accent. Color transitions and ScrollReveal respect reduced motion.

**One active topic rule.** Real tabs expose their selected state and linked panels, use roving tab focus, and support Left/Right and Home/End. All content is server rendered; inactive panels are hidden. `#trust` and `#reviews` remain, and the Reviews deep link selects that topic after bootstrap. Existing verification/review Help Center routes remain, with the trust-score guide added.

## Palette

| Role | Light | Dark |
| --- | --- | --- |
| Canvas / panel | #FAF9F7 / #FFFFFF | #211A14 / #30251C |
| Main / secondary ink | #30251C / #68503E | #FFF1E3 / #E4C6AA |
| Headline/link emphasis | #BD4F00 | #FFB37A |
| Rules / soft hover | #E7D6C7 / #FFF1E3 | #76543B / #473425 |

Filled primary actions and selected tabs use accessible #BD4F00 with white ink in both themes, hovering to #A94300. The panel uses borders and tonal separation rather than the former gray card, role glow or timeline treatment. These are scoped surface values, not replacement tokens for the entire application.

## Product truth

Trust and satisfaction ratings remain separate. The account score starts at 50 and stays within 0-100; approved verification earns +5 once; an eligible settled completion earns +3 per eligible participant, with one rewarded completion per account pair in a rolling 30 days, including switched roles. Ratings add or deduct zero trust points. Documented at-fault cancellation after work starts deducts 5, serious misconduct 10, with one penalty per booking/participant and penalty appeals available. Provider submission precedes Seeker confirmation and review eligibility. No invented ratings, statistics, testimonials or account data appear.

Sources: `src/components/landing/LandingTrust.tsx` and `LandingTrust.module.css`; `SERVICEHUB-BACKEND/docs/TRUST_POLICY_V2.md` and frontend `src/features/help/data/trustScore.ts` / `reviews.ts`.

## Evidence and limits

[Final review](../review/REVIEW.md): 18 Trust crops cover all three tabs at 1440/390/320px in both themes. The full 28-capture independent review returned ship with no material fixes within the requested visual/content/tab scope. Targeted tests, scoped lint and the 107-page production build passed. The anonymous landing bootstrap still records React #418; cause is unresolved, with no claim that this work introduced or fixed it. No pixel-match or error-free runtime certification is made. Earlier Trust layout descriptions and captures are historical.
