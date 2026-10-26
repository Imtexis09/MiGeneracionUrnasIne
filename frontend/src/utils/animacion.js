/**
 * Utilidades de línea de tiempo para la demostración de la guía.
 * Todo es función del tiempo `t` (segundos), así el cursor, el scroll y las
 * acciones quedan sincronizados y el bucle es trivial.
 */

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** Progreso 0..1 del tramo [a, b] */
export const seg = (t, a, b) => clamp((t - a) / (b - a));

export const lerp = (a, b, p) => a + (b - a) * p;

export const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
