<script>
  import { onDestroy } from 'svelte';
  import { getLatestElection } from '../utils/calculos.js';
  import { formatExactPercent, formatCohortRange, getPseudoCohortDisclaimer } from '../utils/formato.js';
  import { announceToScreenReader, prefersReducedMotion } from '../utils/a11y.js';

  export let cohortData = null;
  export let entidad = '';

  let canvas;
  let isGenerating = false;
  let logoImg = null;
  let tarjetaLista = false;
  let descargado = false;
  let mensajeDescarga = '';

  // Etapas de generación (1.1 / 1.2): feedback textual granular
  const ETAPAS = [
    { id: 'preparando', texto: 'Preparando tus datos…' },
    { id: 'diseno', texto: 'Generando el diseño de la tarjeta…' },
    { id: 'finalizando', texto: 'Aplicando colores y tipografía…' },
    { id: 'listo', texto: '¡Tarjeta lista!' }
  ];
  let etapaActual = ETAPAS[3];

  /** Espera un frame para que el navegador pinte la etapa antes del trabajo pesado */
  function respiro() {
    return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
  }

  /** Opción de "Generar sin animaciones" (5.4): sin esperas entre etapas */
  let sinAnimaciones = false;

  /** Respeta la preferencia del sistema además de la opción manual */
  $: respiroUsar = (sinAnimaciones || prefersReducedMotion()) ? () => Promise.resolve() : respiro;

  // Precargar logo para la tarjeta
  if (typeof window !== 'undefined') {
    logoImg = new Image();
    logoImg.onload = () => {
      if (cohortData && latestElection && canvas) generateCard();
    };
    logoImg.src = '/images/logo_inev2.png';
  }

  $: latestElection = cohortData ? getLatestElection(cohortData.elections) : null;
  $: participacionPct = latestElection ? latestElection.participacion_pct : 0;
  $: cohortRange = cohortData ? formatCohortRange(cohortData.year_of_birth_min, cohortData.year_of_birth_max) : '';
  
  function generateCard() {
    if (!canvas || !cohortData || !latestElection) return;

    isGenerating = true;
    tarjetaLista = false;
    descargado = false;
    etapaActual = ETAPAS[0];

    pintarCard();
  }

  async function pintarCard() {
    if (!canvas || !cohortData || !latestElection) return;

    // Alias local del elemento: `canvas` es estado del componente (bind:this), así que
    // escribir en sus propiedades (canvas.width / canvas.height) lo compila Svelte como
    // $$invalidate y marcaba el componente como sucio en cada repintado, disparando
    // infinitamente el bloque reactivo que llama a generateCard() y congelando la página.
    // Con un alias local Svelte no rastrea la mutación y no se genera el ciclo.
    const lienzo = canvas;
    const ctx = lienzo.getContext('2d');
    const width = 1080;
    const height = 1350;

    // Etapa 1: preparar el lienzo
    await respiroUsar();

    // Configurar canvas (asignar width/height también limpia el bitmap)
    lienzo.width = width;
    lienzo.height = height;

    // Etapa 2: fondo y estructura del diseño
    etapaActual = ETAPAS[1];
    await respiroUsar();

    // Fondo con gradiente INE
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#D8005F');  // Magenta INE
    gradient.addColorStop(1, '#1A2238');  // Navy INE
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Logo INE (si ya cargó)
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      const logoW = 260;
      const logoH = logoW * (logoImg.naturalHeight / logoImg.naturalWidth);
      ctx.drawImage(logoImg, (width - logoW) / 2, 40, logoW, logoH);
    }

    // Título
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Mi Generación', width / 2, 180);
    ctx.fillText('en las Urnas', width / 2, 260);
    
    // Línea decorativa
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 200, 320);
    ctx.lineTo(width / 2 + 200, 320);
    ctx.stroke();
    
    // Datos principales
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText(`Generación ${cohortRange}`, width / 2, 420);
    
    ctx.font = '36px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText(entidad, width / 2, 480);
    
    // Cifra destacada (participación 2024)
    ctx.font = 'bold 140px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText(formatExactPercent(participacionPct), width / 2, 680);
    
    const electionYear = latestElection.year;
    ctx.font = '42px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText(`participó en ${electionYear}`, width / 2, 750);
    
    // Información adicional
    const electionCount = cohortData.elections.length;
    ctx.font = '36px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText(`Datos de ${electionCount} elecciones federales`, width / 2, 870);
    ctx.fillText('2009 - 2024', width / 2, 920);
    
    // Disclaimer de pseudo-cohorte (tarea 6.3): el dato va en la imagen, no solo en la web
    ctx.font = '24px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const aviso1 = 'Seguimos grupos de edad entre elecciones, no a las mismas personas.';
    const aviso2 = 'Por eso el porcentaje puede cambiar aunque la persona no haya cambiado de opinión.';
    ctx.fillText(aviso1, width / 2, 1010);
    ctx.fillText(aviso2, width / 2, 1046);

    // URL del sitio
    ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('migeneracionenlasurnas.mx', width / 2, 1140);

    // Fuente de datos
    ctx.font = '28px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText('Fuente: INE, Conteos Censales 2009-2024', width / 2, 1230);

    // Footer
    ctx.font = '22px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText('Generada en tu navegador · Tus datos no se envían a ningún servidor', width / 2, 1290);

    // Etapa 3 → 4: cerrar y confirmar
    etapaActual = ETAPAS[3];
    isGenerating = false;
    tarjetaLista = true;

    announceToScreenReader('Tarjeta generada y lista para descargar', 'polite');
  }
  
  function downloadCard() {
    // 1.3: impedir descargas mientras se genera o antes de estar lista
    if (!canvas || isGenerating || !tarjetaLista) return;

    try {
      const nombreArchivo = `mi-generacion-${cohortRange}-${entidad}.png`;

      // Convertir canvas a blob y descargar
      canvas.toBlob((blob) => {
        if (!blob) {
          mensajeDescarga = 'No se pudo crear la imagen. Intenta de nuevo.';
          announceToScreenReader('Error al descargar la tarjeta', 'assertive');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = nombreArchivo;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        // 3.3 Confirmación visual temporal (dónde se guardó el archivo)
        descargado = true;
        mensajeDescarga = `Tarjeta descargada como ${nombreArchivo}. Revisa tu carpeta de Descargas.`;
        announceToScreenReader('Tarjeta descargada exitosamente', 'polite');

        clearTimeout(timerConfirmacion);
        timerConfirmacion = setTimeout(() => {
          descargado = false;
          mensajeDescarga = '';
        }, 6000);
      }, 'image/png');
    } catch (error) {
      console.error('Error al descargar tarjeta:', error);
      mensajeDescarga = 'Ocurrió un error al descargar. Intenta de nuevo.';
      announceToScreenReader('Error al descargar la tarjeta', 'assertive');
    }
  }

  let timerConfirmacion;

  onDestroy(() => clearTimeout(timerConfirmacion));

  // Regenerar solo cuando cambian los DATOS (no cuando cambia cualquier referencia del DOM).
  // Se usa una clave explícita en lugar de depender de `canvas`: una clave evita que una
  // invalidación espuria del elemento (p. ej. al modificar sus propiedades) reinicie el
  // ciclo de generación indefinidamente.
  $: claveTarjeta = cohortData
    ? `${cohortData.entidad_cve}-${cohortData.year_of_birth_min}-${latestElection ? latestElection.year : ''}`
    : '';

  let ultimaClaveGenerada = '';

  $: if (canvas && claveTarjeta && claveTarjeta !== ultimaClaveGenerada) {
    ultimaClaveGenerada = claveTarjeta;
    generateCard();
  }
</script>

<div class="tarjeta-container">
  <h3>Tarjeta Compartible</h3>
  <p class="subtitle">Descarga y comparte tu historia generacional</p>
  
  {#if cohortData && latestElection}
    <div class="tarjeta-content">
      <!-- 6.1 Nota de privacidad, siempre visible -->
      <div class="privacy-note">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linejoin="round"/>
        </svg>
        <span>
          <strong>Tu tarjeta se genera en tu navegador.</strong>
          No se envía a servidores: tu año de nacimiento y tu estado nunca salen de este dispositivo.
        </span>
      </div>

      <!-- 5.1 Region con nombre para la vista previa -->
      <div
        class="canvas-wrapper"
        class:is-generating={isGenerating}
        role="region"
        aria-label="Vista previa de la tarjeta, formato 1080 por 1350 píxeles"
      >
        <canvas
          bind:this={canvas}
          class="tarjeta-canvas"
          width="1080"
          height="1350"
          aria-label="Imagen de la tarjeta compartible con tu generación, estado y porcentaje de participación"
        ></canvas>

        <!-- 3.1 Skeleton mientras se genera, para que el canvas nunca quede en blanco -->
        {#if isGenerating}
          <div class="generating-overlay">
            <div class="skeleton" aria-hidden="true">
              <span class="sk-line w60"></span>
              <span class="sk-line w40"></span>
              <span class="sk-block"></span>
              <span class="sk-line w80"></span>
            </div>
            <!-- 1.4 Región de estado: anunciar la etapa a lectores de pantalla -->
            <div class="generating-status" role="status" aria-live="polite">
              <span class="spinner" aria-hidden="true"></span>
              <span class="generating-text">{etapaActual.texto}</span>
              <span class="stage-track" aria-hidden="true">
                {#each ETAPAS as e, i}
                  <span class="stage-dot" class:done={i < ETAPAS.findIndex(x => x.id === etapaActual.id)} class:current={e.id === etapaActual.id}></span>
                {/each}
              </span>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Botón de descarga -->
      <div class="download-section">
        <!-- 3.2 El botón cambia de estado al completar -->
        <button
          class="btn-download"
          on:click={downloadCard}
          disabled={isGenerating || !tarjetaLista}
          aria-label="Generar y descargar tu tarjeta como imagen PNG de 1080 por 1350 píxeles. Se genera localmente en tu navegador, sin enviar datos a servidores."
          title="Genera la imagen en tu navegador y la descarga como PNG 1080×1350. Nada se envía a servidores."
        >
          {#if isGenerating}
            <span class="loading" aria-hidden="true"></span>
            {etapaActual.texto}
          {:else if descargado}
            Descargar Tarjeta
          {:else}
            Generar y descargar tarjeta PNG 1080×1350
          {/if}
        </button>

        <!-- 3.3 Confirmación visual post-descarga -->
        {#if descargado}
          <p class="download-confirm" role="status">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{mensajeDescarga}</span>
          </p>
        {/if}

        <!-- 2.2 Reveal progresivo: la info del formato solo aparece al completar -->
        {#if tarjetaLista}
          <div class="download-info" role="status" aria-live="polite">
            <small>
              Formato: PNG 1080×1350px (Instagram Stories)<br>
              Generada localmente en tu navegador, sin envío a servidores.
            </small>
          </div>
        {/if}

        <!-- 5.4 Opción de generar sin animaciones -->
        <label class="motion-toggle">
          <input
            type="checkbox"
            bind:checked={sinAnimaciones}
            on:change={() => generateCard()}
          />
          <span>Generar sin animaciones</span>
        </label>

        <!-- 6.3 Disclaimer de pseudo-cohorte también en la vista previa -->
        <p class="cohort-disclaimer">
          {getPseudoCohortDisclaimer()}
        </p>
      </div>
      
      <!-- Instrucciones de compartir -->
      <div class="share-tips">
        <h4>Cómo compartir:</h4>
        <ul>
          <li>Comparte en Instagram, Facebook o Twitter</li>
          <li>Envía por WhatsApp a familia y amigos</li>
          <li>Incluye en presentaciones o reportes</li>
          <li>Imprime para material educativo</li>
        </ul>
      </div>
    </div>
  {:else}
    <div class="no-data">
      <p>Selecciona tu año de nacimiento y entidad para generar tu tarjeta.</p>
    </div>
  {/if}
</div>

<style>
  .tarjeta-container {
    padding: var(--spacing-lg);
  }
  
  .tarjeta-container h3 {
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
  
  .tarjeta-content {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .canvas-wrapper {
    position: relative;
    width: 100%;
    max-width: 360px;
    margin: 0 auto var(--spacing-xl);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
  }

  /* ===== Fase 6: privacidad, generación y pseudo-cohortes ===== */
  .privacy-note {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    max-width: 520px;
    margin: 0 auto var(--spacing-lg);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--color-bg-section);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--color-success);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-sm);
    line-height: 1.55;
    color: var(--color-text-secondary);
    text-align: left;
  }

  .privacy-note svg { flex-shrink: 0; margin-top: 2px; color: var(--color-success); }
  .privacy-note strong { color: var(--color-text); }

  .generating-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    background: linear-gradient(160deg, rgba(216, 0, 95, 0.92) 0%, rgba(26, 34, 56, 0.96) 100%);
    padding: 1.75rem;
  }

  /* Skeleton: evita el canvas en blanco (3.1) */
  .skeleton {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
  }

  .sk-line {
    height: 14px;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.22);
  }

  .sk-block {
    height: 90px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.3);
    margin: 0.5rem 0;
  }

  .w40 { width: 40%; }
  .w60 { width: 60%; }
  .w80 { width: 80%; }

  .generating-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: #fff;
    text-align: center;
  }

  .generating-text {
    font-size: var(--font-size-sm);
    font-weight: 600;
    min-height: 1.4em;
  }

  .stage-track {
    display: flex;
    gap: 0.4rem;
  }

  .stage-dot {
    width: 22px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.25);
    transition: background 0.2s;
  }

  .stage-dot.done { background: rgba(255, 255, 255, 0.6); }
  .stage-dot.current { background: #fff; }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(255, 255, 255, 0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .download-confirm {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    max-width: 520px;
    margin: var(--spacing-md) auto 0;
    padding: var(--spacing-md) var(--spacing-lg);
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid var(--color-success);
    border-radius: var(--border-radius-md);
    color: var(--color-text);
    font-size: var(--font-size-sm);
    line-height: 1.5;
    text-align: left;
  }

  .download-confirm svg { flex-shrink: 0; margin-top: 2px; color: var(--color-success); }

  .motion-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: var(--spacing-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    cursor: pointer;
    min-height: 32px;
  }

  .motion-toggle input { width: 1rem; height: 1rem; cursor: pointer; accent-color: var(--color-primary); }
  .motion-toggle input:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }

  .cohort-disclaimer {
    max-width: 520px;
    margin: var(--spacing-md) auto 0;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(245, 158, 11, 0.1);
    border-left: 3px solid var(--color-accent);
    border-radius: var(--border-radius-sm);
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
    text-align: left;
  }
  
  .tarjeta-canvas {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .download-section {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }
  
  .btn-download {
    padding: var(--spacing-lg) var(--spacing-2xl);
    font-size: var(--font-size-lg);
    font-weight: 700;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    color: white;
    border: none;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-base);
    box-shadow: var(--shadow-md);
    min-width: 280px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }
  
  .btn-download:hover:not(:disabled),
  .btn-download:focus:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  .btn-download:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .download-info {
    margin-top: var(--spacing-md);
    color: var(--color-text-secondary);
  }
  
  .download-info small {
    font-size: var(--font-size-sm);
    line-height: 1.6;
  }
  
  .share-tips {
    padding: var(--spacing-xl);
    background-color: var(--color-bg-section);
    border-radius: var(--border-radius-lg);
    border-left: 4px solid var(--color-accent);
  }
  
  .share-tips h4 {
    font-size: var(--font-size-lg);
    color: var(--color-primary);
    margin-bottom: var(--spacing-md);
  }
  
  .share-tips ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .share-tips li {
    padding: var(--spacing-sm) 0;
    font-size: var(--font-size-base);
    line-height: 1.6;
  }
  
  .no-data {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
  }
  
  /* Animación de generación */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .btn-download:disabled {
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .btn-download:disabled {
      animation: none;
    }
    
    .stage-dot {
      transition: none;
    }

    .spinner {
      animation: none;
      border-top-color: #fff;
      border-right-color: #fff;
    }
    
    .btn-download:hover:not(:disabled),
    .btn-download:focus:not(:disabled) {
      transform: none;
    }
  }
  
  /* Responsive */
  @media (max-width: 640px) {
    .btn-download {
      width: 100%;
      min-width: auto;
    }
  }
</style>
