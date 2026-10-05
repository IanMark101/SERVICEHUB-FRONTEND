import { api } from '../lib/api/axios';

export type ContentType = 'SERVICE_LISTING' | 'SERVICE_REQUEST';
export type ContentDecision = 'KEEP' | 'REMOVE' | 'RESTORE' | 'KEEP_REMOVED' | 'GUIDANCE';
export type ContentPenalty = 'none' | 'warn' | 'suspend' | 'ban';
export interface ContentOwner { id: string; name: string; email: string; trustScore: number; verificationStatus: string; moderationStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED'; isActive: boolean; role: string; deactivatedAt: string | null }
export interface ContentItem {
  id: string; contentType: ContentType; title: string; description: string; category: string;
  owner: ContentOwner; status: string; visibility: string; moderationReasonCode: string | null; adminNotes: string | null;
  createdAt: string; updatedAt: string; price: number | null; priceType: string | null; budgetMin: number | null; budgetMax: number | null; urgency: string | null;
  canRemove: boolean; canRestore: boolean; actionBlock: string | null;
}
export interface ContentSnapshot { title: string; description: string; category: string; ownerId: string; ownerName: string; updatedAt: string; price: number | null; priceType: string | null; budgetMin: number | null; budgetMax: number | null; urgency: string | null }
export interface ContentCase {
  id: string; caseType: 'REPORT' | 'APPEAL'; contentType: ContentType; resourceId: string | null; status: 'OPEN' | 'RESOLVED'; reason: string; resolution: string | null;
  createdAt: string; decidedAt: string | null; decision: ContentDecision | null; penalty: ContentPenalty | null; contentSnapshot: ContentSnapshot | null;
  decisionResult: { contentStatus: string | null; ownerStatus: string | null; suspensionDays?: number } | null;
  submitter: { id: string; name: string; email: string }; title: string; ownerName: string | null; category: string | null; currentVisibility: string;
}
export interface ContentCaseDetail extends ContentCase {
  content: ContentItem | null; allowedDecisions: ContentDecision[];
  obligations: { bookings: number; heldPayments: number; pendingPayments: number; unstartedProviderBookings: number };
  history: { id: string; action: string; reason: string; createdAt: string; resourceId: string | null }[];
}
export interface ContentDecisionInput { decision: ContentDecision; penalty: ContentPenalty; resolution: string; expectedUpdatedAt?: string; expectedOwnerStatus?: ContentOwner['moderationStatus']; suspensionDays: number }
export interface ContentQuery { page: number; limit: number; contentType?: ContentType; caseType?: 'REPORT' | 'APPEAL'; status?: 'OPEN' | 'RESOLVED'; search?: string }
export interface ContentPage<T> { success: boolean; data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } }

export async function apiGetContentCases(query: ContentQuery) { return (await api.get<ContentPage<ContentCase>>('/admin/content/cases', { params: query })).data; }
export async function apiGetContentCase(id: string) { return (await api.get<{ data: ContentCaseDetail }>(`/admin/content/cases/${id}`)).data; }
export async function apiDecideContentCase(id: string, input: ContentDecisionInput) { return (await api.patch(`/admin/content/cases/${id}`, input)).data; }
export async function apiGetMarketplaceContent(query: ContentQuery) { return (await api.get<ContentPage<ContentItem>>('/admin/content/marketplace', { params: query })).data; }
export async function apiGetMarketplaceItem(type: ContentType, id: string) { return (await api.get<{ data: ContentItem }>(`/admin/content/marketplace/${type}/${id}`)).data; }
export async function apiChangeMarketplaceItem(item: ContentItem, action: 'REMOVE' | 'RESTORE', reason: string) { return (await api.post<{ data: ContentItem }>(`/admin/content/marketplace/${item.contentType}/${item.id}/action`, { action, reason, expectedUpdatedAt: item.updatedAt })).data; }
