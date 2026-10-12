import type { Metadata } from 'next';
import InstallPage from '@/components/pwa/InstallPage';

export const metadata: Metadata = { title: 'Install ServiceHub', description: 'Add ServiceHub to your home screen and open both workspaces from one app.' };
export default function Page() { return <InstallPage />; }
