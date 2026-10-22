<script>
  /**
   * Slide 3 — El impacto visual (La Silla Vacía).
   * Waffle chart de 100 asientos con retardo escalonado en los grises.
   */
  import { createEventDispatcher } from 'svelte';
  import SillaVacia from '../SillaVacia.svelte';
  import { focusTitle } from '../../utils/focusTitle.js';

  export let cohortData = null;
  export let entidadNombre = '';

  const dispatch = createEventDispatcher();
</script>

<section class="slide slide-waffle">
  <h2 class="slide-title" data-titulo-slide="3" tabindex="-1" use:focusTitle>
    Así se ven las personas que no votaron
  </h2>

  <p class="slide-lead">
    Cada cuadro representa a una persona de tu generación. Los cuadros de color votaron; los cuadros grises se quedaron en casa.
  </p>

  <div class="slide-card">
    <SillaVacia data={cohortData} entidad={entidadNombre} />
  </div>

  <div class="slide-actions">
    <button class="btn-primary" on:click={() => dispatch('next')}>Comparar con el país</button>
    <button class="btn-back" on:click={() => dispatch('back')} aria-label="Volver al paso anterior">Volver</button>
  </div>
</section>
