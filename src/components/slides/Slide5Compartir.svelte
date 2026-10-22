<script>
  /**
   * Slide 5 — Acción ciudadana y difusión.
   * Tarjeta compartible (generada en el navegador) y botones de compartir.
   */
  import { createEventDispatcher } from 'svelte';
  import Tarjeta from '../Tarjeta.svelte';
  import { focusTitle } from '../../utils/focusTitle.js';

  export let cohortData = null;
  export let entidadNombre = '';
  /** Mensaje de confirmación del último acción de compartir */
  export let shareStatus = '';

  const dispatch = createEventDispatcher();
</script>

<section class="slide slide-cta">
  <h2 class="slide-title" data-titulo-slide="5" tabindex="-1" use:focusTitle>
    El futuro de tu estado también depende de ti
  </h2>

  <p class="slide-lead">
    Comparte esta imagen con tus amigos para recordarles por qué cada voto cuenta.
  </p>

  <div class="slide-card slide-card-cta">
    <Tarjeta cohortData={cohortData} entidad={entidadNombre} />
  </div>

  <p class="legal-note">Tus datos están seguros y no salen de tu celular</p>

  <div class="share-box">
    <h3>Comparte tu historia</h3>
    <p class="share-text">Envíalo a tus amigos y familia.</p>
    <div class="social-buttons">
      <button class="btn-social" aria-label="Compartir en X" on:click={(e) => dispatch('share', { red: 'x', boton: e.currentTarget })}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg><span class="social-label">X</span>
      </button>
      <button class="btn-social" aria-label="Compartir en Facebook" on:click={(e) => dispatch('share', { red: 'facebook', boton: e.currentTarget })}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 01-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 01-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg><span class="social-label">Facebook</span>
      </button>
      <button class="btn-social" aria-label="Compartir en Instagram" on:click={(e) => dispatch('share', { red: 'instagram', boton: e.currentTarget })}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg><span class="social-label">Instagram</span>
      </button>
      <button class="btn-social" aria-label="Compartir en WhatsApp" on:click={(e) => dispatch('share', { red: 'whatsapp', boton: e.currentTarget })}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a5.825 5.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m18.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg><span class="social-label">WhatsApp</span>
      </button>
    </div>

    {#if shareStatus}
      <p class="share-feedback" role="status" aria-live="polite">
        {shareStatus}
      </p>
    {/if}

    <button class="btn-copy-text" on:click={() => dispatch('copy')}>
      Copiar texto del resultado
    </button>
  </div>

  <div class="ficha-action">
    <button class="btn-ficha" on:click={() => dispatch('openficha')}>
      Material para profesores y talleres
    </button>
  </div>

  <div class="slide-actions">
    <button class="btn-back" on:click={() => dispatch('back')} aria-label="Volver al paso anterior">Volver</button>
  </div>
</section>
