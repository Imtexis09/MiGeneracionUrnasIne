<script>
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';
  import { separateElectionFamilies } from '../utils/calculos.js';
  import { formatExactPercent, formatCohortRange, getPseudoCohortDisclaimer } from '../utils/formato.js';
  import { getChartAriaAttrs, getAnimationDuration, prefersReducedMotion } from '../utils/a11y.js';
  
  export let data = null;
  export let yearOfBirth = null;
  export let entidad = '';
  
  let chartContainer;
  let showTable = false;
  
  $: elections = data?.elections || [];
  $: { intermedias, presidenciales } = separateElectionFamilies(elections);
  $: cohortRange = data ? formatCohortRange(data.year_of_birth_min, data.year_of_birth_max) : '';
  
  // Dibujar gráfico cuando cambien los datos
  $: if (chartContainer && elections.length > 0) {
    drawChart();
  }
  
  function drawChart() {
    if (!chartContainer) return;
    
    // Limpiar SVG anterior
    d3.select(chartContainer).selectAll('*').remove();
    
    // Dimensiones
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const containerWidth = chartContainer.clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Crear SVG
    const svg = d3.select(chartContainer)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', 400)
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
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', showTooltip)
        .on('mouseleave', hideTooltip)
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
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', showTooltip)
        .on('mouseleave', hideTooltip)
        .transition()
        .delay(duration / 2)
        .duration(duration / 2)
        .attr('r', 6);
    }
    
    // Tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');
    
    function showTooltip(event, d) {
      tooltip
        .style('visibility', 'visible')
        .html(`
          <strong>${d.year}</strong> (${d.type})<br>
          Edad: ${d.age_on_election} años<br>
          Participación: ${formatExactPercent(d.participacion_pct)}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    }
    
    function hideTooltip() {
      tooltip.style('visibility', 'hidden');
    }
    
    // Leyenda
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 200}, -30)`);
    
    if (intermedias.length > 0) {
      const legendIntermedia = legend.append('g');
      legendIntermedia.append('line')
        .attr('x1', 0)
        .attr('x2', 30)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', 'var(--color-intermedia)')
        .attr('stroke-width', 3);
      legendIntermedia.append('text')
        .attr('x', 35)
        .attr('y', 5)
        .text('Intermedias')
        .style('font-size', '13px')
        .style('fill', 'var(--color-text)');
    }
    
    if (presidenciales.length > 0) {
      const legendPresidencial = legend.append('g')
        .attr('transform', 'translate(0, 20)');
      legendPresidencial.append('line')
        .attr('x1', 0)
        .attr('x2', 30)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', 'var(--color-presidencial)')
        .attr('stroke-width', 3);
      legendPresidencial.append('text')
        .attr('x', 35)
        .attr('y', 5)
        .text('Presidenciales')
        .style('font-size', '13px')
        .style('fill', 'var(--color-text)');
    }
  }
  
  onMount(() => {
    if (elections.length > 0) {
      drawChart();
    }
    
    // Redibujar en resize
    const handleResize = () => {
      if (chartContainer && elections.length > 0) {
        drawChart();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
  
  function toggleTable() {
    showTable = !showTable;
  }
</script>

<div class="linea-vida-container">
  <div class="chart-header">
    <h3>Participación de tu Generación ({cohortRange})</h3>
    <p class="chart-subtitle">
      {entidad} · Elecciones Federales 2009–2024
    </p>
    <button 
      class="btn-toggle-table"
      on:click={toggleTable}
      aria-expanded={showTable}
      aria-controls="data-table"
    >
      {showTable ? '📊 Ver Gráfico' : '📋 Ver Tabla'}
    </button>
  </div>
  
  {#if !showTable}
    <!-- Gráfico -->
    <div 
      class="chart-container" 
      bind:this={chartContainer}
      role="img"
      aria-label="Gráfico de línea mostrando participación electoral"
    >
    </div>
  {:else}
    <!-- Tabla accesible -->
    <div class="table-container">
      <table id="data-table" role="table">
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
      ℹ️ {getPseudoCohortDisclaimer()}
    </small>
  </div>
</div>

<style>
  .linea-vida-container {
    padding: var(--spacing-lg);
  }
  
  .chart-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }
  
  .chart-header h3 {
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
  }
  
  .chart-subtitle {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-md);
  }
  
  .btn-toggle-table {
    padding: var(--spacing-sm) var(--spacing-lg);
    background-color: var(--color-bg-alt);
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    font-size: var(--font-size-sm);
    transition: all var(--transition-base);
  }
  
  .btn-toggle-table:hover,
  .btn-toggle-table:focus {
    background-color: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
  
  .chart-container {
    width: 100%;
    min-height: 400px;
    margin: var(--spacing-xl) 0;
  }
  
  .table-container {
    width: 100%;
    overflow-x: auto;
    margin: var(--spacing-xl) 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  caption {
    font-weight: 600;
    text-align: left;
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-lg);
    color: var(--color-primary);
  }
  
  th {
    background-color: var(--color-primary);
    color: white;
    padding: var(--spacing-md);
    text-align: left;
    font-weight: 600;
  }
  
  td {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }
  
  tbody tr:hover {
    background-color: var(--color-bg-section);
  }
  
  tbody tr:nth-child(even) {
    background-color: var(--color-bg-alt);
  }
  
  .chart-disclaimer {
    margin-top: var(--spacing-lg);
    padding: var(--spacing-md);
    background-color: var(--color-bg-warning);
    border-left: 4px solid var(--color-accent);
    border-radius: var(--border-radius-sm);
  }
  
  .chart-disclaimer small {
    font-size: var(--font-size-sm);
    line-height: 1.5;
    color: var(--color-text);
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    table {
      font-size: var(--font-size-sm);
    }
    
    th, td {
      padding: var(--spacing-sm);
    }
  }
  
  /* D3 axis styling */
  :global(.axis-x path),
  :global(.axis-y path),
  :global(.axis-x line),
  :global(.axis-y line) {
    stroke: var(--color-border);
  }
  
  :global(.axis-x text),
  :global(.axis-y text) {
    fill: var(--color-text);
  }
</style>
