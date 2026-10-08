import Link from 'next/link';
import './report-workflows.css';

const workflows = [
  { id: 'content', href: '/admin/content-cases', label: 'Content Reports & Appeals' },
  { id: 'booking', href: '/admin/reports', label: 'Disputes & Reports' },
  { id: 'ban', href: '/admin/ban-appeals', label: 'Ban Appeals' },
] as const;

export default function ReportWorkflowNav({ current, detail = false }: { current: 'content' | 'booking' | 'ban'; detail?: boolean }) {
  return <nav className={`report-workflows${detail ? ' report-workflows-detail' : ''}`} aria-label="Report workflows">
    {workflows.map(workflow => <Link key={workflow.id} href={workflow.href} aria-current={current === workflow.id ? 'page' : undefined}>
      <strong>{workflow.label}</strong>
    </Link>)}
  </nav>;
}
