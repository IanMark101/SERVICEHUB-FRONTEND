import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

const links = [{ label: 'How it works', href: '#how-it-works' }, { label: 'Queue', href: '#queue' }, { label: 'Trust', href: '#trust' }, { label: 'Community', href: '#community' }, { label: 'Help Center', href: '/help' }];

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#121210] text-stone-300"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10"><div className="grid gap-10 md:grid-cols-[1fr_auto]"><div className="max-w-md"><div className="flex items-center gap-3"><Image src="/logo.svg" alt="" width={40} height={40} className="size-10 rounded-xl" /><div><p className="text-sm font-extrabold text-white">ServiceHub Cordova</p><p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300"><MapPin size={12} /> Cordova, Cebu</p></div></div><p className="mt-5 text-sm leading-6 text-stone-400">A capstone marketplace for finding and offering local services through verified identities, accountable workflows, and fair online-payment queues.</p></div><nav className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3" aria-label="Footer">{links.map((link) => link.href.startsWith('/') ? <Link key={link.href} href={link.href} className="text-xs font-semibold hover:text-white">{link.label}</Link> : <a key={link.href} href={link.href} className="text-xs font-semibold hover:text-white">{link.label}</a>)}<Link href="/terms" className="text-xs font-semibold hover:text-white">Terms</Link><Link href="/privacy" className="text-xs font-semibold hover:text-white">Privacy</Link></nav></div><div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-[11px] text-stone-500 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 ServiceHub Cordova. Capstone implementation scoped and tested for Cordova, Cebu.</p><p>Future multi-area expansion is not part of the implemented scope.</p></div></div></footer>
  );
}
