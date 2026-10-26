/**
 * Acción de Svelte: avisa UNA sola vez cuando el elemento se ve de verdad en
 * pantalla (al deslizar hasta él). Sirve para que las animaciones de los
 * dibujos arranquen cuando la persona las puede ver y no al cargar la página.
 *
 * Uso:  <svg use:alVerse={() => visible = true}> o con opciones
 *       use:alVerse={{ alVerse: fn, umbral: 0.3 }}
 *
 * Sin IntersectionObserver (navegadores muy viejos) avisa de inmediato.
 *
 * @param {HTMLElement|SVGElement} nodo
 * @param {(() => void) | { alVerse: () => void, umbral?: number }} param
 */
export function alVerse(nodo, param) {
  const opts = typeof param === 'function' ? { alVerse: param } : param;
  const umbral = opts.umbral ?? 0.3;
  let hecho = false;

  const avisar = () => {
    if (hecho) return;
    hecho = true;
    opts.alVerse?.();
  };

  if (typeof IntersectionObserver === 'undefined') {
    avisar();
    return {};
  }

  const io = new IntersectionObserver(
    (entradas) => {
      if (entradas.some((e) => e.isIntersecting)) {
        avisar();
        io.disconnect();
      }
    },
    { threshold: umbral }
  );
  io.observe(nodo);

  return { destroy: () => io.disconnect() };
}
