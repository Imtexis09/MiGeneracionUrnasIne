<script>
  import { getLatestElection, calculateFilledSeats } from '../utils/calculos.js';
  import { generateSillaVaciaText, formatExactPercent } from '../utils/formato.js';
  import { prefersReducedMotion, announceToScreenReader } from '../utils/a11y.js';

  export let data = null;
  export let entidad = '';

  $: latestElection = data ? getLatestElection(data.elections) : null;
  $: participacionPct = latestElection ? latestElection.participacion_pct : 0;
  $: filledCount = calculateFilledSeats(participacionPct);
  $: sillaVaciaText = latestElection
    ? generateSillaVaciaText(filledCount, participacionPct, entidad)
    : '';

  // Generar 100 asientos
  $: seats = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    filled: i < filledCount,
    row: Math.floor(i / 10),
    col: i % 10
  }));

  // ¿El usuario pidió menos movimiento? Entonces no hay animación escalonada.
  $: sinMovimiento = prefersReducedMotion();

  // El color de cada asiento se deriva SIEMPRE de `seat.filled`; la animación de
  // entrada se hace por CSS con un retardo escalonado. Así los asientos nunca
  // quedan sin pintar al cambiar de cohorte (arreglo del bug de re-animación).
  $: retardoAsiento = filledCount > 0 ? Math.min(30, 900 / filledCount) : 0;

  // Retardo propio de los asientos grises (los que no votan): aparecen
  // DESPUÉS de todos los que sí votaron, con un desfase sutil y escalonado.
  $: retardoVacio = (100 - filledCount) > 0 ? Math.min(8, 600 / (100 - filledCount)) : 0;
  $: finColor = filledCount * retardoAsiento;

  /**
   * Retardo de entrada de un asiento (declaración CSS completa).
   * @param {Object} seat
   * @returns {string|null} valor para el atributo `style` o null si no hay animación
   */
  function retardoEntrada(seat) {
    if (sinMovimiento) return null;
    if (seat.filled) return `animation-delay: ${seat.id * retardoAsiento}ms`;
    return `animation-delay: ${finColor + (100 - seat.id) * retardoVacio}ms`;
  }
</script>

<div class="silla-vacia-container">
  <h3>La Silla Vacía</h3>
  <p class="subtitle">
    Quiénes de tu generación fueron a votar{latestElection ? ` en ${latestElection.year}` : ''}
  </p>

  {#if latestElection}
    <!-- 5.1 Texto explicativo arriba: qué representa la metáfora -->
    <div class="intro">
      <p class="intro-text">
        Estos <strong>100 asientos</strong> representan a <strong>100 personas</strong> de tu generación
        (nacidas entre <strong>{data.year_of_birth_min} y {data.year_of_birth_max}</strong>) que viven en
        <strong>{entidad}</strong> en <strong>{latestElection.year}</strong>.
      </p>
      <p class="intro-text">
        Cada asiento representa una persona. Los <strong class="t-filled">colores</strong> son quienes dejaron su voto
        en la urna; los <strong class="t-empty">gris</strong> se quedaron sin votar.
      </p>
    </div>

    <!-- 5.3 Leyenda de colores, arriba del grid como clave de lectura -->
    <div class="legend" role="group" aria-label="Leyenda de colores">
      <div class="legend-item">
        <span class="legend-box filled" aria-hidden="true"></span>
        <span>Votó <strong>({filledCount})</strong></span>
      </div>
      <div class="legend-item">
        <span class="legend-box empty" aria-hidden="true"></span>
        <span>No votó <strong>({100 - filledCount})</strong></span>
      </div>
    </div>

    <div class="visualization">
      <!-- Grid de 100 asientos (10x10) -->
      <div
        class="seats-grid"
        role="img"
        aria-label={`Gráfica de 100 asientos: ${filledCount} votaron, ${100 - filledCount} no votaron`}
      >
        {#each seats as seat (seat.id)}
          <button
            class="seat"
            class:filled={seat.filled}
            class:empty={!seat.filled}
            class:no-motion={sinMovimiento}
            style={retardoEntrada(seat)}
            aria-label={`Asiento {seat.id + 1}: ${seat.filled ? 'votó' : 'no votó'}`}
            on:keydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                announceToScreenReader(
                  seat.filled ? 'Esta persona votó' : 'Esta persona no votó',
                  'polite'
                );
              }
            }}
          ></button>
        {/each}
      </div>

      <!-- 5.2 Texto descriptivo: ahora secundario, bajo el dato principal -->
      <div class="stats" role="region" aria-label="Estadísticas de participación">
        <p class="main-stat">
          <span class="stat-number">{filledCount}</span>
          <span class="stat-label">de 100 personas votaron</span>
        </p>
        <p class="exact-percentage">
          Resultado exacto: <strong>{formatExactPercent(participacionPct)}</strong>
        </p>
        <p class="detail-stat">
          {sillaVaciaText}
        </p>
      </div>
    </div>
  {:else}
    <div class="no-data">
      <p>No hay datos disponibles para mostrar la visualización.</p>
    </div>
  {/if}
</div>

<style>
  .silla-vacia-container {
    padding: var(--spacing-lg);
  }

  .silla-vacia-container h3 {
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    color: var(--accent-pink);
    margin-bottom: var(--spacing-sm);
    text-align: center;
  }

  .subtitle {
    text-align: center;
    color: var(--text-secondary);
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-xl);
  }

  .visualization {
    max-width: 560px;
    margin: 0 auto;
  }

  /* Grid de asientos (10x10) */
  .seats-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 6px;
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background-color: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    /* Matriz 10x10 también en móvil: el ancho nunca depende del viewport */
    width: 100%;
    max-width: 360px;
    margin-inline: auto;
  }

  .seat {
    aspect-ratio: 1;
    border-radius: var(--radius-sm);
    transition: all var(--transition-base);
    cursor: pointer;
    position: relative;
    /* Reset de button nativo para que solo las clases filled/empty definan el aspecto */
    border: none;
    background: none;
    padding: 0;
    font: inherit;
    color: inherit;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  .seat.filled {
    background-color: var(--status-voted);
    border: 2.5px solid #FFFFFF;
    transform: scale(1);
    box-shadow: 0 0 0 2px var(--status-voted);
  }

  .seat.empty {
    background-color: var(--status-absent);
    border: 2px dashed rgba(255, 255, 255, 0.35);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  }

  .seat.empty:focus-visible,
  .seat.filled:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }

  .seat:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-sm);
  }

  @media (prefers-reduced-motion: reduce) {
    .seat {
      transition: none;
    }

    .seat:hover {
      transform: none;
    }
  }

  /* Animación de llenado */
  @keyframes fillSeat {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .seat.filled {
    animation: fillSeat 0.3s ease-out backwards;
  }

  /* Los asientos grises (quienes no votan) también entran con animación:
     aparecen después de los de color, con un retardo sutil escalonado
     (el retardo se calcula en el script y se aplica como `animation-delay`). */
  .seat.empty {
    animation: fillSeat 0.3s ease-out backwards;
  }

  /* 5.4 Sin animación para quien pidió menos movimiento */
  .seat.filled.no-motion,
  .seat.empty.no-motion {
    animation: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .seat.filled,
    .seat.empty {
      animation: none;
    }
  }

  /* Estadísticas
     El bloque es un dato, no una postal: una superficie de dato (--panel-bg)
     para que el texto pequeño siga cumpliendo el contraste AA. El color sale
     del sistema de tokens, así que el bloque cambia con el tema (oscuro /
     luminoso) sin duplicar reglas ni dejar colores sueltos. */
  .stats {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-xl) var(--spacing-lg);
    background: var(--panel-bg);
    border: 1px solid var(--border-subtle);
    border-left: 3px solid var(--accent-pink);
    border-radius: var(--radius-md);
    color: var(--text-primary);
  }

  .main-stat {
    margin-bottom: var(--spacing-md);
  }

  .stat-number {
    display: block;
    font-family: var(--font-heading);
    font-size: clamp(3rem, 10vw, 5rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: var(--tracking-tight);
    color: var(--accent-pink);
    margin-bottom: var(--spacing-sm);
  }

  .stat-label {
    display: block;
    font-size: clamp(1rem, 3vw, 1.4rem);
    font-weight: 500;
    color: var(--text-primary);
  }

  .detail-stat {
    font-size: var(--font-size-sm);
    line-height: 1.55;
    color: var(--text-secondary);
  }

  .exact-percentage {
    font-size: var(--font-size-base);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--line);
    margin: 0;
    color: var(--text-secondary);
  }

  .exact-percentage strong {
    font-family: var(--font-heading);
    font-size: var(--font-size-lg);
    color: var(--text-primary);
  }

  /* La leyenda se define más abajo, junto con el bloque de intro (Fase 5) */

  /* ===== Fase 5: clarificar la metáfora =====
     El bloque es texto explicativo, no una tarjeta: va con filete y sin
     caja, para que el único panel con peso sea el de las cifras. */
  .intro {
    max-width: 620px;
    margin: 0 auto var(--spacing-lg);
    padding: 0 0 0 var(--spacing-md);
    border-left: 2px solid var(--accent-pink);
    text-align: left;
  }

  .intro-text {
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0;
  }

  .intro-text + .intro-text {
    margin-top: var(--spacing-md);
  }

  .intro-text strong {
    color: var(--text-primary);
  }

  .intro-text .t-filled {
    color: var(--status-voted);
  }

  .intro-text .t-empty {
    color: var(--text-muted);
  }

  /* 5.3 Leyenda como clave de lectura: en línea, sin caja */
  .legend {
    display: flex;
    justify-content: center;
    gap: var(--spacing-lg);
    flex-wrap: wrap;
    margin-bottom: var(--spacing-md);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-base);
    color: var(--text-secondary);
  }

  .legend-box {
    width: 20px;
    height: 20px;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }

  .legend-box.filled {
    background-color: var(--status-voted);
  }

  .legend-box.empty {
    background-color: var(--status-absent);
    border: 1px solid var(--border-subtle);
  }

  .legend-item strong { color: var(--text-primary); }

  .no-data {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--text-secondary);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .seats-grid {
      gap: 4px;
      padding: var(--spacing-md);
    }
  }

  @media (min-width: 768px) {
    .seats-grid {
      gap: 8px;
    }
  }
</style>
