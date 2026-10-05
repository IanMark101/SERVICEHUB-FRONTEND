import { Suspense } from 'react';
import ContentWorkspace from '@/components/admin/content/ContentWorkspace';

export default function AdminContentCases() {
  return <Suspense fallback={<p role="status">Loading content workspace…</p>}><ContentWorkspace /></Suspense>;
}
