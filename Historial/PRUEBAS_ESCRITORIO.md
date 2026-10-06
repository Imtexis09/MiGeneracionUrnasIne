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
