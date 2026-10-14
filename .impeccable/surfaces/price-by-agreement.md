# Price by agreement on service listings

Mode: Operate/preserve. Extend the existing listing wizard and TransactionForm dialogs. Provider green, Seeker orange, current typography, header, navigation and neutral surfaces remain intact. Read design-taste-frontend and the existing craft floor before edits. No new dependencies or separate quote page.

Providers choose Price by agreement; the amount and separate travel fee disappear. Keep the fixed-price draft when switching back. Cards show pricing text and Request service. Request Service has Details, Location, Review for this mode, with an optional zero-to-three photo attachment; no payment choice or checkout before the price. A successful request refreshes workspace data even if a socket event is missed.

Incoming Requests reuses ProposalModal for Accept & set price: final total, duration and included work. Offers Received shows the final total and scope before payment choice. Cash approval needs no second provider acceptance. GCash remains PayMongo Test Mode and only verified success creates the booking/paid queue. Existing fixed/rate and public-request bid flows remain intact.

Verification: 128 focused frontend tests across ten files; bounded backend contracts and isolated lifecycle checks. Twelve intercepted fixtures at 1440px light, 768px light and 390px dark cover pricing, request review, provider reply and seeker approval. No overflow or page errors. Screenshots capture settled animations. The scoped mechanical detector found no issues. Evidence is in .agreement-*.log and .impeccable/review/price-agreement-review.json; no live payment or production deployment claimed.
