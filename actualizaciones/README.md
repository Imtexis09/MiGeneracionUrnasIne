# Índice de actualizaciones

**Actualizado:** 20-oct-2026

Registro de los planes de actualización y corrección del proyecto, organizados por
**estado de implementación**. Cada documento conserva su nombre original.

```
actualizaciones/
├── README.md              ← este índice
├── implementados/         ← planes ya aplicados en el código
│   ├── Storytelling.md    ← Web Story de 5 slides (dashboard vertical → slides)
│   └── estilosnuevos.md  ← Sistema de tokens CSS + slides por componente
└── pendientes/
    └── PENDIENTES.md      ← verificaciones manuales que faltan
```

> Nota: los documentos de referencia (`Frontend/`, `Historial/`, `PRD/`) viven en la
> raíz del repositorio, no dentro de `actualizaciones/`.

---

## Implementados

Todas las tareas de código están aplicadas en `src/`. Verificación base: `npm test` 14/14
y `npm run build` sin errores. Las verificaciones manuales pendientes se listan en
[`pendientes/PENDIENTES.md`](pendientes/PENDIENTES.md).

| Documento | Fecha | Resumen | Estado |
|---|---|---|---|
| [`V1.md`](implementados/V1.md) | 05-oct-2026 | Integración de datos reales INE, KPIs calculados, limpieza, build y QA | ✅ Código; QA manual pendiente |
| [`V2.md`](implementados/V2.md) | 05-oct-2026 | Corrección del bug crítico `presidencialis` + tests con `node --test` | ✅ |
| [`V3.md`](implementados/V3.md) | 05-oct-2026 | Logo INE, tema claro/oscuro, eliminación de emojis, link de validación | ✅ |
| [`V4.md`](implementados/V4.md) | 05-oct-2026 | Top-bar sticky, iconos sociales, tarjeta INE + logo, animaciones WCAG | ✅ |
| [`V4.5.md`](implementados/V4.5.md) | 05-oct-2026 | Ajustes de layout, logo proporcional, footer pegado, contraste | ✅ (superado por V4.7) |
| [`V4.6.md`](implementados/V4.6.md) | 05-oct-2026 | Grilla de secciones, iconos sociales, barra de progreso | ✅ (revertido por V4.7) |
| [`V4.7.md`](implementados/V4.7.md) | 05-oct-2026 | Reversión a apilado, iconos visibles, progreso solo al scroll, footer | ✅ (versión vigente) |
| [`V5.md`](implementados/V5.md) | 06-oct-2026 | Accesibilidad WCAG 2.1 AA: foco, contraste, 44 px, reflujo | ✅ Código; verificación manual pendiente |
| [`V6.md`](implementados/V6.md) | 06-oct-2026 | WCAG 2.1 AA: focus trap, contraste, semántica, estados | ✅ Código; Lighthouse pendiente |
| [`Intuitividad.md`](implementados/Intuitividad.md) | 09-oct-2026 | Onboarding, progressive disclosure KPIs, tooltips, Silla Vacía, tarjeta | ✅ |
| [`Tarjeta.md`](implementados/Tarjeta.md) | 09-oct-2026 | Tarjeta compartible: feedback de generación, preview y flujo de compartir | ✅ (tarea 5.4 descartada) |
| [`correcciones131026.md`](implementados/correcciones131026.md) | 13-oct-2026 | Correcciones generales: fallback mock, ARIA, contraste, purga de código | ✅ |
| [`ayuda13102026.md`](implementados/ayuda13102026.md) | 13-oct-2026 | Tooltips "?" en táctil: bottom sheet, hit-area 44 px, `:focus-within` | ✅ |
| [`grafica131026.md`](implementados/grafica131026.md) | 13-oct-2026 | Gráfica "Línea de Vida": eje X real, Y adaptativa, scroll móvil, popup | ✅ |
| [`Storytelling.md`](implementados/Storytelling.md) | 20-oct-2026 | Web Story de 5 slides: store de navegación, transiciones, foco por slide, carga diferida de D3 | ✅ |
| [`estilosnuevos.md`](implementados/estilosnuevos.md) | 20-oct-2026 | Sistema de estilos: tokens CSS nuevos, slides como componentes, acción `focusTitle`, refinado visual (tipografías, asimetría, contraste) | ✅ |

---

## Pendientes

| Documento | Fecha | Resumen |
|---|---|---|
| [`PENDIENTES.md`](pendientes/PENDIENTES.md) | 20-oct-2026 | Verificaciones manuales: Lighthouse, QA de escritorio y pruebas cross-browser |

---

## Convención

- **`implementados/`**: el código del plan ya está aplicado en `src/`.
- **`pendientes/`**: plan con trabajo de código real por hacer (nuevos planes).
  Las **verificaciones manuales** de planes ya implementados se consolidan en
  `pendientes/PENDIENTES.md`, no como plan aparte.

Al crear un plan nuevo, guárdalo en `pendientes/`; al completarlo, muévelo a
`implementados/` y actualiza este índice.
