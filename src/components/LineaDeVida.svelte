<script>
  import { onMount, afterUpdate, tick } from 'svelte';
  import * as d3 from 'd3';
  import { separateElectionFamilies } from '../utils/calculos.js';
  import { formatExactPercent, formatCohortRange, getPseudoCohortDisclaimer } from '../utils/formato.js';
  import { getChartAriaAttrs, getAnimationDuration, prefersReducedMotion } from '../utils/a11y.js';
  
  export let data = null;
  export let entidad = '';

  let chartContainer;
  let showTable = false;
  let puntoFijado = null;   // Punto seleccionado con clic/tap (persistente)
  let puntoHover = null;    // Punto bajo el cursor (preview)

  // El tooltip muestra el punto fijado; si no hay, el que está bajo el cursor
  $: puntoActivo = puntoFijado || puntoHover;

  function fijarPunto(d) {
    puntoFijado = puntoFijado === d ? null : d;
  }

  function limpiarPunto() {
    puntoFijado = null;
    puntoHover = null;
  }
  
  $: elections = data?.elections || [];
  $: electionFamilies = separateElectionFamilies(elections);
  $: intermedias = electionFamilies.intermedias;
  $: presidenciales = electionFamilies.presidenciales;
  $: cohortRange = data ? formatCohortRange(data.year_of_birth_min, data.year_of_birth_max) : '';
  $: tipoActivo = puntoActivo
    ? (puntoActivo.type === 'presidencial' ? 'Elección Presidencial' : 'Elección Intermedia')
    : '';
  
  // Dibujar gráfico cuando cambien los datos o se vuelva a mostrar el lienzo
  $: if (chartContainer && elections.length > 0) {
    programarDibujo(true);
  }

  let rootEl;
  let lastInnerWidth = 0;
  let rafId = 0;
  let dibujoForzado = false;
  let resizeObserver;

  function medirAnchoInterno() {
    const cs = getComputedStyle(chartContainer);
    const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    return Math.max(0, chartContainer.clientWidth - paddingX);
  }

  /** Dibuja en el siguiente frame.
   *  - `force`: redibuja aunque el ancho no haya cambiado (datos nuevos o
   *    lienzo recién montado tras volver de la tabla).
   *  - Sin `force`: solo redibuja si cambió el ancho disponible (resize). */
  function programarDibujo(force = false) {
    if (force) dibujoForzado = true;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      if (!chartContainer || elections.length === 0) {
        dibujoForzado = false;
        return;
      }
      const yaDibujado = d3.select(chartContainer).select('svg').size() > 0;
      const inner = medirAnchoInterno();
      const debeDibujar = dibujoForzado || !yaDibujado || Math.abs(inner - lastInnerWidth) >= 1;
      dibujoForzado = false;
      if (!debeDibujar) return;
      lastInnerWidth = inner;
      drawChart();
    });
  }

  // Solo resaltar el punto fijado, sin redibujar todo el gráfico
  $: if (chartContainer && puntoFijado && elections.length > 0) {
    d3.selectAll('.dot-intermedia, .dot-presidencial')
      .classed('is-selected', d => d.year === puntoFijado.year);
  }
  
  function drawChart() {
    if (!chartContainer) return;
    
    // Limpiar SVG anterior
    d3.select(chartContainer).selectAll('*').remove();
    
    // Dimensiones
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };

    // clientWidth INCLUYE el padding del contenedor; hay que descontarlo,
    // porque el SVG vive en el content box. Sin esto el SVG desborda 2×padding
    // y provoca scroll horizontal en toda la página.
    const innerWidth = medirAnchoInterno();

    const width = Math.max(0, innerWidth - margin.left - margin.right);
    const height = 400 - margin.top - margin.bottom;
    const totalHeight = height + margin.top + margin.bottom;

    // Crear SVG fluido: viewBox + width 100% para que nunca exceda su contenedor
    const svg = d3.select(chartContainer)
      .append('svg')
      .attr('viewBox', `0 0 ${innerWidth} ${totalHeight}`)
      .attr('width', '100%')
      .attr('height', totalHeight)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-label', 'Gráfico de línea de vida cívica mostrando participación electoral por año');
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Escalas
    const allYears = elections.map(e => e.year);
    const xScale = d3.scaleLinear()
      .domain([Math.min(...allYears), Math.max(...allYears)])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);
    
    // Ejes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d.toString())
      .ticks(6);
    
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => d + '%')
      .ticks(5);
    
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .attr('class', 'axis-x')
      .style('font-size', '14px');
    
    g.append('g')
      .call(yAxis)
      .attr('class', 'axis-y')
      .style('font-size', '14px');
    
    // Etiquetas de ejes
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'var(--color-text)')
      .text('Año de Elección');
    
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'var(--color-text)')
      .text('Participación (%)');
    
    // Función de línea
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.participacion_pct))
      .curve(d3.curveMonotoneX);
    
    // Duración de animación
    const duration = getAnimationDuration(800);
    
    // Dibujar línea de intermedias
    if (intermedias.length > 0) {
      const pathIntermedia = g.append('path')
        .datum(intermedias)
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-intermedia)')
        .attr('stroke-width', 3)
        .attr('d', line);
      
      // Animar si no hay preferencia de movimiento reducido
      if (!prefersReducedMotion()) {
        const totalLength = pathIntermedia.node().getTotalLength();
        pathIntermedia
          .attr('stroke-dasharray', totalLength + ' ' + totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(duration)
          .attr('stroke-dashoffset', 0);
      }
      
      // Puntos
      g.selectAll('.dot-intermedia')
        .data(intermedias)
        .enter()
        .append('circle')
        .attr('class', 'dot-intermedia')
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(d.participacion_pct))
        .attr('r', 0)
        .attr('fill', 'var(--color-intermedia)')
        .attr('stroke', 'var(--color-dot-stroke)')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', (e, d) => (puntoHover = d))
        .on('mouseleave', () => (puntoHover = null))
        .on('click', (e, d) => fijarPunto(d))
        .on('keydown', (e, d) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fijarPunto(d); }
        })
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', d => `${d.year}, ${d.type === 'presidencial' ? 'elección presidencial' : 'elección intermedia'}. Edad ${d.age_on_election} años. Participación ${formatExactPercent(d.participacion_pct)}`)
        .transition()
        .delay(duration / 2)
        .duration(duration / 2)
        .attr('r', 6);
    }
    
    // Dibujar línea de presidenciales
    if (presidenciales.length > 0) {
      const pathPresidencial = g.append('path')
        .datum(presidenciales)
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-presidencial)')
        .attr('stroke-width', 3)
        .attr('d', line);
      
      if (!prefersReducedMotion()) {
        const totalLength = pathPresidencial.node().getTotalLength();
        pathPresidencial
          .attr('stroke-dasharray', totalLength + ' ' + totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(duration)
          .attr('stroke-dashoffset', 0);
      }
      
      // Puntos
      g.selectAll('.dot-presidencial')
        .data(presidenciales)
        .enter()
        .append('circle')
        .attr('class', 'dot-presidencial')
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(d.participacion_pct))
        .attr('r', 0)
        .attr('fill', 'var(--color-presidencial)')
        .attr('stroke', 'var(--color-dot-stroke)')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', (e, d) => (puntoHover = d))
        .on('mouseleave', () => (puntoHover = null))
        .on('click', (e, d) => fijarPunto(d))
        .on('keydown', (e, d) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fijarPunto(d); }
        })
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', d => `${d.year}, ${d.type === 'presidencial' ? 'elección presidencial' : 'elección intermedia'}. Edad ${d.age_on_election} años. Participación ${formatExactPercent(d.participacion_pct)}`)
        .transition()
        .delay(duration / 2)
        .duration(duration / 2)
        .attr('r', 6);
    }
    
    // Resaltar el punto fijado dentro del SVG
    d3.selectAll('.chart-tooltip').remove();
  }
  
  onMount(() => {
    // Redibujar cuando cambia el ancho disponible (incluye cambios que no
    // provienen de un resize de la ventana, p. ej. el panel lateral).
    if (typeof ResizeObserver !== 'undefined' && rootEl) {
      resizeObserver = new ResizeObserver(() => {
        if (chartContainer && elections.length > 0) programarDibujo();
      });
      resizeObserver.observe(rootEl);
    }

    const handleResize = () => {
      if (chartContainer && elections.length > 0) programarDibujo();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      cancelAnimationFrame(rafId);
    };
  });
  
  async function toggleTable() {
    showTable = !showTable;
    // Esperar a que se monte/destruya el lienzo antes de medir y dibujar.
    await tick();
    if (!showTable) programarDibujo(true);
  }
</script>

<div class="linea-vida-container" bind:this={rootEl}>
  <div class="chart-header">
    <h3>Participación de tu Generación ({cohortRange})</h3>
    <p class="chart-subtitle">
      {entidad} · Elecciones Federales 2009–2024
    </p>

    <!-- 4.2 Rango de edad implícito por cohorte -->
    {#if data}
      <p class="cohort-note">
        Esta línea sigue a la <strong>generación nacida entre {data.year_of_birth_min} y {data.year_of_birth_max}</strong>:
        en cada elección se muestra qué porcentaje de ese grupo votó, y qué edad tenía entonces.
      </p>
    {/if}

    <button 
      class="btn-toggle-table"
      on:click={toggleTable}
      aria-expanded={showTable}
      aria-controls="data-table"
    >
      {showTable ? 'Ver Gráfico' : 'Ver Tabla'}
    </button>
  </div>
  
  {#if !showTable}
    <!-- Gráfico -->
    <div class="chart-wrapper" role="presentation" on:mouseleave={() => (puntoHover = null)}>
      <div 
        class="chart-container" 
        bind:this={chartContainer}
        role="img"
        aria-label="Gráfico de línea mostrando participación electoral. Toca un punto para ver su detalle."
      >
      </div>

      <!-- 4.1 Leyenda fija debajo del gráfico -->
      <div class="chart-legend" role="group" aria-label="Leyenda del gráfico">
        {#if intermedias.length > 0}
          <span class="legend-item">
            <span class="legend-swatch swatch-intermedia" aria-hidden="true"></span>
            Elecciones intermedias (2009, 2015, 2021)
          </span>
        {/if}
        {#if presidenciales.length > 0}
          <span class="legend-item">
            <span class="legend-swatch swatch-presidencial" aria-hidden="true"></span>
            Elecciones presidenciales (2012, 2018, 2024)
          </span>
        {/if}
        <span class="legend-item">
          <span class="legend-swatch swatch-dot" aria-hidden="true"></span>
          Cada punto = una elección
        </span>
      </div>

      <!-- 4.3 / 4.4 Tooltip fijo (no sigue al mouse) + label del punto fijado -->
      {#if puntoActivo}
        <div class="chart-readout" role="status" aria-live="polite">
          <button class="readout-close" on:click={limpiarPunto} aria-label="Cerrar detalle del punto">✕</button>
          <div class="readout-main">
            <strong>{puntoActivo.year}</strong> · {tipoActivo}
          </div>
          <div class="readout-row">
            <span>Edad en esa elección</span>
            <strong>{puntoActivo.age_on_election} años</strong>
          </div>
          <div class="readout-row">
            <span>Participaron</span>
            <strong>{formatExactPercent(puntoActivo.participacion_pct)}</strong>
          </div>
          <div class="readout-row">
            <span>Lista nominal</span>
            <strong>{puntoActivo.lista_nominal?.toLocaleString('es-MX') ?? '—'}</strong>
          </div>
          <p class="readout-hint">
            {#if puntoFijado}
              Toca otro punto para compararlo, o ✕ para cerrar.
            {:else}
              Toca este punto para dejar el dato fijo.
            {/if}
          </p>
        </div>
      {:else}
        <p class="chart-hint">Toca cualquier punto para ver su detalle.</p>
      {/if}
    </div>
  {:else}
    <!-- Tabla accesible -->
    <div class="table-container">
      <table id="data-table">
        <caption>Datos de Participación Electoral por Año</caption>
        <thead>
          <tr>
            <th scope="col">Año</th>
            <th scope="col">Tipo</th>
            <th scope="col">Edad</th>
            <th scope="col">Participación</th>
            <th scope="col">Lista Nominal</th>
          </tr>
        </thead>
        <tbody>
          {#each elections as election}
            <tr>
              <td>{election.year}</td>
              <td>{election.type}</td>
              <td>{election.age_on_election} años</td>
              <td><strong>{formatExactPercent(election.participacion_pct)}</strong></td>
              <td>{election.lista_nominal.toLocaleString('es-MX')}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  
  <!-- Disclaimer de pseudo-cohorte -->
  <div class="chart-disclaimer">
    <small>
      Nota: {getPseudoCohortDisclaimer()}
    </small>
  </div>
</div>

<style>
  .linea-vida-container {
    padding: 0;
  }
  
  .chart-header {
    margin-bottom: var(--spacing-xl);
  }
  
  .chart-header h3 {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: var(--spacing-sm);
  }
  
  .chart-subtitle {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-lg);
  }

  /* ===== Fase 4: claridad visual ===== */
  .cohort-note {
    font-size: 0.95rem;
    line-height: 1.55;
    color: var(--color-text-secondary);
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    padding: 0.85rem 1rem;
    margin-bottom: var(--spacing-lg);
  }
  .cohort-note strong { color: var(--color-text); }

  .chart-wrapper { position: relative; }

  .chart-legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem 1.5rem;
    margin-top: var(--spacing-md);
    padding: 0.85rem 1rem;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
  .legend-item { display: inline-flex; align-items: center; gap: 0.5rem; }
  .legend-swatch { width: 1.5rem; height: 4px; border-radius: 2px; flex-shrink: 0; }
  .swatch-intermedia { background: var(--color-intermedia); }
  .swatch-presidencial { background: var(--color-presidencial); }
  .swatch-dot {
    width: 0.75rem; height: 0.75rem; border-radius: 50%;
    background: var(--color-text-muted); height: 0.75rem;
  }

  .chart-hint {
    text-align: center;
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin-top: 0.75rem;
  }

  /* Readout fijo (no sigue al mouse) */
  .chart-readout {
    position: sticky;
    bottom: 0.75rem;
    margin: 1rem auto 0;
    max-width: 420px;
    background: var(--color-bg-section);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--color-primary);
    border-radius: 10px;
    padding: 1rem 2.5rem 1rem 1.1rem;
    box-shadow: var(--shadow-md);
    text-align: left;
  }
  .readout-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    line-height: 1;
    padding: 0.4rem;
    border-radius: 6px;
  }
  .readout-close:hover { color: var(--color-text); }
  .readout-close:focus-visible,
  .btn-toggle-table:focus-visible,
  :global(.dot-intermedia:focus-visible),
  :global(.dot-presidencial:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
  .readout-main { font-size: 1.05rem; color: var(--color-text); margin-bottom: 0.6rem; }
  .readout-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    padding: 0.25rem 0;
    border-top: 1px solid var(--color-border);
  }
  .readout-row strong { color: var(--color-text); }
  .readout-hint { font-size: 0.8rem; color: var(--color-text-muted); margin: 0.6rem 0 0; }

  :global(.dot-intermedia.is-selected),
  :global(.dot-presidencial.is-selected) {
    stroke: var(--color-text);
    stroke-width: 4px;
  }

  @media (max-width: 480px) {
    .chart-readout { position: static; max-width: 100%; }
  }
  
  .btn-toggle-table {
    padding: 0.625rem 1.25rem;
    background: var(--color-btn-soft);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: all var(--transition-base);
  }
  
  .btn-toggle-table:hover,
  .btn-toggle-table:focus {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
  
  .chart-container {
    width: 100%;
    min-height: 450px;
    margin: var(--spacing-xl) 0;
    background: var(--color-bg);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-lg);
    /* El SVG se dibuja aquí; si algo excediera el ancho, se recorta con
       scroll interno en lugar de desbordar toda la página. */
    overflow-x: auto;
  }
  
  /* El SVG lo crea D3 dinámicamente, por eso necesita :global().
     width:100% + height:auto mantiene la proporción y evita desbordes. */
  .chart-container :global(svg) {
    display: block;
    width: 100%;
    height: auto;
    max-width: 100%;
  }
  
  .table-container {
    width: 100%;
    overflow-x: auto;
    margin: var(--spacing-xl) 0;
    background: var(--color-bg);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-border);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  caption {
    font-weight: 700;
    text-align: left;
    padding: var(--spacing-lg);
    font-size: var(--font-size-lg);
    color: var(--color-text);
    font-family: 'Outfit', sans-serif;
  }
  
  th {
    background-color: rgba(79, 70, 229, 0.1);
    color: var(--color-text);
    padding: var(--spacing-md);
    text-align: left;
    font-weight: 600;
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid var(--color-primary);
  }
  
  td {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
  }
  
  tbody tr:hover {
    background-color: var(--color-row-hover);
  }

  tbody tr:nth-child(even) {
    background-color: var(--color-row-even);
  }
  
  .chart-disclaimer {
    margin-top: var(--spacing-lg);
    padding: var(--spacing-md);
    background-color: rgba(245, 158, 11, 0.1);
    border-left: 4px solid var(--color-accent);
    border-radius: var(--border-radius-sm);
  }
  
  .chart-disclaimer small {
    font-size: var(--font-size-sm);
    line-height: 1.6;
    color: var(--color-text-secondary);
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .chart-container {
      padding: var(--spacing-md);
      min-height: 350px;
    }
    
    table {
      font-size: var(--font-size-sm);
    }
    
    th, td {
      padding: var(--spacing-sm);
    }
  }
  
  /* D3 axis styling - Tema oscuro */
  :global(.axis-x path),
  :global(.axis-y path),
  :global(.axis-x line),
  :global(.axis-y line) {
    stroke: var(--color-border);
  }
  
  :global(.axis-x text),
  :global(.axis-y text) {
    fill: var(--color-text-secondary);
  }
  
  :global(.legend text) {
    fill: var(--color-text);
  }
</style>
