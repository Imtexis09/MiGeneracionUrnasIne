<script>
  /**
   * Credencial para votar (ilustración).
   *
   * Calca la forma de la credencial para votar (muesca superior, encabezado
   * curvo con escudo, foto grande, firma, retrato fantasma, greca, Ángel y pirámide), pero impresa con el estilo de la boleta:
   * filete de tinta, segunda tinta magenta desfasada y la casilla con tache
   * como sello. No es un documento oficial ni lleva datos personales: muestra
   * los datos de la generación (año de nacimiento, entidad y participación).
   *
   * Todo el dibujo es un solo SVG (600 × 380) para que la forma conserve sus
   * proporciones a cualquier tamaño.
   */
  import { onMount, onDestroy } from 'svelte';
  import { alVerse } from '../utils/alVerse.js';
  import { getLatestElection } from '../utils/calculos.js';

  export let cohortData = null;
  export let entidad = '';
  export let yearOfBirth = null;

  $: latest = cohortData ? getLatestElection(cohortData.elections) : null;
  $: pct = latest ? Math.round(latest.participacion_pct) : null;
  $: anio = latest ? latest.year : '';
  $: lugar = entidad || 'México';
  $: vigencia = anio ? anio + 6 : '';
  $: lugarMayus = lugar.toLocaleUpperCase('es-MX');
  $: descripcion = pct !== null
    ? `Ilustración de una credencial para votar: generación nacida en ${yearOfBirth ?? 'tu año'}, ${lugar}; ${pct}% votó en ${anio}.`
    : 'Ilustración de una credencial para votar con los datos de tu generación.';

  // Escudo nacional (public/images). Si el archivo se llama distinto, cambia
  // solo esta ruta. Si no carga, se dibuja la versión simplificada.
  const ESCUDO_SRC = '/images/escudo.png';
  let escudoOk = true;
  // Siluetas del fondo (public/images). Se tiñen con el color de la placa.
  const PIRAMIDE_SRC = '/images/piramide.png';
  const ANGEL_SRC = '/images/angel.png';
  let piramideOk = true;
  let angelOk = true;

  // Rutas compartidas: contorno con muesca superior y banda del encabezado
  const CONTORNO =
    'M14 0H112C126 0 132 13 150 13H172C188 13 192 0 206 0H586Q600 0 600 14V366Q600 380 586 380H14Q0 380 0 366V14Q0 0 14 0Z';

  // El porcentaje "sube" hasta su valor justo cuando cae el sello.
  let mostrado = null;
  let raf;
  let montado = false;
  // La animación y el conteo arrancan cuando la credencial se ve de verdad
  let visible = false;
  const DELAY = 1150;
  const DUR = 900;

  $: if (montado && visible) contar(pct);
  $: if (montado && !visible) mostrado = enReposo(pct);

  function enReposo(meta) {
    const quieto = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return meta === null || quieto ? meta : 0;
  }

  function contar(meta) {
    cancelAnimationFrame(raf);
    clearTimeout(espera);
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (meta === null || quieto) { mostrado = meta; return; }
    mostrado = 0;
    espera = setTimeout(() => {
      const t0 = performance.now();
      const paso = (t) => {
        const k = Math.min(1, (t - t0) / DUR);
        mostrado = Math.round(meta * (1 - Math.pow(1 - k, 3)));
        if (k < 1) raf = requestAnimationFrame(paso);
      };
      raf = requestAnimationFrame(paso);
    }, DELAY);
  }
  let espera;

  onMount(() => { montado = true; });
  onDestroy(() => { cancelAnimationFrame(raf); clearTimeout(espera); });
</script>

<figure class="ine" class:visible use:alVerse={() => (visible = true)} aria-label="Ilustración de una credencial para votar con los datos de tu generación">
  <div class="ine-card">
    <svg
      class="ine-svg"
      viewBox="0 0 608 388"
      role="img"
      aria-label={descripcion}
      focusable="false"
    >
      <defs>
        <clipPath id="ine-clip"><path d={CONTORNO} /></clipPath>
        <!-- Microtrama de líneas, como el papel de seguridad -->
        <pattern id="ine-trama" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
          <rect width="8" height="1" class="ine-trama-linea" />
        </pattern>
        <!-- Greca de la orilla izquierda -->
        <pattern id="ine-greca" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M2 20V2H20V14H8V8H14" class="ine-greca-trazo" />
        </pattern>
        <!-- Medios tonos del retrato fantasma -->
        <pattern id="ine-puntos" width="4.6" height="4.6" patternUnits="userSpaceOnUse">
          <circle cx="2.3" cy="2.3" r="1.75" fill="#fff" />
        </pattern>
        <mask id="ine-mascara-puntos" maskUnits="userSpaceOnUse" x="55" y="104" width="136" height="188">
          <rect x="55" y="104" width="136" height="188" fill="url(#ine-puntos)" />
        </mask>
        <radialGradient id="ine-foto-luz" cx="0.5" cy="0.3" r="0.8">
          <stop offset="0" class="ine-luz-a" />
          <stop offset="1" class="ine-luz-b" />
        </radialGradient>
        <!-- La misma figura se usa en la foto y en el retrato fantasma -->
        <g id="ine-figura">
          <!-- pelo (atrás) -->
          <path class="ine-pelo" d="M123 108C88 108 78 140 80 178C82 214 74 238 66 264H180C172 238 164 214 166 178C168 140 158 108 123 108Z" />
          <!-- cuello y sombra bajo la barbilla -->
          <path class="ine-piel" d="M109 204H137L140 240L123 260L106 240Z" />
          <path class="ine-sombra" d="M110 212C118 228 128 228 136 212V224C128 238 118 238 110 224Z" />
          <!-- blusa con cuello en V -->
          <path class="ine-ropa" d="M55 292C58 262 80 243 106 237L123 260L140 237C166 243 188 262 191 292Z" />
          <path class="ine-cuello" d="M106 237L123 260L140 237" />
          <!-- cara -->
          <path class="ine-piel" d="M123 130C100 130 91 150 93 174C95 198 109 212 123 212C137 212 151 198 153 174C155 150 146 130 123 130Z" />
          <ellipse class="ine-rubor" cx="106" cy="193" rx="6" ry="3" />
          <ellipse class="ine-rubor" cx="140" cy="193" rx="6" ry="3" />
          <!-- mechones al frente y fleco de lado -->
          <path class="ine-pelo-osc" d="M82 180C80 218 76 244 68 264C88 264 100 256 106 240C98 224 94 204 93 180Z" />
          <path class="ine-pelo-osc" d="M164 180C166 218 170 244 178 264C158 264 146 256 140 240C148 224 152 204 153 180Z" />
          <path class="ine-pelo-osc" d="M92 166C90 124 120 110 152 128C158 140 156 156 154 168C148 148 138 142 124 140C110 142 100 152 92 166Z" />
          <!-- brillos del cabello -->
          <path class="ine-brillo-pelo" d="M98 150C98 130 110 118 126 116" />
          <path class="ine-brillo-pelo" d="M90 204C90 224 86 242 80 256" />
          <path class="ine-brillo-pelo" d="M156 204C156 224 160 242 166 256" />
        </g>
        <mask id="ine-mascara-piramide" mask-type="alpha" maskUnits="userSpaceOnUse" x="430" y="312" width="240" height="103">
          <image href={PIRAMIDE_SRC} x="430" y="312" width="240" height="103" preserveAspectRatio="xMidYMax meet" on:error={() => (piramideOk = false)} />
        </mask>
        <mask id="ine-mascara-angel" mask-type="alpha" maskUnits="userSpaceOnUse" x="310" y="290" width="150" height="150">
          <image href={ANGEL_SRC} x="310" y="290" width="150" height="150" preserveAspectRatio="xMidYMid meet" on:error={() => (angelOk = false)} />
        </mask>
        <path id="ine-arco" d="M68 76a30 30 0 1 1 0 -60a30 30 0 1 1 0 60" fill="none" />
        <linearGradient id="ine-brillo" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="0" />
          <stop offset="0.5" stop-color="#fff" stop-opacity="0.8" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Segunda tinta desfasada (la placa magenta) -->
      <path class="ine-placa" d={CONTORNO} />

      <!-- Papel -->
      <path class="ine-papel" d={CONTORNO} />

      <g clip-path="url(#ine-clip)">
        <rect class="ine-trama" width="600" height="380" fill="url(#ine-trama)" />
        <rect class="ine-greca" x="4" y="104" width="24" height="264" fill="url(#ine-greca)" />

        <!-- Pirámide y Ángel, al fondo: grandes y asomando desde abajo; la orilla de la credencial los recorta -->
        {#if piramideOk}
          <rect class="ine-silueta" x="430" y="312" width="240" height="103" mask="url(#ine-mascara-piramide)" />
        {:else}
          <path class="ine-fondo" d="M478 380V366H486V352H494V338H502V324H510V310H522V300H568V310H580V324H588V338H596V352H604V366H612V380Z" />
        {/if}
        {#if angelOk}
          <rect class="ine-silueta" x="310" y="290" width="150" height="150" mask="url(#ine-mascara-angel)" />
        {:else}
          <g class="ine-fondo ine-angel" transform="translate(378 302)">
            <path d="M0 12C-14 4-19 16-12 28C-9 22-5 20 0 20C5 20 9 22 12 28C19 16 14 4 0 12Z" />
            <circle cx="0" cy="6" r="3.4" />
            <rect x="-4" y="22" width="8" height="34" />
            <rect x="-9" y="56" width="18" height="6" />
          </g>
        {/if}

        <!-- Encabezado curvo -->
        <path class="ine-banda" d="M0 0H600V84Q300 100 0 88Z" />

        <!-- Escudo (versión simplificada) -->
        <g class="ine-escudo" aria-hidden="true">
          {#if escudoOk}
            <image
              class="ine-escudo-img"
              href={ESCUDO_SRC}
              x="29" y="7" width="78" height="78"
              preserveAspectRatio="xMidYMid meet"
              on:error={() => (escudoOk = false)}
            />
          {:else}
          <circle cx="68" cy="46" r="37" class="ine-escudo-aro" />
          <text class="ine-escudo-txt"><textPath href="#ine-arco" startOffset="50%" text-anchor="middle">ESTADOS UNIDOS MEXICANOS</textPath></text>
          <g transform="translate(68 46) scale(0.74)">
            <ellipse cx="0" cy="2" rx="8.5" ry="13" transform="rotate(18)" />
            <circle cx="-7" cy="-13" r="4.6" />
            <path d="M-11 -14L-17 -11L-11 -9Z" />
            <path d="M-6 -5C-18 -11-23 0-17 9C-14 3-10 3-6 5Z" />
            <path d="M5 -9C16 -19 25 -6 20 7C16 1 12 1 7 3Z" />
            <path d="M3 14L8 24L1 20L-3 26L-3 14Z" />
            <ellipse cx="-9" cy="24" rx="5" ry="3" />
            <ellipse cx="-2" cy="27" rx="5" ry="3" />
            <ellipse cx="6" cy="27" rx="4" ry="2.6" />
          </g>
          {/if}
        </g>

        <text class="ine-mx" x="118" y="55">MÉXICO</text>
        <text class="ine-t1" x="207" y="41" textLength="362" lengthAdjust="spacingAndGlyphs">INSTITUTO NACIONAL ELECTORAL</text>
        <text class="ine-t2" x="207" y="67" textLength="242" lengthAdjust="spacingAndGlyphs">CREDENCIAL PARA VOTAR</text>

        <text class="ine-top" x="574" y="108" text-anchor="end">ILUSTRACIÓN</text>
        <text class="ine-top" x="574" y="124" text-anchor="end">NO OFICIAL</text>

        <!-- Foto -->
        <g class="ine-foto" aria-hidden="true">
          <rect x="55" y="104" width="136" height="188" rx="3" class="ine-foto-fondo" />
          <svg x="55" y="104" width="136" height="188" viewBox="55 104 136 188" overflow="hidden">
            <!-- fondo de estudio: viñeta suave y luz de arriba -->
            <rect x="55" y="104" width="136" height="188" fill="url(#ine-foto-luz)" />
            <use href="#ine-figura" />
          </svg>
          <rect x="55" y="104" width="136" height="188" rx="3" class="ine-foto-marco" />
        </g>

        <!-- Firma -->
        <g aria-hidden="true">
          <text class="ine-firma" x="70" y="320" transform="rotate(-3 70 320)">Tu generación</text>
          <path class="ine-firma-linea" d="M64 330C94 334 134 332 186 327" />
        </g>

        <!-- Retrato fantasma: la misma figura, en medios tonos -->
        <g class="ine-fantasma" aria-hidden="true">
          <svg x="488" y="140" width="78" height="122" viewBox="66 108 114 178" overflow="hidden">
            <use href="#ine-figura" mask="url(#ine-mascara-puntos)" />
          </svg>
        </g>

        <!-- Datos -->
        <g class="ine-datos">
          <text class="ine-et" x="198" y="115">NOMBRE</text>
          <text class="ine-nombre" x="198" y="137">TU</text>
          <text class="ine-nombre" x="198" y="159">GENERACIÓN</text>

          <text class="ine-et" x="198" y="190">DOMICILIO</text>
          <text class="ine-val" x="198" y="206">{lugarMayus}</text>
          <text class="ine-val" x="198" y="222">ESTADOS UNIDOS MEXICANOS</text>

          <text class="ine-et" x="198" y="250">PARTICIPACIÓN</text>
          <text class="ine-pct" x="198" y="284">{pct !== null ? `${mostrado ?? pct}%` : '—'}<tspan class="ine-pct-txt" dx="9">votó en {anio || 'la última elección'}</tspan></text>

          <text class="ine-et" x="198" y="326">NACIMIENTO</text>
          <text class="ine-val" x="198" y="346">{yearOfBirth ?? '—'}</text>

          <text class="ine-et" x="324" y="326">CASILLA</text>
          <g class="ine-box" transform="translate(324 330)">
            <rect width="22" height="22" rx="3" class="ine-box-fondo" />
            <g transform="translate(2.75 2.75) scale(0.68)" class="ine-tache">
              <path pathLength="1" d="M3.9 5.3C8.2 7.6 10.6 11.8 13.1 14.1S17.6 18.3 20.1 19.7" stroke-width="3.2" />
              <path pathLength="1" d="M19.6 3.8C16.4 7.9 12.2 10.2 9.7 13.4S5.9 18.6 4.3 20.4" stroke-width="3.6" />
            </g>
          </g>

          <text class="ine-et" x="410" y="326">VIGENCIA</text>
          <text class="ine-val" x="410" y="346">{anio ? `${anio}–${vigencia}` : '—'}</text>
        </g>

        <!-- Destello, como el holograma al inclinar la credencial -->
        <rect class="ine-destello" x="-160" y="-30" width="130" height="440" fill="url(#ine-brillo)" />
      </g>

      <!-- Filete de tinta -->
      <path class="ine-filete" d={CONTORNO} />
    </svg>
  </div>
  <figcaption>Ilustración. No es un documento oficial.</figcaption>
</figure>

<style>
  .ine {
    perspective: 1400px;
    margin: 0;
    width: 100%;
    max-width: 46rem;
  }

  .ine-card {
    container-type: inline-size;
    width: 100%;
  }

  .ine-svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  /* ---- Papel, tinta y placa ---- */
  .ine-papel { fill: var(--bg-card); }
  .ine-filete {
    fill: none;
    stroke: var(--rule-strong);
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
  }
  .ine-placa {
    fill: var(--sheet-plate);
    transform: translate(8px, 8px);
  }
  .ine-trama-linea { fill: var(--sheet-plate); opacity: 0.55; }
  .ine-greca-trazo { fill: none; stroke: var(--line); stroke-width: 1.6; }
  .ine-greca { opacity: 0.9; }

  /* ---- Fondo ---- */
  .ine-fondo { fill: var(--sheet-plate); stroke: var(--line); stroke-width: 1; }
  .ine-silueta { fill: var(--accent-pink); opacity: 0.26; }

  /* ---- Encabezado ---- */
  .ine-banda { fill: var(--accent-pink); }
  .ine-escudo { fill: var(--on-accent); }
  /* El escudo es negro sobre blanco: se invierte y se funde con "screen"
     para que quede blanco sobre la banda y el fondo desaparezca. */
  .ine-escudo-img { filter: invert(1); mix-blend-mode: screen; }
  .ine-escudo-aro { fill: none; stroke: var(--on-accent); stroke-width: 1.4; }
  .ine-escudo-txt {
    font-family: var(--font-base);
    font-weight: 700;
    font-size: 6.4px;
    letter-spacing: 0.04em;
    fill: var(--on-accent);
  }
  .ine-mx,
  .ine-t1,
  .ine-t2 {
    font-family: var(--font-display);
    fill: var(--on-accent);
  }
  .ine-mx { font-weight: 700; font-size: 24px; letter-spacing: 0.02em; }
  .ine-t1 { font-weight: 800; font-size: 29px; }
  .ine-t2 { font-weight: 600; font-size: 23px; }
  .ine-top {
    font-family: var(--font-base);
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 0.08em;
    fill: var(--text-primary);
  }

  /* ---- Foto ---- */
  .ine-foto-fondo { fill: var(--bg-card); }
  .ine-luz-a { stop-color: color-mix(in srgb, var(--accent-pink) 14%, var(--bg-card)); }
  .ine-luz-b { stop-color: color-mix(in srgb, var(--accent-purple) 22%, var(--bg-card)); }
  .ine-foto-marco { fill: none; stroke: var(--rule-strong); stroke-width: 1.5; }
  .ine-pelo { fill: var(--accent-purple); }
  .ine-pelo-osc { fill: color-mix(in srgb, var(--accent-purple) 80%, var(--ink)); }
  .ine-brillo-pelo {
    fill: none;
    stroke: color-mix(in srgb, var(--accent-purple) 55%, #fff);
    stroke-width: 2.4;
    stroke-linecap: round;
    opacity: 0.7;
  }
  .ine-ropa { fill: var(--accent-purple-dark); }
  .ine-cuello { fill: none; stroke: var(--accent-pink); stroke-width: 2.6; stroke-linejoin: round; stroke-linecap: round; }
  .ine-piel { fill: color-mix(in srgb, var(--accent-pink-light) 38%, var(--bg-card)); }
  .ine-sombra { fill: var(--ink); opacity: 0.13; }
  .ine-rubor { fill: var(--accent-pink); opacity: 0.28; }
  .ine-firma {
    font-family: 'Caveat', var(--font-base);
    font-weight: 600;
    font-size: 22px;
    fill: var(--text-primary);
  }
  .ine-firma-linea { fill: none; stroke: var(--text-muted); stroke-width: 1.2; stroke-linecap: round; }
  .ine-fantasma { filter: grayscale(1); opacity: 0.55; }

  /* ---- Datos ---- */
  .ine-et {
    font-family: var(--font-base);
    font-weight: 700;
    font-size: 10px;
    letter-spacing: 0.08em;
    fill: var(--text-muted);
  }
  .ine-val {
    font-family: var(--font-base);
    font-weight: 700;
    font-size: 14px;
    fill: var(--text-primary);
  }
  .ine-nombre {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 25px;
    letter-spacing: var(--tracking-wide);
    fill: var(--text-primary);
  }
  .ine-pct {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 40px;
    font-variant-numeric: tabular-nums;
    fill: var(--accent-pink);
  }
  .ine-pct-txt {
    font-family: var(--font-base);
    font-weight: 600;
    font-size: 15px;
    fill: var(--text-secondary);
  }

  /* ---- Sello: la casilla marcada con tache ---- */
  .ine-box { transform-box: fill-box; transform-origin: center; }
  .ine-box-fondo { fill: var(--accent-pink); }
  .ine-tache path {
    fill: none;
    stroke: var(--on-accent);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
  }

  .ine-destello { opacity: 0; mix-blend-mode: overlay; transform: skewX(-18deg); }

  .ine figcaption {
    margin-top: 0.9rem;
    font-size: var(--font-size-sm);
    color: var(--text-muted);
  }

  /* En ventanas medianas la leyenda chocaría con el texto de abajo:
     se oculta a la vista, pero sigue disponible para lectores de pantalla. */
  @media (min-width: 1000px) and (max-width: 1299px) {
    .ine figcaption {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }

  /* ---- Entrada ----
     1) la credencial gira hacia el frente (voltea en 3D) y se asienta,
     2) la placa magenta se despega detrás de ella,
     3) pasa un destello,
     4) cae el sello (tache) y el porcentaje sube hasta su valor. */
  @media (prefers-reduced-motion: no-preference) {
    /* todo queda en pausa (en su estado inicial) hasta que se ve en pantalla */
    .ine:not(.visible) .ine-card,
    .ine:not(.visible) .ine-placa,
    .ine:not(.visible) .ine-destello,
    .ine:not(.visible) .ine-box,
    .ine:not(.visible) .ine-tache path,
    .ine:not(.visible) figcaption {
      animation-play-state: paused;
    }

    .ine-card {
      transform-origin: 100% 50%;
      animation: ine-voltea 900ms cubic-bezier(0.2, 0.85, 0.25, 1) 150ms both;
    }

    .ine-placa {
      animation: ine-placa 600ms ease-out 800ms both;
    }

    .ine-destello {
      animation: ine-destello 1100ms ease-in-out 950ms both;
    }

    .ine-box {
      animation: ine-sello 520ms cubic-bezier(0.3, 1.6, 0.5, 1) 1150ms both;
    }

    .ine-tache path {
      animation: ine-tache 420ms ease-out 1250ms both;
    }

    .ine figcaption {
      animation: ine-aparece 500ms ease-out 1500ms both;
    }
  }

  @keyframes ine-voltea {
    0% {
      opacity: 0;
      transform: translateX(6rem) rotateY(-78deg) rotateZ(-6deg);
    }
    55% {
      opacity: 1;
      transform: translateX(-0.6rem) rotateY(8deg) rotateZ(1deg);
    }
    80% {
      transform: translateX(0.2rem) rotateY(-3deg);
    }
    100% {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes ine-placa {
    from { transform: translate(0, 0); }
    to { transform: translate(8px, 8px); }
  }

  @keyframes ine-destello {
    0% { opacity: 0; transform: translateX(0) skewX(-18deg); }
    15% { opacity: 1; }
    85% { opacity: 1; }
    100% { opacity: 0; transform: translateX(800px) skewX(-18deg); }
  }

  @keyframes ine-sello {
    0% { opacity: 0; transform: translate(324px, 330px) scale(2.6) rotate(-18deg); }
    60% { opacity: 1; transform: translate(324px, 330px) scale(0.92) rotate(3deg); }
    100% { opacity: 1; transform: translate(324px, 330px) scale(1) rotate(0); }
  }

  @keyframes ine-tache {
    from { stroke-dashoffset: 1; }
    to { stroke-dashoffset: 0; }
  }

  @keyframes ine-aparece {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (prefers-contrast: more) {
    .ine-trama { display: none; }
  }
</style>
