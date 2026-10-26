<script>
  /**
   * Demostración con la pantalla REAL: incrusta esta misma app en un iframe
   * (modo ?demo=1, ver App.svelte) con el ancho de viewport que tendría de
   * verdad —así las media queries y las unidades vw se comportan igual— y la
   * escala para que quepa en el marco. Un guion opera la interfaz real por su
   * DOM (elegir en los <select>, pulsar botones, desplazar la página) mientras
   * un cursor dibujado encima lo hace visible.
   *
   * Todo es función del tiempo `t` que da DemoStage; las acciones se disparan
   * al cruzar su instante. Si el iframe no puede usarse (bloqueado por el
   * servidor, sin datos…) avisa con `fallo` y la guía se queda solo con el texto.
   *
   * Eventos: listo (pantalla cargada, arranca el reloj) · fallo
   */
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { Spring } from 'svelte/motion';
  import { toStore } from 'svelte/store';
  import { seg, lerp, easeInOut, clamp } from '../../utils/animacion.js';

  export let t = 0;
  /** 0..4: un paso de la guía */
  export let paso = 0;
  export let reducido = false;

  const dispatch = createEventDispatcher();

  // Ejemplo preferido (Puebla, 1990). Si no existe en los datos cargados, la app
  // elige otro y lo deja en <html data-demo-anio / data-demo-entidad>.
  const ANIO = 1990;
  const CVE = '21';

  // Con el ancho real de la persona (hasta el diseño de escritorio) la pantalla
  // se ve igual que en su navegador, solo que en miniatura.
  const ANCHO = typeof window !== 'undefined' ? Math.min(1100, Math.max(360, window.innerWidth)) : 1100;
  const TEMA =
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light';

  // Slide en el que arranca cada paso (los pasos 2-5 llegan pulsando el botón real)
  const SLIDE_INICIAL = [1, 1, 2, 3, 4];
  // La pantalla real se carga UNA vez (con el paso con que se abre la guía). Al cambiar
  // de paso no se recarga: se reinicia por dentro (ver `cambiarPaso`), así no hay parpadeo.
  const PASO_INICIAL = paso;
  const url = `/?demo=1&slide=${SLIDE_INICIAL[PASO_INICIAL]}&theme=${TEMA}&anio=${ANIO}&entidad=${CVE}&sel=${
    PASO_INICIAL > 0 ? 1 : 0
  }`;
  const LISTO_SEL = PASO_INICIAL === 0 ? '#year-select' : '.slide-actions .btn-primary';
  const BTN = '.slide-actions .btn-primary';
  const FILA = 26; // alto de una fila del menú desplegable (px de la pantalla real)

  let contenedor;
  let marco;
  let doc = null;
  let win = null;
  let escala = 0.6;
  let altoPane = 680;
  let ro;
  let vivo = true;

  // ---------- Acceso al DOM de la pantalla real ----------
  const el = (sel) => {
    try {
      return doc ? doc.querySelector(sel) : null;
    } catch (e) {
      return null;
    }
  };

  /** Año y estado de ejemplo que realmente usa la app (ver App.svelte) */
  const ejemplo = () => ({
    anio: (doc && doc.documentElement.dataset.demoAnio) || String(ANIO),
    cve: (doc && doc.documentElement.dataset.demoEntidad) || CVE
  });

  const espera = (ms) => new Promise((r) => setTimeout(r, ms));

  async function esperarEl(sel, max = 3000) {
    const ini = performance.now();
    while (vivo && performance.now() - ini < max) {
      const e = el(sel);
      if (e) return e;
      await espera(60);
    }
    return null;
  }

  /** Centro (o punto relativo) de un elemento, en px del marco ya escalado */
  function punto(sel, fx = 0.5, fy = 0.5) {
    const e = el(sel);
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: (r.left + r.width * fx) * escala, y: (r.top + r.height * fy) * escala };
  }

  const inicio = () => ({ x: ANCHO * 0.9 * escala, y: altoPane * 0.92 * escala });

  /** Geometría del menú desplegable de un <select> (5 filas alrededor del valor) */
  function geoMenu(sel, valor) {
    const s = el(sel);
    if (!s) return null;
    const r = s.getBoundingClientRect();
    const ops = Array.from(s.options).filter((o) => !o.disabled);
    const i = Math.max(0, ops.findIndex((o) => o.value === valor));
    const a = clamp(i - 2, 0, Math.max(0, ops.length - 5));
    const alto = Math.min(5, ops.length) * FILA + 6;
    const arriba = r.bottom + alto > altoPane - 4;
    return {
      left: r.left,
      top: arriba ? r.top - alto : r.bottom,
      ancho: r.width,
      filas: ops.slice(a, a + 5).map((o) => o.text),
      objetivo: i - a
    };
  }

  /** Centro de la fila que se va a elegir */
  function fila(sel, valor) {
    const g = geoMenu(sel, valor);
    if (!g) return null;
    return { x: (g.left + g.ancho * 0.4) * escala, y: (g.top + 3 + (g.objetivo + 0.5) * FILA) * escala };
  }

  // ---------- Acciones reales sobre la interfaz ----------
  async function elegir(sel, valor) {
    const s = await esperarEl(sel);
    if (!s) return;
    s.value = valor;
    s.dispatchEvent(new win.Event('change', { bubbles: true }));
    await espera(60);
  }

  async function pulsar(sel) {
    const b = await esperarEl(sel);
    b?.click();
  }

  const maxScroll = () => (doc && win ? Math.max(0, doc.documentElement.scrollHeight - win.innerHeight) : 0);

  /** Posición para que el final del slide quede a la vista */
  function finDeSlide() {
    const s = el('main section.slide');
    if (!s || !win) return 0;
    return clamp(win.scrollY + s.getBoundingClientRect().bottom - win.innerHeight + 32, 0, maxScroll());
  }

  function centrarEn(sel, fy = 0.5) {
    const e = el(sel);
    if (!e || !win) return null; // sin elemento, la página la gobierna la propia app
    return clamp(win.scrollY + e.getBoundingClientRect().top - win.innerHeight * fy, 0, maxScroll());
  }

  /**
   * Posición del formulario del paso 1: centrado arriba, pero subiendo lo necesario (en pantallas
   * bajas, como un celular) para que el selector de estado quede completo y a la vista.
   */
  function posFormulario() {
    const base = centrarEn('.mad-libs-form', 0.3);
    const e = el('#entidad-select');
    if (base === null || !e || !win) return base;
    const abajo = e.getBoundingClientRect().bottom + win.scrollY - base; // dónde quedaría su borde inferior
    const limite = win.innerHeight - 40;
    return abajo > limite ? clamp(base + (abajo - limite), 0, maxScroll()) : base;
  }

  // ---------- Guion de cada paso ----------
  // clics: instantes con "onda" de clic · acciones: lo que realmente se opera
  // ruta: puntos por los que pasa el cursor · scroll: desplazamiento de la página
  const GUION = [
    {
      // 1 · Año y estado
      clics: [1.0, 2.4, 3.6, 4.9, 6.9],
      cursorHasta: 8.6,
      menus: [
        { sel: '#year-select', valor: () => ejemplo().anio, de: 1.05, a: 2.45 },
        { sel: '#entidad-select', valor: () => ejemplo().cve, de: 3.65, a: 4.95 }
      ],
      acciones: [
        { t: 2.4, run: () => elegir('#year-select', ejemplo().anio) },
        { t: 4.9, run: () => elegir('#entidad-select', ejemplo().cve) },
        { t: 6.9, run: () => pulsar(BTN) }
      ],
      ruta: [
        [0, inicio],
        [0.9, () => punto('#year-select', 0.6)],
        [1.4, () => punto('#year-select', 0.6)],
        [2.3, () => fila('#year-select', ejemplo().anio)],
        [2.8, () => fila('#year-select', ejemplo().anio)],
        [3.5, () => punto('#entidad-select', 0.6)],
        [4.0, () => punto('#entidad-select', 0.6)],
        [4.8, () => fila('#entidad-select', ejemplo().cve)],
        [5.3, () => fila('#entidad-select', ejemplo().cve)],
        [6.7, () => punto(BTN, 0.6)],
        [10, () => punto(BTN, 0.6)]
      ],
      // Se baja hasta el formulario y, al final, hasta el botón que aparece.
      // Tras el clic la página la gobierna la app (vuelve arriba por su cuenta).
      scrollHasta: 6.85,
      scroll: [
        [0.2, () => 0],
        [0.9, () => posFormulario()],
        [5.4, () => posFormulario()],
        [6.4, () => centrarEn('.acciones-reservadas', 0.8)],
        [10, () => centrarEn('.acciones-reservadas', 0.8)]
      ]
    },
    {
      // 2 · El choque
      clics: [1.4],
      cursorHasta: 2.6,
      acciones: [{ t: 1.4, run: () => pulsar(BTN) }],
      previo: [[0, () => 0], [0.9, () => centrarEn(BTN, 0.7)]],
      previoHasta: 1.5,
      ruta: [[0, inicio], [1.2, () => punto(BTN, 0.6)], [10, () => punto(BTN, 0.6)]],
      scroll: [[3.2, () => 0], [7.2, finDeSlide]]
    },
    {
      // 3 · La silla vacía
      clics: [1.4],
      cursorHasta: 2.6,
      acciones: [{ t: 1.4, run: () => pulsar(BTN) }],
      previo: [[0, () => 0], [0.9, () => centrarEn(BTN, 0.7)]],
      previoHasta: 1.5,
      ruta: [[0, inicio], [1.2, () => punto(BTN, 0.6)], [10, () => punto(BTN, 0.6)]],
      scroll: [[3.6, () => 0], [8.2, finDeSlide]]
    },
    {
      // 4 · Cómo ha cambiado (línea de vida + «Tu generación a la misma edad»)
      clics: [1.4, 6.3],
      cursorHasta: 7.3,
      acciones: [
        { t: 1.4, run: () => pulsar(BTN) },
        { t: 6.3, run: () => pulsar('.slide-details summary') }
      ],
      previo: [[0, () => 0], [0.9, () => centrarEn(BTN, 0.7)]],
      previoHasta: 1.5,
      ruta: [
        [0, inicio],
        [1.2, () => punto(BTN, 0.6)],
        [2.0, () => punto(BTN, 0.6)],
        [5.7, () => punto('.slide-details summary', 0.2)],
        [6.0, () => punto('.slide-details summary', 0.2)],
        [11, () => punto('.slide-details summary', 0.2)]
      ],
      // Primero la gráfica completa (se dibuja sola); luego baja hasta «Tu generación a la
      // misma edad», se ve el clic y queda desplegado
      scroll: [
        [3.2, () => 0],
        [4.4, () => centrarEn('.slide-card', 0.45)],
        [4.9, () => centrarEn('.slide-card', 0.45)],
        [5.7, () => centrarEn('.slide-details summary', 0.6)],
        [6.6, () => centrarEn('.slide-details summary', 0.6)],
        [8.0, () => centrarEn('.slide-details summary', 0.25)],
        [10.4, finDeSlide]
      ]
    },
    {
      // 5 · Compartir: se pulsa un botón real y aparece su confirmación (se cancela)
      clics: [1.4, 4.6, 7.4],
      cursorHasta: 8.4,
      acciones: [
        { t: 1.4, run: () => pulsar(BTN) },
        { t: 4.6, run: () => pulsar('[aria-label="Compartir en WhatsApp"]') },
        { t: 7.4, run: () => pulsar('.btn-cancel') }
      ],
      previo: [[0, () => 0], [0.9, () => centrarEn(BTN, 0.7)]],
      previoHasta: 1.5,
      ruta: [
        [0, inicio],
        [1.2, () => punto(BTN, 0.6)],
        [2.0, () => punto(BTN, 0.6)],
        [4.0, () => punto('[aria-label="Compartir en WhatsApp"]', 0.5)],
        [6.0, () => punto('[aria-label="Compartir en WhatsApp"]', 0.5)],
        [6.9, () => punto('.btn-cancel', 0.5)],
        [11, () => punto('.btn-cancel', 0.5)]
      ],
      // Baja hasta los botones de compartir para que se vea el clic en WhatsApp
      scroll: [
        [2.4, () => 0],
        [3.6, () => centrarEn('[aria-label="Compartir en WhatsApp"]', 0.55)],
        [7.6, () => centrarEn('[aria-label="Compartir en WhatsApp"]', 0.55)],
        [8.4, () => 0],
        [10.6, finDeSlide]
      ]
    }
  ];

  $: G = GUION[paso];

  // ---------- Reloj → cursor, menús, desplazamiento y acciones ----------
  let ultimoPunto = null;

  /** Dónde está (o estará) el cursor en el instante `tt` según la ruta del guion */
  function rutaEn(tt) {
    const R = G.ruta;
    let res = null;
    if (tt <= R[0][0]) {
      res = R[0][1]();
    } else {
      for (let i = 1; i < R.length; i++) {
        if (tt <= R[i][0]) {
          const a = R[i - 1][1]();
          const b = R[i][1]();
          if (a && b) {
            const q = easeInOut(seg(tt, R[i - 1][0], R[i][0]));
            res = { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q) };
          } else {
            res = b || a;
          }
          break;
        }
      }
      if (!res) res = R[R.length - 1][1]();
    }
    return res;
  }

  function posicionCursor() {
    const res = rutaEn(t);
    if (res) ultimoPunto = res;
    return res || ultimoPunto;
  }

  $: cursor = (t, escala, doc, posicionCursor()) && ultimoPunto;
  // ---------- Zoom hacia el punto donde se va a pulsar ----------
  // La "cámara" es un resorte (svelte/motion): el guion solo fija el DESTINO (acercarse al punto
  // del próximo clic, o volver a 1×) y el resorte lo alcanza con un movimiento natural, sin
  // curvas calculadas a mano. Al repetirse el bucle o cambiar de paso se coloca de golpe.
  const ZOOM = 1.7;
  const ENCUADRE = 0.6; // cuánto del camino al centro del marco recorre el punto del clic
  const ANTES = 1.0; // segundos antes del clic en que empieza el acercamiento
  const DESPUES = 0.4; // y después del clic en que empieza a alejarse
  const REPOSO = { z: 1, x: 0, y: 0 };

  const camara = new Spring(REPOSO, { stiffness: 0.03, damping: 0.37, precision: 0.001 });
  // Puente para que esta plantilla (sintaxis clásica) se actualice en cada cuadro del resorte
  const camaraActual = toStore(() => camara.current);

  // Punto de cada clic: se sigue al elemento hasta pulsarlo y después se conserva (el botón ya no existe)
  let origenes = {};

  function objetivoCamara(tt) {
    if (reducido || !doc || !contenedor) return REPOSO;
    const k = G.clics.findIndex((c) => tt >= c - ANTES && tt <= c + DESPUES);
    if (k < 0) return REPOSO;
    const c = G.clics[k];
    const clave = `${paso}:${k}`;
    if (tt <= c) {
      const pt = rutaEn(c);
      if (pt) origenes[clave] = pt;
    }
    const pt = origenes[clave];
    if (!pt) return REPOSO;
    // Transformación (origen en 0,0): pantalla = z·punto + desplazamiento. Se busca que el punto
    // quede encuadrado hacia el centro; el desplazamiento se limita para que la pantalla ampliada
    // siempre cubra el marco (sin bordes en blanco).
    const W = contenedor.clientWidth;
    const H = contenedor.clientHeight;
    const z = ZOOM;
    const x = clamp(pt.x + (W / 2 - pt.x) * ENCUADRE - z * pt.x, W * (1 - z), 0);
    const y = clamp(pt.y + (H / 2 - pt.y) * ENCUADRE - z * pt.y, H * (1 - z), 0);
    return { z, x, y };
  }

  let ultimoObjetivo = REPOSO;
  $: {
    const o = (t, escala, doc, objetivoCamara(t));
    if (o.z !== ultimoObjetivo.z || o.x !== ultimoObjetivo.x || o.y !== ultimoObjetivo.y) {
      ultimoObjetivo = o;
      camara.target = o;
    }
  }

  // Lo que se pinta: nunca por debajo de 1× ni con el desplazamiento fuera del rango que cubre el marco.
  function estiloCamara(actual) {
    const zz = Math.max(1, actual.z);
    const W = contenedor ? contenedor.clientWidth : 0;
    const H = contenedor ? contenedor.clientHeight : 0;
    const x = clamp(actual.x, W * (1 - zz), 0);
    const y = clamp(actual.y, H * (1 - zz), 0);
    return `transform: translate(${x}px, ${y}px) scale(${zz})`;
  }

  $: cursorOp = reducido ? 0 : seg(t, 0.1, 0.4) * (1 - seg(t, G.cursorHasta, G.cursorHasta + 0.4));
  $: clicP = G.clics.reduce((acc, c) => (t >= c && t < c + 0.45 ? (t - c) / 0.45 : acc), -1);

  // Menú desplegable simulado (los <select> nativos no se pueden abrir por código)
  $: menu = !reducido && G.menus ? G.menus.find((m) => t >= m.de && t < m.a) || null : null;
  $: geo = (t, escala, menu ? geoMenu(menu.sel, menu.valor()) : null);
  $: menuOp = menu ? seg(t, menu.de, menu.de + 0.12) : 0;
  $: filaHover = geo && cursor ? Math.floor((cursor.y / escala - geo.top - 3) / FILA) : -1;

  // Desplazamiento de la página real
  let ultimoScroll = -1;

  /** Interpola entre los fotogramas [instante, () => posición] según `t`; null si no aplica */
  function interpolar(K) {
    if (t < K[0][0]) return null;
    for (let i = 1; i < K.length; i++) {
      if (t <= K[i][0]) {
        const a = K[i - 1][1]();
        const b = K[i][1]();
        if (a === null || b === null) return null;
        return lerp(a, b, easeInOut(seg(t, K[i - 1][0], K[i][0])));
      }
    }
    return K[K.length - 1][1]();
  }

  function scrollEn() {
    // Tramo previo: baja hasta que el botón de "siguiente" quede a la vista ANTES de pulsarlo
    if (G.previo && t < G.previoHasta) return interpolar(G.previo);
    const K = G.scroll;
    if (!K || t < K[0][0] || (G.scrollHasta && t >= G.scrollHasta)) return null;
    return interpolar(K);
  }

  $: if (doc && win) {
    const y = (t, scrollEn());
    if (y !== null && Math.abs(y - ultimoScroll) > 0.5) {
      win.scrollTo(0, y);
      ultimoScroll = y;
    }
  }

  // Acciones: se ejecutan una sola vez, en orden, al cruzar su instante
  let idxAccion = 0;
  let tPrev = 0;
  let cola = Promise.resolve();

  // Se suma en cada reinicio: las acciones en cola de la vuelta/paso anterior se descartan
  let generacion = 0;

  function ejecutar() {
    // Mientras cambia el paso (o aún se reinicia) el guion espera: así no actúa sobre el estado viejo
    if (!doc || !pasoListo || paso !== pasoAplicado) return;
    if (t < tPrev) idxAccion = 0;
    tPrev = t;
    while (idxAccion < G.acciones.length && G.acciones[idxAccion].t <= t) {
      const a = G.acciones[idxAccion++];
      const g = generacion;
      cola = cola.then(() => (g === generacion ? a.run() : null)).catch(() => {});
    }
  }
  $: (t, doc, ejecutar());

  // Cambio de paso de la guía: la misma pantalla real salta al punto de partida del
  // nuevo paso (sin recargar ni desvanecer). Mientras tanto el guion espera.
  let pasoAplicado = paso;
  let pasoListo = true;

  async function cambiarPaso() {
    pasoAplicado = paso;
    pasoListo = false;
    await reiniciar();
    pasoListo = true;
    ejecutar();
  }

  $: if (doc && paso !== pasoAplicado) cambiarPaso();

  /**
   * Repite el bucle SIN recargar: la propia app (en el iframe) vuelve al punto de
   * partida del paso. Se llama justo cuando el reloj vuelve a 0.
   */
  export async function reiniciar() {
    if (!win || typeof win.__demoReiniciar !== 'function') return;
    generacion += 1; // descarta acciones pendientes de la vuelta anterior
    cola = Promise.resolve();
    idxAccion = 0;
    tPrev = 0;
    ultimoScroll = -1;
    ultimoPunto = null;
    origenes = {};
    ultimoObjetivo = REPOSO;
    camara.set(REPOSO, { instant: true });
    try {
      await win.__demoReiniciar(SLIDE_INICIAL[paso], paso > 0);
    } catch (e) { /* si falla, la siguiente vuelta sigue desde donde quedó */ }
  }

  // ---------- Carga del iframe ----------
  function medir() {
    if (!contenedor) return;
    escala = contenedor.clientWidth / ANCHO;
    altoPane = contenedor.clientHeight / escala;
  }

  async function alCargar() {
    const ini = performance.now();
    try {
      while (vivo && performance.now() - ini < 10000) {
        const d = marco.contentDocument; // lanza si el servidor bloquea el marco
        // Cargó algo que no es la app (página de error, marco prohibido…): respaldo ya
        if (!d || !d.getElementById('app')) break;
        if (d.querySelector(LISTO_SEL)) {
          await espera(250); // margen mínimo para las entradas propias de la pantalla
          if (!vivo) return;
          const st = d.createElement('style');
          st.textContent =
            'html{scrollbar-width:none;scroll-behavior:auto!important}::-webkit-scrollbar{display:none}*{caret-color:transparent}';
          d.head.appendChild(st);
          win = marco.contentWindow;
          win.scrollTo(0, 0);
          doc = d;
          dispatch('listo');
          return;
        }
        await espera(30);
      }
    } catch (e) {
      /* se trata como fallo */
    }
    if (vivo) dispatch('fallo');
  }

  onMount(() => {
    medir();
    ro = new ResizeObserver(medir);
    ro.observe(contenedor);
  });

  onDestroy(() => {
    vivo = false;
    ro?.disconnect();
  });
</script>

<div class="pantalla" bind:this={contenedor}>
  <div
    class="zoom"
    style={estiloCamara($camaraActual)}
  >
  <iframe
    bind:this={marco}
    src={url}
    title=""
    aria-hidden="true"
    tabindex="-1"
    inert
    on:load={alCargar}
    style="width: {ANCHO}px; height: {altoPane}px; transform: scale({escala})"
  ></iframe>

  {#if geo}
    <ul
      class="menu"
      style="left: {geo.left * escala}px; top: {geo.top * escala}px; width: {geo.ancho}px; transform: scale({escala}); opacity: {menuOp}"
    >
      {#each geo.filas as f, i}
        <li class:sel={i === filaHover}>{f}</li>
      {/each}
    </ul>
  {/if}

  {#if cursor && cursorOp > 0}
    {#if clicP >= 0}
      <span
        class="onda"
        style="left: {cursor.x}px; top: {cursor.y}px; opacity: {1 - clicP}; transform: translate(-50%, -50%) scale({0.4 + clicP * 1.6})"
      ></span>
    {/if}
    <svg
      class="cursor"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      style="left: {cursor.x}px; top: {cursor.y}px; opacity: {cursorOp}; transform: translate(-3px, -2px) scale({clicP >= 0 && clicP < 0.25 ? 0.86 : 1})"
    >
      <path d="M4 2l15 9-6.5 1.6L9.4 19z" fill="#fff" stroke="#24102c" stroke-width="1.6" stroke-linejoin="round" />
    </svg>
  {/if}
  </div>
</div>

<style>
  .pantalla {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .zoom {
    position: absolute;
    inset: 0;
    transform-origin: 0 0;
  }

  iframe {
    position: absolute;
    left: 0;
    top: 0;
    border: 0;
    transform-origin: 0 0;
    pointer-events: none;
    background: var(--bg-main);
  }

  /* Imita la lista desplegable nativa del sistema */
  .menu {
    position: absolute;
    z-index: 3;
    margin: 0;
    padding: 3px;
    list-style: none;
    transform-origin: 0 0;
    background: Canvas;
    color: CanvasText;
    border: 1px solid color-mix(in srgb, CanvasText 35%, transparent);
    border-radius: 4px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
    font: 16px/26px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    pointer-events: none;
  }

  .menu li {
    height: 26px;
    padding: 0 10px;
    border-radius: 3px;
    white-space: nowrap;
    overflow: hidden;
  }

  .menu li.sel {
    background: Highlight;
    color: HighlightText;
  }

  .onda {
    position: absolute;
    width: 30px;
    height: 30px;
    border: 2px solid var(--accent-pink);
    border-radius: 50%;
    background: color-mix(in srgb, var(--accent-pink) 18%, transparent);
    pointer-events: none;
    z-index: 4;
  }

  .cursor {
    position: absolute;
    z-index: 5;
    pointer-events: none;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45));
  }
</style>
