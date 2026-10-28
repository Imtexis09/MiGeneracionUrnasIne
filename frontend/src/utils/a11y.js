export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

export function getAnimationDuration(defaultDuration = 300) {
  return prefersReducedMotion() ? 0 : defaultDuration;
}

export function announceToScreenReader(message, priority = 'polite') {
  if (typeof document === 'undefined') return;
  
  
  let liveRegion = document.querySelector('[data-live-region]');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('data-live-region', 'true');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }
  
  
  liveRegion.textContent = message;
  
  
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 1000);
}