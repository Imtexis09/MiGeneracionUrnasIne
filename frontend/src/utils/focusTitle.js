/**
 * Acción de Svelte para el foco del título de cada slide.
 *
 * Cuando se entra a un slide, el foco del teclado se mueve al encabezado
 * (`<h1>` / `<h2>`) para que las personas que navegan con lector de pantalla
 * sepan de inmediato en qué parte de la historia están (WCAG 2.4.3).
 *
 * Uso:  <h1 use:focusTitle>...</h1>
 *
 * La acción se aplica al ENCABEZADO: al montarse (es decir, al entrar al
 * slide) le pasa el foco. En la carga inicial de la página no se roba el
 * foco: el usuario acaba de llegar y puede tener el foco en otro sitio
 * (por ejemplo, dentro de la guía de bienvenida).
 */

let primeraEjecucion = true;

/**
 * @param {HTMLElement} node - Elemento al que se le pasa el foco
 */
export function focusTitle(node) {
  const enfocar = () => {
    try {
      node.focus({ preventScroll: true });
    } catch (e) {
      // Navegadores sin soporte de `preventScroll`: foco simple
      try {
        node.focus();
      } catch (e2) { /* noop */ }
    }
  };

  if (primeraEjecucion) {
    // Primer slide que se monta en esta carga: no se roba el foco
    primeraEjecucion = false;
  } else {
    enfocar();
  }

  return {
    destroy() {
      // nada que limpiar: el nodo desaparece con el slide
    }
  };
}
