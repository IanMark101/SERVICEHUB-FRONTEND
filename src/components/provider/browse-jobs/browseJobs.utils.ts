export function formatUrgencyDisplay(urgency?: string): string {
  if (!urgency || !urgency.trim()) return 'Flexible Schedule';
  const value = urgency.trim();
  const normalized = value.toLowerCase();
  if (normalized === 'high') return 'High Urgency (ASAP / Today)';
  if (normalized === 'medium') return 'Medium Urgency (Next 1-2 Days)';
  if (normalized === 'low') return 'Low Urgency (Flexible)';
  return value;
}
