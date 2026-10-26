/**
 * Store de navegación de la Web Story (slides).
 *
 * Un único writable `currentSlide` controla qué vista está activa.
 * Los componentes lo consumen con `$currentSlide`.
 */

import { writable } from 'svelte/store';

/** Número total de slides de la historia */
export const totalSlides = 5;

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
