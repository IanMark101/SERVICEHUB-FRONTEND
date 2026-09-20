# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

ServiceHub Cordova serves residents of Cordova, Cebu in two standard-user workspaces: seekers who need local services and providers who offer them. Administrators moderate accounts, listings, transactions, verification, reports, and community activity.

## Product Purpose

ServiceHub Cordova is a hyperlocal service marketplace and queue-management system. It helps residents find accountable local providers, post service requests, manage offers and bookings, communicate, and complete service transactions inside one traceable workflow.

## Positioning

The product combines Cordova residency verification, moderated marketplace participation, booking and queue records, eligible reviews, and account trust history. Its core distinction is accountable local participation rather than anonymous community-group listings.

## Operating Context

Standard users can move between Seeker and Provider workspaces under one account. Their main workflows include browsing services or requests, creating listings or requests, sending and receiving offers, managing bookings and queues, messaging, viewing community updates, handling verification, and reviewing completed work. Administrators operate in a restricted workspace whose actions are recorded in audit logs.

## Capabilities and Constraints

- The frontend is a Next.js and React web application backed by a TypeScript API.
- Authentication uses a short-lived in-memory access token and an HttpOnly refresh-token cookie.
- Protected routes distinguish standard users from administrators.
- Transactional actions can be restricted by residency verification, email verification, account status, role, and booking participation.
- The system supports light and dark themes and role-specific Seeker and Provider workspaces.
- User-facing errors must distinguish authentication, authorization, missing resources, validation, conflicts, rate limits, connectivity, and unexpected system failures.
- Routine form and component failures remain contextual; only route-level or unrecoverable failures use a full-page state.

## Brand Commitments

Preserve the ServiceHub Cordova name, existing logo assets, locality-specific terminology, direct and reassuring product voice, and the established distinction between Seeker, Provider, and Administrator workspaces. New system states must feel native to the existing interface rather than like framework-default pages.

## Evidence on Hand

- Product implementation and routes in `src/app`, `src/components`, and `src/context`.
- Existing logo assets in `public/logo.svg` and `public/logo.png`.
- Existing authentication, authorization, and API error contracts in the frontend and backend repositories.
- Product and implementation documentation in the repository root and `CAPSTONE_DOCUMENTATION`.
- No fabricated testimonials, performance claims, or usage metrics are required for this work.

## Product Principles

1. Keep local service transactions accountable and understandable.
2. Explain restrictions and failures in plain language with a safe recovery action.
3. Preserve user input and workspace context whenever recovery is possible.
4. Match interruption level to severity instead of turning every failure into a full-page error.
5. Maintain consistent behavior across Seeker, Provider, and Administrator experiences.

## Accessibility & Inclusion

Error states must remain keyboard accessible, expose meaningful headings and live announcements, avoid relying on color alone, preserve readable contrast in light and dark themes, and provide clear recovery actions at mobile and desktop sizes.
