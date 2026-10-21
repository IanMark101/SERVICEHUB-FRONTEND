import { HelpArticle } from '../types/help.types';

export const PAYMENTS_ARTICLES: HelpArticle[] = [
  {
    slug: 'payment-methods-overview',
    title: 'Paying with GCash or Cash',
    category: 'payments',
    description: 'When each ServiceHub payment workflow applies.',
    lastUpdated: 'October 21, 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['payment methods', 'gcash', 'cash', 'on-site cash', 'paymongo', 'payment hold'],
    relatedArticleSlugs: ['how-escrow-works', 'payment-release-and-refunds'],
    sections: [{
      heading: 'Two Ways to Complete a Booking',
      paragraphs: ['Choose an available method shown on the service or offer: GCash through PayMongo Test Mode, or cash paid directly to the Provider. Check the service, any hours or days, travel charge and full agreed total before continuing.'],
      bullets: [
        'GCash: Review the total, platform fee and Provider share before continuing to payment. A confirmed payment creates the booking and adds it to the Provider’s shared paid Job Queue.',
        'Cash: The Customer pays the Provider directly. A direct cash booking first needs Provider acceptance. Cash bookings do not take a numbered paid queue place, have no ServiceHub platform fee and do not create GCash earnings records.',
      ],
      callout: { type: 'important', title: 'GCash is in Test Mode', text: 'No real money is transferred or paid out to a Provider. Cash is arranged directly between the Customer and Provider.' },
    }],
  },
  {
    slug: 'how-escrow-works',
    title: 'What Payment Held Means',
    category: 'payments',
    description: 'Understand the payment record while a GCash booking is unfinished.',
    lastUpdated: 'October 21, 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['payment hold', 'paid held', 'payment status', 'payment security'],
    relatedArticleSlugs: ['payment-methods-overview', 'payment-release-and-refunds'],
    sections: [{
      heading: 'While work is unfinished',
      paragraphs: ['After a GCash Test Mode payment is confirmed, its record stays held until the booking is completed or a reported problem is resolved. This is a Test Mode record, not a real-money escrow service.'],
      bullets: [
        'The browser redirect does not confirm payment or create a booking.',
        'A signed PayMongo webhook or an independent server-to-server intent check provides authoritative confirmation; a browser redirect alone never does.',
        'If a capture cannot be converted into a queue booking, it is marked for refund reconciliation instead of overfilling the queue.',
      ],
    }],
  },
  {
    slug: 'payment-release-and-refunds',
    title: 'Completion and Refund Records',
    category: 'payments',
    description: 'How online and cash bookings reach their final payment states.',
    lastUpdated: 'October 21, 2026',
    readTimeMinutes: 3,
    keywords: ['payment release', 'refund', 'cancellation refund', 'completion confirmation'],
    relatedArticleSlugs: ['how-escrow-works', 'how-paymongo-gcash-payouts-work'],
    sections: [{
      heading: 'Final States',
      paragraphs: ['When the Customer confirms completed work, ServiceHub records the GCash payment as released and the Provider’s net share as earnings. Cash confirmation records completion and direct payment separately; ServiceHub does not collect the cash.'],
      bullets: [
        'Cancellation before completion keeps cash external. In Test Mode, ServiceHub records an explicit simulated reversal; it does not claim that PayMongo moved real money.',
        'A disputed GCash payment remains held while an administrator reviews the booking. An eligible refund reverses the full booking amount; ServiceHub does not keep a platform fee on a fully refunded booking.',
        'Administrator decisions and refund attempts are retained for audit and retry.',
      ],
    }],
  },
  {
    slug: 'how-paymongo-gcash-payouts-work',
    title: 'GCash Confirmation and Provider Payment Records',
    category: 'payments',
    description: 'The implemented capstone payment flow and its boundaries.',
    lastUpdated: 'October 21, 2026',
    readTimeMinutes: 4,
    popular: true,
    keywords: ['paymongo', 'gcash', 'test mode', 'webhook', 'provider ledger'],
    relatedArticleSlugs: ['how-escrow-works', 'payment-release-and-refunds', 'payment-methods-overview'],
    sections: [
      {
        heading: 'Payment Confirmation',
        paragraphs: ['ServiceHub creates a durable local attempt, sends the customer to PayMongo Test Mode, and verifies payment through a signed webhook or a server-side intent check after checkout return. It validates the amount, currency, user, listing, offer, and provider intent before creating the booking.'],
      },
      {
        heading: 'Provider Earnings in This Capstone',
        paragraphs: ['Payment Records shows recorded GCash booking amounts, the platform fee and the Provider’s share. Earnings are counted after completion and payment release, not when checkout is opened. Both Free and Pro include Provider analytics. Subscription payments appear separately on the Subscription page.'],
        callout: { type: 'important', title: 'Test records', text: 'These records demonstrate the payment workflow. ServiceHub does not send real payouts to a phone number, bank account or personal GCash account.' },
      },
    ],
  },
  {
    slug: 'gcash-fees-and-provider-earnings',
    title: 'GCash Fees and Provider Earnings',
    category: 'payments',
    description: 'Understand the 10% Free or 5% Pro fee, the total a Customer pays, and the Provider’s share.',
    lastUpdated: 'October 21, 2026',
    readTimeMinutes: 3,
    keywords: ['gcash', 'platform fee', '10%', '5%', 'commission', 'provider share', 'earnings', 'cash', 'travel charge'],
    relatedArticleSlugs: ['provider-plans-and-subscriptions', 'payment-methods-overview', 'payment-release-and-refunds'],
    sections: [
      { heading: 'What is charged', paragraphs: ['GCash currently uses PayMongo Test Mode. These fees and earnings are tracking records; no real money is transferred and no real Provider payout is made.'], bullets: [
        'Free: a 10% platform fee on new GCash bookings.',
        'Pro: a 5% platform fee on new GCash bookings while paid benefits are active.',
        'The fee uses the full agreed booking total, including any travel charge. It is deducted from the Provider’s share, not added to the Customer’s total.',
        'Cash: no ServiceHub platform fee. The Customer pays the Provider directly.',
      ] },
      { heading: 'The breakdown is visible before payment', paragraphs: [
        'The payment review shows Total you pay, Platform fee and Provider share without needing to open extra fee details. Review the agreed total before continuing to GCash.',
        'For example, a ₱500 GCash booking on Free has a ₱50 platform fee and a ₱450 Provider share. On Pro, the fee is ₱25 and the Provider share is ₱475. The Customer pays ₱500 in either example.',
      ] },
      { heading: 'When the rate is fixed', paragraphs: [
        'The Provider’s rate is saved when the payment checkout is created. Upgrading, cancelling or reaching Pro expiry does not change the fee on an existing payment attempt or booking.',
        'The Provider’s net earnings are recorded after the booking is completed and payment is released. Full refunds reverse the full Customer amount. The ₱199 Pro subscription payment is separate from booking fees and earnings.',
      ] },
    ],
  },
  {
    slug: 'provider-plans-and-subscriptions',
    title: 'Provider Plans: Free and Pro',
    category: 'payments',
    description: 'Compare listing limits, GCash fees, featured placement and the ₱199 monthly Pro plan.',
    lastUpdated: 'October 21, 2026',
    readTimeMinutes: 4,
    keywords: ['provider plans', 'subscription', 'free', 'pro', 'upgrade', '199', 'listing limit', 'analytics', 'renew', 'cancel pro', 'expiry', 'featured'],
    relatedArticleSlugs: ['gcash-fees-and-provider-earnings', 'creating-a-service-listing', 'how-the-queue-works'],
    sections: [
      { heading: 'Compare the plans', bullets: [
        'Free costs ₱0 per month, allows up to 3 active service listings and uses a 10% fee for GCash bookings.',
        'Pro costs ₱199 per month, allows unlimited active service listings and lowers the GCash booking fee to 5%.',
        'Both plans include Provider analytics. Neither plan changes the Provider’s shared paid Job Queue capacity or grants extra Trust Score points.',
        'Cash payments have no ServiceHub platform fee on either plan.',
      ] },
      { heading: 'Upgrade to Pro', steps: [
        'Switch to Provider and select Subscription in the sidebar. It opens a dedicated page; use the top-right close button to return.',
        'Select Upgrade to Pro, review the ₱199 total and select Continue to Payment.',
        'Continue to GCash. Pro activates only after ServiceHub confirms a successful payment. Opening checkout or returning from the payment page does not activate Pro by itself.',
        'Return to Subscription to see your current plan, paid expiry date and payment history. If payment is still pending, select Check payment before attempting another checkout.',
      ], callout: { type: 'info', title: 'Test Mode', text: 'Subscription checkout currently uses GCash Test Mode. No real money is transferred.' } },
      { heading: 'Renewal, cancellation and expiry', paragraphs: [
        'A successful payment activates Pro for one calendar month. The Subscription page shows the exact expiry date. Renew manually after expiry; there are no automatic charges.',
        'Cancel Pro keeps paid benefits active until the displayed expiry date. At expiry, the account returns to Free with its 10% GCash fee and 3-active-listing limit for new publishing or activation.',
        'Existing listings are not deleted or automatically paused at expiry, even if more than three remain active. Upgrade again, or reduce the active count below three before publishing or resuming another listing.',
      ] },
      { heading: 'Featured placement', paragraphs: [
        'Pro gives a small priority advantage among services that already qualify for Community Hub featured placement. Eligible Providers must meet the active-account and verification rules, have at least 50 Trust Score and an average rating of at least 4 stars.',
        'Free services can still be featured. Pro does not guarantee placement, bookings or higher Trust Score, and does not change ordinary nearby-search sorting or the Community Hub leaderboard.',
      ] },
    ],
  },
];
