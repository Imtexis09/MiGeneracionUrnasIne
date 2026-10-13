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
    // Mover el foco al título al abrir (WCAG 2.4.3)
    const title = document.getElementById('metodologia-title');
    title?.focus();
  });

  const citationText = getCitationText();
</script>

<article class="metodologia-container" aria-labelledby="metodologia-title">
  <!-- Header con botón de cerrar -->
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
    <!-- Sección 1: Fuente de Datos -->
    <section class="metodologia-section">
      <h3>Fuente de Datos</h3>
      <p>
        Los datos provienen de los <strong>Conteos Censales de Proceso Constitucional (CCPC)</strong> 
        del Instituto Nacional Electoral (INE), que registran la participación electoral por edad, 
        entidad y año electoral.
      </p>
      <ul>
        <li><strong>Período:</strong> 2009–2024</li>
        <li><strong>Elecciones:</strong> 6 procesos electorales federales</li>
        <li><strong>Cobertura:</strong> 32 entidades federativas de México</li>
      </ul>
        <p>
        <a
          href="https://www.ine.mx/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visitar sitio oficial del INE (se abre en nueva pestaña)"
        >
          Visitar sitio oficial del INE
        </a>
      </p>
    </section>
    
    <!-- Sección 2: Definiciones Clave -->
    <section class="metodologia-section">
      <h3>Definiciones Clave</h3>
      
      <div class="definition">
        <h4>Participación Electoral</h4>
        <p class="formula">
          <code>Participación (%) = 100 × (Sí Votaron) / (Sí Votaron + No Votaron)</code>
        </p>
        <p>
          Se calcula <strong>solo entre personas en Lista Nominal</strong>, no como porcentaje 
          de la población total. Los "No Especificados" (NS) se excluyen del denominador 
          siguiendo la fórmula oficial del INE.
        </p>
      </div>
      
      <div class="definition">
        <h4>Generación (Cohorte)</h4>
        <p>
          Una generación agrupa personas nacidas en un <strong>rango de 3 años consecutivos</strong> 
          (ejemplo: 1998–2000). Este agrupamiento absorbe la imprecisión de ±1 año en la edad 
          cumplida al día de la elección.
        </p>
      </div>
      
      <div class="definition">
        <h4>Pseudo-Cohorte</h4>
        <p class="warning">
          <strong>Importante:</strong> Este análisis NO sigue a las mismas personas entre elecciones. 
          Se siguen <strong>grupos de edad</strong> en diferentes momentos. La Lista Nominal cambia 
          por altas, bajas y cambios de domicilio.
        </p>
      </div>
      
      <div class="definition">
        <h4>Familias de Elecciones</h4>
        <p>Las elecciones se agrupan en dos familias:</p>
        <ul>
          <li><strong>Intermedias:</strong> 2009, 2015, 2021 (participación ~40–50%)</li>
          <li><strong>Presidenciales:</strong> 2012, 2018, 2024 (participación ~60–65%)</li>
        </ul>
        <p class="warning">
          Solo se comparan elecciones <strong>dentro de la misma familia</strong>. 
          Comparar 2018 con 2021 sería incorrecto.
        </p>
      </div>
    </section>
    
    <!-- Sección 3: Límites del Análisis -->
    <section class="metodologia-section">
      <h3>Límites del Análisis</h3>
      
      <div class="limits">
        <h4>Lo que SÍ muestra este sitio:</h4>
        <ul class="check-list">
          <li>Tendencias de participación por cohorte</li>
          <li>Comparación edad vs. generación</li>
          <li>Datos agregados oficiales del INE</li>
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
    
    <!-- Sección 4: Cómo Citar -->
    <section class="metodologia-section">
      <h3>Cómo Citar</h3>
      <div class="citation-box">
        <p>{citationText}</p>
      </div>
      <p>
        <strong>Referencia corta:</strong> Fuente: INE, CCPC 2009–2024
      </p>
    </section>
    
    <!-- Sección 5: Privacidad y Transparencia -->
    <section class="metodologia-section">
      <h3>Privacidad y Transparencia</h3>
      <ul>
        <li>Solo datos agregados del CCPC (públicos)</li>
        <li>Cero cookies de rastreo</li>
        <li>Cero analítica de terceros</li>
        <li>Tu selección NO se guarda ni se envía a servidores</li>
        <li>Todo el procesamiento ocurre en tu navegador</li>
      </ul>
    </section>
    
    <!-- Sección 6: Accesibilidad -->
    <section class="metodologia-section">
      <h3>Accesibilidad</h3>
      <p>
        Este sitio cumple con los estándares <strong>WCAG 2.1 nivel AA</strong>:
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
  
  <!-- Footer con botón de cierre -->
  <div class="metodologia-footer">
    <button class="btn-primary" on:click={handleClose}>
      Volver al Contenido Principal
    </button>
  </div>
</article>

<svelte:window on:keydown={handleKeydown} />

<style>
  .metodologia-container {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }
  
  .metodologia-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 3px solid var(--color-primary);
  }
  
  .metodologia-header h2 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    color: var(--color-primary);
    margin: 0;
  }
  
  .btn-close {
    width: 44px;
    height: 44px;
    border: none;
    background-color: var(--color-bg-alt);
    color: var(--color-text);
    font-size: 1.25rem;
    line-height: 1;
    padding: 0;
    border-radius: 50%;
    cursor: pointer;
    transition: all var(--transition-base);
    flex-shrink: 0;
    align-self: flex-start;
    margin-top: 0.25rem;
  }
  
  .btn-close:hover,
  .btn-close:focus {
    background-color: var(--color-error);
    color: white;
    transform: rotate(90deg);
  }

  .btn-close:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  #metodologia-title:focus {
    outline: none;
  }
  
  .metodologia-content {
    margin-bottom: var(--spacing-2xl);
  }
  
  .metodologia-section {
    margin-bottom: var(--spacing-2xl);
    padding: var(--spacing-xl);
    background-color: var(--color-bg-section);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
  }
  
  .metodologia-section h3 {
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    color: var(--color-primary);
    margin-bottom: var(--spacing-lg);
  }
  
  .metodologia-section h4 {
    font-size: var(--font-size-lg);
    color: var(--color-text);
    margin-top: var(--spacing-lg);
    margin-bottom: var(--spacing-sm);
  }
  
  .metodologia-section p {
    line-height: 1.7;
    color: var(--color-text);
    margin-bottom: var(--spacing-md);
  }
  
  .metodologia-section ul {
    margin-left: var(--spacing-xl);
    margin-bottom: var(--spacing-md);
  }
  
  .metodologia-section li {
    line-height: 1.7;
    margin-bottom: var(--spacing-sm);
  }
  
  .metodologia-section a {
    color: var(--color-primary);
    font-weight: 600;
    text-decoration: underline;
  }
  
  .definition {
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background-color: var(--color-bg-alt);
    border-left: 4px solid var(--color-accent);
    border-radius: var(--border-radius-sm);
  }
  
  .formula {
    padding: var(--spacing-md);
    background-color: var(--color-bg-alt);
    border-radius: var(--border-radius-sm);
    font-family: 'Courier New', monospace;
    overflow-x: auto;
  }
  
  .formula code {
    color: var(--color-primary);
    font-size: var(--font-size-sm);
  }
  
  .warning {
    padding: var(--spacing-md);
    background-color: var(--color-bg-warning);
    border-left: 4px solid var(--color-accent);
    border-radius: var(--border-radius-sm);
  }
  
  .limits h4 {
    margin-top: var(--spacing-lg);
  }
  
  .check-list,
  .cross-list {
    list-style: none;
    margin-left: 0;
  }
  
  .check-list li::before {
    content: '✓';
    color: var(--color-success);
    font-weight: 700;
    margin-right: var(--spacing-xs);
  }

  .cross-list li::before {
    content: '✗';
    color: var(--color-error);
    font-weight: 700;
    margin-right: var(--spacing-xs);
  }
  
  .citation-box {
    padding: var(--spacing-lg);
    background-color: var(--color-bg-alt);
    border-left: 4px solid var(--color-primary);
    border-radius: var(--border-radius-sm);
    font-style: italic;
  }
  
  .citation-box p {
    margin: 0;
  }
  
  .metodologia-footer {
    text-align: center;
    padding-top: var(--spacing-xl);
    border-top: 2px solid var(--color-border);
  }
  
  /* Responsive */
  @media (max-width: 640px) {
    .metodologia-header {
      flex-direction: column;
      gap: var(--spacing-md);
      text-align: center;
    }
    
    .btn-close {
      align-self: flex-end;
    }
  }
  
  /* Animación de entrada */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .metodologia-container {
    animation: fadeIn 0.4s ease-out;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .metodologia-container {
      animation: none;
    }
    
    .btn-close:hover,
    .btn-close:focus {
      transform: none;
    }
  }
</style>
