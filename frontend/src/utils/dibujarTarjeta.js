export const W = 1792;
export const H = 2400;
const PERIODO = '2009-2024';

const FX = {
  a: '"Big Shoulders Display", "Arial Narrow", Impact, sans-serif',
  b: '"Public Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  
  c: 'Caveat, "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive'
};

const MORADO = '#2a0f33';
const NEGRO = '#0d080e';
const ROSA = '#e8208a';

function peso(f, w = '') {
  if (w) return w;
  if (f === FX.a) return 900;
  if (f === FX.c) return 700;
  return '';
}

export function dibujarTarjeta(ctx, d) {
  const est = (d.entidad || '').toUpperCase();
  const pt = (d.participacionPct !== null && d.participacionPct !== undefined
    ? Number(d.participacionPct).toFixed(1) : '') + '%';
  
  const rango = String(d.cohortRange || '').replace(/[–—]/g, '-');
  const n = d.numElecciones || 2;

  
  const font = (f, s, w) => `${peso(f, w)} ${s}px ${f}`;

  function fit(t, fam, w, max, wt = '') {
    ctx.font = font(fam, max, wt);
    const m = ctx.measureText(t).width;
    return m > w ? Math.floor(max * w / m) : max;
  }

  
  function rotado(px, py, deg, fn) {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(deg * Math.PI / 180);
    ctx.translate(-px, -py);
    fn();
    ctx.restore();
  }

  

  function T(t, px, py, o = {}) {
    ctx.save();
    let sz = o.s;
    if (o.mw) sz = fit(t, o.f, o.mw, sz, o.w);
    ctx.font = font(o.f, sz, o.w);
    ctx.textAlign = o.al || 'left';
    ctx.textBaseline = 'alphabetic';
    if (o.rot) {
      ctx.translate(px, py);
      ctx.rotate(o.rot * Math.PI / 180);
      px = 0; py = 0;
    }
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    if (o.sh) {
      ctx.shadowColor = o.sh;
      ctx.shadowBlur = o.shb || 14;
      ctx.shadowOffsetY = o.shy || 6;
    }
    if (o.st) {
      ctx.lineWidth = o.sw;
      ctx.strokeStyle = o.st;
      ctx.strokeText(t, px, py);
    }
    
    ctx.shadowColor = 'transparent';
    if (o.st2) {
      ctx.lineWidth = o.sw2;
      ctx.strokeStyle = o.st2;
      ctx.strokeText(t, px, py);
    }
    ctx.fillStyle = o.c || '#fff';
    ctx.fillText(t, px, py);
    ctx.restore();
  }

  function rr(a, b, w, h, r, c) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.roundRect(a, b, w, h, r);
    ctx.fill();
  }

  function ln(pts, c, w) {
    ctx.save();
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
    ctx.stroke();
    ctx.restore();
  }

  
  function destello(cx, cy, r, ang = 0) {
    for (let i = 0; i < 4; i++) {
      const a = ang + i * Math.PI / 4;
      const k = i % 2 === 0 ? 1 : 0.78;
      ln([
        [cx - r * k * Math.cos(a), cy - r * k * Math.sin(a)],
        [cx + r * k * Math.cos(a), cy + r * k * Math.sin(a)]
      ], NEGRO, 7);
    }
  }

  
  function pincel(x1, y1, x2, y2, grosor, c) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len;
    ctx.save();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x1 + nx * grosor * 0.35, y1 + ny * grosor * 0.35);
    ctx.lineTo(x2 + nx * grosor * 0.5, y2 + ny * grosor * 0.5);
    ctx.lineTo(x2 - nx * grosor * 0.5, y2 - ny * grosor * 0.5);
    ctx.lineTo(x1 - nx * grosor * 0.35, y1 - ny * grosor * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  
  ctx.clearRect(0, 0, W, H);
  if (d.arteImg) {
    ctx.drawImage(d.arteImg, 0, 0, W, H);
  } else {
    
    ctx.fillStyle = '#c70a6e';
    ctx.fillRect(0, 0, W, H);
  }

  
  rotado(88, 372, -1.5, () => {
    T('MI', 88, 242, { f: FX.a, s: 140 });
    const s = fit('GENERACIÓN', FX.a, 540, 150);
    ctx.font = font(FX.a, s);
    const wd = ctx.measureText('GENERA').width;
    T('GENERA', 100, 372, { f: FX.a, s, c: NEGRO });
    T('CIÓN', 100 + wd, 372, { f: FX.a, s, c: NEGRO });

    
    ctx.save();
    ctx.fillStyle = '#c70a6e';
    ctx.beginPath();
    ctx.moveTo(44, 404);
    ctx.lineTo(70, 388); ctx.lineTo(300, 392); ctx.lineTo(610, 386); ctx.lineTo(632, 398);
    ctx.lineTo(626, 440); ctx.lineTo(640, 470); ctx.lineTo(616, 506);
    ctx.lineTo(330, 500); ctx.lineTo(80, 508); ctx.lineTo(52, 494);
    ctx.lineTo(62, 452);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    T('EN LAS URNAS', 98, 488, { f: FX.a, s: fit('EN LAS URNAS', FX.a, 510, 100) });

    T('Elecciones. Democracia.', 106, 586, { f: FX.b, s: 36, w: 500, mw: 520 });
    T('Participación. Futuro.', 106, 630, { f: FX.b, s: 36, w: 500, mw: 520 });
    ln([[114, 675], [200, 675]], '#fff', 4);
  });

  
  T('Haz que cuente.', 1160, 238, { f: FX.c, s: 88, w: 700, al: 'center', rot: -11 });
  T('o', 1135, 312, { f: FX.c, s: 70, w: 700, al: 'center', rot: -6 });
  T('Participa.', 1150, 392, { f: FX.c, s: 96, w: 700, al: 'center', rot: -9 });
  ctx.save();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(1045, 442); ctx.quadraticCurveTo(1160, 432, 1262, 382); ctx.stroke();
  ctx.restore();

  
  {
    const ang = 8;
    const tam = fit(est, FX.a, 330, 92);
    ctx.font = font(FX.a, tam);
    const tw = Math.min(ctx.measureText(est).width, 330);
    const cw = tw + 175;
    const ch = 116;
    
    const px = 1745 - cw * Math.cos(ang * Math.PI / 180);
    const py = 828;
    rotado(px, py, ang, () => {
      rr(px, py, cw, ch, 22, MORADO);
      
      ctx.save();
      ctx.strokeStyle = ROSA; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      const ix = px + 66, iy = py + 44;
      ctx.beginPath();
      ctx.arc(ix, iy, 17, Math.PI * 0.8, Math.PI * 0.2);
      ctx.lineTo(ix, iy + 42);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath(); ctx.arc(ix, iy, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ix - 30, iy + 30); ctx.lineTo(ix - 40, iy + 62); ctx.lineTo(ix + 4, iy + 52);
      ctx.moveTo(ix + 22, iy + 28); ctx.lineTo(ix + 44, iy + 58);
      ctx.lineTo(ix + 4, iy + 52); ctx.lineTo(ix - 40, iy + 62);
      ctx.stroke();
      ctx.restore();
      T(est, px + 128, py + 82, { f: FX.a, s: tam });
    });
  }

  
  T(pt, 1725, 1199, {
    f: FX.a, s: fit(pt, FX.a, 470, 230), al: 'right',
    st: MORADO, sw: 26, st2: ROSA, sw2: 12,
    sh: 'rgba(0,0,0,.45)', shb: 18, shy: 8
  });
  T(`participó en ${d.anioEleccion || ''}`, 1716, 1274, {
    f: FX.b, s: 58, w: 500, al: 'right', mw: 470,
    st: MORADO, sw: 10, sh: 'rgba(0,0,0,.4)'
  });

  
  const tamGen = fit('RACIÓN', FX.a, 395, 150);
  T('GENE-', 1320, 1653, { f: FX.a, s: tamGen, c: NEGRO, rot: 2.5 });
  T('RACIÓN', 1320, 1810, { f: FX.a, s: tamGen, c: NEGRO, rot: 2.5 });
  T(rango, 1248, 1925, {
    f: FX.a, s: fit(rango, FX.a, 490, 140), rot: 2.5,
    st: NEGRO, sw: 12, sh: 'rgba(0,0,0,.35)'
  });
  pincel(1346, 1968, 1658, 1977, 9, NEGRO);
  destello(1239, 1990, 28);
  ln([[1178, 1946], [1233, 1932]], NEGRO, 7);
  destello(1668, 1506, 30, -0.35);
  ln([[1698, 1563], [1758, 1542]], NEGRO, 7);

  
  const lineasElec = n === 1
    ? ['DATOS DE 1 ELECCIÓN', `FEDERAL (${PERIODO})`]
    : [`DATOS DE ${n} ELECCIONES`, `FEDERALES (${PERIODO})`];
  const tamElec = Math.min(...lineasElec.map(l => fit(l, FX.a, 410, 62, '700')));
  lineasElec.forEach((l, i) => {
    T(l, 1508, 2038 + i * 68, {
      f: FX.a, s: tamElec, w: 700, al: 'center', rot: 3,
      sh: 'rgba(0,0,0,.35)', shb: 8, shy: 3
    });
  });

  
  rotado(1285, 2131, 3, () => {
    rr(1285, 2131, 430, 92, 22, MORADO);
    T('→', 1308, 2196, { f: FX.b, s: 64, w: 600, c: ROSA });
    const web = d.sitio.toUpperCase();
    T(web, 1372, 2191, { f: FX.a, w: 700, s: fit(web, FX.a, 330, 52, '700') });
  });

  
  [
    'Seguimos grupos de edad entre elecciones, no a las mismas personas.',
    'Por eso el porcentaje puede cambiar aunque la persona no haya cambiado de opinión.',
    `Fuente: Instituto Nacional Electoral (INE), Conteos Censales de Proceso Constitucional (CCPC) ${PERIODO}`
  ].forEach((l, i) => {
    T(l, 896, 2259 + i * 39, {
      f: FX.b, s: 30, w: 500, al: 'center', mw: 1680,
      sh: 'rgba(0,0,0,.6)', shb: 8, shy: 2
    });
  });
}