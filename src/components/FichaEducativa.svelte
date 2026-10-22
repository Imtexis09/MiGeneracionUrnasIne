<script>
  /**
   * Ficha Resumen Educativa — Material para profesores y talleres.
   *
   * Modal accesible (role="dialog", trampa de foco, Escape cierra, el foco
   * vuelve al botón que lo abrió y se bloquea el scroll de fondo).
   * Incluye un bloque imprimible con los datos del estado seleccionado y
   * preguntas disparadoras para debate grupal.
   *
   * @param {Object} cohortData - Datos de la cohorte del usuario
   * @param {string} entidad - Nombre del estado seleccionado
   * @param {number|null} yearOfBirth - Año de nacimiento del usuario
   * @param {number|null} nacionalPct - Participación nacional 2024 (%)
   * @param {number|null} deltaVsNacional - Diferencia vs promedio nacional (pp)
   */

  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { formatExactPercent } from '../utils/formato.js';
  import { getLatestElection } from '../utils/calculos.js';

  export let cohortData = null;
  export let entidad = '';
  export let yearOfBirth = null;
  export let nacionalPct = null;
  export let deltaVsNacional = null;

  const dispatch = createEventDispatcher();
  let dialogoEl;
  let botonCerrarEl;
  let elementoPrevio = null;

  const imprimir = () => window.print();

  onMount(() => {
    elementoPrevio = document.activeElement;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => botonCerrarEl?.focus());
    window.addEventListener('keydown', onKeydown);
  });

  onDestroy(() => {
    document.body.style.overflow = '';
    window.removeEventListener('keydown', onKeydown);
  });

  function onKeydown(event) {
    if (event.key === 'Escape') cerrar();
    else if (event.key === 'Tab') trapFoco(event);
  }

  function trapFoco(event) {
    if (!dialogoEl) return;
    const focusables = dialogoEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  }

  function cerrar() {
    dispatch('close');
    requestAnimationFrame(() => {
      if (elementoPrevio && elementoPrevio.isConnected !== false) {
        elementoPrevio.focus?.();
      }
    });
  }

  // Datos derivados de la cohorte
  $: latestElection = cohortData ? getLatestElection(cohortData.elections) : null;
  $: participacionPct = latestElection ? latestElection.participacion_pct : null;

  // ¿Hay datos suficientes para la tabla por elección?
  $: hayElecciones = cohortData && Array.isArray(cohortData.elections) && cohortData.elections.length > 0;

  // Preguntas disparadoras para el debate grupal (doc INE, sección 4.2).
  $: preguntas = [
    '¿Por qué creen que los jóvenes participan menos a los 23 años que a los 18?',
    `¿Qué creen que pasa entre los 18 y los 25 años que hace que la participación baje en ${entidad}?`,
    '¿Qué podría hacer su escuela, su familia o su comunidad para que votar sea un hábito desde los 18 años?',
    '¿En qué elecciones (intermedias o presidenciales) creen que más personas de su edad van a votar, y por qué?'
  ];
</script>

<div class="ficha-backdrop" on:click|self={cerrar} role="presentation">
  <div
    class="ficha-dialog"
    bind:this={dialogoEl}
    role="dialog"
    aria-modal="true"
    aria-labelledby="ficha-title"
    aria-describedby="ficha-desc"
    tabindex="-1"
  >
    <button
      class="ficha-close"
      bind:this={botonCerrarEl}
      on:click={cerrar}
      aria-label="Cerrar la ficha educativa"
    >
      <span aria-hidden="true">✕</span>
    </button>

    <!-- Encabezado de la ficha -->
    <header class="ficha-header">
      <div class="ficha-logo">
        <img
          src="/images/logo_ine2026.png"
          alt="INE 2026, Mi Generación en las Urnas"
          class="ficha-logo-img"
        />
      </div>
      <div class="ficha-marca">
        <span class="ficha-tipo">Material educativo</span>
        <h2 id="ficha-title">Ficha Resumen Educativa</h2>
      </div>
      <p id="ficha-desc" class="ficha-desc">
        Datos de tu generación y tu estado, listos para imprimir o guardar en PDF.
      </p>
    </header>

    <!-- Bloque 1: Datos clave -->
    <section class="ficha-bloque">
      <h3 class="ficha-titulo-bloque">
        <span class="ficha-num-bloque">01</span> Datos clave
      </h3>
      <div class="ficha-grid">
        <div class="ficha-dato">
          <span class="ficha-dato-valor">{yearOfBirth ?? '—'}</span>
          <span class="ficha-dato-etiqueta">Año de nacimiento</span>
        </div>
        <div class="ficha-dato">
          <span class="ficha-dato-valor">{entidad || '—'}</span>
          <span class="ficha-dato-etiqueta">Estado</span>
        </div>
        <div class="ficha-dato">
          <span class="ficha-dato-valor">
            {participacionPct !== null ? formatExactPercent(participacionPct) : '—'}
          </span>
          <span class="ficha-dato-etiqueta">Participaron en {latestElection?.year ?? '2024'}</span>
        </div>
        <div class="ficha-dato ficha-dato--diferencia">
          <span class="ficha-dato-valor" class:mayor={deltaVsNacional != null && deltaVsNacional >= 0} class:menor={deltaVsNacional != null && deltaVsNacional < 0}>
            {deltaVsNacional != null
              ? (deltaVsNacional >= 0 ? '+' : '') + deltaVsNacional.toFixed(1) + ' pp'
              : '—'}
          </span>
          <span class="ficha-dato-etiqueta">Vs. promedio del país</span>
        </div>
      </div>
    </section>

    <!-- Bloque 2: Resumen imprimible por elección -->
    <section class="ficha-bloque ficha-bloque-tabla">
      <h3 class="ficha-titulo-bloque">
        <span class="ficha-num-bloque">02</span> Participación por elección
      </h3>
      <p class="ficha-nota">
        Cada fila es una elección federal. Se sigue al grupo de edad (cohorte),
        no a las mismas personas entre una elección y otra.
      </p>
      {#if hayElecciones}
        <div class="ficha-tabla-wrap">
          <table class="ficha-tabla">
            <caption>Resultados de tu generación en {entidad}</caption>
            <thead>
              <tr>
                <th scope="col">Año</th>
                <th scope="col">Tipo</th>
                <th scope="col">Edad</th>
                <th scope="col">Participación</th>
                <th scope="col">Personas registradas</th>
                <th scope="col">Sí votaron</th>
                <th scope="col">No votaron</th>
              </tr>
            </thead>
            <tbody>
              {#each cohortData.elections as e}
                <tr class:intermedia={e.type === 'intermedia'} class:presidencial={e.type === 'presidencial'}>
                  <td>{e.year}</td>
                  <td><span class="ficha-chip-tipo">{e.type === 'presidencial' ? 'Presidencial' : 'Intermedia'}</span></td>
                  <td>{e.age_on_election} años</td>
                  <td><strong>{formatExactPercent(e.participacion_pct)}</strong></td>
                  <td>{e.lista_nominal?.toLocaleString('es-MX') ?? '—'}</td>
                  <td>{e.si_votaron?.toLocaleString('es-MX') ?? '—'}</td>
                  <td>{e.no_votaron?.toLocaleString('es-MX') ?? '—'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="ficha-vacia">No hay datos de elecciones disponibles para esta combinación.</p>
      {/if}
    </section>

    <!-- Bloque 3: Preguntas para el debate -->
    <section class="ficha-bloque ficha-bloque-debate">
      <h3 class="ficha-titulo-bloque">
        <span class="ficha-num-bloque">03</span> Preguntas para el debate grupal
      </h3>
      <ol class="ficha-preguntas">
        {#each preguntas as pregunta, i}
          <li>
            <span class="ficha-preg-num">{i + 1}</span>
            {pregunta}
          </li>
        {/each}
      </ol>
    </section>

    <!-- Pie: fuente -->
    <section class="ficha-bloque ficha-bloque-pie">
      <p class="ficha-fuente">
        Fuente: Instituto Nacional Electoral (INE), Conteos Censales de Proceso
        Constitucional (CCPC) 2009–2024. Datos abiertos.
      </p>
    </section>

    <!-- Acciones -->
    <div class="ficha-acciones">
      <button class="btn-imprimir" on:click={imprimir}>
        Imprimir o guardar la ficha en PDF
      </button>
      <button class="btn-cerrar" on:click={cerrar}>Cerrar ficha</button>
    </div>
  </div>
</div>

<style>
  .ficha-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    z-index: 3000;
  }

  .ficha-dialog {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 0;
    max-width: 760px;
    width: 100%;
    max-height: 92dvh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    text-align: left;
    color: var(--text-primary);
    display: flex;
    flex-direction: column;
  }

  .ficha-dialog:focus {
    outline: none;
  }

  .ficha-close {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
    line-height: 0;
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ficha-close:hover {
    color: var(--text-primary);
    background: var(--bg-card-hover);
  }

  .ficha-close:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }

  /* Encabezado */
  .ficha-header {
    padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-card-hover);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .ficha-logo {
    display: flex;
    justify-content: center;
  }

  .ficha-logo-img {
    width: 120px;
    height: auto;
    filter: grayscale(0%);
  }

  .ficha-marca {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }

  .ficha-tipo {
    font-family: var(--font-heading);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: var(--tracking-wide);
    color: var(--accent-pink);
    text-transform: uppercase;
  }

  .ficha-header h2 {
    font-family: var(--font-heading);
    font-size: clamp(1.5rem, 3vw, 2rem);
    margin: 0;
    color: var(--text-primary);
    letter-spacing: var(--tracking-tight);
  }

  .ficha-desc {
    color: var(--text-secondary);
    font-size: var(--font-size-base);
    line-height: 1.6;
    margin: 0;
  }

  /* Bloques */
  .ficha-bloque {
    padding: var(--spacing-xl);
    border-bottom: 1px solid var(--border-subtle);
  }

  .ficha-bloque:last-child {
    border-bottom: none;
  }

  .ficha-titulo-bloque {
    font-family: var(--font-heading);
    font-size: clamp(1.15rem, 3vw, 1.35rem);
    color: var(--text-primary);
    margin: 0 0 var(--spacing-md) 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .ficha-num-bloque {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--accent-pink);
    background: rgba(216, 0, 95, 0.1);
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-sm);
  }

  /* Datos clave */
  .ficha-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--spacing-md);
  }

  .ficha-dato {
    background: var(--bg-card-hover);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .ficha-dato--diferencia {
    border-left: 3px solid var(--accent-pink);
  }

  .ficha-dato-valor {
    display: block;
    font-family: var(--font-heading);
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--accent-pink);
    line-height: 1.2;
  }

  .ficha-dato-etiqueta {
    display: block;
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    margin-top: var(--spacing-xs);
  }

  .ficha-dato-valor.mayor { color: var(--status-success); }
  .ficha-dato-valor.menor { color: var(--status-error); }

  /* Tabla */
  .ficha-nota {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-md);
    line-height: 1.6;
  }

  .ficha-tabla-wrap {
    overflow-x: auto;
    margin-bottom: var(--spacing-md);
  }

  .ficha-tabla {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  .ficha-tabla caption {
    caption-side: top;
    text-align: left;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-base);
  }

  .ficha-tabla th,
  .ficha-tabla td {
    text-align: left;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-bottom: 1px solid var(--border-subtle);
  }

  .ficha-tabla th {
    background: var(--bg-card-hover);
    color: var(--text-primary);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ficha-tabla tbody tr:last-child td {
    border-bottom: none;
  }

  .ficha-tabla tr.intermedia td { border-left: 3px solid var(--accent-cyan); }
  .ficha-tabla tr.presidencial td { border-left: 3px solid var(--accent-pink); }

  .ficha-chip-tipo {
    display: inline-block;
    padding: 0.1rem 0.4rem;
    border-radius: var(--radius-sm);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .ficha-tabla tr.intermedia .ficha-chip-tipo {
    background: rgba(2, 132, 199, 0.1);
    color: var(--accent-cyan);
  }

  .ficha-tabla tr.presidencial .ficha-chip-tipo {
    background: rgba(216, 0, 95, 0.1);
    color: var(--accent-pink);
  }

  .ficha-vacia {
    color: var(--text-muted);
    text-align: center;
    padding: var(--spacing-xl);
  }

  /* Preguntas */
  .ficha-preguntas {
    margin: 0;
    padding-left: 0;
    list-style: none;
    color: var(--text-secondary);
    line-height: 1.8;
  }

  .ficha-preguntas li {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    padding-left: var(--spacing-md);
    border-left: 2px solid var(--border-subtle);
  }

  .ficha-preg-num {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent-pink);
    flex-shrink: 0;
  }

  /* Pie */
  .ficha-fuente {
    margin: 0;
    padding: var(--spacing-md);
    background: var(--bg-card-hover);
    border-left: 4px solid var(--accent-pink);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    line-height: 1.6;
  }

  /* Acciones */
  .ficha-acciones {
    display: flex;
    gap: var(--spacing-md);
    margin: 0;
    padding: var(--spacing-xl);
    border-top: 1px solid var(--border-subtle);
    background: var(--bg-card-hover);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }

  .btn-imprimir {
    flex: 1;
    background: var(--gradient-accent);
    color: #fff;
    border: none;
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    font-size: var(--font-size-base);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }

  .btn-imprimir:hover:not(:disabled) {
    filter: brightness(0.94);
  }

  .btn-imprimir:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }

  .btn-cerrar {
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    font-size: var(--font-size-base);
  }

  .btn-cerrar:hover {
    background: var(--bg-card-hover);
  }

  .btn-cerrar:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    .ficha-dialog { padding: 0; max-height: 95dvh; }
    .ficha-header { padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md); }
    .ficha-bloque { padding: var(--spacing-lg); }
    .ficha-acciones { padding: var(--spacing-lg); flex-direction: column; }
    .ficha-grid { grid-template-columns: 1fr 1fr; }
    .ficha-titulo-bloque { flex-direction: column; align-items: flex-start; gap: var(--spacing-xs); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ficha-backdrop { animation: none; }
  }

  /* ===== Impresión: solo la ficha, una página, diseño profesional ===== */
  @media print {
    .ficha-backdrop {
      position: static !important;
      inset: auto !important;
      background: transparent !important;
      display: block !important;
      align-items: stretch !important;
      justify-content: stretch !important;
      padding: 0 !important;
      height: auto !important;
      width: 100% !important;
      margin: 0 !important;
    }
    .ficha-dialog {
      max-height: none !important;
      overflow-y: visible !important;
      box-shadow: none !important;
      border: none !important;
      background: #fff !important;
      color: #111 !important;
      padding: 0 !important;
      width: 100% !important;
      margin: 0 !important;
      page-break-after: auto;
    }
    .ficha-close,
    .ficha-acciones,
    .no-print,
    button,
    .btn {
      display: none !important;
    }
    .ficha-header {
      background: #fff !important;
      border-bottom: 2px solid #D8005F !important;
      padding: 1.5rem 2rem 1rem !important;
      border-radius: 0 !important;
      flex-direction: column !important;
      align-items: center !important;
    }
    .ficha-logo {
      margin-bottom: 0.5rem !important;
    }
    .ficha-logo-img {
      width: 100px !important;
      filter: grayscale(80%) !important;
    }
    .ficha-header h2 {
      color: #111 !important;
    }
    .ficha-tipo {
      color: #D8005F !important;
    }
    .ficha-desc {
      color: #333 !important;
    }
    .ficha-bloque {
      background: #fff !important;
      border-bottom: 1px solid #ddd !important;
      padding: 1.5rem 2rem !important;
      page-break-inside: avoid;
    }
    .ficha-bloque:last-child {
      border-bottom: none !important;
    }
    .ficha-titulo-bloque {
      color: #111 !important;
      border-bottom: 2px solid #eee !important;
      padding-bottom: 0.5rem !important;
      margin-bottom: 1rem !important;
    }
    .ficha-num-bloque {
      color: #D8005F !important;
      background: #fdecea !important;
    }
    .ficha-dato {
      background: #f9f9f9 !important;
      border: 1px solid #ddd !important;
      color: #111 !important;
    }
    .ficha-dato-valor {
      color: #D8005F !important;
    }
    .ficha-dato-etiqueta {
      color: #555 !important;
    }
    .ficha-dato--diferencia {
      border-left: 3px solid #D8005F !important;
    }
    .ficha-tabla {
      width: 100% !important;
      border-collapse: collapse !important;
      font-size: 0.8rem !important;
    }
    .ficha-tabla caption {
      color: #111 !important;
      font-weight: 700 !important;
      margin-bottom: 0.5rem !important;
    }
    .ficha-tabla th {
      background: #eee !important;
      color: #111 !important;
      border: 1px solid #ccc !important;
    }
    .ficha-tabla td {
      border: 1px solid #ccc !important;
      color: #333 !important;
    }
    .ficha-tabla tr.intermedia .ficha-chip-tipo {
      background: #e8f4f8 !important;
      color: #0284C7 !important;
      border: 1px solid #0284C7 !important;
    }
    .ficha-tabla tr.presidencial .ficha-chip-tipo {
      background: #fdecea !important;
      color: #D8005F !important;
      border: 1px solid #D8005F !important;
    }
    .ficha-preguntas li {
      color: #333 !important;
      border-left: 2px solid #D8005F !important;
      padding-left: 0.75rem !important;
    }
    .ficha-preg-num {
      color: #D8005F !important;
    }
    .ficha-fuente {
      background: #f9f9f9 !important;
      border-left: 4px solid #D8005F !important;
      color: #555 !important;
    }
    body {
      background: #fff !important;
      color: #111 !important;
      margin: 0 !important;
    }
  }
</style>
