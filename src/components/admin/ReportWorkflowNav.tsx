import Link from 'next/link';
import './report-workflows.css';

const workflows = [
  { id: 'content', href: '/admin/content-cases', label: 'Content Reports & Appeals', scope: 'Listings and public requests' },
  { id: 'booking', href: '/admin/reports', label: 'Disputes & Reports', scope: 'Bookings, services and payments' },
] as const;

export default function ReportWorkflowNav({ current }: { current: 'content' | 'booking' }) {
  return <nav className="report-workflows" aria-label="Report workflows">
    {workflows.map(workflow => <Link key={workflow.id} href={workflow.href} aria-current={current === workflow.id ? 'page' : undefined}>
      <strong>{workflow.label}</strong>
      <span>{workflow.scope}</span>
    </Link>)}
  </nav>;
}
