<script>
  import { createEventDispatcher } from 'svelte';
  import Selector from '../Selector.svelte';
  import { ENTIDADES } from '../../utils/data.js';
  import MapaMexico from '../MapaMexico.svelte';
  import { focusTitle } from '../../utils/focusTitle.js';
  import { fly, fade } from 'svelte/transition';
  import { getAnimationDuration } from '../../utils/a11y.js';

  const DUR = getAnimationDuration(350);
  $: listo = tieneDatos || !!(yearOfBirth && entidadNombre);

  export let yearOfBirth = null;
  export let entidadNombre = '';
  export let tieneDatos = false;

  const dispatch = createEventDispatcher();

  const MOMENTOS = [
    {
      nombre: 'Tu generación',
      desc: 'Los conteos del Instituto Nacional Electoral (INE) agrupan a la gente por edad. Con tu año de nacimiento sabemos qué grupo es el tuyo.'
    },
    {
      nombre: 'El choque',
      desc: 'Cuántas de cada 100 personas de tu edad dejaron su voto en la urna en la última elección.'
    },
    {
      nombre: 'Lo que faltó',
      desc: 'Cada asiento gris es alguien de tu edad que no votó. Los que no aparecen en las urnas.'
    },
    {
      nombre: 'Tu historia',
      desc: 'Una imagen con tus datos, lista para compartir y para que tu generación se entere.'
    }
  ];

  const ESTADO_CVE = {
    'Aguascalientes': '01', 'Baja California': '02', 'Baja California Sur': '03', 'Campeche': '04',
    'Coahuila': '05', 'Colima': '06', 'Chiapas': '07', 'Chihuahua': '08', 'Ciudad de México': '09',
    'Durango': '10', 'Guanajuato': '11', 'Guerrero': '12', 'Hidalgo': '13', 'Jalisco': '14',
    'México': '15', 'Michoacán': '16', 'Morelos': '17', 'Nayarit': '18', 'Nuevo León': '19',
    'Oaxaca': '20', 'Puebla': '21', 'Querétaro': '22', 'Quintana Roo': '23', 'San Luis Potosí': '24',
    'Sinaloa': '25', 'Sonora': '26', 'Tabasco': '27', 'Tamaulipas': '28', 'Tlaxcala': '29',
    'Veracruz': '30', 'Yucatán': '31', 'Zacatecas': '32'
  };
</script>

<section class="slide slide-onboarding">
  <div class="onboarding-main">
    <h2 class="slide-title" data-titulo-slide="1" tabindex="-1" use:focusTitle>
      ¿Qué tan activa es tu edad en las urnas?
    </h2>

    <p class="slide-lead">
      Elige tu año de nacimiento y tu estado. En menos de un minuto verás cuántas personas de tu generación fueron a votar.
    </p>

    <div class="mad-libs-container">
      <Selector
        initialYear={yearOfBirth}
        initialEntidad={ENTIDADES.find((e) => e.nombre === entidadNombre)?.cve ?? null}
        on:select={(e) => dispatch('select', e.detail)} />
    </div>

    <div class="acciones-reservadas">
      {#if tieneDatos}
        <div class="slide-actions slide-actions-left" in:fade={{ duration: DUR, delay: DUR / 2 }}>
          <button class="btn-primary" on:click={() => dispatch('advance')}>Ver la historia de mi generación</button>
        </div>
      {:else if yearOfBirth && entidadNombre}
        <p class="slide-warning" role="status" in:fade={{ duration: DUR }}>
          No encontramos datos para esa combinación. Prueba con otro año de nacimiento u otro estado.
        </p>
      {:else}
        <p class="nota-privacidad" out:fly={{ x: 120, duration: DUR }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
          <span>Tus datos se guardan solo en tu navegador.</span>
        </p>
      {/if}
    </div>
  </div>

  <div class="onboarding-map">
    <MapaMexico
      selectedState={ESTADO_CVE[entidadNombre] ?? ''}
      interactive={false}
    />
  </div>

  <aside class="story-rail" aria-label="Qué vas a ver">
    <p class="story-rail-heading">Lo que viene</p>
    <ol class="story-rail-list">
      {#each MOMENTOS as momento, i}
        <li class="story-rail-item">
          <span class="story-rail-num" aria-hidden="true">{i + 1}</span>
          <span>
            <span class="story-rail-name">{momento.nombre}</span>
            <span class="story-rail-desc">{momento.desc}</span>
          </span>
        </li>
      {/each}
    </ol>
  </aside>
</section>

<style>
  .acciones-reservadas {
    width: 100%;
    min-height: 4rem;
    display: grid;
    align-items: center;
    overflow: hidden;
  }
  .acciones-reservadas > :global(*) {
    grid-area: 1 / 1;
  }
  .nota-privacidad {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-muted);
  }
  .nota-privacidad svg {
    flex: none;
  }
</style>
