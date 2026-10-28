<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { formatExactPercent } from '../utils/formato.js';
  import { getLatestElection } from '../utils/calculos.js';

  export let cohortData = null;
  export let entidad = '';
  export let yearOfBirth = null;
  export let deltaVsNacional = null;

  const dispatch = createEventDispatcher();
  let dialogoEl;
  let botonCerrarEl;
  let elementoPrevio = null;
  const temaClaro = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';

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

  $: latestElection = cohortData ? getLatestElection(cohortData.elections) : null;
  $: participacionPct = latestElection ? latestElection.participacion_pct : null;

  $: hayElecciones = cohortData && Array.isArray(cohortData.elections) && cohortData.elections.length > 0;

  $: ordenadas = hayElecciones ? [...cohortData.elections].sort((x, y) => x.year - y.year) : [];
  $: primera = ordenadas[0] || null;
  $: ultima = ordenadas[ordenadas.length - 1] || null;
  $: hayCambio = primera && ultima && primera.year !== ultima.year;
  $: tendencia = !hayCambio ? 'cambia'
    : ultima.participacion_pct > primera.participacion_pct ? 'suba' : 'baje';

  $: preguntas = [
    hayCambio
      ? `En ${entidad}, esta generación votó ${formatExactPercent(primera.participacion_pct)} a los ${primera.age_on_election} años y ${formatExactPercent(ultima.participacion_pct)} a los ${ultima.age_on_election}. ¿Por qué creen que cambió?`
      : '¿Qué creen que influye para que una generación participe más o menos en las elecciones?',
    hayCambio
      ? `¿Qué creen que pasa entre los ${primera.age_on_election} y los ${ultima.age_on_election} años que hace que la participación ${tendencia} en ${entidad}?`
      : `¿Qué creen que pasa en ${entidad} que hace que la participación de los jóvenes ${tendencia}?`,
    '¿Qué podría hacer su escuela, su familia o su comunidad para que votar sea un hábito desde los 18 años?',
    '¿En qué elecciones (intermedias o presidenciales) creen que más personas de su edad van a votar, y por qué?'
  ];
</script>

<div class="ficha-backdrop" on:click|self={cerrar} role="presentation">
  <div
    class="ficha-dialog hoja"
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

    <header class="ficha-header">
      <div class="ficha-logo">
        <img
          src="/images/logo_inev3.webp"
          alt="Instituto Nacional Electoral (INE) 2026, Mi Generación en las Urnas"
          class="ficha-logo-img logo-pantalla"
          class:logo-blanco={!temaClaro}
        />
        <img
          src="/images/logo_inev3.webp"
          alt=""
          aria-hidden="true"
          class="ficha-logo-img logo-impresion"
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

    <section class="ficha-bloque">
      <h3 class="ficha-titulo-bloque">
        Datos clave
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
              ? (deltaVsNacional >= 0 ? '+' : '') + deltaVsNacional.toFixed(1) + ' puntos porcentuales'
              : '—'}
          </span>
          <span class="ficha-dato-etiqueta">Comparado con el promedio del país</span>
        </div>
      </div>
    </section>

    <section class="ficha-bloque ficha-bloque-tabla">
      <h3 class="ficha-titulo-bloque">
        Participación por elección
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

    <section class="ficha-bloque ficha-bloque-debate">
      <h3 class="ficha-titulo-bloque">
        Preguntas para el debate grupal
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

    <section class="ficha-bloque ficha-bloque-pie">
      <p class="ficha-fuente">
        Fuente: Instituto Nacional Electoral (INE), Conteos Censales de Proceso
        Constitucional (CCPC) 2009–2024. Datos abiertos.
      </p>
    </section>

    <div class="ficha-acciones">
      <button class="btn-primary btn-imprimir" on:click={imprimir}>
        Imprimir o guardar la ficha en PDF
      </button>
      <button class="btn-back btn-cerrar" on:click={cerrar}>Cerrar ficha</button>
    </div>
  </div>
</div>

<style>
  .ficha-backdrop {
    position: fixed;
    inset: 0;
    background: var(--backdrop);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    z-index: 3000;
  }

  .ficha-dialog {
    position: relative;
    max-width: 48rem;
    width: 100%;
    max-height: 92dvh;
    overflow-y: auto;
    text-align: left;
    display: flex;
    flex-direction: column;
  }

  .ficha-dialog:focus {
    outline: none;
  }

  .ficha-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    line-height: 1;
    color: var(--text-primary);
  }

  .ficha-close:hover {
    color: var(--accent-pink);
  }

  .ficha-header {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 1.75rem 2rem 1.5rem;
    border-bottom: 1.5px solid var(--rule-strong);
  }

  .ficha-logo-img {
    width: 110px;
    height: auto;
  }

  .logo-impresion {
    display: none;
  }

  .logo-blanco {
    filter: brightness(0) invert(1);
  }

  .ficha-marca {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .ficha-tipo {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--accent-pink);
  }

  .ficha-marca h2 {
    font-size: clamp(2.2rem, 5vw, 3rem);
    line-height: 0.95;
    margin: 0;
  }

  .ficha-desc {
    margin: 0;
    max-width: var(--measure);
  }

  .ficha-bloque {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--line);
  }

  .ficha-titulo-bloque {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 1rem;
  }

  .ficha-nota {
    max-width: var(--measure);
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }

  .ficha-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-top: 1.5px solid var(--rule-strong);
  }

  .ficha-dato {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.9rem 0.9rem 0.4rem 0;
  }

  .ficha-dato + .ficha-dato {
    padding-left: 0.9rem;
    border-left: 1px solid var(--line);
  }

  .ficha-dato-valor {
    order: 1;
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.05;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }

  .ficha-dato-valor.menor {
    color: var(--status-error);
  }

  .ficha-dato-valor.mayor {
    color: var(--status-success);
  }

  .ficha-dato-etiqueta {
    order: 2;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .ficha-tabla-wrap {
    overflow-x: auto;
  }

  .ficha-tabla {
    min-width: 34rem;
    font-size: 0.9rem;
  }

  .ficha-tabla caption {
    padding: 0 0 0.6rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .ficha-tabla th {
    padding: 0.55rem 0.7rem 0.55rem 0;
    text-align: left;
    font-weight: 700;
    color: var(--text-secondary);
    border-bottom: 1.5px solid var(--rule-strong);
    background: none;
  }

  .ficha-tabla td {
    padding: 0.6rem 0.7rem 0.6rem 0;
    border-bottom: 1px solid var(--line);
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  .ficha-chip-tipo {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  tr.presidencial .ficha-chip-tipo {
    color: var(--accent-pink);
  }

  tr.intermedia .ficha-chip-tipo {
    color: var(--accent-cyan);
  }

  .ficha-vacia {
    color: var(--text-muted);
  }

  .ficha-preguntas {
    list-style: none;
    display: grid;
    gap: 0.9rem;
  }

  .ficha-preguntas li {
    display: grid;
    grid-template-columns: 2.25rem minmax(0, 1fr);
    gap: 0.5rem;
    color: var(--text-primary);
    line-height: 1.5;
  }

  .ficha-preg-num {
    font-family: var(--font-display);
    font-size: 1.9rem;
    font-weight: 800;
    line-height: 0.95;
    color: var(--accent-pink);
  }

  .ficha-bloque-pie {
    border-bottom: none;
  }

  .ficha-fuente {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 0;
  }

  .ficha-acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 1.25rem 2rem 1.75rem;
    border-top: 1.5px solid var(--rule-strong);
  }

  @media (max-width: 640px) {
    .ficha-header,
    .ficha-bloque,
    .ficha-acciones {
      padding-left: 1.25rem;
      padding-right: 1.25rem;
    }

    .ficha-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ficha-dato:nth-child(3) {
      padding-left: 0;
      border-left: none;
    }

    .ficha-acciones > button {
      flex: 1 1 100%;
    }
  }

  @media print {
    @page {
      size: letter portrait;
      margin: 11mm 13mm;
    }

    :global(html),
    :global(body) {
      height: auto !important;
      overflow: visible !important;
      background: #fff !important;
    }

    :global(.app-wrapper) {
      display: none !important;
    }

    .ficha-backdrop,
    .ficha-dialog {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .ficha-backdrop {
      position: static !important;
      display: block !important;
      padding: 0 !important;
      background: none !important;
      height: auto !important;
    }

    .ficha-dialog {
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      max-height: none !important;
      overflow: visible !important;
      border: 0 !important;
      box-shadow: none !important;
      background: #fff !important;
      color: #24102c !important;
      font-size: 10.5pt;
      line-height: 1.4;
    }

    .ficha-dialog :global(*) {
      color: inherit;
    }

    .ficha-close,
    .ficha-acciones {
      display: none !important;
    }

    .ficha-header {
      display: grid !important;
      grid-template-columns: auto 1fr;
      grid-template-areas:
        'logo marca'
        'logo desc';
      column-gap: 5mm;
      row-gap: 1mm;
      align-items: center;
      padding: 0 0 5mm !important;
      border-bottom: 1.2pt solid #24102c !important;
    }

    .ficha-logo {
      grid-area: logo;
    }

    .ficha-logo-img {
      width: 30mm !important;
      filter: none;
    }

    .logo-pantalla {
      display: none !important;
    }

    .logo-impresion {
      display: block !important;
    }

    .ficha-marca {
      grid-area: marca;
      flex-direction: row;
      align-items: baseline;
      gap: 3mm;
    }

    .ficha-marca h2 {
      font-size: 30pt !important;
      color: #24102c !important;
    }

    .ficha-tipo {
      font-size: 8pt;
      color: #c70a6e !important;
    }

    .ficha-desc {
      grid-area: desc;
      font-size: 10pt;
      color: #46344e !important;
      max-width: none;
    }

    .ficha-bloque {
      padding: 6mm 0 !important;
      border-bottom: 0.6pt solid rgba(36, 16, 44, 0.3) !important;
      break-inside: avoid;
    }

    .ficha-bloque-pie {
      padding-bottom: 0 !important;
      border-bottom: 0 !important;
    }

    .ficha-titulo-bloque {
      font-size: 19pt !important;
      margin-bottom: 3mm !important;
      color: #24102c !important;
    }

    .ficha-nota {
      font-size: 9.5pt;
      margin-bottom: 3mm !important;
      color: #46344e !important;
    }

    .ficha-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      border-top: 1.2pt solid #24102c !important;
    }

    .ficha-dato {
      padding: 3mm 2mm 0 0 !important;
    }

    .ficha-dato + .ficha-dato {
      padding-left: 2.5mm !important;
      border-left: 0.6pt solid rgba(36, 16, 44, 0.3) !important;
    }

    .ficha-dato-valor {
      font-size: 22pt !important;
    }

    .ficha-dato-valor.menor {
      color: #b42318 !important;
    }

    .ficha-dato-valor.mayor {
      color: #0b7a52 !important;
    }

    .ficha-dato-etiqueta {
      font-size: 9pt;
      color: #46344e !important;
    }

    .ficha-tabla-wrap {
      overflow: visible !important;
    }

    .ficha-tabla {
      min-width: 0 !important;
      font-size: 9.5pt !important;
    }

    .ficha-tabla caption {
      font-size: 9.5pt;
      padding-bottom: 2mm !important;
      background: none !important;
      color: #46344e !important;
    }

    .ficha-tabla th {
      padding: 1.5mm 2mm 1.5mm 0 !important;
      background: none !important;
      color: #46344e !important;
      border-bottom: 1.2pt solid #24102c !important;
    }

    .ficha-tabla td {
      padding: 2.2mm 2mm 2.2mm 0 !important;
      border-bottom: 0.6pt solid rgba(36, 16, 44, 0.3) !important;
    }

    .ficha-chip-tipo {
      font-size: 9pt;
    }

    tr.presidencial .ficha-chip-tipo {
      color: #c70a6e !important;
    }

    tr.intermedia .ficha-chip-tipo {
      color: #0b7a85 !important;
    }

    .ficha-preguntas {
      grid-template-columns: 1fr 1fr;
      gap: 4mm 8mm !important;
    }

    .ficha-preguntas li {
      grid-template-columns: 8mm minmax(0, 1fr);
      gap: 1.5mm;
      font-size: 10pt;
      line-height: 1.35;
      break-inside: avoid;
    }

    .ficha-preg-num {
      font-size: 20pt !important;
      color: #c70a6e !important;
    }

    .ficha-fuente {
      font-size: 8.5pt;
      color: #665470 !important;
    }
  }
</style>
