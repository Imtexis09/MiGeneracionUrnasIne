<script>
  import { compareGenerationsAtSameAge, getLatestElection } from '../utils/calculos.js';
  import { generateComparisonText, formatExactPercent } from '../utils/formato.js';

  export let data = null;
  export let allData = null;
  export let yearOfBirth = null;

  $: latestElection = data ? getLatestElection(data.elections) : null;
  $: comparison = (() => {
    try {
      return (data && allData && yearOfBirth && latestElection)
        ? compareGenerationsAtSameAge(data, allData, yearOfBirth, latestElection.age_on_election)
        : null;
    } catch (e) {
      console.error('Error en comparación generacional:', e);
      return null;
    }
  })();
  $: comparisonText = comparison ? generateComparisonText(comparison) : '';
</script>

<div class="comparacion-container">
  {#if comparison && comparison.current}
    <p class="comparison-text" role="article" aria-label="Resultado de comparación generacional">
      {comparisonText}
    </p>

    {#if comparison.previous && comparison.previous.length > 0}
      <table class="timeline">
        <caption class="sr-only">Cómo va tu generación a la misma edad</caption>
        <thead>
          <tr>
            <th scope="col">Elección</th>
            <th scope="col">Edad</th>
            <th scope="col" class="num">Participación</th>
          </tr>
        </thead>
        <tbody>
          {#each comparison.previous as prev}
            <tr>
              <td>{prev.year}</td>
              <td>{prev.age} años</td>
              <td class="num">{formatExactPercent(prev.participacion)}</td>
            </tr>
          {/each}
          <tr class="current">
            <td>{comparison.current.year}</td>
            <td>{comparison.current.age} años</td>
            <td class="num">{formatExactPercent(comparison.current.participacion)}</td>
          </tr>
        </tbody>
      </table>
    {/if}

    <p class="comparison-note">
      <strong>¿Qué significa esto?</strong> Esta comparación muestra cómo tu generación
      participó a una edad específica, frente a generaciones anteriores cuando tenían
      la misma edad en elecciones del mismo tipo ({comparison.type}).
    </p>
  {:else}
    <p class="no-comparison">No hay suficientes datos históricos para realizar una comparación generacional.</p>
  {/if}
</div>

<style>
  .comparacion-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 0.5rem;
  }

  .comparison-text {
    max-width: var(--measure);
    font-size: var(--font-size-lg);
    line-height: 1.55;
    color: var(--text-primary);
    margin: 0;
  }

  .timeline {
    max-width: 34rem;
  }

  .timeline th {
    padding: 0.5rem 1rem 0.5rem 0;
    text-align: left;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-secondary);
    border-bottom: 1.5px solid var(--rule-strong);
    background: none;
  }

  .timeline td {
    padding: 0.75rem 1rem 0.75rem 0;
    border-bottom: 1px solid var(--line);
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .timeline td:first-child {
    font-weight: 700;
    color: var(--text-primary);
  }

  .timeline .num {
    text-align: right;
    padding-right: 0;
    font-weight: 700;
    color: var(--text-primary);
  }

  /* La fila de tu generación va marcada con tinta */
  .timeline tr.current td {
    color: var(--accent-pink);
    font-weight: 800;
    border-bottom: 1.5px solid var(--rule-strong);
  }

  .comparison-note {
    max-width: var(--measure);
    padding-left: 1rem;
    border-left: 3px solid var(--line);
    font-size: 0.925rem;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0;
  }

  .no-comparison {
    color: var(--text-secondary);
  }
</style>
