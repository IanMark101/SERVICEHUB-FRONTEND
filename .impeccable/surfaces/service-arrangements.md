# Service arrangements and location design

Preserve the existing service, request, booking and inbox components, workspace colors, keyboard controls, drafts and lifecycle checks. Current behavior is defined in ../../docs/CURRENT_SYSTEM.md.

Every physical service or public request selects one Discovery location using search or the map. The two methods select the same point. Changing physical arrangements retains it. There is no provider travel limit or coverage circle. The browsing circle is independent and filters nearby physical discovery.

Providers accepting visitors additionally save private workplace directions of 5–500 characters, with no second pin. A seeker posts a discovery point and supplies the actual private job location during the applicable booking step. Seeker visits uses the provider venue snapshot. Remote creation/editing shows no location, area search, map, device location, workplace or travel fee. Remote results bypass discovery radius and show no distance or marker.

Current forms expose no exact-public-pin checkbox and save approximate pins. Only older explicitly consented provider records retain exact-pin API compatibility. Private directions remain protected by booking authorization.

Pricing is independent of delivery. Fixed/rate work uses posted terms and any displayed one-time travel fee. Only Price by agreement requests a final provider offer. Cash direct requests still require provider approval; acceptance does not start a job. Verified GCash admission enters the paid queue without automatically starting work.

Retain green Provider and orange Seeker actions, labeled arrangement/price facts, existing expandable details and usable 44px controls. Historical browser captures and removed local fixtures are recorded before cleanup at frontend 3411838; they are not current live-payment or community acceptance.
