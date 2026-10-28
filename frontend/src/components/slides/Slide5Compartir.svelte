<script>
  import { createEventDispatcher } from 'svelte';
  import Tarjeta from '../Tarjeta.svelte';
  import { focusTitle } from '../../utils/focusTitle.js';

  export let cohortData = null;
  export let entidadNombre = '';
  export let shareStatus = '';

  const dispatch = createEventDispatcher();
</script>

<section class="slide slide-cta">
  <div class="cta-copy">
    <h2 class="slide-title" data-titulo-slide="5" tabindex="-1" use:focusTitle>
      El futuro de tu estado también depende de ti
    </h2>

    <p class="slide-lead">
      Comparte esta imagen con tus amigos para recordarles por qué cada voto cuenta.
    </p>
  </div>

  <div class="cta-card">
    <Tarjeta cohortData={cohortData} entidad={entidadNombre} />
  </div>

  <div class="cta-share">
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

    <p class="legal-note">Tus datos están seguros y no salen de tu celular.</p>

    <button class="btn-ficha" on:click={() => dispatch('openficha')}>
      Material para profesores y talleres
    </button>

    <div class="slide-actions">
      <button class="btn-back" on:click={() => dispatch('back')} aria-label="Volver al paso anterior">Volver</button>
    </div>
  </div>

  <div class="cierre-zona">
  <aside class="cierre" aria-labelledby="cierre-titulo">
    <div class="cierre-cabeza">
      <span class="cierre-sello" aria-hidden="true">Fin</span>
      <h3 id="cierre-titulo" class="cierre-titulo">Eso fue todo.</h3>
      <p class="cierre-lead">
        Viste cómo vota tu generación. Lo que sigue ya no son datos: es lo que
        haces tú.
      </p>
    </div>

    <ol class="cierre-lista">
      <li>
        <span class="casilla marcada" aria-hidden="true"></span>
        <div>
          <strong>Revisa tu credencial para votar.</strong>
          <span>Que esté vigente y con tus datos al día. Si no, agenda tu cita en un
          Módulo de Atención Ciudadana del Instituto Nacional Electoral (INE), teléfono de atención INETEL: 800 433 2000.</span>
        </div>
      </li>
      <li>
        <span class="casilla marcada" aria-hidden="true"></span>
        <div>
          <strong>Pásale tu tarjeta a tres personas de tu generación.</strong>
          <span>Un mensaje basta para que alguien se acuerde de que su voto cuenta.</span>
        </div>
      </li>
      <li>
        <span class="casilla marcada" aria-hidden="true"></span>
        <div>
          <strong>Vota en la próxima elección, y lleva a alguien contigo.</strong>
          <span>La casilla vacía de esta historia se llena así: una persona a la vez.</span>
        </div>
      </li>
    </ol>

    <p class="cierre-pie">Gracias por llegar hasta aquí.</p>
  </aside>
  </div>
</section>

<style>
  :global(.main-content:has(.cierre-zona)) {
    padding-bottom: 0;
  }

  .cierre-zona {
    grid-area: cierre;
    min-width: 0;
    margin-top: 1rem;
    margin-inline: calc(-1 * var(--gutter));
  }

  .cierre {
    position: relative;
    width: 100%;
    background: var(--bg-card);
    border-top: 1.5px solid var(--rule-strong);
    overflow: hidden;
  }

  .cierre-cabeza {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    row-gap: 0.75rem;
    padding: clamp(1.5rem, 4vw, 3rem) var(--gutter) clamp(1.5rem, 3.5vw, 2.5rem);
    background:
      repeating-linear-gradient(-12deg, transparent 0 7px, var(--sheet-plate) 7px 8px);
  }

  .cierre-sello {
    justify-self: start;
    padding: 0.15rem 0.6rem;
    background: var(--accent-pink);
    color: var(--on-accent);
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-radius: var(--radius-sm);
  }

  .cierre-titulo {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(2.6rem, 7vw, 6.5rem);
    line-height: 0.92;
    letter-spacing: var(--tracking-display);
    color: var(--text-primary);
  }

  .cierre-lead {
    margin: 0;
    max-width: 46ch;
    font-size: var(--font-size-lg);
    line-height: 1.5;
    color: var(--text-secondary);
  }

  @media (min-width: 900px) {
    .cierre-cabeza {
      grid-template-columns: minmax(0, 1fr) minmax(0, 30rem);
      grid-template-areas:
        'sello  lead'
        'titulo lead';
      column-gap: clamp(2rem, 6vw, 6rem);
      align-items: end;
    }
    .cierre-sello  { grid-area: sello; }
    .cierre-titulo { grid-area: titulo; }
    .cierre-lead   { grid-area: lead; padding-bottom: 0.35rem; }
  }

  .cierre-lista {
    position: relative;
    margin: 0;
    padding: clamp(1.5rem, 3.5vw, 2.5rem) var(--gutter);
    list-style: none;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem;
    border-top: 2px dashed var(--rule-strong);
  }

  .cierre-lista::before,
  .cierre-lista::after {
    content: '';
    position: absolute;
    top: -0.8rem;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: var(--bg-main);
    border: 1.5px solid var(--rule-strong);
  }
  .cierre-lista::before { left: -0.8rem; }
  .cierre-lista::after { right: -0.8rem; }

  .cierre-lista li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 0.9rem;
    align-items: start;
    min-width: 0;
  }

  .cierre-lista .casilla {
    --casilla-size: 1.6rem;
    margin-top: 0.1rem;
  }

  .cierre-lista strong {
    display: block;
    font-size: var(--font-size-lg);
    line-height: 1.25;
    color: var(--text-primary);
  }

  .cierre-lista li div span {
    display: block;
    margin-top: 0.35rem;
    font-size: 0.975rem;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  @media (min-width: 900px) {
    .cierre-lista {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0;
    }
    .cierre-lista li {
      padding-inline: clamp(1.25rem, 3vw, 3rem);
    }
    .cierre-lista li:first-child {
      padding-left: 0;
    }
    .cierre-lista li:last-child {
      padding-right: 0;
    }
    .cierre-lista li + li {
      border-left: 1px solid var(--line);
    }
  }

  .cierre-pie {
    margin: 0;
    padding: 1rem var(--gutter) 1.25rem;
    border-top: 1px solid var(--line);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.35rem;
    color: var(--accent-pink);
  }

  @media (prefers-reduced-motion: no-preference) {
    .cierre-lista .casilla::after {
      animation: cierre-tache 420ms ease-out both;
    }
    .cierre-lista li:nth-child(1) .casilla::after { animation-delay: 300ms; }
    .cierre-lista li:nth-child(2) .casilla::after { animation-delay: 600ms; }
    .cierre-lista li:nth-child(3) .casilla::after { animation-delay: 900ms; }
  }

  @keyframes cierre-tache {
    from { clip-path: inset(0 100% 100% 0); }
    to { clip-path: inset(0 0 0 0); }
  }
</style>
