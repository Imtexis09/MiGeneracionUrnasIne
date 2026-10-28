<script>
  import { onMount } from 'svelte';
  import { prefersReducedMotion } from '../utils/a11y.js';
  import { alVerse } from '../utils/alVerse.js';

  let caida;
  let pliegue;
  let dorso;
  let doblez;

  const T_TOTAL = 3500;

  const ease = {
    lineal: (x) => x,
    suave: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    entra: (x) => x * x * x,
    sale: (x) => 1 - Math.pow(1 - x, 3)
  };

  const CAIDA = [
    { t: 0,    tx: 0,   ty: -96,  rot: 0,   op: 0, e: 'lineal' },
    { t: 400,  tx: 0,   ty: -96,  rot: 0,   op: 1, e: 'lineal' },
    { t: 1700, tx: -19, ty: -88,  rot: 0,   op: 1, e: 'suave' },
    { t: 2300, tx: -19, ty: -56,  rot: 0,   op: 1, e: 'suave' },
    { t: 2800, tx: -19, ty: 4,    rot: -8,  op: 1, e: 'entra' },
    { t: 3200, tx: -19, ty: 40,   rot: -94, op: 1, e: 'lineal' },
    { t: 3350, tx: -19, ty: 34,   rot: -84, op: 1, e: 'sale' },
    { t: 3500, tx: -19, ty: 36,   rot: -86, op: 1, e: 'sale' }
  ];

  const clamp01 = (x) => Math.min(1, Math.max(0, x));

  function pintar(t) {
    if (!caida) return;

    let i = 1;
    while (i < CAIDA.length - 1 && t > CAIDA[i].t) i++;
    const a = CAIDA[i - 1];
    const b = CAIDA[i];
    const k = ease[b.e](clamp01((t - a.t) / (b.t - a.t)));
    const tx = a.tx + (b.tx - a.tx) * k;
    const ty = a.ty + (b.ty - a.ty) * k;
    const rot = a.rot + (b.rot - a.rot) * k;
    const op = a.op + (b.op - a.op) * k;
    caida.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) rotate(${rot.toFixed(2)} 149 59)`);
    caida.setAttribute('opacity', op.toFixed(3));

    const f = ease.suave(clamp01((t - 600) / 1000));
    const s = 1 - 2 * f;
    pliegue.setAttribute('transform', `translate(${(130 * (1 - s)).toFixed(2)} 0) scale(${s.toFixed(3)} 1)`);
    dorso.setAttribute('opacity', s < 0 ? '1' : '0');
    doblez.setAttribute('opacity', clamp01((t - 1550) / 200).toFixed(3));
  }

  let raf = 0;
  let animar = false;

  function arrancar() {
    if (!animar || !caida) return;
    let inicio = null;
    const paso = (ahora) => {
      if (inicio === null) inicio = ahora;
      const t = ahora - inicio;
      pintar(Math.min(t, T_TOTAL));
      if (t < T_TOTAL) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
  }

  onMount(() => {
    if (prefersReducedMotion() || !caida) return undefined;
    animar = true;
    pintar(0);
    return () => cancelAnimationFrame(raf);
  });
</script>

<svg
  class="urna"
  use:alVerse={{ alVerse: arrancar, umbral: 0.2 }}
  viewBox="20 80 210 170"
  role="presentation"
  aria-hidden="true"
  focusable="false"
>
  <g class="plate">
    <rect x="48" y="119" width="164" height="124" rx="3" />
    <rect x="38" y="105" width="184" height="18" rx="3" />
  </g>

  <defs>
    <clipPath id="urna-clip-izq"><rect x="80" y="0" width="50" height="130" /></clipPath>
    <clipPath id="urna-clip-der"><rect x="130" y="0" width="50" height="130" /></clipPath>

    <g id="urna-hoja">
      <rect class="papel" x="92" y="6" width="76" height="106" rx="2" />
      <rect class="tinta" x="100" y="14" width="34" height="5" rx="1" />
      <line class="linea-suave" x1="100" y1="25" x2="160" y2="25" />

      <rect class="casilla-svg" x="101" y="34" width="14" height="14" rx="1" />
      <line class="linea-suave" x1="121" y1="41" x2="158" y2="41" />

      <rect class="casilla-svg" x="101" y="56" width="14" height="14" rx="1" />
      <g class="tache" transform="translate(100 55) scale(0.66)">
        <path d="M3.9 5.3C8.2 7.6 10.6 11.8 13.1 14.1S17.6 18.3 20.1 19.7" />
        <path d="M19.6 3.8C16.4 7.9 12.2 10.2 9.7 13.4S5.9 18.6 4.3 20.4" />
      </g>
      <line class="linea-suave" x1="121" y1="63" x2="158" y2="63" />

      <rect class="casilla-svg" x="101" y="78" width="14" height="14" rx="1" />
      <line class="linea-suave" x1="121" y1="85" x2="152" y2="85" />
    </g>
  </defs>

  <g transform="translate(0 118)">
    <g class="caida" bind:this={caida} transform="translate(-19 36) rotate(-86 149 59)">
      <use href="#urna-hoja" clip-path="url(#urna-clip-der)" />
      <g class="pliegue" bind:this={pliegue} transform="translate(260 0) scale(-1 1)">
        <use href="#urna-hoja" clip-path="url(#urna-clip-izq)" />
        <rect class="dorso" bind:this={dorso} x="92" y="6" width="38" height="106" rx="2" />
      </g>
      <line class="doblez" bind:this={doblez} x1="130" y1="6" x2="130" y2="112" />
    </g>
  </g>

  <rect class="cuerpo" x="44" y="113" width="164" height="124" rx="3" />

  <rect class="franja" x="44" y="152" width="164" height="46" />
  <rect class="sello-caja" x="112" y="159" width="32" height="32" rx="2" />
  <g class="tache tache-claro" transform="translate(114 161) scale(1.2)">
    <path d="M3.9 5.3C8.2 7.6 10.6 11.8 13.1 14.1S17.6 18.3 20.1 19.7" />
    <path d="M19.6 3.8C16.4 7.9 12.2 10.2 9.7 13.4S5.9 18.6 4.3 20.4" />
  </g>
  <line class="linea-franja" x1="56" y1="168" x2="98" y2="168" />
  <line class="linea-franja" x1="56" y1="182" x2="86" y2="182" />
  <line class="linea-franja" x1="158" y1="168" x2="196" y2="168" />
  <line class="linea-franja" x1="158" y1="182" x2="184" y2="182" />

  <polygon class="vidrio" points="54,126 84,126 58,232 54,232" />
  <polygon class="vidrio" points="92,126 104,126 78,232 66,232" />

  <circle class="remache" cx="194" cy="222" r="2.6" />
  <circle class="remache" cx="58" cy="124" r="2.6" />
  <circle class="remache" cx="194" cy="124" r="2.6" />

  <rect class="tapa" x="34" y="98" width="184" height="18" rx="3" />
  <rect class="ranura" x="88" y="103" width="76" height="7" rx="3.5" />
</svg>

<style>
  .urna {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    color: var(--ink);
  }

  .plate rect {
    fill: var(--sheet-plate);
  }

  .cuerpo,
  .tapa,
  .papel {
    vector-effect: non-scaling-stroke;
    stroke: var(--ink);
    stroke-width: 1.5px;
    stroke-linejoin: round;
  }
  .cuerpo {
    fill: var(--bg-card);
    fill-opacity: 0.38;
  }
  .vidrio {
    fill: #ffffff;
    fill-opacity: 0.35;
  }
  .tapa {
    fill: var(--ink);
  }
  .ranura {
    fill: var(--bg-main);
    stroke: var(--bg-main);
    stroke-width: 1px;
  }
  .papel {
    fill: var(--bg-card);
    stroke-width: 1.5px;
  }

  .tinta {
    fill: var(--ink);
  }
  .linea-suave {
    vector-effect: non-scaling-stroke;
    stroke: var(--rule-strong);
    stroke-width: 1.5px;
    stroke-linecap: round;
  }
  .casilla-svg {
    vector-effect: non-scaling-stroke;
    fill: var(--bg-card);
    stroke: var(--rule-strong);
    stroke-width: 1.5px;
  }

  .tache path {
    fill: none;
    stroke: var(--accent-pink);
    stroke-width: 3.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .tache-claro path {
    stroke: var(--on-accent);
    stroke-width: 3;
  }

  .franja {
    vector-effect: non-scaling-stroke;
    fill: var(--accent-pink);
    fill-opacity: 0.58;
    stroke: var(--ink);
    stroke-width: 1.5px;
  }
  .sello-caja {
    vector-effect: non-scaling-stroke;
    fill: transparent;
    stroke: var(--on-accent);
    stroke-width: 1.5px;
  }
  .linea-franja {
    vector-effect: non-scaling-stroke;
    stroke: var(--on-accent);
    stroke-opacity: 0.55;
    stroke-width: 1.5px;
    stroke-linecap: round;
  }

  .remache {
    fill: var(--ink);
    opacity: 0.85;
  }

  .dorso {
    vector-effect: non-scaling-stroke;
    fill: var(--bg-card-hover);
    stroke: var(--ink);
    stroke-width: 1.5px;
    stroke-linejoin: round;
  }
  .doblez {
    vector-effect: non-scaling-stroke;
    stroke: var(--ink);
    stroke-width: 1.5px;
    stroke-linecap: round;
  }
</style>
