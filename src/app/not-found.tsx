import Link from 'next/link';
import { Compass, House } from '@phosphor-icons/react/dist/ssr';
import SystemState from '@/components/ui/SystemState';

export default function NotFound() {
  return (
    <SystemState
      code="404"
      tone="seeker"
      icon={<Compass size={28} weight="duotone" />}
      title="Page not found"
      description="This address does not lead to an available page. Check the URL for a typing error, or go to the ServiceHub homepage."
      actions={
          <Link href="/" className="system-state-primary-action">
            <House size={17} weight="bold" aria-hidden="true" />
            Go to homepage
          </Link>
      }
    />
  );
}
