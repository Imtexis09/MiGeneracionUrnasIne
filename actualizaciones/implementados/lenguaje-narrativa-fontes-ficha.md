# Implementado: Lenguaje Claro, narrativa dinámica, fuentes locales y ficha educativa

**Fecha:** 21-oct-2026  
**Origen:** plan "Ajustes Finales de Lenguaje y Lógica" (secciones 1-4)  
**Estado:** aplicado y verificado (`npm test` 19/19, `npm run build` sin advertencias)

---

## Qué cambió

### 1. Lenguaje Claro Ciudadano (sección 1 del plan)

Todos los textos visibles de los 5 slides y componentes usan el glosario ciudadano:

| Antes (jerga) | Después (ciudadano) |
|---|---|
| Mi Generación en las Urnas (título del slide 1) | ¿Qué tan activa es tu edad en las urnas? |
| Descubre cuántas personas de tu edad votan… | Selecciona tu año de nacimiento y tu estado para descubrirlo en menos de un minuto. |
| Descubrir mi historia | Ver la historia de mi generación |
| De cada 100… dejaron su voto en la urna | De cada 100 personas de tu edad en [Estado], [X] fueron a votar en [año]. |
| No votaron (chip) | Personas que no fueron a votar |
| Así se ve tu generación en las urnas… no votean | Así se ven las personas que no votaron / Cada cuadro representa a una persona… |
| El futuro de tu estado se decide con o sin ti | El futuro de tu estado también depende de ti |
| Generado localmente, sin envío a servidores | Tus datos están seguros y no salen de tu celular |
| Descargar mi historia para compartir | Descargar imagen para compartir |
| Comparte en Instagram, Facebook o Twitter | Comparte en Instagram, Facebook o X |
| entidad federativa / Lista Nominal / Participación Electoral | estado / Personas registradas para votar / Cuántas personas van a votar |

Corrección de contenido: el tour decía "grupos de 5 años" → **3 años** (lo que usa realmente el INE).

### 2. Motor narrativo dinámico (sección 2 del plan)

Nuevo `src/utils/narrativeEngine.js` con `getNarrative(birthYear)` y 4 casos por edad:
- ≤20 años: primera elección, `comparable: false`.
- 21-29: la participación cae en los 20s.
- 30-64: la participación se estabiliza.
- **65+ (nuevo):** participación alta y constante.

Se consume en `App.svelte` (`copyInsight` reemplaza el texto fijo del slide 2). El slide 4 usa la variante "primera elección" (sin gráfica ni comparación) para los nacidos en 2004-2006.

Nuevo `tests/narrativeEngine.test.mjs` (5 pruebas).

### 3. Fuentes locales y iOS/Safari (sección 3 del plan)

- `public/fonts/`: Bricolage Grotesque variable + IBM Plex Sans normal e itálica (subconjunto latin, ~146 KB).
- `global.css`: `@font-face` propios; eliminado el `@import` de Google Fonts.
- `index.html`: eliminados los `preconnect` a Google; agregados `<link rel="preload">` de las fuentes locales.
- `Selector.svelte` y `LineaDeVida.svelte`: se quitó la referencia a `'Outfit'` (tipografía inexistente), ahora usan `var(--font-base)` / `var(--font-heading)`.
- `Tarjeta.svelte`: lienzo retina ×2 (2160×2700), retardo de 100 ms antes de pintar, enlace `<a download>` insertado en el DOM, `revokeObjectURL` diferido y fallback que abre la imagen en una pestaña nueva si `toBlob` falla en Safari.

### 4. Ficha Educativa para docentes (sección 4 del plan)

Nuevo `src/components/FichaEducativa.svelte`: modal accesible (`role="dialog"`, trampa de foco, `Escape` cierra, foco devuelto, scroll de fondo bloqueado) con:
- Datos clave (año de nacimiento, estado, participación, diferencia vs país).
- Tabla imprimible por elección (año, tipo, edad, %, personas registradas, sí/no votaron).
- 4 preguntas para el debate grupal.
- Botón "Imprimir o guardar la ficha en PDF" (`window.print()`) con reglas `@media print` que imprimen solo la ficha.

Botón "Material para profesores y talleres" agregado en la barra superior y en el slide 5.

---

## Archivos tocados

`src/App.svelte`, `src/index.html`, `src/styles/global.css`,
`src/components/FichaEducativa.svelte` (nuevo),
`src/components/slides/Slide1Onboarding.svelte`,
`src/components/slides/Slide2Realidad.svelte`,
`src/components/slides/Slide3SillaVacia.svelte`,
`src/components/slides/Slide4Contexto.svelte`,
`src/components/slides/Slide5Compartir.svelte`,
`src/components/SillaVacia.svelte`,
`src/components/LineaDeVida.svelte`,
`src/components/Comparacion.svelte`,
`src/components/WelcomeTour.svelte`,
`src/components/Selector.svelte`,
`src/components/Metodologia.svelte`,
`src/components/Tarjeta.svelte`,
`src/utils/narrativeEngine.js` (nuevo),
`tests/narrativeEngine.test.mjs` (nuevo),
`public/fonts/*` (nuevo: 5 archivos .woff2).

---

## Queda pendiente (verificación manual, no ejecutable desde Node)

- Descarga de la PNG en Safari/iOS (ver `actualizaciones/pendientes/PENDIENTES.md`, punto 4).
- Prueba de la ficha impresa a PDF y del motor narrativo en los años límite del selector.
