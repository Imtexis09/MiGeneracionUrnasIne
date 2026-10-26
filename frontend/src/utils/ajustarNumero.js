/**
 * Acción de Svelte: ajusta el número grande del slide 2 para que su altura
 * abarque TODO el alto del bloque de texto (de la primera línea del titular
 * hasta la última línea de texto), sin importar cuántas líneas ocupe.
 *
 * CSS no puede igualar la altura de un dígito con la de otro bloque, así que
 * se mide el glifo real (canvas) y se calcula el tamaño de fuente exacto.
 *
 * Uso: <div class="shock-hero" use:ajustarNumero={numero}> con dentro
 * `.shock-numeral > .shock-number`, `.shock-copy` y `.slide-title`.
 * En pantallas angostas (una columna) no hace nada y vale el CSS.
 */

const FUENTE = '"Big Shoulders Display"';
const PESO = 900;
const LINE_HEIGHT = 0.78; // el mismo del CSS de .shock-number
const MAX_ANCHO = 0.42; // el número no ocupa más del 42 % del ancho del hero

export function ajustarNumero(hero, texto) {
  const q = (sel) => hero.querySelector(sel);
  const mq = window.matchMedia('(min-width: 761px)');
  let vivo = true;
  let texto_ = texto;
  let ultimoFs = 0;
  let ultimoY = 0;
  let ro = null;

  function limpiar() {
    const num = q('.shock-number');
    const cont = q('.shock-numeral');
    if (num) num.removeAttribute('style');
    if (cont) cont.removeAttribute('style');
    ultimoFs = 0;
  }

  async function medir() {
    const copy = q('.shock-copy');
    const num = q('.shock-number');
    const cont = q('.shock-numeral');
    const titulo = q('.slide-title');
    if (!copy || !num || !cont || !titulo) return;

    if (!mq.matches) {
      limpiar();
      return;
    }

    try {
      await document.fonts.load(`${PESO} 100px ${FUENTE}`);
    } catch {
      /* si falla, se mide con la fuente de respaldo */
    }
    if (!vivo) return;

    // Zona útil del texto: del borde superior de las mayúsculas del titular
    // al borde inferior de la última línea (sin el relleno del bloque).
    const tituloFs = parseFloat(getComputedStyle(titulo).fontSize) || 48;
    const padAbajo = parseFloat(getComputedStyle(copy).paddingBottom) || 0;
    const insetArriba = tituloFs * 0.08;
    const insetAbajo = padAbajo + 3;
    const alto = copy.clientHeight - insetArriba - insetAbajo;
    if (alto < 40) return;

    // Métricas reales del glifo a 100 px
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${PESO} 100px ${FUENTE}`;
    const m = ctx.measureText(String(texto_));
    const aA = m.actualBoundingBoxAscent / 100;
    const aD = m.actualBoundingBoxDescent / 100;
    const fA = (m.fontBoundingBoxAscent ?? 95) / 100;
    const fD = (m.fontBoundingBoxDescent ?? 25) / 100;
    const ancho = m.width / 100;
    const glifo = aA + aD;
    if (!glifo || !isFinite(glifo)) return;

    let fs = alto / glifo;
    const maxAncho = hero.clientWidth * MAX_ANCHO;
    if (ancho * fs > maxAncho) fs = maxAncho / ancho;

    // El dígito queda pegado ABAJO si hubo que achicarlo
    const altoDigito = fs * glifo;
    const baseline = fs * ((LINE_HEIGHT - fA - fD) / 2 + fA);
    const arribaDigito = baseline - fs * aA;
    const y = insetArriba + (alto - altoDigito) - arribaDigito;

    if (Math.abs(fs - ultimoFs) < 0.5 && Math.abs(y - ultimoY) < 0.5) return;
    ultimoFs = fs;
    ultimoY = y;

    cont.style.alignSelf = 'start';
    num.style.display = 'block';
    num.style.height = '0';
    num.style.overflow = 'visible';
    num.style.fontSize = `${fs.toFixed(2)}px`;
    num.style.lineHeight = String(LINE_HEIGHT);
    num.style.transform = `translateY(${y.toFixed(2)}px)`;
  }

  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => medir());
    ro.observe(hero);
    const copy = q('.shock-copy');
    if (copy) ro.observe(copy);
  }
  mq.addEventListener?.('change', medir);
  medir();

  return {
    update(nuevo) {
      texto_ = nuevo;
      ultimoFs = 0;
      medir();
    },
    destroy() {
      vivo = false;
      ro?.disconnect();
      mq.removeEventListener?.('change', medir);
    }
  };
}
