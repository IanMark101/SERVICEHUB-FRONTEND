export type AuditKind = 'admin' | 'security';
export interface AuditFilters { search: string; action: string; from: string; to: string }
export interface AdminAuditRecord {
  id: string; action: string; resourceType: string; resourceId?: string;
  reason: string; createdAt: string;
  actor: { name: string; email: string };
  targetUser?: { name: string } | null;
}
export interface SecurityRecord {
  id: string; userId: string | null; action: string; reason: string;
  method: string | null; ipAddress: string | null;
  locationStatus: 'APPROXIMATE' | 'LOCAL_NETWORK' | 'UNAVAILABLE';
  city: string | null; region: string | null; country: string | null;
  browser: string; device: string; userAgent: string | null;
  sessionReference: string | null; requestId: string | null; createdAt: string;
  user: { id: string; name: string; email: string } | null;
}
export interface AuditHistoryResponse {
  success: boolean; kind: AuditKind; data: Array<AdminAuditRecord | SecurityRecord>;
  retentionDays?: number;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
