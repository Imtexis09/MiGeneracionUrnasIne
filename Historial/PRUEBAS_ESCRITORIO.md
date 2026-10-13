# Pruebas de Escritorio — Mi Generación en las Urnas

**Fecha:** 05-oct-2026
**Responsable:** QA manual sobre build de producción (`npm run preview`)

## 1. Pruebas funcionales del flujo

| # | Caso | Resultado esperado | Estado |
|---|------|--------------------|--------|
| 1 | Seleccionar año + entidad en el selector Mad Libs | KPIs, gráfica, comparación, silla vacía y tarjeta se actualizan | ☐ |
| 2 | Cambiar año de nacimiento tras selección previa | Todos los componentes reflejan la nueva cohorte | ☐ |
| 3 | Cambiar entidad | Sidebar "Filtros Activos" y gráficas se actualizan | ☐ |
| 4 | Año límite inferior (1940) | Cohorte 1938–1940 muestra solo elecciones donde tuvo ≥18 años | ☐ |
| 5 | Año límite superior (2006) | Solo elección 2024 disponible; comparación generacional puede no aplicar | ☐ |
| 6 | Entidad sin datos suficientes | Fallback a datos nacionales con marca `_isNational` | ☐ |
| 7 | Botón "Ver Tabla" en gráfica | Alterna gráfica/tabla accesible | ☐ |
| 8 | Botón "Descargar Tarjeta" | Descarga PNG 1080×1350 | ☐ |
| 9 | Botones sociales (X, WhatsApp, Instagram) | Abren share intent / copian texto | ☐ |
| 10 | "Generar tarjeta para Stories" | Scroll suave a la sección de tarjeta | ☐ |
| 11 | "Leer análisis completo" | Abre vista de Metodología | ☐ |
| 12 | Footer "Reporte de Validación" | Enlace presente (sin 404 en sitio) | ☐ |

## 2. Validación de datos

| Verificación | Dato esperado | Resultado |
|---|---|---|
| Nacional 2024 (meta) | 59.68% | ✅ verificado en `cohorts.json` meta |
| Nacional 2012 (meta) | 62.09% | ✅ |
| Cohorte CDMX 2001–2003, 2024 | 61.13% (LN 446,002) | ✅ verificado con node |
| Total de cohortes | 759 | ✅ |
| `dist/` total | < 1 MB | ✅ 862 KB |

## 3. UI/UX en escritorio

| Resolución | Revisión | Estado |
|---|---|---|
| 1366×768 | Sidebar sticky, sin overflow horizontal, KPIs en grid | ☐ |
| 1440×900 | Jerarquía visual, espaciados, hover en cards | ☐ |
| 1920×1080 | Gráfica D3 ocupa ancho, tipografía fluida legible | ☐ |
| Scroll largo | Header sticky presente, footer visible al final | ☐ |

## 4. Accesibilidad en escritorio

- [ ] Navegación completa con Tab/Enter/Escape (selector, botones, enlaces).
- [ ] Foco visible (`:focus-visible`) en todos los elementos interactivos.
- [ ] Zoom 150% y 200% sin pérdida de contenido.
- [ ] `prefers-reduced-motion` desactiva animaciones (probar con DevTools).
- [ ] Contraste de texto AA en tarjetas KPI, sidebar y disclaimers.
- [ ] Tablas equivalentes presentes para gráfica (toggle "Ver Tabla").

## 5. Registro de bugs

| Fecha | Bug | Severidad | Estado |
|---|---|---|---|
| 05-oct | KPI cards hardcodeados | Alta | ✅ Corregido (Fase 2) |
| 05-oct | Tooltips duplicados en gráfica D3 | Media | ✅ Corregido (Fase 3) |
| 05-oct | `--color-seat-filled` indefinido (silla vacía sin color) | Alta | ✅ Corregido (Fase 3) |
| 05-oct | URL de tarjeta con espacio (`migenera cionenlasurnas.mx`) | Media | ✅ Corregido (Fase 3) |
| 05-oct | Inputs con fondo blanco y texto claro (ilegibles) | Alta | ✅ Corregido (Fase 3) |
| 05-oct | cohorts.json con datos mock | Crítica | ✅ Corregido (Fase 1) |

## Notas

- Ejecución manual de la sección 1, 3 y 4 pendiente de sesión en navegador.
- Los valores numéricos (sección 2) se verificaron directamente contra el JSON generado.

## 6. Auditoría WCAG 2.1 AA — Plan V6 (06-oct-2026)

Correcciones aplicadas:

| Ítem | Cambio |
|---|---|
| Foco visible | `:focus-visible` explícito en `.btn-link`, `.theme-toggle`, `.btn-insight`, `.btn-social`, `.btn-retry`, `.btn-generate-story`, `.btn-close` |
| Metodología | Al abrir, foco a `#metodologia-title`; `Esc` cierra; al cerrar, foco vuelve al botón "Metodología"; `✕` con `aria-hidden="true"`; `div[role=article]` → `<article>` |
| Contraste muted | `--color-text-muted`: oscuro `#94A3B8`→`#A8B8C8` (≥5:1 sobre bg/sección/alt); claro `#64748B`→`#4B5A72` (≥5:1) |
| Badges KPI | Variables de tema: oscuro `#34D399`/`#FCA5A5` (≥4.6:1); claro `#047857`/`#B91C1C` (≥4.8:1) |
| Reflujo | `.kpi-grid` → `minmax(min(100%, 280px), 1fr)`: sin scroll horizontal a 320 px |
| Emojis | Eliminados de Metodología (🔗📚🚫🔐💻♿) |
| `alert()` | Reemplazado por mensaje en región `role="status"` `aria-live="polite"` |

Verificaciones:

- `npm test`: 12/12 en verde.
- `npm run build`: sin warnings; `dist/` ≈ 165 KB total (< 1 MB).
- Lighthouse accesibilidad > 95 en ambos temas: **pendiente de medición** con Chrome (DevTools → Lighthouse); no ejecutable desde Node en este entorno. Registrar aquí cuando se mida.

## 7. Bug crítico — página congelada al elegir el estado (10-oct-2026)

**Síntoma:** al seleccionar año + estado, la interfaz dejaba de responder (navegador al 100 % de CPU, sin excepción en consola). Reproducido en `vite dev` y en el build de producción (`dist/`).

**Diagnóstico (Edge headless + CDP, con depurador):**

1. No era el backend: `public/data/cohorts.json` tiene 759 cohortes (33 entidades × 23 cohortes) sin combinaciones faltantes; `npm test` en verde.
2. Al pausar el hilo durante el congelamiento, la pila mostró `pintarCard` → `$$invalidate`, y el punto de interrupción del bloque reactivo de `Tarjeta.svelte` se alcanzaba de forma repetida: `1288 → 1013 → 1288 → 1013 → …` (bucle infinito de `flush()` de Svelte).
3. Causa raíz: `pintarCard()` hacía `canvas.width = 1080; canvas.height = 1350;`. Como `canvas` es estado del componente (`bind:this`), Svelte compila esas escrituras como `$$invalidate(1, …)`, que marca `canvas` como sucio (medido: `dirty = -1` → `dirty = 2`). Como el bloque reactivo `$: if (cohortData && latestElection && canvas) generateCard();` dependía de `canvas`, se volvía a disparar `generateCard()` indefinidamente.

**Corrección:**

| Ítem | Cambio |
|---|---|
| `Tarjeta.svelte` | `pintarCard()` usa un alias local (`const lienzo = canvas`) para dimensionar el bitmap: Svelte ya no genera `$$invalidate` |
| `Tarjeta.svelte` | `<canvas>` con atributos `width="1080" height="1350"` (evita el canvas en blanco antes del primer pintado) |
| `Tarjeta.svelte` | Bloque reactivo sustituido por clave de datos: `claveTarjeta !== ultimaClaveGenerada` → la regeneración depende de los datos, no de la referencia del DOM |
| `Tarjeta.svelte` | `onMount` redundante eliminado (lo cubre el bloque reactivo al enlazarse `canvas`) |
| `tests/regresion_bind_this.test.mjs` | Nueva prueba: falla si algún componente asigna propiedades a un elemento `bind:this`; verifica además la clave de datos de `Tarjeta` |
| `package.json` | `npm test` ahora corre `node --test "tests/**/*.test.mjs"` |

**Verificación (Edge headless vía CDP, dev `:5173` y `dist/`):**

| Escenario | Resultado |
|---|---|
| 1990 + Aguascalientes | ✅ página responde, KPI 52.6 %, lienzo 1080×1350, descarga habilitada |
| Cambio de estado → CDMX | ✅ se actualiza sin congelarse (61 %) |
| 2006 + Zacatecas | ✅ se actualiza sin congelarse (57 %) |
| Orden inverso: estado (Jalisco) → año 1995 | ✅ se actualiza sin congelarse (47 %) |
| Repintado continuo | ❌→✅ el lienzo queda idéntico tras 1.2 s (antes se redibujaba en bucle) |
| Excepciones JS | Ninguna |
| `npm test` | 14/14 en verde |
| `npm run build` | Sin errores |
