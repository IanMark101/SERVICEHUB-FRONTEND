# Service Manager card handoff

Scope: existing Provider Service Manager card extension (`SCOPED_EXISTING_ALLOWED`). Retain Provider green and neutral workspace surfaces, Geist, the sidebar and header. This record applies to the managed card; no global identity system was initialized.

The card now presents one manual gallery beside listing content on wide cards and stacks at a card width of 660px or less. The gallery keeps the entire photo visible with `object-fit: contain` inside a stage capped at 280px. The toolbar holds the counter and previous/next controls; thumbnails remain below. No duplicate expanded photo follows the gallery. The detail presentation retains its existing manual carousel, and public discovery cards retain one cover photo.

Title, category and status lead the card. Price and location precede the description and labeled facts for time, payment methods, work queue and public map. Unbroken text wraps. Descriptions over 240 characters collapse to four lines with Read full description / Show less. Edit, Delete and listing visibility share the footer. Existing callbacks, permissions, APIs and business logic are preserved; this work adds no backend changes, dependencies or migrations.

Evidence checked: `src/components/provider/ManagedServiceCard.tsx`, `ManagedServiceCard.module.css`, `src/components/ui/ListingPhotoGallery.tsx`, `ListingPhotos.module.css`, `.impeccable/review/review-managed-card.mjs`, `managed-card-review.json` and `managed-card-detector.json`. The recorded browser assertions passed with no horizontal overflow and measured photo stages of 225px at 1440/1175, 268.5px at 768 and 240px at 390. The detector result is `[]`.

Seventeen saved `managed-card-*.png` screenshots cover default and second-photo states at 1440 light/dark, 1175 light, 768 light and 390 light/dark; controls at 768 light and 390 light/dark; and missing/failed photos at 1440 light. They use an isolated synthetic API fixture and existing repository assets; no users or listings were mutated. The fresh reviewer inspected all seventeen and the original screenshot, completed all five review sections and returned **SHIP** with zero material fixes. Retained type, material and ground; gallery topology; image visibility; navigation; responsive behavior; readable facts; grouped controls; and empty/error states match the direction. No further ornament is required.

Recorded implementation validation: all 12 focused tests passed (3 managed-card tests and 9 listing-photo tests), TypeScript `--noEmit`, scoped ESLint and the production build passed. Production was not deployed or independently tested; the fixture review does not establish backend behavior.

The stale Service Manager View all rule was replaced in the listing-photo surface brief and both master prompts. Discovery, detail, request and upload rules are preserved. No defects were canonized as design-system rules, and no unrelated drift was repaired.
