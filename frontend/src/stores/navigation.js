import { writable } from 'svelte/store';

export const totalSlides = 5;

export const currentSlide = writable(1);

export function goToSlide(n) {
  if (!Number.isInteger(n) || n < 1 || n > totalSlides) return;
  currentSlide.set(n);
}