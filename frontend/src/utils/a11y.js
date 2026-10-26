/**
 * Utilidades de Accesibilidad (WCAG 2.1 AA)
 * Helpers activos: movimiento reducido y anuncios a lectores de pantalla.
 */

/**
 * Verificar si usuario prefiere movimiento reducido
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Obtener duración de animación según preferencias
 * @param {number} defaultDuration - Duración por defecto en ms
 * @returns {number} Duración ajustada
 */
export function getAnimationDuration(defaultDuration = 300) {
  return prefersReducedMotion() ? 0 : defaultDuration;
}

/**
 * Anunciar cambio dinámico a lectores de pantalla
 * @param {string} message - Mensaje a anunciar
 * @param {string} priority - 'polite' | 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  if (typeof document === 'undefined') return;
  
  // Buscar o crear región ARIA live
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
  
  // Actualizar mensaje
  liveRegion.textContent = message;
  
  // Limpiar después de 1 segundo
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 1000);
}
