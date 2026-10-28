<script>
  import { alVerse } from '../utils/alVerse.js';

  let visible = false;
  const SUELO = 150;

  const personas = [
    { x: 34,  w: 17, h: 66, r: 11, color: 'var(--accent-pink)',   pelo: 'largo' },
    { x: 84,  w: 14, h: 52, r: 10, color: 'var(--accent-cyan)',   pelo: 'chongo' },
    { x: 130, w: 19, h: 76, r: 12, color: 'var(--accent-purple)', pelo: 'corto', extra: 'lentes' },
    { x: 180, w: 10, h: 34, r: 8,  color: 'var(--accent-amber)',  pelo: 'corto' },
    { x: 222, w: 17, h: 68, r: 11, color: 'var(--bg-card)',       pelo: 'rizado' },
    { x: 272, w: 17, h: 64, r: 11, color: null,                   pelo: 'corto', vacia: true }
  ];

  function cuerpo(p) {
    const recto = p.h - p.w;
    return `M ${p.x - p.w} ${SUELO} V ${SUELO - recto} A ${p.w} ${p.w} 0 0 1 ${p.x + p.w} ${SUELO - recto} V ${SUELO} Z`;
  }
  const cabezaY = (p) => SUELO - p.h - p.r - 3;
</script>

<svg
  class="personas"
  class:visible
  use:alVerse={() => (visible = true)}
  viewBox="0 0 306 164"
  role="presentation"
  aria-hidden="true"
  focusable="false"
>
  <line class="piso" x1="6" y1={SUELO} x2="300" y2={SUELO} />

  {#each personas as p, i}
    <g class="persona" class:vacia={p.vacia} class:claro={p.color === 'var(--bg-card)'} style={`--i: ${i}`}>
      <g class="plate" transform="translate(5 4)">
        <path d={cuerpo(p)} />
        <circle cx={p.x} cy={cabezaY(p)} r={p.r} />
      </g>

      {#if p.vacia}
        <path class="contorno" d={cuerpo(p)} />
        <circle class="contorno" cx={p.x} cy={cabezaY(p)} r={p.r} />
        <rect class="casilla-svg" x={p.x - 6} y={SUELO - p.h + 14} width="12" height="12" rx="1" />
      {:else}
        <path class="cuerpo" d={cuerpo(p)} fill={p.color} style:fill-opacity={p.color === 'var(--bg-card)' ? 1 : 0.6} />
        <circle class="cabeza" cx={p.x} cy={cabezaY(p)} r={p.r} />

        {#if p.pelo === 'corto'}
          <path class="pelo" d={`M ${p.x - p.r} ${cabezaY(p) + 1} A ${p.r} ${p.r} 0 0 1 ${p.x + p.r} ${cabezaY(p) + 1} Q ${p.x} ${cabezaY(p) - p.r * 0.45} ${p.x - p.r} ${cabezaY(p) + 1} Z`} />
        {:else if p.pelo === 'largo'}
          <path class="pelo" d={`M ${p.x - p.r - 2} ${cabezaY(p) + p.r * 1.5} V ${cabezaY(p)} A ${p.r + 2} ${p.r + 2} 0 0 1 ${p.x + p.r + 2} ${cabezaY(p)} V ${p.r * 0 + cabezaY(p) + p.r * 1.5} L ${p.x + p.r - 3} ${cabezaY(p) + p.r * 1.5} V ${cabezaY(p) - 1} Q ${p.x} ${cabezaY(p) - p.r * 0.5} ${p.x - p.r + 3} ${cabezaY(p) - 1} V ${cabezaY(p) + p.r * 1.5} Z`} />
        {:else if p.pelo === 'chongo'}
          <path class="pelo" d={`M ${p.x - p.r} ${cabezaY(p) + 1} A ${p.r} ${p.r} 0 0 1 ${p.x + p.r} ${cabezaY(p) + 1} Q ${p.x} ${cabezaY(p) - p.r * 0.4} ${p.x - p.r} ${cabezaY(p) + 1} Z`} />
          <circle class="pelo" cx={p.x} cy={cabezaY(p) - p.r - 3} r="5" />
        {:else if p.pelo === 'rizado'}
          <circle class="pelo" cx={p.x - 8} cy={cabezaY(p) - 5} r="6.5" />
          <circle class="pelo" cx={p.x} cy={cabezaY(p) - 9} r="7.5" />
          <circle class="pelo" cx={p.x + 8} cy={cabezaY(p) - 5} r="6.5" />
        {/if}

        {#if p.extra === 'lentes'}
          <g class="lentes">
            <circle cx={p.x - 5} cy={cabezaY(p) + 2} r="3.6" />
            <circle cx={p.x + 5} cy={cabezaY(p) + 2} r="3.6" />
            <line x1={p.x - 1.4} y1={cabezaY(p) + 2} x2={p.x + 1.4} y2={cabezaY(p) + 2} />
          </g>
        {/if}

        <g class="tache" transform={`translate(${p.x - 7} ${SUELO - p.h + 12}) scale(0.58)`}>
          <path d="M3.9 5.3C8.2 7.6 10.6 11.8 13.1 14.1S17.6 18.3 20.1 19.7" />
          <path d="M19.6 3.8C16.4 7.9 12.2 10.2 9.7 13.4S5.9 18.6 4.3 20.4" />
        </g>
      {/if}
    </g>
  {/each}
</svg>

<style>
  .personas {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    color: var(--ink);
  }

  .piso {
    vector-effect: non-scaling-stroke;
    stroke: var(--rule-strong);
    stroke-width: 1.5px;
    stroke-linecap: round;
  }

  .plate path,
  .plate circle {
    fill: var(--sheet-plate);
  }

  .persona {
    animation: llegar 0.55s cubic-bezier(0.3, 0.9, 0.3, 1) backwards;
    animation-delay: calc(var(--i) * 110ms + 150ms);
    animation-play-state: paused;
  }

  .visible .persona {
    animation-play-state: running;
  }

  @keyframes llegar {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
  }

  .cuerpo,
  .cabeza,
  .contorno {
    vector-effect: non-scaling-stroke;
    stroke: var(--ink);
    stroke-width: 1.5px;
    stroke-linejoin: round;
  }
  .cabeza {
    fill: var(--bg-card);
  }

  .pelo {
    fill: var(--ink);
  }

  .lentes circle,
  .lentes line {
    vector-effect: non-scaling-stroke;
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.2px;
  }

  .tache path {
    fill: none;
    stroke: var(--on-accent);
    stroke-width: 3.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .claro .tache path {
    stroke: var(--accent-pink);
  }

  .vacia .contorno {
    fill: none;
    stroke: var(--text-muted);
    stroke-dasharray: 4 4;
    stroke-linecap: round;
  }
  .vacia .plate {
    display: none;
  }
  .casilla-svg {
    vector-effect: non-scaling-stroke;
    fill: var(--bg-card);
    stroke: var(--rule-strong);
    stroke-width: 1.5px;
  }

  @media (prefers-reduced-motion: reduce) {
    .persona {
      animation: none;
    }
  }
</style>
