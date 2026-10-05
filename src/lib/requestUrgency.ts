// New requests use these exact values. Older free-text timelines stay readable.
export const REQUEST_URGENCY_OPTIONS = [
  { value: 'ASAP / Today', label: 'ASAP / Today' },
  { value: 'Needs Tomorrow', label: 'Needs Tomorrow' },
  { value: 'Next 1-2 Days', label: 'Next 1-2 Days' },
  { value: 'This Week', label: 'This Week' },
  { value: 'Flexible Schedule', label: 'Flexible Schedule' },
] as const;

export type RequestUrgency = typeof REQUEST_URGENCY_OPTIONS[number]['value'];

export function isRequestUrgency(value: string): value is RequestUrgency {
  return REQUEST_URGENCY_OPTIONS.some(option => option.value === value);
}

export function formatRequestUrgency(urgency?: string | null): string {
  const value = urgency?.trim() || '';
  const legacy: Record<string, string> = { high: 'ASAP / Today', medium: 'Next 1-2 Days', low: 'Flexible Schedule', flexible: 'Flexible Schedule' };
  return legacy[value.toLowerCase()] || value || 'Flexible Schedule';
}

export function requestUrgencyRank(urgency?: string): number {
  const value = formatRequestUrgency(urgency).toLowerCase();
  if (/asap|today|high|urgent|immediate|emergency/.test(value)) return 4;
  if (/tomorrow|24/.test(value)) return 3;
  if (/1-2|medium/.test(value)) return 2;
  if (/week/.test(value)) return 1;
  return 0;
}
