import { api } from '../lib/api/axios';
import type { ContentReportReason } from '../lib/contentReportReasons';

export type ContentCaseType = 'REPORT' | 'APPEAL';
export type ModeratedContentType = 'SERVICE_LISTING' | 'SERVICE_REQUEST';

export async function apiSubmitContentCase(input: {
  caseType: ContentCaseType;
  contentType: ModeratedContentType;
  resourceId?: string;
  reason: string;
  reportReason?: ContentReportReason;
}) {
  const response = await api.post('/content-cases', input);
  return response.data;
}

export async function apiListMyContentCases() {
  const response = await api.get('/content-cases/mine');
  return response.data;
}
