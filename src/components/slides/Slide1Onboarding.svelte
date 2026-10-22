<script>
  /**
   * Slide 1 — Onboarding y captura de datos.
   * Recoge el año de nacimiento y el estado, y lanza la historia.
   */
  import { createEventDispatcher } from 'svelte';
  import Selector from '../Selector.svelte';
  import MapaMexico from '../MapaMexico.svelte';
  import { focusTitle } from '../../utils/focusTitle.js';

  export let yearOfBirth = null;
  export let entidadNombre = '';
  /** ¿Hay datos de cohorte para la selección actual? */
  export let tieneDatos = false;

  const dispatch = createEventDispatcher();

  /** Los cuatro momentos de la historia: es una secuencia real, por eso va numerada. */
  const MOMENTOS = [
    {
      nombre: 'Tu generación',
      desc: 'Los conteos del INE agrupan a la gente por edad. Con tu año de nacimiento sabemos qué grupo es el tuyo.'
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

  /** Mapea el nombre del estado a su clave INE (01-32) para el mapa. */
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
      <span class="gradient-text">¿Qué tan activa es tu edad en las urnas?</span>
    </h2>

    <p class="slide-lead">
      Selecciona tu año de nacimiento y tu estado para descubrirlo en menos de un minuto.
    </p>

    <div class="mad-libs-container">
      <Selector on:select={(e) => dispatch('select', e.detail)} />

      <!-- Mapa de México como referencia visual del estado seleccionado.
           No es interactivo: solo refleja la elección hecha en el select. -->
      <MapaMexico
        selectedState={ESTADO_CVE[entidadNombre] ?? ''}
        interactive={false}
      />
    </div>

    {#if tieneDatos}
      <div class="slide-actions slide-actions-left">
        <button class="btn-primary" on:click={() => dispatch('advance')}>Ver la historia de mi generación</button>
      </div>
    {:else if yearOfBirth && entidadNombre}
      <p class="slide-warning" role="status">
        No encontramos datos para esa combinación. Prueba con otro año de nacimiento u otro estado.
      </p>
    {/if}
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
