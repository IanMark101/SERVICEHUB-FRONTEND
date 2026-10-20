import { useId, type ReactNode, type FormEventHandler } from 'react';
import { MagnifyingGlass as Search } from '@phosphor-icons/react';

export default function MarketplaceSearchHeader({ role, isDark, value, onQueryChange, onSubmit, locationControl, resultsId }: {
  role: 'seeker' | 'provider'; isDark: boolean; value: string; onQueryChange: (query: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>; locationControl: ReactNode; resultsId: string;
}) {
  const queryId = useId();
  return (
      <div className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-gradient-to-b from-[#fffdfa] to-[#faf8f5] px-4 py-5 text-center shadow-[0_2px_12px_-4px_rgba(23,23,22,0.05)] transition-colors sm:px-8 sm:py-7 dark:border-white/[0.08] dark:bg-none dark:bg-charcoal-surface dark:shadow-none">
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent ${role === 'provider' ? 'via-emerald-500/50' : 'via-brand/15'} to-transparent`} />
        <div className="relative z-10 mx-auto w-full max-w-2xl space-y-2">
          <h2 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-ink dark:text-white sm:text-3xl">{role === 'seeker' ? 'Find local experts for any task.' : 'Find customer requests for any task.'}</h2>
          <p className="mx-auto max-w-md text-xs leading-relaxed text-ink-muted dark:text-ink-muted sm:text-sm">{role === 'seeker' ? 'Browse provider services nearby, then narrow by service, category or availability.' : 'Browse open requests and send offers to local customers.'}</p>
          <form role="search" onSubmit={onSubmit} className={`service-search-control mx-auto mt-4 flex w-full max-w-xl min-w-0 items-center rounded-xl border p-1 shadow-sm transition-all focus-within:ring-2 ${role === 'seeker' ? 'focus-within:ring-brand/20' : 'focus-within:ring-emerald-500/20'} ${
            isDark ? 'bg-charcoal-inset border-neutral-800' : 'bg-white border-black/10'
          }`}>
            <span className={`pl-3 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
              <Search className="w-4 h-4" />
            </span>
            <label htmlFor={queryId} className="sr-only">{role === 'seeker' ? 'Search service listings' : 'Search service requests'}</label>
            <input
              id={queryId}
              type="text"
              maxLength={100}
              placeholder={role === 'seeker' ? 'What service are you looking for?' : 'What service request are you looking for?'}
              value={value}
              onChange={(e) => {
                onQueryChange(e.target.value);
              }}
              className={`service-search-input min-w-0 flex-1 border-none bg-transparent px-3 py-2 text-sm focus:outline-none ${
                isDark ? 'text-white placeholder:text-ink-muted' : 'text-ink placeholder:text-ink-muted'
              }`}
            />
            <button
              type="submit"
              aria-controls={resultsId}
              className="workspace-primary-button flex-shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition-all sm:px-5"
            >
              Search
            </button>
          </form>
          {locationControl}
        </div>
      </div>
  );
}
