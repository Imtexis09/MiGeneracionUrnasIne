<script>
  import { onMount } from 'svelte';
  import { getLatestElection, calculateFilledSeats } from '../utils/calculos.js';
  import { generateSillaVaciaText, formatExactPercent } from '../utils/formato.js';
  import { prefersReducedMotion, getAnimationDuration } from '../utils/a11y.js';
  
  export let data = null;
  export let entidad = '';
  
  let animatedSeats = [];
  let animationComplete = false;
  
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
  
  // Animar asientos al montar o cuando cambien los datos
  $: if (latestElection && !animationComplete) {
    animateSeats();
  }
  
  function animateSeats() {
    if (prefersReducedMotion()) {
      // Sin animación: mostrar todos inmediatamente
      animatedSeats = seats.map(s => s.id);
      animationComplete = true;
      return;
    }
    
    // Con animación: llenar progresivamente
    animatedSeats = [];
    animationComplete = false;
    
    const animationDuration = getAnimationDuration(1500);
    const delayPerSeat = animationDuration / filledCount;
    
    seats.forEach((seat, index) => {
      if (seat.filled) {
        setTimeout(() => {
          animatedSeats = [...animatedSeats, seat.id];
          
          if (animatedSeats.length === filledCount) {
            animationComplete = true;
          }
        }, index * delayPerSeat);
      }
    });
  }
  
  function isSeatAnimated(seatId) {
    return animatedSeats.includes(seatId);
  }
  
  onMount(() => {
    if (latestElection) {
      animateSeats();
    }
  });

  // ¿El usuario pidió menos movimiento? Entonces no hay animación escalonada.
  $: sinMovimiento = prefersReducedMotion();
</script>

<div class="silla-vacia-container">
  <h3>La Silla Vacía</h3>
  <p class="subtitle">
    Visualización de Participación Electoral{latestElection ? ` en ${latestElection.year}` : ''}
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
        aria-label={`Grid de 100 asientos mostrando participación electoral: ${filledCount} asientos ocupados, ${100 - filledCount} asientos vacíos`}
      >
        {#each seats as seat (seat.id)}
          <div
            class="seat"
            class:filled={seat.filled && isSeatAnimated(seat.id)}
            class:empty={!seat.filled}
            class:no-motion={sinMovimiento}
            title={seat.filled ? 'Esta persona votó' : 'Esta persona no votó'}
            role="presentation"
            aria-hidden="true"
          >
            <span class="sr-only">
              {seat.filled ? 'Asiento ocupado' : 'Asiento vacío'}
            </span>
          </div>
        {/each}
      </div>
      
      <!-- 5.2 Texto descriptivo: ahora secundario, bajo el dato principal -->
      <div class="stats" role="region" aria-label="Estadísticas de participación">
        <p class="main-stat">
          <span class="stat-number">{filledCount}</span>
          <span class="stat-label">de 100 personas votaron</span>
        </p>
        <p class="exact-percentage">
          Participación exacta: <strong>{formatExactPercent(participacionPct)}</strong>
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
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
    text-align: center;
  }
  
  .subtitle {
    text-align: center;
    color: var(--color-text-secondary);
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
    background-color: var(--color-bg-section);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
  }
  
  .seat {
    aspect-ratio: 1;
    border-radius: var(--border-radius-sm);
    transition: all var(--transition-base);
    cursor: pointer;
    position: relative;
  }
  
  .seat.filled {
    background-color: var(--color-seat-filled);
    transform: scale(1);
  }
  
  .seat.empty {
    background-color: var(--color-seat-empty);
    border: 1px solid var(--color-border);
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
    animation: fillSeat 0.3s ease-out;
  }

  /* 5.4 Sin animación para quien pidió menos movimiento */
  .seat.filled.no-motion {
    animation: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .seat.filled {
      animation: none;
    }
  }
  
  /* Estadísticas */
  .stats {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-xl);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    color: white;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
  }
  
  .main-stat {
    margin-bottom: var(--spacing-md);
  }
  
  .stat-number {
    display: block;
    font-size: clamp(3rem, 10vw, 5rem);
    font-weight: 800;
    line-height: 1;
    margin-bottom: var(--spacing-sm);
  }
  
  .stat-label {
    font-size: clamp(1rem, 3vw, 1.5rem);
    opacity: 0.95;
  }
  
  .detail-stat {
    font-size: var(--font-size-sm);
    line-height: 1.55;
    opacity: 0.85;
    margin: var(--spacing-md) 0 0;
  }

  .exact-percentage {
    font-size: var(--font-size-base);
    padding-top: var(--spacing-md);
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    margin: 0;
  }
  
  .exact-percentage strong {
    font-size: var(--font-size-lg);
  }
  
  /* La leyenda se define más abajo, junto con el bloque de intro (Fase 5) */
  
  /* ===== Fase 5: clarificar la metáfora ===== */
  .intro {
    max-width: 620px;
    margin: 0 auto var(--spacing-lg);
    padding: var(--spacing-lg);
    background: var(--color-bg-section);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--color-primary);
    border-radius: var(--border-radius-lg);
    text-align: left;
  }

  .intro-text {
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .intro-text + .intro-text {
    margin-top: var(--spacing-md);
  }

  .intro-text strong {
    color: var(--color-text);
  }

  .intro-text .t-filled {
    color: var(--color-seat-filled);
  }

  .intro-text .t-empty {
    color: var(--color-text-muted);
  }

  /* 5.3 Leyenda como clave de lectura, encima del grid */
  .legend {
    display: flex;
    justify-content: center;
    gap: var(--spacing-lg);
    flex-wrap: wrap;
    margin-bottom: var(--spacing-md);
    padding: 0.85rem 1rem;
    background: var(--color-bg-section);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-lg);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
  }

  .legend-box {
    width: 20px;
    height: 20px;
    border-radius: var(--border-radius-sm);
    flex-shrink: 0;
  }

  .legend-box.filled {
    background-color: var(--color-seat-filled);
  }

  .legend-box.empty {
    background-color: var(--color-seat-empty);
    border: 1px solid var(--color-border);
  }

  .legend-item strong { color: var(--color-text); }

  .no-data {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
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
