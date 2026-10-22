# Plan de Mejora: Tarjeta Compartible — Mi Generación en las Urnas

**Fecha:** 09-oct-2026
**Componente objetivo:** `src/components/Tarjeta.svelte` + funciones de compartir en `src/App.svelte`
**Objetivo general:** Hacer que la generación, preview y compartición de la tarjeta PNG 1080×1350 sea instantáneamente comprensible para cualquier usuario, sin requerir instrucciones previas.

---

## Diagnóstico (resumen)

| Hallazgo | Archivo | Impacto |
|----------|---------|---------|
| Confusión en la generación: el usuario no sabe si la tarjeta ya se generó | `Tarjeta.svelte` | Alto |
| Feedback visual insuficiente durante `isGenerating` (spinner pequeño, sin progreso) | `Tarjeta.svelte` | Alto |
| Texto del botón impreciso: "Crear imagen para Stories" | `Tarjeta.svelte` | Alto |
| Sin preview antes de descargar: descarga automática sin confirmación | `Tarjeta.svelte` | Medio |
| Flujo de compartir a redes desconectado: no hay preview del texto a publicar | `App.svelte` | Alto |
| Sin feedback cuando se usa WhatsApp (`window.open` o clipboard) | `App.svelte` | Medio |
| Formato 1080×1350 mencionado solo después de generar | `Tarjeta.svelte` | Bajo |

---

## Fortalezas actuales (a preservar)

- ✅ Generación 100% local en el navegador (privacidad)
- ✅ Múltiples opciones de compartir: X, Facebook, WhatsApp, native share
- ✅ Formato correcto para Instagram Stories (1080×1350)
- ✅ Nombre de archivo significativo: `mi-generacion-{rango}-{entidad}.png`
- ✅ ARIA labels presentes en canvas y botón

---

## Plan por prioridades

### 🔴 Prioridad Alta — Feedback visual durante generación

| # | Tarea | Archivo | Notas |
|---|-------|---------|-------|
| 1.1 | Añadir progreso por etapas durante `generateCard()` | `Tarjeta.svelte` | "Preparando…" → "Generando diseño…" → "Listo" |
| 1.2 | Mostrar estado textual más claro (reemplazar "Generando..." genérico) | `Tarjeta.svelte` | Indicador de etapa actual |
| 1.3 | Desactivar canvas y botón durante generación | `Tarjeta.svelte` | Prevenir clicks múltiples |
| 1.4 | Añadir `aria-live="polite"` al región de estado | `Tarjeta.svelte` | Anunciar cambios a lectores de pantalla |

### 🔴 Prioridad Alta — Textos y etiquetas precisas

| # | Tarea | Archivo | Notas |
|---|-------|---------|-------|
| 2.1 | Cambiar "Crear imagen para Stories" → "Generar y descargar tarjeta PNG 1080×1350" | `App.svelte` | Botón de la sidebar |
| 2.2 | Mostrar `download-info` (formato, privacidad) solo tras completar generación | `Tarjeta.svelte` | Reveal progresivo |
| 2.3 | Añadir texto de privacidad visible antes de generar | `Tarjeta.svelte` | "Se genera en tu navegador. No se envía a ningún servidor." |

### 🟡 Prioridad Media — Preview antes de descargar

| # | Tarea | Archivo | Notas |
|---|-------|---------|-------|
| 3.1 | Mostrar canvas con estado "generando" (skeleton/placeholder) | `Tarjeta.svelte` | Evita pantalla en blanco |
| 3.2 | Botón cambia de estado al completar: "Descargar Tarjeta" | `Tarjeta.svelte` | Ya existe, solo asegurar transiciones |
| 3.3 | Añadir confirmación visual post-descarga | `Tarjeta.svelte` | "Tarjeta descargada" temporal |

### 🟡 Prioridad Media — Compartir en redes sociales

| # | Tarea | Archivo | Notas |
|---|-------|---------|-------|
| 4.1 | Mostrar preview del texto a compartir antes de abrir `window.open` | `App.svelte` | Ej: modal o tooltip con el texto exacto |
| 4.2 | Confirmar siempre el resultado de WhatsApp | `App.svelte` | "Texto copiado al portapapeles" vs "Abriendo WhatsApp" |
| 4.3 | Unificar feedback visual para los 4 botones sociales | `App.svelte` | Mismo patrón de confirmación |
| 4.4 | Añadir estado `shareStatus` visible (no solo `sr-only`) | `App.svelte` | El usuario ve la confirmación |

### 🟢 Prioridad Baja — Accesibilidad y detalles

| # | Tarea | Archivo | Notas |
|---|-------|---------|-------|
| 5.1 | `role="region"` + label en el wrapper del canvas | `Tarjeta.svelte` | "Vista previa de tarjeta 1080×1350" |
| 5.2 | `title` descriptivo en botón de descarga | `Tarjeta.svelte` | Incluir "generada localmente" |
| 5.3 | Respetar `prefers-reduced-motion` en animaciones | `Tarjeta.svelte` | Ya parcialmente implementado |
| 5.4 | Opción "Generar sin animaciones" | `Tarjeta.svelte` | ⚠️ **DESCARTADA** — redundante con 5.3 (ver nota) |

> **Nota (13-oct-2026) — tarea 5.4 descartada por redundante.**
> Su finalidad declarada ("para usuarios con sensibilidad") es exactamente la que cubre la tarea 5.3 vía la media query `prefers-reduced-motion`, el mecanismo estándar (WCAG 2.3.3). Además, la implementación resultó engañosa: el checkbox `"Generar sin animaciones"` (`Tarjeta.svelte:31-35, 320-328, 507-519`) **no desactiva** el spinner (`animation: spin`, `:482`), el `pulse` (`:626`) ni las transiciones (`:470, :554`); solo elimina ~2 frames (~16–50 ms) de espera entre las etapas de progreso, un ahorro imperceptible. Duplica 5.3, regenera la tarjeta al marcar/desmarcar (`on:change={() => generateCard()}`) y añade carga cognitiva.
> **Acción:** eliminar el checkbox y su estado (`sinAnimaciones`), simplificar `respiroUsar` a `prefersReducedMotion() ? noop : respiro` y borrar el CSS `.motion-toggle`. Detalle en `actualizaciones/implementados/correcciones131026.md`.

---

## Directrices de diseño visual

1. **Colores**: Mantener gradiente INE (`#D8005F` → `#1A2238`); reducir opacidad durante generación para desviar atención al progreso.
2. **Tipografía**: El texto de estado debe tener peso equivalente al contenido final (continuidad visual).
3. **Espaciado**: Aumentar padding durante `isGenerating` para que el spinner no se sienta apretado.
4. **Responsive**: En < 640px, canvas más grande y botón de descarga al 100% del ancho.

---

## Checklist de validación

- [ ] El botón dice "Generar y descargar tarjeta PNG 1080×1350"
- [ ] Durante la generación se ve progreso (etapa + spinner)
- [ ] El canvas no queda en blanco (muestra skeleton o estado)
- [ ] Tras completar, el canvas muestra la tarjeta final
- [ ] El archivo se descarga como `mi-generacion-{rango}-{entidad}.png`
- [ ] El texto de compartir se previewa antes de abrir la red social
- [ ] WhatsApp siempre confirma la acción
- [ ] `prefers-reduced-motion` desactiva animaciones sin romper funcionalidad
- [ ] ARIA labels significativos y no redundantes
- [ ] `npm test` pasa (12 tests)
- [ ] `npm run build` sin warnings nuevos

---

## Métricas de éxito esperadas

| Métrica | Antes | Después |
|---------|-------|---------|
| Tiempo para entender la acción | 20-30 s | < 5 s |
| Éxitos en primera descarga | ~60% | ~95% |
| Dudas sobre "dónde se guardó el archivo" | Frecuentes | Raras |
| Compartición funcional en redes | ~70% | ~90% |

---

## Orden de implementación

**Sprint 1 (≈4 h) — Feedback + Textos**
- [ ] 1.1–1.4 (feedback de generación)
- [ ] 2.1–2.3 (textos precisos y privacidad)
- [ ] 5.1–5.2 (accesibilidad básica)

**Sprint 2 (≈4 h) — Preview + Compartir**
- [ ] 3.1–3.3 (preview y confirmación)
- [ ] 4.1–4.4 (flujo de compartir)

**Sprint 3 (≈2 h) — Toques finales**
- [ ] 5.3 (reduced motion) — 5.4 descartada (redundante con 5.3)
- [ ] Validación completa (`npm test`, `npm run build`, prueba manual)

**Total estimado:** 10 horas de trabajo

---

## Comandos de referencia

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm test         # Tests unitarios
npm run preview  # Ver build local
```