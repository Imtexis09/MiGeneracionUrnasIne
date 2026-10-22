<script>
  import { onMount } from 'svelte';
  import { getLatestElection } from '../utils/calculos.js';
  import { formatCohortRange } from '../utils/formato.js';

  export let cohortData = null;
  export let entidad = '';

  let canvas;
  let ctx;
  const W = 1792;
  const H = 2400;

  /* Datos derivados (reactivos) */
  $: latestElection = cohortData ? getLatestElection(cohortData.elections) : null;
  $: participacionPct = latestElection ? latestElection.participacion_pct : 0;
  $: cohortRange = cohortData ? formatCohortRange(cohortData.year_of_birth_min, cohortData.year_of_birth_max) : '';
  $: anioEleccion = latestElection ? latestElection.year : '';
  $: eleccionesTexto = cohortData ? `${cohortData.elections.length} elecciones federales (2009-2024)` : 'DATOS DE 2 ELECCIONES FEDERALES (2009-2024)';

  const FX = {
    a: 'Anton, Impact, "Arial Narrow", sans-serif',
    b: '"Barlow Condensed", "Arial Narrow", sans-serif',
    c: 'Caveat, "Comic Sans MS", cursive'
  };

  let listo = false;
  let arteImg, logoImg;

  /* Clave de datos que controla la regeneración (no depende del DOM/canvas) */
  $: claveTarjeta = cohortData
    ? `${cohortData.entidad_cve || ''}-${cohortData.year_of_birth_min || ''}-${cohortData.year_of_birth_max || ''}-${entidad || ''}`
    : '';

  let ultimaClaveGenerada = '';

  /* Regenerar cuando cambien los datos (clave de datos, no referencia del DOM) */
  $: if (canvas && claveTarjeta && claveTarjeta !== ultimaClaveGenerada) {
    ultimaClaveGenerada = claveTarjeta;
    render();
  }

  /* ---------- Funciones de dibujo ---------- */
  function fit(t, fam, w, max, wt = '') {
    if (!ctx) return max;
    ctx.font = `${wt} ${max}px ${fam}`;
    const m = ctx.measureText(t).width;
    return m > w ? Math.floor(max * w / m) : max;
  }

  function T(t, px, py, o = {}) {
    if (!ctx) return 0;
    ctx.save();
    ctx.font = `${o.w || ''} ${o.s}px ${o.f}`;
    ctx.textAlign = o.al || 'left';
    ctx.fillStyle = o.c || '#fff';
    if (o.rot) { ctx.translate(px, py); ctx.rotate(o.rot * Math.PI / 180); px = 0; py = 0; }
    if (o.sh) { ctx.shadowColor = o.sh; ctx.shadowBlur = o.shb || 14; ctx.shadowOffsetY = o.shy || 6; }
    if (o.st) { ctx.lineJoin = 'round'; ctx.lineWidth = o.sw; ctx.strokeStyle = o.st; ctx.strokeText(t, px, py); }
    ctx.fillText(t, px, py);
    const m = ctx.measureText(t).width;
    ctx.restore();
    return m;
  }

  function rr(a, b, w, h, r, c) {
    if (!ctx) return;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.roundRect(a, b, w, h, r);
    ctx.fill();
  }

  function ln(pts, c, w) {
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));
    ctx.stroke();
    ctx.restore();
  }

  function wrap(t, mw, f, s) {
    if (!ctx) return [];
    ctx.font = `${s}px ${f}`;
    const L = [];
    let c = '';
    t.split(' ').forEach(w => {
      const n = c ? c + ' ' + w : w;
      if (ctx.measureText(n).width > mw && c) { L.push(c); c = w; } else c = n;
    });
    L.push(c);
    return L;
  }

  function star(cx, cy, r) {
    if (!ctx) return;
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 4;
      ln([[cx - r * Math.cos(a), cy - r * Math.sin(a)], [cx + r * Math.cos(a), cy + r * Math.sin(a)]], '#0d080e', 7);
    }
  }

  /* ---------- Render principal ---------- */
  function render() {
    if (!ctx || !arteImg || !logoImg || !listo) return;

    const est = (entidad || '').toUpperCase();
    const pt = (participacionPct !== null && participacionPct !== undefined ? participacionPct.toFixed(1) : '') + '%';
    const g = (cohortRange || '').toUpperCase();
    const k = Math.round(g.length * 0.4);
    const g1 = g.slice(0, k) + '-';
    const g2 = g.slice(k);

    /* Fondo */
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(arteImg, 0, 0, W, H);
    ctx.drawImage(logoImg, 896 - 190, 64, 380, 380 * logoImg.height / logoImg.width);

    /* Titular izquierda */
    T('MI', 88, 242, { f: FX.a, s: 140 });
    const s = fit('GENERACIÓN', FX.a, 540, 150);
    ctx.font = `${s}px ${FX.a}`;
    const wd = ctx.measureText('GENERA').width;
    T('GENERA', 100, 372, { f: FX.a, s, c: '#1c0824' });
    T('CIÓN', 100 + wd, 372, { f: FX.a, s });
    rr(48, 388, 572, 112, 14, '#c70a6e');
    T('EN LAS URNAS', 98, 488, { f: FX.a, s: fit('EN LAS URNAS', FX.a, 510, 100) });
    T('Elecciones. Democracia.', 106, 586, { f: FX.b, s: 46, w: 500 });
    T('Participación. Futuro.', 106, 640, { f: FX.b, s: 46, w: 500 });
    ln([[114, 675], [200, 675]], '#fff', 4);

    /* Manuscrito derecha */
    T('Haz que cuente.', 1190, 238, { f: FX.c, s: 88, w: 700, al: 'center', rot: -11 });
    T('o', 1165, 312, { f: FX.c, s: 70, w: 700, al: 'center', rot: -6 });
    T('Participa.', 1180, 392, { f: FX.c, s: 96, w: 700, al: 'center', rot: -9 });
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1075, 442); ctx.quadraticCurveTo(1190, 432, 1292, 382); ctx.stroke(); ctx.restore();

    /* Chip estado */
    ctx.font = `92px ${FX.a}`;
    const tw = Math.min(ctx.measureText(est).width, 330);
    const cw = tw + 190;
    const cx = 1741 - cw;
    rr(cx, 830, cw, 176, 34, '#2a0f33');
    ctx.save(); ctx.strokeStyle = '#e8208a'; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.arc(cx + 66, 904, 24, Math.PI * 0.85, Math.PI * 0.15); ctx.lineTo(cx + 66, 950); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + 66, 903, 8, 0, 7); ctx.stroke(); ctx.restore();
    T(est, cx + 130, 952, { f: FX.a, s: fit(est, FX.a, 330, 92) });

    /* Porcentaje */
    T(pt, 1725, 1199, { f: FX.a, s: fit(pt, FX.a, 470, 230), al: 'right', st: '#2a0f33', sw: 18, sh: 'rgba(0,0,0,.45)', shb: 18, shy: 8 });
    T(`participó en ${anioEleccion || ''}`, 1716, 1274, { f: FX.b, s: 58, w: 500, al: 'right', st: '#2a0f33', sw: 8, sh: 'rgba(0,0,0,.4)' });

    /* Generación (dos líneas) */
    star(1672, 1505, 34);
    ln([[1640, 1580], [1730, 1545]], '#0d080e', 7);
    const gs = Math.min(fit(g1, FX.a, 490, 150), fit(g2, FX.a, 490, 150));
    T(g1, 1237, 1654, { f: FX.a, s: gs, c: '#0d080e' });
    T(g2, 1237, 1654 + gs * 1.02, { f: FX.a, s: gs, c: '#0d080e' });

    /* Rango */
    T(cohortRange || '', 1247, 1942, { f: FX.a, s: fit(cohortRange || '', FX.a, 490, 140), st: '#2a0f33', sw: 10, sh: 'rgba(0,0,0,.35)' });
    ln([[1334, 1968], [1595, 1962]], '#0d080e', 8);
    star(1216, 1950, 26);

    /* Elecciones */
    wrap(eleccionesTexto.toUpperCase(), 520, FX.b, 58).forEach((l, i) => T(l, 1508, 2061 + i * 50, { f: FX.b, s: 58, w: 600, al: 'center' }));

    /* Botón web */
    rr(1285, 2131, 430, 92, 22, '#2a0f33');
    T('→', 1308, 2196, { f: FX.b, s: 64, w: 600, c: '#e8208a' });
    T('MIGENERACIONENLASURNAS.MX', 1372, 2194, { f: FX.b, s: fit('MIGENERACIONENLASURNAS.MX', FX.b, 325, 50, '600'), w: 600 });

    /* Pie */
    [
      'Seguimos grupos de edad entre elecciones, no a las mismas personas.',
      'Por eso el porcentaje puede cambiar aunque la persona no haya cambiado de opinión.',
      'Fuente: INE, Conteos Censales 2009-2024',
      'Generada en tu navegador • Tus datos no se envían a ningún servidor'
    ].forEach((l, i) => T(l, 896, 2272 + i * 32, { f: FX.b, s: 33, w: 500, al: 'center', sh: 'rgba(0,0,0,.6)', shb: 8, shy: 2 }));
  }

  /* ---------- Descarga ---------- */
  function descargar() {
    if (!canvas) return;
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tarjeta-${(entidad || 'datos').toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }

  /* ---------- Carga inicial ---------- */
  onMount(async () => {
    ctx = canvas.getContext('2d');

    arteImg = new Image();
    arteImg.src = '/images/arte-base.jpg';
    logoImg = new Image();
    logoImg.src = '/images/logo-ine-blanco.png';

    try {
      await Promise.all([arteImg.decode(), logoImg.decode()]);
    } catch (e) {
      console.warn('No se pudieron decodificar las imágenes', e);
    }

    try {
      await Promise.all([
        document.fonts.load('1em Anton'),
        document.fonts.load('500 1em "Barlow Condensed"'),
        document.fonts.load('600 1em "Barlow Condensed"'),
        document.fonts.load('700 1em Caveat')
      ]);
    } catch (e) {
      console.warn('No se pudieron cargar las fuentes', e);
    }

    listo = true;
    render();
  });

  /* Re-renderizar cuando cambien los datos */
  $: if (listo) render();
</script>

<canvas
  bind:this={canvas}
  width="1792"
  height="2400"
  role="img"
  aria-label="Tarjeta Mi generación en las urnas"
  class="tarjeta-canvas"
></canvas>

<div class="descarga">
  <button class="btn-download" on:click={descargar} disabled={!listo}>
    Descargar imagen para compartir
  </button>
</div>

<style>
  .tarjeta-canvas {
    width: 100%;
    max-width: 520px;
    height: auto;
    display: block;
    margin: 0 auto;
    border-radius: var(--radius-lg, 16px);
    box-shadow: var(--shadow-lg, 0 20px 60px rgba(0, 0, 0, 0.5));
    background: #0B0F19;
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
  }

  .descarga {
    margin-top: var(--spacing-xl, 2rem);
    text-align: center;
  }

  .btn-download {
    padding: var(--spacing-lg, 1rem) var(--spacing-2xl, 2rem);
    font-size: var(--font-size-lg, 1.125rem);
    font-weight: 700;
    font-family: var(--font-heading, 'Bricolage Grotesque', sans-serif);
    background: #FF1A8C;
    color: white;
    border: none;
    border-radius: var(--radius-md, 12px);
    cursor: pointer;
    min-width: 280px;
    min-height: 44px;
  }

  .btn-download:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
