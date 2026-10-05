import type { ContentCaseDetail, ContentItem } from '@/api/contentWorkspace.api';
export const fixtureContent: ContentItem = {
  id: 'content-1', contentType: 'SERVICE_LISTING', title: 'Kitchen faucet repair', description: 'Inspect and repair a leaking kitchen faucet. Parts are discussed separately before booking.', category: 'Plumbing',
  owner: { id: 'owner-1', name: 'Maria Santos', email: 'maria@example.test', trustScore: 79, verificationStatus: 'APPROVED', moderationStatus: 'ACTIVE', isActive: true, role: 'user', deactivatedAt: null },
  status: 'ACTIVE', visibility: 'Public', moderationReasonCode: null, adminNotes: null, createdAt: '2026-09-29T04:00:00.000Z', updatedAt: '2026-09-30T04:00:00.000Z', price: 500, priceType: 'FIXED', budgetMin: null, budgetMax: null, urgency: null, canRemove: true, canRestore: false, actionBlock: null,
};
export const fixtureCase: ContentCaseDetail = {
  id: 'case-1', caseType: 'REPORT', contentType: 'SERVICE_LISTING', resourceId: 'content-1', status: 'OPEN', reason: 'The description promises parts that the provider later said were not included. Please check whether the price is misleading.', resolution: null,
  createdAt: '2026-09-30T08:00:00.000Z', decidedAt: null, decision: null, penalty: null, decisionResult: null,
  contentSnapshot: { ...fixtureContent, ownerId: 'owner-1', ownerName: 'Maria Santos' },
  submitter: { id: 'reporter-1', name: 'Juan Reyes', email: 'juan@example.test' }, title: fixtureContent.title, ownerName: 'Maria Santos', category: 'Plumbing', currentVisibility: 'Public',
  content: fixtureContent, allowedDecisions: ['KEEP', 'REMOVE'], obligations: { bookings: 0, heldPayments: 0, pendingPayments: 0, unstartedProviderBookings: 0 }, history: [],
};
