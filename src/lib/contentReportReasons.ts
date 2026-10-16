export const CONTENT_REPORT_REASONS = [
  { value: 'MISLEADING', label: 'False or misleading information' },
  { value: 'SCAM', label: 'Scam or suspicious payment request' },
  { value: 'INAPPROPRIATE', label: 'Offensive or inappropriate content' },
  { value: 'UNSAFE', label: 'Unsafe or prohibited service' },
  { value: 'SPAM', label: 'Spam or duplicate listing' },
  { value: 'OTHER', label: 'Other concern' },
] as const;

export type ContentReportReason = typeof CONTENT_REPORT_REASONS[number]['value'];

export const CONTENT_REPORT_REASON_FILTERS = [
  ...CONTENT_REPORT_REASONS,
  { value: 'UNSPECIFIED', label: 'Not specified' },
] as const;

export type ContentReportReasonFilter = typeof CONTENT_REPORT_REASON_FILTERS[number]['value'];

export function contentReportReasonLabel(value?: string | null) {
  return CONTENT_REPORT_REASONS.find(reason => reason.value === value)?.label || 'Not specified';
}
