<script>
  import { onMount, tick } from 'svelte';
  import * as d3 from 'd3';
  import { separateElectionFamilies } from '../utils/calculos.js';
  import { formatExactPercent, formatCohortRange, getPseudoCohortDisclaimer } from '../utils/formato.js';
  import { getAnimationDuration, prefersReducedMotion } from '../utils/a11y.js';

  export let data = null;
  export let entidad = '';
  /** Participación nacional por año: { "2009": 44.06, ... } (claves string en JSON). */
  export let nacional = {};

  let chartContainer;
  let rootEl;
  let showTable = false;
  let escalaCompleta = false;
  let hayScroll = false;
  let puntoFijado = null;   // Punto seleccionado con clic/tap (persistente)
  let puntoHover = null;    // Punto bajo el cursor (preview)

  // El readout muestra el punto fijado; si no hay, el que está bajo el cursor
  $: puntoActivo = puntoFijado || puntoHover;

  function fijarPunto(d) {
    puntoFijado = puntoFijado === d ? null : d;
  }

  function limpiarPunto() {
    puntoFijado = null;
    puntoHover = null;
  }

  // ---- Datos derivados ----
  $: elections = (data?.elections || []).slice().sort((a, b) => a.year - b.year);
  $: years = elections.map(e => e.year);
  $: electionFamilies = separateElectionFamilies(elections);
  $: intermedias = electionFamilies.intermedias;
  $: presidenciales = electionFamilies.presidenciales;
  $: cohortRange = data ? formatCohortRange(data.year_of_birth_min, data.year_of_birth_max) : '';
  $: tipoActivo = puntoActivo
    ? (puntoActivo.type === 'presidencial' ? 'Elección Presidencial' : 'Elección Intermedia')
    : '';
  $: nacionalDisponible = years.some(y => nacional && nacional[y] != null);

  // Comparaciones del punto activo (nac. del mismo año y elección anterior de la cohorte)
  $: nacionalPunto = (puntoActivo && nacional && nacional[puntoActivo.year] != null)
    ? nacional[puntoActivo.year]
    : null;
  $: deltaNacional = (puntoActivo && nacionalPunto != null)
    ? puntoActivo.participacion_pct - nacionalPunto
    : null;
  $: eleccionPrevia = puntoActivo
    ? (elections.filter(e => e.year < puntoActivo.year).sort((a, b) => b.year - a.year)[0] || null)
    : null;
  $: deltaPrevia = (puntoActivo && eleccionPrevia)
    ? puntoActivo.participacion_pct - eleccionPrevia.participacion_pct
    : null;

  // ---- Redibujo ----
  let lastInnerWidth = 0;
  let rafId = 0;
  let dibujoForzado = false;
  let resizeObserver;

  function medirAnchoInterno() {
    if (!chartContainer) return 0;
    const cs = getComputedStyle(chartContainer);
    const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    return Math.max(0, chartContainer.clientWidth - paddingX);
  }

  /** Dibuja en el siguiente frame.
   *  - `force`: redibuja aunque el ancho no haya cambiado (datos nuevos,
   *    cambio de escala o lienzo recién montado tras volver de la tabla).
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

  // Dibujar al montar o cuando cambian los datos
  $: if (chartContainer && elections.length > 0) {
    programarDibujo(true);
  }

  // Resaltar el punto activo (fijado o hover), acotado al SVG de este gráfico.
  $: if (chartContainer) aplicarResaltado(puntoActivo);

  function aplicarResaltado(p) {
    if (!chartContainer) return;
    d3.select(chartContainer)
      .selectAll('.dot-intermedia, .dot-presidencial')
      .classed('is-selected', d => !!p && !!d && d.year === p.year);
  }

  function ariaPunto(d) {
    const tipo = d.type === 'presidencial' ? 'elección presidencial' : 'elección intermedia';
    return `${d.year}, ${tipo}. Edad ${d.age_on_election} años. Participación ${formatExactPercent(d.participacion_pct)}`;
  }

  function drawChart() {
    if (!chartContainer) return;

    // Limpiar SVG anterior
    d3.select(chartContainer).selectAll('*').remove();

    const n = years.length;
    if (n === 0) { hayScroll = false; return; }

    // clientWidth INCLUYE el padding; se descuenta en medirAnchoInterno().
    const anchoContenido = medirAnchoInterno();
    const estrecho = anchoContenido < 560;

    const margin = {
      top: 24,
      right: estrecho ? 18 : 32,
      bottom: estrecho ? 74 : 54,
      left: estrecho ? 42 : 54
    };

    // ¿Cabe todo o hace falta scroll horizontal?
    // Solo se activa cuando ni siquiera con separación mínima cabría (móvil).
    const espacioPorPunto = 62;
    const anchoNecesario = (n - 1) * espacioPorPunto + margin.left + margin.right;
    const usarScroll = n > 1 && anchoNecesario > anchoContenido;
    const anchoSvg = usarScroll ? anchoNecesario : anchoContenido;
    hayScroll = usarScroll;

    const width = Math.max(0, anchoSvg - margin.left - margin.right);
    const alturaTrazo = estrecho ? 300 : 360;
    const totalHeight = alturaTrazo + margin.top + margin.bottom;

    // SVG con ancho en píxeles: si hay scroll, el contenedor lo desplaza;
    // si no, coincide con el ancho útil y no desborda la página.
    const svg = d3.select(chartContainer)
      .append('svg')
      .attr('viewBox', `0 0 ${anchoSvg} ${totalHeight}`)
      .attr('width', anchoSvg)
      .attr('height', totalHeight)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('role', 'img')
      .attr('aria-label', 'Participación de tu generación en elecciones federales 2009-2024');

    svg.append('title').text('Participación de tu generación en elecciones federales 2009-2024');
    svg.append('desc').text('Gráfica de línea que muestra el porcentaje de participación de tu generación en cada elección federal. Cada punto representa una elección: los círculos son elecciones presidenciales y los cuadrados son elecciones intermedias. El porcentaje exacto aparece junto a cada punto. La línea desmarcada muestra el promedio nacional.');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Escala X categórica: un punto por AÑO DE ELECCIÓN real (no años intercalados)
    const xScale = d3.scalePoint()
      .domain(years)
      .range([0, width])
      .padding(0.5);

    // Escala Y adaptativa con span mínimo (o 0–100 si se pide escala completa)
    const vals = elections.map(e => e.participacion_pct);
    let y0 = 0;
    let y1 = 100;
    if (!escalaCompleta) {
      y0 = Math.max(0, Math.floor(Math.min(...vals) - 5));
      y1 = Math.min(100, Math.ceil(Math.max(...vals) + 5));
      const spanMin = 20;
      if (y1 - y0 < spanMin) {
        const centro = (y0 + y1) / 2;
        y0 = Math.max(0, Math.round(centro - spanMin / 2));
        y1 = Math.min(100, y0 + spanMin);
        if (y1 - y0 < spanMin) y0 = Math.max(0, y1 - spanMin);
      }
    }
    const yScale = d3.scaleLinear()
      .domain([y0, y1])
      .range([alturaTrazo, 0]);

    // Rejilla horizontal (detrás de todo)
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-width).tickFormat(''));

    // Eje Y
    g.append('g')
      .attr('class', 'axis-y')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d + '%'));

    // Eje X: solo los años que existen; rotar si están muy juntos
    const rotar = n > 3 && (width / (n - 1)) < 56;
    const xAxis = d3.axisBottom(xScale)
      .tickValues(years)
      .tickFormat(d => String(d))
      .tickSizeOuter(0);

    const xAxisG = g.append('g')
      .attr('class', 'axis-x')
      .attr('transform', `translate(0,${alturaTrazo})`)
      .call(xAxis);

    xAxisG.selectAll('text')
      .attr('text-anchor', rotar ? 'end' : 'middle')
      .attr('transform', rotar ? 'rotate(-45)' : null)
      .attr('dx', rotar ? '-0.35em' : '0')
      .attr('dy', rotar ? '0.35em' : '0.85em');

    // Títulos de ejes (solo si hay espacio)
    if (!estrecho) {
      g.append('text')
        .attr('x', width / 2)
        .attr('y', alturaTrazo + 46)
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-title')
        .text('Año de elección');

      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -alturaTrazo / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-title')
        .text('Participación (%)');
    }

    const duration = getAnimationDuration(800);
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.participacion_pct))
      .curve(d3.curveLinear);

    // Línea de referencia nacional, del mismo año que cada elección (detrás)
    const nacSeries = years
      .map(y => ({ year: y, pct: nacional?.[y] }))
      .filter(d => d.pct != null);
    if (nacSeries.length > 1) {
      g.append('path')
        .datum(nacSeries)
        .attr('class', 'national-line')
        .attr('fill', 'none')
        .attr('stroke', 'var(--text-muted)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6 4')
        .attr('d', d3.line()
          .x(d => xScale(d.year))
          .y(d => yScale(d.pct))
          .curve(d3.curveLinear));
    }

    dibujarSerie(intermedias, 'intermedia', 'var(--chart-intermedia)', duration, line, g, xScale, yScale);
    dibujarSerie(presidenciales, 'presidencial', 'var(--chart-presidencial)', duration, line, g, xScale, yScale);

    aplicarResaltado(puntoActivo);
  }

  function dibujarSerie(datos, familia, color, duration, line, g, xScale, yScale) {
    if (datos.length === 0) return;

    // Línea (solo si hay 2+ puntos de esa familia)
    if (datos.length > 1) {
      const path = g.append('path')
        .datum(datos)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 3)
        .attr('d', line);

      if (!prefersReducedMotion() && duration > 0) {
        const totalLength = path.node().getTotalLength();
        path
          .attr('stroke-dasharray', totalLength + ' ' + totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(duration)
          .attr('stroke-dashoffset', 0);
      }
    }

    // Área táctil ampliada (transparente) y accesible, encima del punto visible
    g.selectAll('.hit-' + familia)
      .data(datos)
      .enter()
      .append('circle')
      .attr('class', 'dot-hit hit-' + familia)
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.participacion_pct))
      .attr('r', 22)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseenter', (e, d) => (puntoHover = d))
      .on('mouseleave', () => (puntoHover = null))
      .on('click', (e, d) => fijarPunto(d))
      .on('keydown', (e, d) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fijarPunto(d); }
      })
      .attr('tabindex', 0)
      .attr('role', 'graphics-symbol')
      .attr('aria-label', d => ariaPunto(d));

    // Punto visible con doble codificación: forma distinta por familia + etiqueta numérica.
    // Así no depende solo del color para distinguir tipo de elección ni para leer el valor.
    const puntoEnter = g.selectAll('.dot-' + familia)
      .data(datos)
      .enter();

    if (familia === 'presidencial') {
      // Círculo para elecciones presidenciales
      puntoEnter.append('circle')
        .attr('class', 'dot dot-' + familia)
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(d.participacion_pct))
        .attr('r', 0)
        .attr('fill', color)
        .attr('stroke', 'var(--chart-dot-stroke)')
        .attr('stroke-width', 2)
        .style('pointer-events', 'none')
        .transition()
        .delay(duration / 2)
        .duration(duration / 2)
        .attr('r', 6);
    } else {
      // Cuadrado para elecciones intermedias (doble codificación de forma)
      puntoEnter.append('rect')
        .attr('class', 'dot dot-' + familia)
        .attr('x', d => xScale(d.year) - 6)
        .attr('y', d => yScale(d.participacion_pct) - 6)
        .attr('width', 0)
        .attr('height', 0)
        .attr('fill', color)
        .attr('stroke', 'var(--chart-dot-stroke)')
        .attr('stroke-width', 2)
        .style('pointer-events', 'none')
        .transition()
        .delay(duration / 2)
        .duration(duration / 2)
        .attr('x', d => xScale(d.year) - 6)
        .attr('y', d => yScale(d.participacion_pct) - 6)
        .attr('width', 12)
        .attr('height', 12);
    }

    // Etiqueta numérica explícita al lado de cada punto (WCAG 1.4.1: no solo color)
    puntoEnter.append('text')
      .attr('class', 'dot-label dot-label-' + familia)
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(d.participacion_pct) - 14)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-secondary)')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('font-family', 'var(--font-heading)')
      .attr('pointer-events', 'none')
      .text(d => formatExactPercent(d.participacion_pct));
  }

  // Cerrar al tocar/click fuera del gráfico (solo si hay punto fijado)
  let escuchaExterior = false;

  function onDocClick(e) {
    if (!(e.target instanceof Element)) return;
    if (!e.target.closest('.linea-vida-container')) {
      puntoFijado = null;
    }
  }

  $: if (typeof document !== 'undefined') {
    if (puntoFijado && !escuchaExterior) {
      document.addEventListener('click', onDocClick, true);
      escuchaExterior = true;
    } else if (!puntoFijado && escuchaExterior) {
      document.removeEventListener('click', onDocClick, true);
      escuchaExterior = false;
    }
  }

  function toggleEscala() {
    escalaCompleta = !escalaCompleta;
    programarDibujo(true);
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
      if (escuchaExterior) {
        document.removeEventListener('click', onDocClick, true);
        escuchaExterior = false;
      }
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
    <h3>Cuántas personas de tu generación van a votar</h3>
    <p class="chart-subtitle">
      {entidad}. Elecciones Federales 2009–2024
    </p>

    <!-- Rango de edad implícito por cohorte -->
    {#if data}
      <p class="cohort-note">
        Esta línea sigue a la <strong>generación nacida entre {data.year_of_birth_min} y {data.year_of_birth_max}</strong>:
        en cada elección se muestra qué porcentaje de ese grupo votó, y qué edad tenía entonces.
      </p>
    {/if}

    {#if elections.length > 0}
      <div class="chart-toolbar">
        {#if !showTable}
          <button
            class="btn-escala"
            on:click={toggleEscala}
            aria-pressed={escalaCompleta}
          >
            {escalaCompleta ? 'Escala completa (0–100)' : 'Escala ajustada a los datos'}
          </button>
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
    {/if}
  </div>

  {#if elections.length === 0}
    <p class="sin-datos">No hay datos de elecciones para tu generación.</p>
  {:else if !showTable}
    <!-- Gráfico -->
    <div class="chart-wrapper" role="presentation" on:mouseleave={() => (puntoHover = null)}>
      {#if hayScroll}
        <p class="scroll-hint" role="note">Desliza horizontalmente para ver todas las elecciones →</p>
      {/if}

      <div
        class="chart-container"
        bind:this={chartContainer}
        role="group"
        aria-label="Gráfico interactivo de línea de vida cívica. Usa Tab para recorrer cada elección y Enter para ver su detalle."
      >
      </div>

      <!-- Leyenda fija debajo del gráfico -->
      <div class="chart-legend" role="group" aria-label="Leyenda del gráfico">
        {#if intermedias.length > 0}
          <span class="legend-item">
            <span class="legend-swatch swatch-intermedia" aria-hidden="true"></span>
            Elecciones intermedias
          </span>
        {/if}
        {#if presidenciales.length > 0}
          <span class="legend-item">
            <span class="legend-swatch swatch-presidencial" aria-hidden="true"></span>
            Elecciones presidenciales
          </span>
        {/if}
        {#if nacionalDisponible}
          <span class="legend-item">
            <span class="legend-swatch swatch-nacional" aria-hidden="true"></span>
            Promedio nacional
          </span>
        {/if}
        <span class="legend-item">
          <span class="legend-swatch swatch-dot" aria-hidden="true"></span>
          Cada punto = una elección
        </span>
      </div>

      <!-- Readout del punto activo (fijo; bottom sheet en móvil) -->
      {#if puntoActivo}
        <div class="chart-readout" role="status" aria-live={puntoFijado ? 'polite' : 'off'}>
          <button class="readout-close" on:click={limpiarPunto} aria-label="Cerrar detalle del punto">✕</button>
          <div class="readout-main">
            <strong>{puntoActivo.year}</strong>, {tipoActivo}
          </div>
          <div class="readout-row">
            <span>Edad en esa elección</span>
            <strong>{puntoActivo.age_on_election} años</strong>
          </div>
          <div class="readout-row">
            <span>Participaron</span>
            <strong>{formatExactPercent(puntoActivo.participacion_pct)}</strong>
          </div>
          {#if nacionalPunto != null}
            <div class="readout-row">
              <span>Promedio nacional ({puntoActivo.year})</span>
              <strong>
                {formatExactPercent(nacionalPunto)}
                <span
                  class="readout-delta"
                  class:up={deltaNacional >= 0}
                  class:down={deltaNacional < 0}
                >({deltaNacional >= 0 ? '+' : ''}{deltaNacional.toFixed(1)} puntos)</span>
              </strong>
            </div>
          {/if}
          {#if deltaPrevia != null}
            <div class="readout-row">
              <span>Vs. elección anterior ({eleccionPrevia.year})</span>
              <strong class="readout-delta" class:up={deltaPrevia >= 0} class:down={deltaPrevia < 0}>
                {deltaPrevia >= 0 ? '+' : ''}{deltaPrevia.toFixed(1)} puntos
              </strong>
            </div>
          {/if}
          <div class="readout-row">
            <span>Personas registradas</span>
            <strong>{puntoActivo.lista_nominal?.toLocaleString('es-MX') ?? '—'}</strong>
          </div>
          <p class="readout-hint">
            {#if puntoFijado}
              Toca otro punto para verlo, o ✕ para cerrar.
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
        <caption>Resultados por año</caption>
        <thead>
          <tr>
            <th scope="col">Año</th>
            <th scope="col">Tipo</th>
            <th scope="col">Edad</th>
            <th scope="col">Participación</th>
            <th scope="col">Personas registradas</th>
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
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }

  .chart-subtitle {
    color: var(--text-secondary);
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-lg);
  }

  /* ===== Claridad visual ===== */
  .cohort-note {
    font-size: 0.95rem;
    line-height: 1.55;
    color: var(--text-secondary);
    background: var(--bg-card-hover);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 0.85rem 1rem;
    margin-bottom: var(--spacing-lg);
  }
  .cohort-note strong { color: var(--text-primary); }

  .chart-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .chart-wrapper { position: relative; }

  .scroll-hint {
    font-size: 0.85rem;
    color: var(--text-muted);
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .sin-datos {
    text-align: center;
    color: var(--text-secondary);
    padding: var(--spacing-xl);
  }

  .chart-legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem 1.5rem;
    margin-top: var(--spacing-md);
    padding: 0.85rem 1rem;
    background: var(--bg-main);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  .legend-item { display: inline-flex; align-items: center; gap: 0.5rem; }
  .legend-swatch { width: 1.5rem; height: 4px; border-radius: 2px; flex-shrink: 0; }
  .swatch-intermedia { background: var(--chart-intermedia); }
  .swatch-presidencial { background: var(--chart-presidencial); }
  .swatch-nacional {
    height: 3px;
    background: repeating-linear-gradient(90deg, var(--text-muted) 0 6px, transparent 6px 10px);
  }
  .swatch-dot {
    width: 0.75rem; height: 0.75rem; border-radius: 50%;
    background: var(--text-muted);
  }

  .chart-hint {
    text-align: center;
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: 0.75rem;
  }

  /* Readout fijo (no sigue al mouse); bottom sheet en móvil */
  .chart-readout {
    position: sticky;
    bottom: 0.75rem;
    margin: 1rem auto 0;
    max-width: 440px;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-left: 4px solid var(--accent-pink);
    border-radius: 10px;
    padding: 1rem 2.75rem 1rem 1.1rem;
    box-shadow: var(--shadow-md);
    text-align: left;
  }
  .readout-close {
    position: absolute;
    top: 0.35rem;
    right: 0.35rem;
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    border-radius: 8px;
  }
  .readout-close:hover { color: var(--text-primary); }
  .readout-close:focus-visible,
  .btn-toggle-table:focus-visible,
  .btn-escala:focus-visible,
  :global(.dot-hit:focus-visible) {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }
  :global(.dot-hit:focus-visible) { border-radius: 50%; }
  .readout-main { font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.6rem; }
  .readout-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
    padding: 0.25rem 0;
    border-top: 1px solid var(--border-subtle);
  }
  .readout-row strong { color: var(--text-primary); }
  .readout-delta { font-size: 0.82rem; font-weight: 600; margin-left: 0.25rem; }
  .readout-delta.up { color: var(--status-success); }
  .readout-delta.down { color: var(--status-error); }
  .readout-hint { font-size: 0.8rem; color: var(--text-muted); margin: 0.6rem 0 0; }

  :global(.dot-intermedia.is-selected),
  :global(.dot-presidencial.is-selected) {
    stroke: var(--text-primary);
    stroke-width: 4px;
  }

  .btn-escala,
  .btn-toggle-table {
    padding: 0.625rem 1.25rem;
    background: var(--btn-soft);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: all var(--transition-base);
  }

  .btn-escala:hover,
  .btn-escala:focus,
  .btn-toggle-table:hover,
  .btn-toggle-table:focus {
    background: var(--accent-pink);
    color: white;
    border-color: var(--accent-pink);
  }

  .btn-escala[aria-pressed="true"] {
    border-color: var(--accent-pink);
    color: var(--text-primary);
  }

  .chart-container {
    width: 100%;
    margin: var(--spacing-lg) 0;
    background: var(--bg-main);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    /* El SVG se dibuja aquí; si no cabe a lo ancho, el contenedor hace
       scroll interno en lugar de desbordar toda la página. */
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* El SVG lo crea D3 dinámicamente: dimensiones en píxeles por atributo.
     No forzamos width:100% para que el modo scroll funcione. */
  .chart-container :global(svg) {
    display: block;
  }

  /* D3: ejes, rejilla y línea nacional (tema oscuro/claro) */
  :global(.axis-x path),
  :global(.axis-y path),
  :global(.axis-x line),
  :global(.axis-y line) {
    stroke: var(--border-subtle);
  }
  :global(.axis-x text),
  :global(.axis-y text) {
    fill: var(--text-secondary);
    font-size: 13px;
  }
  :global(.axis-title) {
    fill: var(--text-primary);
    font-size: 13px;
  }
  :global(.grid line) {
    stroke: var(--border-subtle);
    stroke-opacity: 0.35;
  }
  :global(.grid path.domain) { display: none; }
  :global(.national-line) { opacity: 0.9; }

  .table-container {
    width: 100%;
    overflow-x: auto;
    margin: var(--spacing-xl) 0;
    background: var(--bg-main);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-subtle);
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
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
  }

  th {
    background-color: rgba(79, 70, 229, 0.1);
    color: var(--text-primary);
    padding: var(--spacing-md);
    text-align: left;
    font-weight: 600;
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid var(--accent-pink);
  }

  td {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-subtle);
    color: var(--text-primary);
  }

  tbody tr:hover {
    background-color: var(--row-hover);
  }

  tbody tr:nth-child(even) {
    background-color: var(--row-even);
  }

  .chart-disclaimer {
    margin-top: var(--spacing-lg);
    padding: var(--spacing-md);
    background-color: rgba(245, 158, 11, 0.1);
    border-left: 4px solid var(--accent-amber);
    border-radius: var(--radius-sm);
  }

  .chart-disclaimer small {
    font-size: var(--font-size-sm);
    line-height: 1.6;
    color: var(--text-secondary);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .chart-container {
      padding: var(--spacing-md);
    }

    table {
      font-size: var(--font-size-sm);
    }

    th, td {
      padding: var(--spacing-sm);
    }
  }

  /* Móvil: el detalle se ancla abajo (siempre visible al tocar un punto) */
  @media (max-width: 560px) {
    .chart-readout {
      position: fixed;
      left: 0.75rem;
      right: 0.75rem;
      bottom: 0.75rem;
      margin: 0;
      max-width: none;
      z-index: 1200;
      box-shadow: var(--shadow-lg, var(--shadow-md));
    }
  }

  /* Etiquetas numéricas de cada punto (doble codificación: valor explícito) */
  :global(.dot-label) {
    fill: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
    font-family: var(--font-heading);
    pointer-events: none;
    /* Pequeño halo para que resalte sobre la línea y la rejilla */
    stroke: var(--bg-main);
    stroke-width: 3;
    paint-order: stroke fill;
  }

  :global(.dot.intermedia) {
    /* Cuadrado: ya se dibuja como rect en JS, esta regla es por consistencia */
    shape-rendering: geometricPrecision;
  }

  /* Ajuste de etiquetas en móvil: evitar solapamiento cuando los puntos están cerca */
  @media (max-width: 560px) {
    :global(.dot-label) {
      font-size: 9px;
    }
  }
</style>
