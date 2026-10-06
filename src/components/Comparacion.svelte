<script>
  import { compareGenerationsAtSameAge, getLatestElection } from '../utils/calculos.js';
  import { generateComparisonText, formatExactPercent } from '../utils/formato.js';

  export let data = null;
  export let allData = null;
  export let yearOfBirth = null;

  $: latestElection = data ? getLatestElection(data.elections) : null;
  $: comparison = (data && allData && yearOfBirth && latestElection)
    ? compareGenerationsAtSameAge(data, allData, yearOfBirth, latestElection.age_on_election)
    : null;
  $: comparisonText = comparison ? generateComparisonText(comparison) : '';
</script>

<div class="comparacion-container">
  <h3>Comparación Generacional</h3>
  
  {#if comparison && comparison.current}
    <div class="comparison-card">
      <div class="comparison-icon">
        📊
      </div>
      
      <div class="comparison-content">
        <p class="comparison-text" role="article" aria-label="Resultado de comparación generacional">
          {comparisonText}
        </p>
        
        {#if comparison.previous && comparison.previous.length > 0}
          <div class="comparison-details">
            <h4>Evolución Histórica</h4>
            <div class="timeline">
              {#each comparison.previous as prev}
                <div class="timeline-item">
                  <span class="timeline-year">{prev.year}</span>
                  <span class="timeline-age">Edad {prev.age}</span>
                  <span class="timeline-participation">{formatExactPercent(prev.participacion)}</span>
                </div>
              {/each}
              <div class="timeline-item current">
                <span class="timeline-year">{comparison.current.year}</span>
                <span class="timeline-age">Edad {comparison.current.age}</span>
                <span class="timeline-participation">
                  <strong>{formatExactPercent(comparison.current.participacion)}</strong>
                </span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
    
    <div class="comparison-note">
      <p>
        💡 <strong>¿Qué significa esto?</strong> Esta comparación muestra cómo tu generación 
        participó a una edad específica, comparada con generaciones anteriores cuando tenían 
        la misma edad en elecciones del mismo tipo ({comparison.type}).
      </p>
    </div>
  {:else}
    <div class="no-comparison">
      <p>No hay suficientes datos históricos para realizar una comparación generacional.</p>
    </div>
  {/if}
</div>

<style>
  .comparacion-container {
    padding: var(--spacing-lg);
  }
  
  .comparacion-container h3 {
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    color: var(--color-primary);
    margin-bottom: var(--spacing-lg);
    text-align: center;
  }
  
  .comparison-card {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--border-radius-lg);
    border-left: 6px solid var(--color-primary);
    box-shadow: var(--shadow-md);
  }
  
  @media (min-width: 768px) {
    .comparison-card {
      flex-direction: row;
      align-items: flex-start;
    }
  }
  
  .comparison-icon {
    font-size: 3rem;
    text-align: center;
    flex-shrink: 0;
  }
  
  .comparison-content {
    flex: 1;
  }
  
  .comparison-text {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    line-height: 1.7;
    color: var(--color-text);
    margin-bottom: var(--spacing-lg);
  }
  
  .comparison-details {
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 2px solid var(--color-border);
  }
  
  .comparison-details h4 {
    font-size: var(--font-size-lg);
    color: var(--color-primary);
    margin-bottom: var(--spacing-md);
  }
  
  .timeline {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .timeline-item {
    display: grid;
    grid-template-columns: 80px 100px 1fr;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--color-bg-alt);
    border-radius: var(--border-radius-sm);
    align-items: center;
    transition: background-color var(--transition-fast);
  }
  
  .timeline-item:hover {
    background-color: var(--color-bg-section);
  }
  
  .timeline-item.current {
    background-color: var(--color-primary);
    color: white;
    font-weight: 600;
  }
  
  .timeline-item.current .timeline-year,
  .timeline-item.current .timeline-age,
  .timeline-item.current .timeline-participation {
    color: white;
  }
  
  .timeline-year {
    font-weight: 600;
    color: var(--color-primary);
  }
  
  .timeline-age {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
  
  .timeline-participation {
    text-align: right;
    font-weight: 600;
    color: var(--color-text);
  }
  
  .comparison-note {
    margin-top: var(--spacing-xl);
    padding: var(--spacing-lg);
    background-color: var(--color-bg-warning);
    border-radius: var(--border-radius-sm);
    border-left: 4px solid var(--color-accent);
  }
  
  .comparison-note p {
    font-size: var(--font-size-sm);
    line-height: 1.6;
    color: var(--color-text);
    margin: 0;
  }
  
  .no-comparison {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
  }
  
  /* Responsive */
  @media (max-width: 640px) {
    .timeline-item {
      grid-template-columns: 1fr;
      gap: var(--spacing-xs);
      text-align: center;
    }
    
    .timeline-participation {
      text-align: center;
    }
  }
  
  /* Animación de entrada */
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .comparison-card {
    animation: slideInUp 0.6s ease-out;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .comparison-card {
      animation: none;
    }
  }
</style>
