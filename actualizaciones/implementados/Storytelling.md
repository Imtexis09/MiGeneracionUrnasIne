# Documento de Arquitectura y Refactorización (PRD)
**Proyecto:** Mi Generación en las Urnas — Hackathon INE Reto 3
**Objetivo del Agente:** Refactorizar la interfaz de usuario actual (Dashboard de scroll vertical) hacia una experiencia interactiva paginada (Web Story / Slides) para mejorar el storytelling de los datos, la retención de usuarios y el cumplimiento del objetivo comunicacional del INE.

## 1. Directivas de Experiencia de Usuario (El Viaje del Votante)

El agente debe implementar un sistema de vistas secuenciales (Slides) donde el usuario avance mediante interacciones (clics en botones). 

### Vistas Requeridas (Slides)

*   **Slide 1: Onboarding (Captura de Datos)**
    *   Componentes: Selectores de `Año de nacimiento` y `Estado`.
    *   Acción: Botón "Descubrir mi historia" que valida los inputs y avanza al Slide 2.
*   **Slide 2: El Choque de Realidad (Métrica Principal)**
    *   Componentes: Texto de gran tamaño centrado.
    *   Copy Principal: "De 100 personas de tu edad en [Estado], solo [X] votaron en 2024."
    *   Copy Secundario: "Nuestra generación vota con fuerza a los 18, pero estamos desapareciendo de las urnas en nuestros 20s."
    *   Acción: Botón "Ver cómo se ve esto" -> (Avanza a Slide 3).
*   **Slide 3: Impacto Visual (Waffle Chart)**
    *   Componentes: Renderizado del componente `SillaVacia.svelte`.
    *   Copy Principal: "Así se ve la mitad de tu generación faltando a la urna."
    *   Animación requerida: Retraso sutil en la aparición de los cuadros grises (no votantes).
    *   Acción: Botón "Comparar con el país" -> (Avanza a Slide 4).
*   **Slide 4: El Contexto (Evolución Histórica)**
    *   Componentes: Renderizado del componente `LineaDeVida.svelte`.
    *   Copy Principal: "No siempre fuimos así. Caímos [X] puntos desde 2018 y hoy estamos por debajo del promedio nacional."
    *   Requisito D3.js: Animar el trazado de la línea desde 2018 hasta 2024 al montar el componente.
    *   Acción: Botón "¿Qué podemos hacer?" -> (Avanza a Slide 5).
*   **Slide 5: Call to Action y Difusión**
    *   Componentes: Renderizado de la `Tarjeta Compartible` (gradiente, datos resumidos).
    *   Copy Principal: "El futuro de tu estado se decide con o sin ti. Haz que tu generación cuente."
    *   Acción Principal: Botón "Descargar mi historia para compartir" (Ejecuta la generación del PNG local).
    *   Nota Legal: Mantener el texto "Generado localmente, sin envío a servidores" en tamaño reducido pero legible (contraste WCAG AA).

## 2. Directivas Técnicas (Svelte 4)

*   **Gestión de Estado Centralizada:** Crear un archivo `src/stores/navigation.js` que exporte un store writable (ej. `currentSlide = writable(1)`).
*   **Enrutamiento Interno (App.svelte):** Reemplazar el layout de flujo normal por condicionales `{#if $currentSlide === X}`.
*   **Transiciones Svelte:** Importar y aplicar `fade` y `slide` de `svelte/transition` en los bloques `{#if}` para asegurar transiciones suaves entre vistas sin recargas.
*   **Carga Diferida de Gráficos (Lazy Rendering):** Los módulos D3.js no deben ejecutarse en el montaje inicial de la app, sino únicamente cuando su respectivo Slide cambie a estado activo.

## 3. Directivas de Accesibilidad (A11y)

*   **Focus Management:** Al transicionar a un nuevo Slide, el agente debe programar el envío del foco del teclado (mediante `bind:this` o `action` de Svelte) al primer elemento de texto (`<h1>` o `<h2>`) para garantizar soporte con lectores de pantalla.
*   **Lenguaje Limpio:** Purgar términos burocráticos de la UI (ej. remover "PNG 1080x1350px", "Lista Nominal"). Mover detalles metodológicos a un modal u hoja separada referenciada por un enlace "Cómo se calculó".
---

## 4. Nota de implementación (20-oct-2026)

**Estado:** aplicado en `src/`. `npm test` 14/14 y `npm run build` sin errores.

### Archivos

| Archivo | Cambio |
|---|---|
| `src/stores/navigation.js` | **Nuevo.** Store `currentSlide` (writable) + `goToSlide`, `nextSlide`, `prevSlide`, `resetSlides`, `TOTAL_SLIDES`. |
| `src/App.svelte` | Dashboard vertical -> Web Story de 5 slides (`{#if $currentSlide === N}`), transiciones `fade`, foco programático al encabezado de cada slide, barra de progreso de slide en el header, barra de scroll de lectura eliminada. |
| `src/components/SillaVacia.svelte` | Los asientos grises (quienes no votan) ahora también entran con animación, con retardo escalonado posterior al de los que sí votan. |
| `src/components/Tarjeta.svelte` | Botón "Descargar mi historia para compartir" (sin "PNG 1080x1350" en la UI). |
| `src/components/LineaDeVida.svelte` | "Lista nominal" -> "Personas registradas". |
| `src/components/Metodologia.svelte` | El detalle técnico del formato de la imagen (PNG 1080x1350) se documenta aquí, en "Cómo se calculó". |
| `src/utils/formato.js` | El disclaimer metodológico usa lenguaje llano ("la lista de personas registradas para votar"). |

### Mapa de slides

| # | Slide | Componentes | Acción |
|---|---|---|---|
| 1 | Onboarding | `Selector` | "Descubrir mi historia" (valida y avanza) |
| 2 | Choque de realidad | KPIs (chips) | "Ver cómo se ve esto" |
| 3 | Impacto visual | `SillaVacia` | "Comparar con el país" |
| 4 | Contexto histórico | `LineaDeVida` (+ `Comparacion` plegable) | "¿Qué podemos hacer?" |
| 5 | CTA y difusión | `Tarjeta` + compartir | "Descargar mi historia para compartir" |

### Decisiones y ajustes sobre el PRD

- **Copy dinámico:** los textos del PRD se adaptan a los datos reales para no afirmar
  cosas falsas: "solo X votaron" solo se usa cuando X < 50; si no, se usa
  "X dejaron su voto en la urna". En el slide 4 el verbo cambia entre "Caímos" y
  "Subimos", y la comparación con el nacional entre "por debajo / por encima /
  prácticamente igual". El copy "la mitad de tu generación" del slide 3 se
  reserva para abstainciones >= 40 %.
- **Carga diferida:** los componentes con D3 (`SillaVacia`, `LineaDeVida`, `Tarjeta`)
  solo se montan cuando su slide está activo, por lo que D3 no se ejecuta en el
  montaje inicial.
- **Funcionalidad conservada:** la comparación generacional (`Comparacion`) no se
  perdió: quedó como detalle desplegable en el slide 4. Los botones sociales, el
  copiado de texto, la guía (`WelcomeTour`) y el modal de metodología se mantienen
  como modales globales.
- **A11y:** foco al encabezado del slide (`tabindex="-1"` + `data-titulo-slide`),
  botones nativos de avance y retroceso, `prefers-reduced-motion` respetado en
  transiciones y animaciones.

### Verificación

- `npm test` -> 14/14. `npm run build` -> OK.
- Recorrido automatizado en Chrome headless (27 comprobaciones): montaje de los 5
  slides, foco en cada encabezado, render de la gráfica D3, grid de 100 asientos
  con retardo en los grises, PNG de la tarjeta generado, botones sociales y
  ausencia de errores en consola.
- Revisión visual en 1280 px y 390 px, en tema oscuro y claro.
