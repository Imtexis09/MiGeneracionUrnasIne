<script>
  import { onMount } from 'svelte';
  import { getLatestElection, getCohortMidpoint } from '../utils/calculos.js';
  import { formatExactPercent, formatCohortRange } from '../utils/formato.js';
  import { announceToScreenReader } from '../utils/a11y.js';
  
  export let cohortData = null;
  export let yearOfBirth = null;
  export let entidad = '';
  
  let canvas;
  let isGenerating = false;
  
  $: latestElection = cohortData ? getLatestElection(cohortData.elections) : null;
  $: participacionPct = latestElection ? latestElection.participacion_pct : 0;
  $: cohortRange = cohortData ? formatCohortRange(cohortData.year_of_birth_min, cohortData.year_of_birth_max) : '';
  $: cohortMidpoint = cohortData ? getCohortMidpoint(cohortData.year_of_birth_min, cohortData.year_of_birth_max) : yearOfBirth;
  
  function generateCard() {
    if (!canvas || !cohortData || !latestElection) return;
    
    isGenerating = true;
    
    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1350;
    
    // Configurar canvas
    canvas.width = width;
    canvas.height = height;
    
    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#6C1C5C');  // Morado INE
    gradient.addColorStop(1, '#C84B8A');  // Rosa
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
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
    
    ctx.font = '42px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText('participó en 2024', width / 2, 750);
    
    // Información adicional
    const electionCount = cohortData.elections.length;
    ctx.font = '36px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText(`Datos de ${electionCount} elecciones federales`, width / 2, 870);
    ctx.fillText('2009 - 2024', width / 2, 920);
    
    // URL del sitio
    ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText('migenera cionenlasurnas.mx', width / 2, 1040);
    
    // Fuente de datos
    ctx.font = '28px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText('Fuente: INE, CCPC 2009-2024', width / 2, 1140);
    
    // Footer
    ctx.font = '24px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Hackathon INE 2026 · Reto 3: Storytelling con Datos', width / 2, 1260);
    
    isGenerating = false;
    
    announceToScreenReader('Tarjeta generada y lista para descargar', 'polite');
  }
  
  function downloadCard() {
    if (!canvas) return;
    
    try {
      // Convertir canvas a blob y descargar
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `mi-generacion-${cohortRange}-${entidad}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        announceToScreenReader('Tarjeta descargada exitosamente', 'polite');
      }, 'image/png');
    } catch (error) {
      console.error('Error al descargar tarjeta:', error);
      announceToScreenReader('Error al descargar la tarjeta', 'assertive');
    }
  }
  
  onMount(() => {
    if (cohortData && latestElection) {
      generateCard();
    }
  });
  
  // Regenerar cuando cambien los datos
  $: if (cohortData && latestElection && canvas) {
    generateCard();
  }
</script>

<div class="tarjeta-container">
  <h3>Tarjeta Compartible</h3>
  <p class="subtitle">Descarga y comparte tu historia generacional</p>
  
  {#if cohortData && latestElection}
    <div class="tarjeta-content">
      <!-- Vista previa de la tarjeta -->
      <div class="canvas-wrapper">
        <canvas
          bind:this={canvas}
          class="tarjeta-canvas"
          aria-label="Vista previa de tarjeta compartible"
        ></canvas>
      </div>
      
      <!-- Botón de descarga -->
      <div class="download-section">
        <button
          class="btn-download"
          on:click={downloadCard}
          disabled={isGenerating}
          aria-label="Descargar tarjeta como imagen PNG 1080x1350"
        >
          {#if isGenerating}
            <span class="loading"></span>
            Generando...
          {:else}
            📥 Descargar Tarjeta
          {/if}
        </button>
        
        <p class="download-info">
          <small>
            📱 Formato: PNG 1080×1350px (Instagram Stories)<br>
            🔒 Generada localmente en tu navegador (sin envío a servidores)
          </small>
        </p>
      </div>
      
      <!-- Instrucciones de compartir -->
      <div class="share-tips">
        <h4>💡 Cómo compartir:</h4>
        <ul>
          <li>📱 Comparte en Instagram, Facebook o Twitter</li>
          <li>💬 Envía por WhatsApp a familia y amigos</li>
          <li>📧 Incluye en presentaciones o reportes</li>
          <li>🖨️ Imprime para material educativo</li>
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
    max-width: 540px;
    margin: 0 auto var(--spacing-xl);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
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
