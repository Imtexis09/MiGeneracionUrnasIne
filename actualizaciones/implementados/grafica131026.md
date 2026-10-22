# Análisis y plan: gráfica "Línea de Vida" (experiencia de usuario)

Fecha: 13/10/2026
Componente: `src/components/LineaDeVida.svelte` (678 líneas)
Contexto de uso: `src/App.svelte:499-504` (dentro de `.chart-main`, grid `280px 1fr`, `App.svelte:1015-1028`)

---

## 1. Cómo funciona hoy

- SVG con `viewBox="0 0 innerWidth 400"`, `width:100%`, `height:auto`,
  `preserveAspectRatio="xMidYMid meet"` (`LineaDeVida.svelte:101-106`). Se **escala al ancho**
  del contenedor; **no hace scroll**.
- X: `d3.scaleLinear(min(año) → max(año))` (`:113-115`). Y: `d3.scaleLinear(0 → 100)` **fija**
  (`:117-119`).
- Dos líneas por familia (`intermedias` esmeralda / `presidenciales` magenta) con
  `curveMonotoneX` (`:160-163`), puntos `r=6` y animación `stroke-dasharray` (`:168-261`).
- El "popup" es `.chart-readout` (`:351-379`, CSS `:486-531`): tarjeta **sticky** debajo del
  gráfico y la leyenda. Se muestra en **hover** (preview) o **clic/tap** (fijado).
- Entrada: `cohortData` (una cohorte: `year_of_birth_min/max`, `entidad_cve`, `elections[]`).
  Cada elección: `year`, `type`, `age_on_election`, `lista_nominal`, `si_votaron`, `no_votaron`,
  `participacion_pct`, `n_valido`.

Datos reales observados (`public/data/cohorts.json`, 759 cohortes):
- Elecciones por cohorte: **1 a 6** (594 con 6; 33 con cada uno de 1–5). Las de 1 elección son
  las más jóvenes (edad 19 → solo 2024).
- Participación: 18.5%–85%; *spread* intra-cohorte mediano **21.1 pp** (mín 0.5, máx 44.3).
- `meta.nacional_participacion`: 2009:44.1, 2012:62.1, 2015:47.1, 2018:62.4, 2021:51.8, 2024:59.7.
- `n_valido=false` solo en 1 de 4059 elecciones (dato de calidad casi irrelevante).

---

## 2. Diagnóstico visual

1. **El eje X muestra años que NO son elecciones (hallazgo principal).**
   `axisBottom(xScale).ticks(6)` sobre escala lineal produce
   `d3.ticks(2009,2024,6) → [2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024]`.
   Los puntos están en `2009, 2012, 2015, 2018, 2021, 2024`: **faltan 2009/2015/2021 y sobran
   2010/2014/2016/2020/2022**. Los puntos caen entre etiquetas; el usuario no puede mapear
   punto↔año. (`:122-124`)
2. **Y fija 0–100 aplana la señal.** Con *spread* mediano de 21 pp (y cohortes de 0.5 pp), muchas
   líneas se ven casi planas y no se perciben diferencias. (`:117-119`)
3. **Márgenes fijos** `{top:40,right:30,bottom:60,left:60}` (`:89`) no adaptados a móvil. En un
   teléfono de 360px el área de trazo queda en ~150-190px para 6 puntos (~26px/punto) →
   **etiquetas de año solapadas** (14px, `:134/:139/:146/:155`).
4. **La opción de scroll no existe hoy.** `.chart-container { overflow-x:auto }` (`:562-572`) es
   inerte porque `svg { width:100%; max-width:100% }` (`:576-581`) nunca desborda: el gráfico
   siempre se **comprime**.
5. **Casos degenerados según los datos.** Con **1 punto**, `domain([2024,2024])` → d3 devuelve el
   **centro** (`x(2024)=300`) y `d3.line` **no dibuja línea** (solo el punto). Con ≤1 punto por
   familia, esa familia desaparece.
6. **Dos familias suavizadas** con `curveMonotoneX` implican continuidad donde no la hay y dejan
   "saltos" entre familia.
7. **Sin gridlines ni referencia.** No se usa `meta.nacional_participacion`, que está disponible.
8. **Puntos de 12px** (`r=6`): objetivo táctil muy pequeño (<44px, WCAG 2.5.5).
9. **Leyenda redundante**: repite los años que deberían estar en el eje (`:331-348`) y crece a
   varias líneas en móvil.

---

## 3. Diagnóstico del popup (al presionar un punto)

1. **No es un popup flotante ni cercano al punto.** Es una tarjeta **debajo del gráfico + leyenda**
   (`:351-379`). En móvil (`≤480px`) es `position: static` (`:539-541`). Al tocar un punto arriba,
   el detalle aparece **por debajo, probablemente fuera de pantalla → sin feedback inmediato**.
2. **`position: sticky` sin ancestro con scroll** (`:486-488`): se comporta como estático; el
   `sticky` no aporta.
3. **Hover y fijado se pisan.** `$: puntoActivo = puntoFijado || puntoHover` (`:17`): con un punto
   fijado se ignora el hover. El texto "Toca otro punto para compararlo" (`:371`) es impreciso →
   **reemplaza, no compara**.
4. **Resaltado frágil y global.** `.is-selected` solo aplica al fijado (no al hover) y usa
   `d3.selectAll('.dot-…')` **a nivel documento** (`:77-80`), no acotado al SVG; se pierde al
   redibujar.
5. **`aria-live="polite"` cambia en cada hover** (`:352`) → puede saturar al lector de pantalla.
6. **✕ con `padding: 0.4rem`** (`:499-511`): objetivo táctil pequeño. **No cierra al tocar fuera**
   (solo ✕ o re-tocar el mismo punto).
7. **No aprovecha datos ya presentes**: comparación con el nacional y delta vs. elección previa.

---

## 4. Evaluación de las recomendaciones

**a) Ajustar la gráfica según los datos** — *recomendada como base.*
- Pros: usa el rango real (Y adaptativa), ticks = **años reales de elección**, se adapta a 1–6
  puntos, permite altura/márgenes según nº de puntos y ancho. Resuelve el solapamiento en móvil.
- Contras: una Y variable dificulta comparar entre cohortes; se mitiga con gridlines, **span
  mínimo** (20–25 pp) y/o un toggle "escala completa (0–100) / ajustada".

**b) Scroll horizontal** — *útil como fallback, no como base.*
- Pros: mantiene legibilidad sin comprimir.
- Contras: gesto horizontal en una página con scroll vertical (conflicto táctil, "scroll
  trapping"), peor discoverability y **compite con el tap de puntos**. Requiere quitar
  `width/max-width:100%` y usar `min-width` (`nPuntos × ~90px`), más indicador "desliza →" y
  `scroll-snap`.

**Recomendación: híbrido.** (1) Ajuste data-driven como base. (2) Modo scroll solo cuando el ancho
sea insuficiente (`<~480px`). (3) Rediseñar el popup para que sea visible al tocar.

---

## 5. Plan propuesto

### Fase 1 — Ajuste a los datos (visual)
- X: usar `scalePoint`/banda sobre los **años presentes**; ticks = esos años (en móvil, rotar 45°
  o alternar etiquetas).
- Y: dominio adaptativo `[max(0, min−5), min(100, max+5)]` con **span mínimo** (20–25 pp) y
  **gridlines**; opción "escala completa".
- Añadir **línea de referencia nacional** por año (requiere pasar `nacionalPorAnio` desde
  `App.svelte`, que ya tiene `allData.meta.nacional_participacion`).
- Márgenes y altura adaptativos al ancho y al nº de puntos; reducir `bottom` en móvil.
- Manejar 1 punto (punto central + anotación, sin línea) y familias vacías.

### Fase 2 — Modo scroll en móvil
- En `<480px`: `.chart-container` con `overflow-x:auto`; SVG `min-width: max(100%, nPuntos*90px)`
  (quitar `max-width:100%`), `scroll-snap-align` en puntos y pista "desliza".
- Alternativa simple: en móvil mostrar directamente la **Tabla** (ya existe) y reservar el gráfico
  para ≥480px.

### Fase 3 — Popup al tocar
- En móvil: readout como **bottom sheet** fijo/sticky con cierre al tocar fuera (no `static` lejos
  del punto). En escritorio: panel lateral o popup **anclado al punto**.
- Resaltar el punto activo **también en hover**; acotar el `d3.selectAll` al SVG del gráfico.
- ✕ con 44px; cerrar al tocar fuera; `aria-live` **solo al fijar** (no en hover).
- Añadir comparación con el nacional y delta vs. elección previa.

### Fase 4 — Accesibilidad / robustez
- Hit-area táctil mayor (círculo transparente `r≈16-20`) sobre el punto visible de 6px.
- Verificar casos 1–6 puntos, cohortes sin una familia y `prefers-reduced-motion`.

---

## Nota de estado

Análisis realizado en **modo Plan**; **no se modificó código todavía**. Pendiente de implementar
(prioridad sugerida: Fase 1).

---

## Estado: IMPLEMENTADO (13/10/2026)

Se implementaron las Fases 1–4 en `src/components/LineaDeVida.svelte` y se pasó la prop
`nacional` desde `src/App.svelte` (`allData.meta.nacional_participacion`).

Cambios realizados:

- **Fase 1 (ajuste a los datos):**
  - X con `d3.scalePoint` sobre los **años de elección reales** (dominio = años presentes);
    ticks = esos mismos años (se acabaron 2010/2014/2016/2020/2022). Etiquetas rotadas 45° si
    el espacio por punto es < 56 px.
  - Y adaptativa `[max(0, min−5), min(100, max+5)]` con **span mínimo de 20 pp**, `gridlines`
    y **toggle "Escala completa (0–100) / ajustada"**.
  - **Línea de referencia nacional** punteada por año + entrada en la leyenda.
  - Márgenes/altura adaptativos; se omiten títulos de ejes en pantallas estrechas.
  - 1 punto → `scalePoint` lo centra y no se dibuja línea (solo el punto + hit-area).
- **Fase 2 (scroll en móvil):** si `(n−1)·62 + márgenes > ancho`, el SVG usa ancho en píxeles y
  `.chart-container` (ya `overflow-x:auto`) permite scroll; pista "Desliza horizontalmente…".
  Se eliminó `width:100%`/`max-width:100%` del SVG que anulaba el scroll.
- **Fase 3 (popup):** readout como **bottom sheet fijo** en ≤560 px (z-index 1200) y tarjeta en
  escritorio; cierra al **tocar fuera** (listener en captura) y con **Escape** vía ✕; ✕ de 44 px;
  `aria-live` **solo al fijar** (hover = `off`); resaltado del punto activo **también en hover** y
  acotado al SVG (`d3.select` sobre `chartContainer`, no `d3.selectAll` global).
- **Fase 4 (a11y/robustez):** hit-area transparente `r=22` (44 px, WCAG 2.5.5) con `tabindex`,
  `role="button"` y `aria-label`; se manejan 1–6 puntos, familias vacías y
  `prefers-reduced-motion`.
- **Extras:** readout añade **comparación con el promedio nacional** y **delta vs. elección
  previa**; leyenda sin listas de años redundantes; estado "sin datos".

Verificación: `npm test` 14/14 y `npm run build` OK.
