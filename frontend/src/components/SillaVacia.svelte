<script>
  import { getLatestElection, calculateFilledSeats } from '../utils/calculos.js';
  import { generateSillaVaciaText, formatExactPercent } from '../utils/formato.js';
  import IlustracionPersonas from './IlustracionPersonas.svelte';
  import { alVerse } from '../utils/alVerse.js';
  import { prefersReducedMotion, announceToScreenReader } from '../utils/a11y.js';

  export let data = null;
  export let entidad = '';

  $: latestElection = data ? getLatestElection(data.elections) : null;
  $: participacionPct = latestElection ? latestElection.participacion_pct : 0;
  $: filledCount = calculateFilledSeats(participacionPct);
  $: sillaVaciaText = latestElection
    ? generateSillaVaciaText(filledCount, participacionPct, entidad)
    : '';

  $: seats = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    filled: i < filledCount,
    row: Math.floor(i / 10),
    col: i % 10
  }));

  $: sinMovimiento = prefersReducedMotion();

  $: retardoAsiento = filledCount > 0 ? Math.min(110, 4500 / filledCount) : 0;
  const INICIO = 250;

  function rotacion(id) {
    return (((id * 37) % 11) - 5) * 2.2;
  }

  function dibujar(nodo, { n, T, sin }) {
    const mostrar = () => nodo.classList.add('visible');
    if (sin || n <= 0 || typeof nodo.animate !== 'function') { mostrar(); return {}; }
    const lapiz = nodo.querySelector('.lapiz');
    const casillas = nodo.querySelectorAll('.seat.filled');
    if (!lapiz || !casillas.length) { mostrar(); return {}; }

    const tam = Math.max(90, casillas[0].offsetWidth * 4.2);
    lapiz.style.width = lapiz.style.height = `${tam}px`;
    const puntaX = (6 / 64) * tam;
    const puntaY = (58 / 64) * tam;

    const D = INICIO + n * T + 300;
    const pos = (c, fx, fy) => {
      const x = c.offsetLeft + c.offsetWidth * fx - puntaX;
      const y = c.offsetTop + c.offsetHeight * fy - puntaY;
      return `translate(${x}px, ${y}px) rotate(0deg)`;
    };
    const frame = (ms, transform, opacity = 1) => ({ offset: Math.min(1, ms / D), transform, opacity });

    const primera = casillas[0];
    const ultima = casillas[casillas.length - 1];
    const desplazar = (transform, dx, dy) => transform.replace(
      /translate\(([-\d.]+)px, ([-\d.]+)px\)/,
      (_, x, y) => `translate(${+x + dx}px, ${+y + dy}px)`
    );
    const frames = [frame(0, desplazar(pos(primera, 0.2, 0.22), -50, 40), 0)];
    casillas.forEach((c, i) => {
      const t0 = INICIO + i * T;
      frames.push(frame(t0, pos(c, 0.2, 0.22)));
      frames.push(frame(t0 + T * 0.42, pos(c, 0.8, 0.8)));
      frames.push(frame(t0 + T * 0.5, pos(c, 0.8, 0.18)));
      frames.push(frame(t0 + T * 0.92, pos(c, 0.18, 0.84)));
    });
    frames.push(frame(D, desplazar(pos(ultima, 0.18, 0.84), 50, 40), 0));

    const anim = lapiz.animate(frames, { duration: D, easing: 'linear', fill: 'both' });
    anim.pause();
    const observador = alVerse(nodo, {
      umbral: 0.4,
      alVerse: () => { mostrar(); anim.play(); }
    });
    return { destroy() { observador.destroy?.(); anim.cancel(); } };
  }

  function retardoEntrada(seat) {
    if (sinMovimiento) return null;
    if (seat.filled) return `--d: ${Math.round(INICIO + seat.id * retardoAsiento)}ms; --t: ${Math.round(retardoAsiento * 0.42)}ms; --r: ${rotacion(seat.id)}deg`;
    return null;
  }
</script>

<div class="silla">
  {#if latestElection}
    <figure class="boleta hoja">
      {#key `${entidad}|${data.year_of_birth_min}|${filledCount}`}
      <div
        class="seats-grid"
        role="img"
        aria-label={`Gráfica de 100 casillas: ${filledCount} votaron, ${100 - filledCount} no votaron`}
        use:dibujar={{ n: filledCount, T: retardoAsiento, sin: sinMovimiento }}
      >
        {#each seats as seat (seat.id)}
          <button
            class="seat"
            class:filled={seat.filled}
            class:empty={!seat.filled}
            class:no-motion={sinMovimiento}
            style={retardoEntrada(seat) ?? `--r: ${rotacion(seat.id)}deg`}
            aria-label={`Casilla ${seat.id + 1}: ${seat.filled ? 'votó' : 'no votó'}`}
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

        {#if !sinMovimiento && filledCount > 0}
          <svg class="lapiz" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <g transform="translate(6 58) rotate(-49)" stroke="#000000" stroke-width="0.8" stroke-linejoin="round" stroke-linecap="round">
              <polygon points="0,0 14,-5 14,5" fill="#f2c9a6" />
              <polygon points="0,0 4.6,-1.65 4.6,1.65" fill="#2a0f33" />
              <rect x="14" y="-5" width="48" height="10" fill="var(--accent-pink)" />
              <line x1="14" y1="0" x2="62" y2="0" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.2" />
              <rect x="62" y="-5" width="9" height="10" fill="#c9ced6" />
              <line x1="65" y1="-5" x2="65" y2="5" stroke-width="0.6" />
              <line x1="68" y1="-5" x2="68" y2="5" stroke-width="0.6" />
              <rect x="71" y="-5" width="8" height="10" rx="2.5" fill="#f4a3c4" />
            </g>
          </svg>
        {/if}
      </div>
      {/key}

      <figcaption class="talon">
        La silla vacía: {data.year_of_birth_min}–{data.year_of_birth_max}, {entidad}, {latestElection.year}
      </figcaption>
    </figure>

    <div class="lectura">
      <div class="stats-fila">
        <div class="stats" role="region" aria-label="Estadísticas de participación">
          <p class="main-stat">
            <span class="stat-number">{filledCount}</span>
            <span class="stat-label">de 100 personas votaron</span>
          </p>
          <p class="exact-percentage">
            Resultado exacto: <strong>{formatExactPercent(participacionPct)}</strong>
          </p>
        </div>

        <div class="stats-art" aria-hidden="true">
          <IlustracionPersonas />
        </div>
      </div>

      <div class="legend" role="group" aria-label="Leyenda">
        <div class="legend-item">
          <span class="casilla marcada" aria-hidden="true"></span>
          <span>Votó <strong>({filledCount})</strong></span>
        </div>
        <div class="legend-item">
          <span class="casilla" aria-hidden="true"></span>
          <span>No votó <strong>({100 - filledCount})</strong></span>
        </div>
      </div>

      <div class="intro">
        <p class="intro-text">
          Estas <strong>100 casillas</strong> representan a <strong>100 personas</strong> de tu generación
          (nacidas entre <strong>{data.year_of_birth_min} y {data.year_of_birth_max}</strong>) que viven en
          <strong>{entidad}</strong>, en <strong>{latestElection.year}</strong>.
        </p>
        <p class="intro-text detail-stat">{sillaVaciaText}</p>
      </div>
    </div>
  {:else}
    <div class="no-data">
      <p>No hay datos disponibles para mostrar la visualización.</p>
    </div>
  {/if}
</div>

<style>
  .silla {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: clamp(2rem, 6vw, 5.5rem);
    row-gap: 2rem;
    align-items: start;
    width: 100%;
  }

  .boleta {
    margin: 0;
    width: 100%;
    max-width: 44rem;
  }

  .seats-grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: clamp(5px, 1.2vw, 9px);
    padding: clamp(0.9rem, 3vw, 1.5rem);
  }

  .lapiz {
    position: absolute;
    left: 0;
    top: 0;
    overflow: visible;
    pointer-events: none;
    z-index: 2;
    opacity: 0;
    will-change: transform, opacity;
    filter: drop-shadow(0 3px 2px rgba(0, 0, 0, 0.25));
  }

  .seat {
    position: relative;
    aspect-ratio: 1;
    padding: 0;
    border-radius: 2px;
    cursor: default;
    color: var(--accent-pink);
    border: 1.5px solid var(--rule-strong);
    background: var(--bg-main);
  }

  .seat.filled {
    border-color: var(--rule-strong);
    background: var(--bg-card);
    animation: marcar 0.15s ease-out backwards;
    animation-delay: var(--d, 0ms);
    animation-play-state: paused;
  }

  .seat.filled::before,
  .seat.filled::after {
    content: '';
    position: absolute;
    inset: 6%;
    background: currentColor;
    transform: rotate(var(--r, 0deg));
    animation-duration: var(--t, 0.2s);
    animation-timing-function: cubic-bezier(0.4, 0, 0.3, 1);
    animation-fill-mode: backwards;
    animation-play-state: paused;
  }

  .seats-grid:global(.visible) .seat.filled,
  .seats-grid:global(.visible) .seat.filled::before,
  .seats-grid:global(.visible) .seat.filled::after {
    animation-play-state: running;
  }

  .seat.filled::before {
    -webkit-mask: var(--tache-1) center / contain no-repeat;
    mask: var(--tache-1) center / contain no-repeat;
    animation-name: trazo-1;
    animation-delay: var(--d, 0ms);
  }

  .seat.filled::after {
    -webkit-mask: var(--tache-2) center / contain no-repeat;
    mask: var(--tache-2) center / contain no-repeat;
    animation-name: trazo-2;
    animation-delay: calc(var(--d, 0ms) + var(--t, 0.2s) * 1.19);
  }

  .seat:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
    z-index: 1;
  }

  @keyframes marcar {
    from {
      border-color: var(--rule-strong);
      background: var(--bg-main);
    }
  }

  .seat.no-motion,
  .seat.no-motion::before,
  .seat.no-motion::after {
    animation: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .seat,
    .seat::before,
    .seat::after {
      animation: none !important;
    }
  }

  .talon {
    padding: 0.85rem clamp(0.9rem, 3vw, 1.5rem) 1rem;
    border-top: 2px dashed var(--rule-strong);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .lectura {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    min-width: 0;
  }

  .stats-fila {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    column-gap: clamp(1.25rem, 3vw, 2.5rem);
    row-gap: 1.5rem;
  }

  .stats-art {
    flex: 1 1 16rem;
    min-width: 0;
    padding-bottom: 0.25rem;
  }

  .main-stat {
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .stat-number {
    font-family: var(--font-display);
    font-size: clamp(7rem, 16vw, 18rem);
    font-weight: 900;
    line-height: 0.8;
    letter-spacing: -0.02em;
    color: var(--accent-pink);
    font-variant-numeric: lining-nums tabular-nums;
  }

  .stat-label {
    margin-top: 0.75rem;
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 3vw, 2.1rem);
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
  }

  .exact-percentage {
    margin: 0.9rem 0 0;
    color: var(--text-secondary);
  }

  .exact-percentage strong {
    color: var(--text-primary);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1.75rem;
    padding: 1rem 0;
    border-top: 1.5px solid var(--rule-strong);
    border-bottom: 1px solid var(--line);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--text-secondary);
  }

  .intro {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    max-width: 44rem;
  }

  .intro-text {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
  }

  .detail-stat {
    font-size: 0.925rem;
    color: var(--text-muted);
  }

  .no-data {
    grid-column: 1 / -1;
    padding: 2rem 0;
    color: var(--text-secondary);
  }

  @media (max-width: 860px) {
    .silla {
      grid-template-columns: minmax(0, 1fr);
    }

    .boleta {
      max-width: 33rem;
    }
  }
</style>
