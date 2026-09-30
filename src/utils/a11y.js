/**
 * Utilidades de Accesibilidad (WCAG 2.1 AA)
 * Helpers para ARIA, navegación por teclado, y lectores de pantalla
 */

/**
 * Generar ID único para vincular elementos (aria-labelledby, aria-describedby)
 * @param {string} prefix - Prefijo del ID
 * @returns {string}
 */
export function generateA11yId(prefix = 'a11y') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Configurar atributos ARIA para un gráfico
 * @param {string} title - Título del gráfico
 * @param {string} description - Descripción del gráfico
 * @returns {Object} Atributos ARIA
 */
export function getChartAriaAttrs(title, description) {
  const titleId = generateA11yId('chart-title');
  const descId = generateA11yId('chart-desc');
  
  return {
    role: 'img',
    'aria-labelledby': titleId,
    'aria-describedby': descId,
    titleId,
    descId,
    title,
    description
  };
}

/**
 * Generar texto alternativo para visualizaciones
 * @param {Array} data - Datos de la visualización
 * @param {string} type - Tipo de visualización
 * @returns {string}
 */
export function generateAltText(data, type = 'chart') {
  if (!data || data.length === 0) {
    return 'Gráfico sin datos disponibles';
  }
  
  if (type === 'linea-vida') {
    const points = data.map(d => `${d.year}: ${d.participacion_pct.toFixed(1)}%`).join(', ');
    return `Línea de vida cívica mostrando participación electoral: ${points}`;
  }
  
  if (type === 'silla-vacia') {
    const filled = Math.round(data.participacion_pct);
    return `Visualización de 100 asientos: ${filled} llenos representan personas que participaron, ${100 - filled} vacíos representan quienes no participaron`;
  }
  
  return 'Visualización de datos electorales';
}

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
 * Configurar navegación por teclado para elementos interactivos
 * @param {HTMLElement} element - Elemento DOM
 * @param {Function} callback - Función a ejecutar
 */
export function setupKeyboardNav(element, callback) {
  if (!element) return;
  
  element.addEventListener('keydown', (event) => {
    // Enter o Espacio activan el elemento
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback(event);
    }
    
    // Escape para cerrar/cancelar
    if (event.key === 'Escape') {
      const closeButton = element.querySelector('[data-close]');
      if (closeButton) {
        closeButton.click();
      }
    }
  });
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

/**
 * Verificar contraste de color (WCAG AA: 4.5:1 para texto normal)
 * @param {string} fg - Color de frente (hex)
 * @param {string} bg - Color de fondo (hex)
 * @returns {Object} { ratio: number, passes: boolean }
 */
export function checkColorContrast(fg, bg) {
  // Convertir hex a RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Calcular luminancia relativa
  const getLuminance = (rgb) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  
  if (!fgRgb || !bgRgb) {
    return { ratio: 0, passes: false };
  }
  
  const fgLum = getLuminance(fgRgb);
  const bgLum = getLuminance(bgRgb);
  
  const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
  
  return {
    ratio: ratio.toFixed(2),
    passes: ratio >= 4.5  // WCAG AA para texto normal
  };
}

/**
 * Agregar skip link para navegación rápida
 * @returns {string} HTML del skip link
 */
export function createSkipLink() {
  return `
    <a href="#main-content" class="skip-link">
      Saltar al contenido principal
    </a>
  `;
}

/**
 * Configurar atributos para tabla accesible
 * @param {string} caption - Título de la tabla
 * @returns {Object}
 */
export function getTableAriaAttrs(caption) {
  return {
    role: 'table',
    'aria-label': caption,
    'aria-describedby': generateA11yId('table-desc')
  };
}

/**
 * Generar descripción accesible para un dato
 * @param {Object} election - Datos de elección
 * @returns {string}
 */
export function describeElectionForA11y(election) {
  return `Año ${election.year}, ${election.type}, edad ${election.age_on_election} años, participación ${election.participacion_pct.toFixed(1)} por ciento, lista nominal ${election.lista_nominal.toLocaleString('es-MX')} personas`;
}

/**
 * Configurar focus trap para modales
 * @param {HTMLElement} container - Contenedor del modal
 */
export function setupFocusTrap(container) {
  if (!container) return;
  
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  });
  
  // Enfocar primer elemento al abrir
  firstElement?.focus();
}

/**
 * Restaurar foco después de cerrar modal
 * @param {HTMLElement} triggerElement - Elemento que abrió el modal
 */
export function restoreFocus(triggerElement) {
  if (triggerElement && typeof triggerElement.focus === 'function') {
    triggerElement.focus();
  }
}

/**
 * Obtener atributos para botón accesible
 * @param {string} label - Etiqueta del botón
 * @param {boolean} pressed - Estado pressed (para toggles)
 * @returns {Object}
 */
export function getButtonAriaAttrs(label, pressed = null) {
  const attrs = {
    'aria-label': label,
    role: 'button',
    tabindex: '0'
  };
  
  if (pressed !== null) {
    attrs['aria-pressed'] = pressed.toString();
  }
  
  return attrs;
}

/**
 * Validar si elemento es visible para lectores de pantalla
 * @param {HTMLElement} element - Elemento a verificar
 * @returns {boolean}
 */
export function isVisibleToScreenReader(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
}
