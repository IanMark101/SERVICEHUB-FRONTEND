export default function PhilippineFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 600 300" className={`rounded-[2px] shadow-xs object-cover flex-shrink-0 ${className}`}>
      <rect width="600" height="150" fill="#0038A8" />
      <rect y="150" width="600" height="150" fill="#CE1126" />
      <polygon points="0,0 259.8,150 0,300" fill="#FFFFFF" />
      <circle cx="86.6" cy="150" r="28" fill="#FCD116" />
      <polygon points="86.6,105 91,140 82.2,140" fill="#FCD116" />
      <polygon points="86.6,195 91,160 82.2,160" fill="#FCD116" />
      <polygon points="41.6,150 76.6,154.4 76.6,145.6" fill="#FCD116" />
      <polygon points="131.6,150 96.6,154.4 96.6,145.6" fill="#FCD116" />
      <circle cx="36" cy="48" r="8" fill="#FCD116" />
      <circle cx="36" cy="252" r="8" fill="#FCD116" />
      <circle cx="218" cy="150" r="8" fill="#FCD116" />
    </svg>
  );
}
