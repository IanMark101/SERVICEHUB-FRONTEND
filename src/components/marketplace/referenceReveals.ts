/** One-time entrances. All CSS defaults to visible final states. */
export function installReferenceReveals(root: HTMLElement) {
  if (typeof window.matchMedia !== 'function') return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map<HTMLElement, Animation>();
  const elements = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
  const finish = (element: HTMLElement) => {
    element.dataset.revealPlayed = 'true';
    animations.get(element)?.cancel();
    animations.delete(element);
  };
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target as HTMLElement;
      observer?.unobserve(element);
      element.dataset.revealPlayed = 'true';
      if (reduced.matches || document.visibilityState === 'hidden' || entry.boundingClientRect.top < 0) finish(element);
      else animations.get(element)?.play();
    }
  }, { threshold: 0, rootMargin: '0px 0px 80px 0px' }) : undefined;
  const stop = () => { observer?.disconnect(); elements.forEach(finish); };
  const updates = new MutationObserver(() => {
    const current = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
    if (current.length !== elements.length || current.some((element, index) => element !== elements[index])) stop();
  });
  updates.observe(root, { childList: true, subtree: true });
  const onPreference = () => { if (reduced.matches) stop(); };
  const onScroll = () => {
    for (const [element, animation] of animations) {
      if (!element.isConnected || element.getBoundingClientRect().top < 0) {
        observer?.unobserve(element);
        finish(element);
      } else if (animation.playState === 'running' && element.getBoundingClientRect().bottom <= 0) finish(element);
    }
  };
  reduced.addEventListener?.('change', onPreference);
  window.addEventListener('scroll', onScroll, { passive: true });
  const initialWidth = innerWidth;
  const initialHeight = innerHeight;
  const onResize = () => { if (innerWidth !== initialWidth || innerHeight !== initialHeight) stop(); };
  window.addEventListener('resize', onResize);
  for (const element of elements) {
    if (element.dataset.revealPlayed === 'true') continue;
    const rect = element.getBoundingClientRect();
    if (reduced.matches || !observer || !element.animate || rect.top < innerHeight || document.visibilityState === 'hidden') {
      finish(element); continue;
    }
    const slide = element.dataset.reveal === 'slide';
    const animation = element.animate([
      { opacity: 0, transform: slide ? 'translateX(6px)' : 'translateY(8px)' },
      { opacity: 1, transform: 'none' },
    ], { duration: slide ? 550 : 500, delay: Math.min(Number(element.dataset.revealIndex || 0) * 70, 210), easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' });
    animation.pause();
    animation.onfinish = () => finish(element);
    animations.set(element, animation);
    observer.observe(element);
  }
  return () => {
    stop();
    updates.disconnect();
    reduced.removeEventListener?.('change', onPreference);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };
}
