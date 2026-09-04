import { ChevronDown, ChevronUp, HelpCircle, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';

interface TrustScoreGuideProps { isDark: boolean; isOpen: boolean; cardBg: string; accentColor: string; headingText: string; labelText: string; onToggle: () => void; }

export default function TrustScoreGuide({ isDark, isOpen, cardBg, accentColor, headingText, labelText, onToggle }: TrustScoreGuideProps) {
  const bands = [
    { range: '90 – 100', title: 'Highly Trusted', description: 'Top-tier marketplace standing', card: isDark ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-200', rangeClass: 'text-emerald-500', descriptionClass: 'text-emerald-600 dark:text-emerald-400' },
    { range: '70 – 89', title: 'Trusted', description: 'Consistent positive track record', card: isDark ? 'bg-blue-950/20 border-blue-900/30' : 'bg-blue-50 border-blue-200', rangeClass: 'text-blue-500', descriptionClass: 'text-blue-600 dark:text-blue-400' },
    { range: '50 – 69', title: 'Average', description: 'New or standard activity level', card: isDark ? 'bg-amber-950/20 border-amber-900/30' : 'bg-amber-50 border-amber-200', rangeClass: 'text-amber-500', descriptionClass: 'text-amber-600 dark:text-amber-400' },
    { range: 'Below 50', title: 'Needs Attention', description: 'Impacted by cancellations or issues', card: isDark ? 'bg-rose-950/20 border-rose-900/30' : 'bg-rose-50 border-rose-200', rangeClass: 'text-rose-500', descriptionClass: 'text-rose-600 dark:text-rose-400' }
  ];
  return (
    <div className={`${cardBg} rounded-[24px] p-6 border space-y-4`}>
      <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
        <div className="flex items-center gap-2"><ShieldCheck size={18} className={accentColor} /><h3 className={`font-black text-sm uppercase tracking-wider ${headingText}`}>How Trust Score Works</h3></div>
        <button type="button" onClick={onToggle} className={`text-xs font-bold flex items-center gap-1 ${labelText} hover:opacity-80 transition-opacity`}><span>{isOpen ? 'Hide Guide' : 'Show Guide'}</span>{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
      </div>
      {isOpen && (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className={labelText}>Your Trust Score (0–100) reflects your reliability, transparency, and history in the Cordova marketplace. All accounts start at a baseline of 50.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {bands.map((band) => <div key={band.range} className={`p-3 rounded-2xl border ${band.card}`}><div className={`${band.rangeClass} font-extrabold text-[11px]`}>{band.range}</div><div className={`font-bold text-xs ${headingText}`}>{band.title}</div><div className={`text-[10px] ${band.descriptionClass} mt-0.5`}>{band.description}</div></div>)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <TrustFactors title="What Increases Your Score" icon={<TrendingUp size={15} />} color="emerald" isDark={isDark} labelText={labelText} items={['Admin verification of residency and identity credentials','Successfully completing and confirming service bookings','Receiving positive (4-star & 5-star) client reviews','Smooth, undisputed booking completion and confirmation']} />
            <TrustFactors title="What Decreases Your Score" icon={<TrendingDown size={15} />} color="rose" isDark={isDark} labelText={labelText} items={['Cancelling bookings at fault after work has already started','Valid disputes or complaints confirmed by admin moderators','Receiving low-rating reviews (1-star or 2-star)','Repeated service listing rejections for policy violations']} />
          </div>
          <div className={`p-3 rounded-xl border flex items-center gap-2 text-[11px] ${isDark ? 'bg-[#1c1b18] border-neutral-800 text-neutral-400' : 'bg-amber-50/60 border-amber-200/60 text-amber-900'}`}><HelpCircle size={15} className="flex-shrink-0 text-amber-500" /><span>To prevent gaming and ensure authentic interactions, exact mathematical formulas are not published. Earning trust is based on genuine reliability.</span></div>
        </div>
      )}
    </div>
  );
}

function TrustFactors({ title, icon, color, isDark, labelText, items }: { title: string; icon: React.ReactNode; color: 'emerald' | 'rose'; isDark: boolean; labelText: string; items: string[] }) {
  const titleClass = color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
  const bulletClass = color === 'emerald' ? 'text-emerald-500' : 'text-rose-500';
  return <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#191919] border-neutral-800/80' : 'bg-slate-50/80 border-slate-200/80'} space-y-2`}><div className={`flex items-center gap-1.5 font-bold ${titleClass}`}>{icon}<span>{title}</span></div><ul className={`space-y-1 text-[11px] ${labelText}`}>{items.map((item) => <li key={item} className="flex items-start gap-1.5"><span className={`${bulletClass} font-bold`}>•</span><span>{item}</span></li>)}</ul></div>;
}
