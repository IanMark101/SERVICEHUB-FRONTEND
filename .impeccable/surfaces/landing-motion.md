# Landing motion

Mode: **Persuade**. This is a motion refinement of the incumbent ServiceHub landing page, following the user's request for perceptible animation on repeated scroll passes and their eGovPH hero reference. Existing copy, palette, assets and product behavior remain the visual authority.

## Current contract

- `useScrollEntrance` drives transform/opacity Motion values from the target's layout position: viewport bottom to midpoint. Stopping scroll stops the entrance, scrolling upward rewinds it, and returning repeats it. There is no entry timer or per-frame React state.
- How It Works cards rise 80px with a bounded scroll stagger. Trust columns move inward up to 64px on desktop; FAQ rows independently move inward up to 56px. Shared headings, Benefits copy/track, comparison frame, Community panel, CTA and Booking heading use the same position-driven mechanism.
- Below 900px, sideways directions become vertical with a maximum 48px displacement. At the reading position, transform is neutral and opacity is 1. The server/no-script state is fully visible. Focused groups remain stationary; live reduced-motion preference changes immediately settle or restore the current position.
- The hero follows [eGovPH](https://e.gov.ph/), inspected on 2026-10-12: badge drops 20px over 0.5s; copy rises 32px over 0.6s with 100ms stagger; presenter/phone arrive together from 48px to the right over 0.7s with a 0.3s delay. The easing is `[0.22, 1, 0.36, 1]`. ServiceHub's Help Center row occupies the last supporting slot. This is a timed entrance that replays on viewport re-entry, distinct from the scroll-linked section groups.
- Existing particle background, Booking timeline, tablet perspective, role/tab/accordion feedback and footer choreography keep their established behavior. The sticky Booking track has no newly transformed ancestor.
- Reduced motion keeps the hero and scroll groups stationary. Hero server output remains visible until a live entrance starts, and interrupted hero entrances complete on exit rather than leaving hidden content.

Sources: `src/components/landing/useScrollEntrance.ts`, `ScrollReveal.tsx`, `useHeroEntrance.ts`, `LandingHero.tsx`, `LandingHowItWorks.tsx`, `LandingTrust.tsx`, `LandingFaq.tsx`.

## Evidence

See [review record](../review/REVIEW.md), [scroll measurements](../review/scroll-linked-review.json) and [hero measurements](../review/hero-egov-review.json). These describe current motion; the earlier 0.68s partial-opacity reveal report is historical. The eGov public JavaScript was inspected for timing, without retaining third-party source or copying its assets/claims into ServiceHub.
