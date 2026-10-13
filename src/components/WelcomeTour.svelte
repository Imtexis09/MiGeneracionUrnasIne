<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  /**
   * Recorrido guiado de primer uso (Fase 2 del plan de intuitividad).
   * 3 pasos: año de nacimiento, entidad, preview de resultados.
   * Recuerda en sessionStorage si ya se completó o se omitió.
   */

  export let yearOfBirth = null;
  export let entidadNombre = '';
  export let participacion = null;
  export let anioEleccion = null;

  const dispatch = createEventDispatcher();
  const STORAGE_KEY = 'welcome-tour-completado';

  let paso = 0;
  let dialogoEl;
  let botonCerrarEl;
  let elementoPrevio = null;

  onMount(() => {
    elementoPrevio = document.activeElement;
    document.body.style.overflow = 'hidden';
    // Foco en el botón de cierre (WCAG 2.4.3)
    requestAnimationFrame(() => botonCerrarEl?.focus());
    window.addEventListener('keydown', onKeydown);
  });

  onDestroy(() => {
    document.body.style.overflow = '';
    window.removeEventListener('keydown', onKeydown);
  });

  function onKeydown(event) {
    if (event.key === 'Escape') {
      cerrar();
    } else if (event.key === 'Tab') {
      trapFoco(event);
    } else if (event.key === 'ArrowRight' && paso < 2) {
      siguiente();
    } else if (event.key === 'ArrowLeft' && paso > 0) {
      anterior();
    }
  }

  // Mantener el foco dentro del diálogo mientras esté abierto
  function trapFoco(event) {
    if (!dialogoEl) return;
    const focusables = dialogoEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  }

  function marcarVisto() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { /* modo privado: se muestra de nuevo */ }
  }

  function siguiente() {
    if (paso < 2) {
      paso += 1;
      anunciarPaso();
    } else {
      cerrar();
    }
  }

  function anterior() {
    if (paso > 0) {
      paso -= 1;
      anunciarPaso();
    }
  }

  function cerrar() {
    marcarVisto();
    dispatch('close');
    // Devolver el foco al elemento que abrió el tour (WCAG 2.4.3)
    requestAnimationFrame(() => {
      if (elementoPrevio && elementoPrevio.isConnected !== false) {
        elementoPrevio.focus?.();
      }
    });
  }

  function saltar() {
    marcarVisto();
    dispatch('close');
  }

  function anunciarPaso() {
    requestAnimationFrame(() => dialogoEl?.focus());
  }

  // ¿Hay resultado real para mostrar en el preview?
  $: hayPreview = participacion !== null && anioEleccion !== null;

  $: titulos = [
    'Paso 1 de 2 · Tu año de nacimiento',
    'Paso 2 de 2 · Tu entidad',
    'Y con eso… tu resultado'
  ];

  $: cuerpos = [
    'Tu año de nacimiento define a qué "generación" te comparamos. Usamos grupos de 5 años, no personas individuales.',
    'Tu estado (entidad federativa) filtra los conteos censales del INE. Con estos dos datos ya podemos mostrarte tu resultado.'
  ];
</script>

<div class="tour-backdrop" on:click|self={saltar} role="presentation">
  <div
    class="tour-dialog"
    bind:this={dialogoEl}
    role="dialog"
    aria-modal="true"
    aria-labelledby="tour-title"
    aria-describedby="tour-desc"
    tabindex="-1"
  >
    <button class="tour-close" bind:this={botonCerrarEl} on:click={saltar} aria-label="Cerrar la guía">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Indicador de pasos del tour -->
    <div class="tour-dots" aria-hidden="true">
      {#each [0, 1, 2] as i}
        <span class="tour-dot" class:active={i === paso}></span>
      {/each}
    </div>
    <p class="sr-only" aria-live="polite">Paso {paso + 1} de 3 de la guía</p>

    <h2 class="tour-title" id="tour-title">{titulos[paso]}</h2>

    {#if paso < 2}
      <p class="tour-text" id="tour-desc">{cuerpos[paso]}</p>

      <div class="tour-visual" aria-hidden="true">
        {#if paso === 0}
          <div class="mock-field">
            <span class="mock-label"><span class="mock-num">1</span> ¿En qué año naciste?</span>
            <span class="mock-input">{yearOfBirth ?? 'Elige tu año'}</span>
          </div>
          <div class="mock-field faded">
            <span class="mock-label"><span class="mock-num">2</span> ¿En qué estado vives?</span>
            <span class="mock-input">Pendiente</span>
          </div>
        {:else}
          <div class="mock-field done">
            <span class="mock-label"><span class="mock-num">1</span> ¿En qué año naciste?</span>
            <span class="mock-input">{yearOfBirth ?? 'Listo'}</span>
          </div>
          <div class="mock-field">
            <span class="mock-label"><span class="mock-num">2</span> ¿En qué estado vives?</span>
            <span class="mock-input">{entidadNombre || 'Elige tu estado'}</span>
          </div>
        {/if}
      </div>
    {:else}
      <p class="tour-text" id="tour-desc">Así se verá tu resultado. Todo se calcula en tu navegador y no se envía a ningún servidor.</p>

      <div class="tour-preview" id="tour-desc-preview">
        {#if hayPreview}
          <p class="preview-main">
            De cada 100 personas nacidas en {yearOfBirth} que viven en {entidadNombre},
            aproximadamente <strong>{Math.round(participacion)}</strong> voting on {anioEleccion}.
          </p>
        {:else}
          <p class="preview-placeholder">Tu resultado aparecerá aquí en cuanto elijas tus 2 datos.</p>
        {/if}
      </div>

      <p class="tour-note">
        Usamos <strong>pseudo-cohortes</strong>: seguimos grupos de edad entre elecciones, no a las mismas personas.
      </p>
    {/if}

    <div class="tour-actions">
      <button class="btn-skip" on:click={saltar}>Omitir guía</button>
      <div class="tour-nav">
        {#if paso > 0}
          <button class="btn-back" on:click={anterior}>Atrás</button>
        {/if}
        <button class="btn-next" on:click={siguiente}>
          {paso === 2 ? 'Empezar' : 'Siguiente'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .tour-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    z-index: 2000;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .tour-dialog {
    position: relative;
    background: var(--color-bg-section);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 2rem;
    max-width: 520px;
    width: 100%;
    box-shadow: var(--shadow-md);
    text-align: center;
  }

  .tour-dialog:focus {
    outline: none;
  }

  .tour-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    line-height: 0;
  }

  .tour-close:hover {
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.06);
  }

  .tour-close:focus-visible,
  .btn-next:focus-visible,
  .btn-back:focus-visible,
  .btn-skip:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  .tour-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .tour-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-border);
    transition: background var(--transition-base), width var(--transition-base);
  }

  .tour-dot.active {
    background: var(--color-primary);
    width: 24px;
    border-radius: 999px;
  }

  .tour-title {
    font-size: clamp(1.25rem, 3vw, 1.6rem);
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 0.75rem;
  }

  .tour-text {
    font-size: 1rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .tour-visual {
    display: grid;
    gap: 0.75rem;
    text-align: left;
    margin-bottom: 1.5rem;
  }

  .mock-field {
    display: grid;
    gap: 0.35rem;
    padding: 0.85rem 1rem;
    border: 2px solid var(--color-border);
    border-radius: 10px;
  }

  .mock-field.faded {
    opacity: 0.5;
  }

  .mock-field.done {
    border-color: var(--color-primary);
  }

  .mock-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .mock-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .mock-input {
    font-size: 1rem;
    color: var(--color-text-secondary);
  }

  .tour-preview {
    background: var(--color-bg-alt);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--color-primary);
    border-radius: 10px;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .preview-main {
    font-size: 1.05rem;
    line-height: 1.5;
    color: var(--color-text);
  }

  .preview-main strong {
    color: var(--color-primary);
  }

  .preview-placeholder {
    font-size: 0.95rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  .tour-note {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }

  .tour-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .tour-nav {
    display: flex;
    gap: 0.5rem;
  }

  .btn-skip {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 0.5rem;
  }

  .btn-back {
    background: none;
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 0.7rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-next {
    background: var(--gradient-primary);
    border: none;
    color: #fff;
    padding: 0.7rem 1.75rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  @media (max-width: 480px) {
    .tour-dialog { padding: 1.5rem 1.25rem; }
    .tour-actions { flex-direction: column-reverse; }
    .tour-nav { width: 100%; justify-content: space-between; }
    .btn-next { flex: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .tour-backdrop { animation: none; }
    .tour-dot { transition: none; }
  }
</style>