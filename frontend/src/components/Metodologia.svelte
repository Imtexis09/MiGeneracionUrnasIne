<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { getCitationText } from '../utils/formato.js';

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  onMount(() => {
    const title = document.getElementById('metodologia-title');
    title?.focus();
  });

  const citationText = getCitationText();
</script>

<article class="metodologia-container" aria-labelledby="metodologia-title">
  <div class="metodologia-header">
    <h2 id="metodologia-title" tabindex="-1">Metodología y Fuentes</h2>
    <button
      class="btn-close"
      on:click={handleClose}
      aria-label="Cerrar metodología y volver al contenido principal"
    >
      <span aria-hidden="true">✕</span>
    </button>
  </div>
  
  <div class="metodologia-content">
    <section class="metodologia-section">
      <h3>Fuente de Datos</h3>
      <p>
        Los datos provienen de los <strong>Conteos Censales de Proceso Constitucional (CCPC)</strong> 
        del Instituto Nacional Electoral (INE), que registran cuántas personas van a votar por edad, 
        estado y año electoral.
      </p>
      <ul>
        <li><strong>Período:</strong> 2009–2024</li>
        <li><strong>Elecciones:</strong> 6 procesos electorales federales</li>
        <li><strong>Cobertura:</strong> 32 estados de México</li>
      </ul>
        <p>
        <a
          href="https://www.ine.mx/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visitar sitio oficial del Instituto Nacional Electoral (INE), se abre en nueva pestaña"
        >
          Visitar sitio oficial del Instituto Nacional Electoral (INE)
        </a>
      </p>
      <p>
        Si no hay datos suficientes para tu estado y tu generación, el sitio muestra los
        <strong>datos nacionales</strong> y lo indica en pantalla y en la imagen.
      </p>
    </section>
    
    <section class="metodologia-section">
      <h3>Definiciones Clave</h3>
      
      <div class="definition">
        <h4>Cuántas personas van a votar</h4>
        <p class="formula">
          <code>Participación (%) = 100 × (Sí Votaron) / (Sí Votaron + No Votaron)</code>
        </p>
        <p>
          Se calcula <strong>solo entre personas registradas para votar</strong>, no como porcentaje 
          de la población total. Los "No Especificados" se excluyen del denominador.
          Se usa la lista nominal; no incluye casillas especiales ni residentes en el extranjero, por lo que
          las cifras pueden diferir ligeramente de la participación oficial publicada por el Instituto Nacional Electoral (INE).
        </p>
      </div>
      
      <div class="definition">
        <h4>Tu generación (grupo de edad)</h4>
        <p>
          Una generación agrupa personas nacidas en un <strong>rango de 3 años consecutivos</strong> 
          (ejemplo: 1998–2000). Este agrupamiento absorbe la imprecisión de ±1 año en la edad 
          cumplida al día de la elección.
        </p>
      </div>
      
      <div class="definition">
        <h4>Pseudo-cohorte (grupos de edad)</h4>
        <p class="warning">
          <strong>Importante:</strong> Este análisis NO sigue a las mismas personas entre elecciones. 
          Se siguen <strong>grupos de edad</strong> en diferentes momentos. La lista de personas 
          registradas para votar cambia por altas, bajas y cambios de domicilio.
        </p>
      </div>
      
      <div class="definition">
        <h4>Familias de Elecciones</h4>
        <p>Las elecciones se agrupan en dos familias:</p>
        <ul>
          <li><strong>Intermedias:</strong> 2009, 2015, 2021 (participación nacional ~44–52%)</li>
          <li><strong>Presidenciales:</strong> 2012, 2018, 2024 (participación nacional ~60–62%)</li>
        </ul>
        <p class="warning">
          Solo se comparan elecciones <strong>dentro de la misma familia</strong>. 
          Comparar 2018 con 2021 sería incorrecto.
        </p>
      </div>
    </section>
    
    <section class="metodologia-section">
      <h3>Límites del Análisis</h3>
      
      <div class="limits">
        <h4>Lo que SÍ muestra este sitio:</h4>
        <ul class="check-list">
          <li>Tendencias de cuántas personas van a votar por grupo de edad</li>
          <li>Comparación entre edad y generación</li>
          <li>Datos agregados oficiales del Instituto Nacional Electoral (INE)</li>
          <li>Análisis descriptivo neutral</li>
        </ul>
        
        <h4>Lo que NO muestra:</h4>
        <ul class="cross-list">
          <li>Seguimiento de personas individuales</li>
          <li>Resultados por partido político</li>
          <li>Predicciones o análisis causal</li>
          <li>Datos de elecciones locales</li>
          <li>Segmentación por sexo (inconsistencia histórica)</li>
        </ul>
      </div>
    </section>
    
    <section class="metodologia-section">
      <h3>Cómo Citar</h3>
      <div class="citation-box">
        <p>{citationText}</p>
      </div>
      <p>
        <strong>Referencia corta:</strong> Fuente: Instituto Nacional Electoral (INE), Conteos Censales de Proceso Constitucional (CCPC) 2009–2024
      </p>
    </section>
    
    <section class="metodologia-section">
      <h3>Privacidad y Transparencia</h3>
      <ul>
        <li>Solo datos agregados de los Conteos Censales de Proceso Constitucional (CCPC), que son públicos</li>
        <li>Cero cookies de rastreo</li>
        <li>Cero analítica de terceros</li>
        <li>Tu selección NO se guarda ni se envía a servidores</li>
        <li>Todo el procesamiento ocurre en tu navegador</li>
      </ul>
      <p>
        La imagen para compartir se dibuja en tu navegador y se descarga como una
        <strong>imagen vertical de 1792 × 2400 px</strong>.
      </p>
    </section>
    
    <section class="metodologia-section">
      <h3>Accesibilidad</h3>
      <p>
        Este sitio cumple con los estándares <strong>Pautas de Accesibilidad para el Contenido Web (WCAG, por sus siglas en inglés) versión 2.1, nivel de conformidad AA</strong>:
      </p>
      <ul>
        <li>Navegación completa por teclado</li>
        <li>Contraste de color ≥ 4.5:1</li>
        <li>Texto alternativo en visualizaciones</li>
        <li>Tablas equivalentes para lectores de pantalla</li>
        <li>Respeto a preferencias de movimiento reducido</li>
      </ul>
    </section>
  </div>
  
  <div class="metodologia-footer">
    <button class="btn-primary" on:click={handleClose}>
      Volver al Contenido Principal
    </button>
  </div>
</article>

<svelte:window on:keydown={handleKeydown} />

<style>
  .metodologia-container {
    max-width: 64rem;
  }

  .metodologia-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 2.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 1.5px solid var(--rule-strong);
  }

  .metodologia-header h2 {
    font-size: var(--size-title);
    margin: 0;
  }

  #metodologia-title:focus-visible {
    outline: 3px solid var(--border-focus);
    outline-offset: 4px;
  }

  .btn-close {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid var(--rule-strong);
    border-radius: var(--radius-sm);
    font-size: 1.1rem;
    line-height: 1;
    color: var(--text-primary);
    transition: background-color var(--transition-fast), color var(--transition-fast);
  }

  .btn-close:hover {
    background: var(--ink);
    color: var(--bg-main);
  }

  .metodologia-content {
    margin-bottom: 3rem;
  }

  .metodologia-section {
    padding: 1.5rem 0 2.25rem;
    border-top: 1.5px solid var(--rule-strong);
  }

  .metodologia-section h3 {
    font-family: var(--font-display);
    font-size: clamp(1.9rem, 4vw, 2.5rem);
    font-weight: 800;
    line-height: 1;
    margin-bottom: 1.25rem;
  }

  .metodologia-section h4 {
    font-size: var(--font-size-lg);
    margin: 1.5rem 0 0.5rem;
  }

  .metodologia-section p {
    max-width: var(--measure);
    line-height: 1.7;
    margin-bottom: 1rem;
  }

  .metodologia-section ul {
    max-width: var(--measure);
    margin: 0 0 1rem 1.25rem;
    color: var(--text-secondary);
  }

  .metodologia-section li {
    line-height: 1.7;
    margin-bottom: 0.4rem;
    padding-left: 0.25rem;
  }

  .definition {
    margin-bottom: 1.75rem;
    padding-left: 1.1rem;
    border-left: 3px solid var(--line);
  }

  .definition h4 {
    margin-top: 0;
  }

  .formula {
    padding: 0.85rem 1rem;
    background: var(--bg-card);
    border: 1px solid var(--line);
    overflow-x: auto;
  }

  .formula code {
    font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .warning {
    padding: 0.85rem 1rem;
    background: var(--bg-warning);
    border-left: 3px solid var(--accent-pink);
    color: var(--text-primary);
  }

  .check-list,
  .cross-list {
    list-style: none;
    margin-left: 0 !important;
  }

  .check-list li,
  .cross-list li {
    position: relative;
    padding-left: 2rem;
  }

  .check-list li::before,
  .cross-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.32em;
    width: 1.1rem;
    height: 1.1rem;
    border: 1.5px solid var(--rule-strong);
    border-radius: 2px;
  }

  .check-list li::after {
    content: '';
    position: absolute;
    left: 0.1rem;
    top: calc(0.32em + 0.1rem);
    width: 0.9rem;
    height: 0.9rem;
    background: var(--accent-pink);
    -webkit-mask: var(--tache) center / contain no-repeat;
    mask: var(--tache) center / contain no-repeat;
  }

  .cross-list li::before {
    border-style: dashed;
    border-color: var(--text-muted);
  }

  .citation-box {
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
    background: var(--bg-card);
    border-left: 3px solid var(--accent-pink);
  }

  .citation-box p {
    margin: 0;
    font-style: italic;
  }

  .metodologia-footer {
    padding-top: 1.5rem;
    border-top: 1.5px solid var(--rule-strong);
  }

  @media (max-width: 640px) {
    .metodologia-header {
      margin-bottom: 1.75rem;
    }
  }
</style>
