<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { mdToHtml } from '../utils/markdown.js';

  const dispatch = createEventDispatcher();

  /** Ruta del reporte (se sigue generando como archivo estático) */
  const RUTA_REPORTE = '/data/reporte_validacion.md';

  let estado = 'cargando'; // 'cargando' | 'listo' | 'error'
  let html = '';

  function handleClose() {
    dispatch('close');
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') handleClose();
  }

  async function cargar() {
    estado = 'cargando';
    try {
      const res = await fetch(RUTA_REPORTE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const texto = await res.text();
      // Si el servidor devuelve index.html por una ruta inexistente, es un error
      if (/^\s*<!doctype html|^\s*<html/i.test(texto)) throw new Error('Respuesta no válida');
      html = mdToHtml(texto);
      estado = 'listo';
    } catch (e) {
      console.error('Error cargando el reporte de validación:', e);
      estado = 'error';
    }
  }

  onMount(() => {
    // Mover el foco al título al abrir (WCAG 2.4.3)
    document.getElementById('validacion-title')?.focus();
    cargar();
  });
</script>

<article class="validacion-container" aria-labelledby="validacion-title">
  <div class="validacion-header">
    <h2 id="validacion-title" tabindex="-1">Reporte de Validación</h2>
    <button
      class="btn-close"
      on:click={handleClose}
      aria-label="Cerrar el reporte de validación y volver al contenido principal"
    >
      <span aria-hidden="true">✕</span>
    </button>
  </div>

  <div class="validacion-content" aria-live="polite">
    {#if estado === 'cargando'}
      <p role="status">Cargando el reporte…</p>
    {:else if estado === 'error'}
      <div class="validacion-error" role="alert">
        <p>No pudimos cargar el reporte de validación.</p>
        <button class="btn-primary" on:click={cargar}>Reintentar</button>
      </div>
    {:else}
      <div class="md">{@html html}</div>
    {/if}
  </div>

  <div class="validacion-footer">
    <button class="btn-primary" on:click={handleClose}>
      Volver al Contenido Principal
    </button>
  </div>
</article>

<svelte:window on:keydown={handleKeydown} />

<style>
  /* Ocupa todo el ancho y alto disponible de la ventana */
  .validacion-container {
    width: 100%;
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
  }

  .validacion-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 2.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 1.5px solid var(--rule-strong);
  }

  .validacion-header h2 {
    font-size: var(--size-title);
    margin: 0;
  }

  #validacion-title:focus-visible {
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

  .validacion-content {
    flex: 1 0 auto;
    margin-bottom: 3rem;
    min-height: 8rem;
  }

  .validacion-error {
    padding: 1rem 1.25rem;
    background: var(--bg-warning);
    border-left: 3px solid var(--accent-pink);
  }

  .validacion-error p {
    margin: 0 0 1rem;
  }

  .validacion-footer {
    padding-top: 1.5rem;
    border-top: 1.5px solid var(--rule-strong);
  }

  /* ---- Contenido del Markdown (inyectado con {@html}) ---- */
  .md :global(h3) {
    font-family: var(--font-display);
    font-size: clamp(1.9rem, 4vw, 2.5rem);
    font-weight: 800;
    line-height: 1;
    margin: 0 0 1.25rem;
  }

  .md :global(h4) {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3vw, 1.9rem);
    font-weight: 800;
    line-height: 1.1;
    margin: 2.25rem 0 1rem;
    padding-top: 1.5rem;
    border-top: 1.5px solid var(--rule-strong);
  }

  .md :global(h5) {
    font-size: var(--font-size-lg);
    margin: 1.5rem 0 0.5rem;
  }

  .md :global(h6) {
    margin: 1.25rem 0 0.5rem;
  }

  .md :global(p) {
    line-height: 1.7;
    margin-bottom: 1rem;
  }

  .md :global(ul),
  .md :global(ol) {
    margin: 0 0 1rem 1.25rem;
    color: var(--text-secondary);
  }

  .md :global(li) {
    line-height: 1.7;
    margin-bottom: 0.4rem;
    padding-left: 0.25rem;
  }

  .md :global(a) {
    text-decoration: underline;
  }

  .md :global(code) {
    font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 0.9em;
    padding: 0.1em 0.35em;
    background: var(--bg-card);
    border: 1px solid var(--line);
  }

  .md :global(pre) {
    margin: 0 0 1.25rem;
    padding: 0.85rem 1rem;
    background: var(--bg-card);
    border: 1px solid var(--line);
    overflow-x: auto;
  }

  .md :global(pre code) {
    padding: 0;
    border: 0;
    background: none;
  }

  .md :global(blockquote) {
    margin: 0 0 1.25rem;
    padding: 0.85rem 1rem;
    background: var(--bg-warning);
    border-left: 3px solid var(--accent-pink);
    color: var(--text-primary);
  }

  .md :global(hr) {
    border: 0;
    border-top: 1.5px solid var(--rule-strong);
    margin: 2rem 0;
  }

  .md :global(.md-tabla) {
    margin: 0 0 1.5rem;
    overflow-x: auto;
  }

  .md :global(.md-tabla:focus-visible) {
    outline: 3px solid var(--border-focus);
    outline-offset: 2px;
  }

  .md :global(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }

  .md :global(th),
  .md :global(td) {
    padding: 0.55rem 0.75rem;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--line);
  }

  .md :global(th) {
    border-bottom: 1.5px solid var(--rule-strong);
    background: var(--bg-card);
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .validacion-header {
      margin-bottom: 1.75rem;
    }
  }
</style>
