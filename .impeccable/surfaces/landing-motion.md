# Landing motion

Mode: **Persuade**. Preserve the incumbent ServiceHub landing page and eGovPH hero timing. Sections animate once when first scrolled into view, rather than finishing offscreen at page load. Workspaces and the footer are explicit exceptions with repeating motion.

## Current contract

- `ScrollReveal` uses the existing Motion `useInView` with `once: true` to activate `LandingEntrance.module.css` on first viewport entry. There is no continuous scroll-position tracking, reverse motion or exit/re-entry reset. Refreshing the page allows another first-view entrance. The obsolete continuous `useScrollEntrance` and replaying `useHeroEntrance` hooks remain deleted.
- How It Works cards, Trust columns, FAQ rows, headings, Benefits, comparison frame, Community, CTA and Booking heading retain their entrance directions and spacing with CSS timing. Stable How It Works card nodes prevent role switching from remounting and replaying their entrance.
- Below 900px, sideways directions become vertical with a maximum 48px displacement. After the entrance, transform is neutral and opacity is 1. Default server/no-script content stays visible; reduced motion disables the entrance.
- The hero retains the [eGovPH](https://e.gov.ph/) timing inspected on 2026-10-12: badge drops 20px over 0.5s; copy rises 32px over 0.6s with 100ms stagger; presenter/phone arrive together from 48px to the right over 0.7s with a 0.3s delay. It starts once from server-rendered CSS and never restarts on hydration or scroll. The badge has no orange hover border or background in either theme; its keyboard focus ring remains.
- Workspaces retains its original Aceternity ContainerScroll tilt/scale and repeating panel entrance. Its source and scroll offsets are unchanged. This is the user-pinned exception to one-time page entrances.
- The footer keeps its GSAP ScrollTrigger wordmark parallax (`top 85%` to `bottom bottom`, scrub 1). Its heading, supporting copy, action/category group and bottom navigation use existing Motion `whileInView` keyframes, observing each group at 15% visibility. Each fades from 0.25 to 1 and rises 48px over 0.8s with exponential easing, replaying on return. This avoids entrances finishing offscreen because the earlier ticker triggered them or cached scroll offsets became stale. `initial: false` keeps default/server content visible; reduced motion keeps content stationary and readable. Existing particles, tickers, navigation, Booking walkthrough stage selection, tab/accordion interaction feedback and product behavior remain.
- Header navigation (desktop and mobile) and page content follow: Why ServiceHub, How it works, Workspaces, Booking progress, Compare, Trust, Community, FAQ. Workspaces now precedes Booking progress; section IDs and navigation behavior remain.

Sources: `src/components/landing/LandingEntrance.module.css`, `ScrollReveal.tsx`, `LandingHero.tsx`, `LandingHowItWorks.tsx`, `LandingWorkspaces.tsx`, `src/components/ui/container-scroll-animation.tsx`, `src/components/ui/motion-footer.tsx`.

## Evidence

See [review record](../review/REVIEW.md). The [scroll measurements](../review/scroll-linked-review.json) and [hero measurements](../review/hero-egov-review.json) describe superseded replay behavior. The eGov timing remains; none of its third-party source, assets or claims are retained in ServiceHub.

The first-paint correction is verified in [hero first-paint measurements](../review/hero-first-paint-review.json): cold loads, delayed hydration, both themes at desktop/phone widths, reduced motion and JavaScript disabled. The earlier hero measurements describe the superseded JavaScript entrance implementation; its visual timing is preserved in CSS.
