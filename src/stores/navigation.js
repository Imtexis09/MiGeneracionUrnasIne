/**
 * Store de navegación de la Web Story (slides).
 *
 * Un único writable `currentSlide` controla qué vista está activa.
 * Los componentes lo consumen con `$currentSlide` y los tests pueden
 * importarlo sin necesidad de montar la app.
 */

import { writable } from 'svelte/store';

/** Número total de slides de la historia */
export const totalSlides = 5;

/** Alias en mayúsculas (mantiene compatibilidad con el resto del código) */
export const TOTAL_SLIDES = totalSlides;

/** Slide activo (1..totalSlides) */
export const currentSlide = writable(1);

/**
 * Ir a un slide concreto. Ignora valores fuera de rango.
 * @param {number} n
 */
export function goToSlide(n) {
  if (!Number.isInteger(n) || n < 1 || n > totalSlides) return;
  currentSlide.set(n);
}

/** Avanzar un slide (no pasa del último) */
export function nextSlide() {
  currentSlide.update((v) => Math.min(totalSlides, v + 1));
}

/** Retroceder un slide (no pasa del primero) */
export function prevSlide() {
  currentSlide.update((v) => Math.max(1, v - 1));
}

/** Volver al inicio de la historia */
export function resetSlides() {
  currentSlide.set(1);
}
