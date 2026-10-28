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