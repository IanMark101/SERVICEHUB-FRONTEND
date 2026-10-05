import './trust-score-badge.css';

/** A trust score is out of 100; residency verification is shown separately. */
export default function TrustScoreBadge({ score, compact = false }: { score?: number | null; compact?: boolean }) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return null;
  const band = score >= 70 ? 'trusted' : score >= 50 ? 'average' : 'attention';
  return <span className="trust-score-badge" data-band={band} title={`Trust score: ${score} out of 100`} aria-label={`Trust score: ${score} out of 100`}>{compact ? '' : 'Trust '}{score}/100</span>;
}
