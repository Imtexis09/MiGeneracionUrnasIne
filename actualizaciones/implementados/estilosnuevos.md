# Plan Maestro de Refactorización y Estilos (PRD Unificado)

**Proyecto:** Mi Generación en las Urnas — Hackathon INE Reto 3

**Objetivo para el Agente:** Ejecutar en una sola fase la transformación de la aplicación, migrando de un dashboard de scroll vertical a una experiencia interactiva de storytelling paginado (Web Story / Slides) con un sistema de diseño optimizado bajo el estándar de accesibilidad WCAG 2.1 Nivel AA.

---

## 1. Arquitectura de Estado y Navegación Paginada

### 1.1 Store de Navegación (`src/stores/navigation.js`)

Crear la gestión centralizada de estado para controlar el slide activo y el flujo de navegación:

```javascript
import { writable } from 'svelte/store';

export const currentSlide = writable(1);
export const totalSlides = 5;

export const nextSlide = () => currentSlide.update(n => Math.min(n + 1, totalSlides));
export const prevSlide = () => currentSlide.update(n => Math.max(n - 1, 1));
export const goToSlide = (slideNumber) => currentSlide.set(slideNumber);

```

### 1.2 Orquestación de Vistas (`src/App.svelte`)

Reemplazar la estructura vertical por bloques condicionales animados con transiciones nativas de Svelte (`fade` y `slide`). Asegurar que los componentes pesados de D3.js solo se monten al entrar a su respectivo slide:

```html
<script>
  import { fade, slide } from 'svelte/transition';
  import { currentSlide } from './stores/navigation.js';
  import Slide1Onboarding from './components/slides/Slide1Onboarding.svelte';
  import Slide2Realidad from './components/slides/Slide2Realidad.svelte';
  import Slide3SillaVacia from './components/slides/Slide3SillaVacia.svelte';
  import Slide4Contexto from './components/slides/Slide4Contexto.svelte';
  import Slide5Compartir from './components/slides/Slide5Compartir.svelte';
</script>

<main class="story-container">
  {#if $currentSlide === 1}
    <div in:fade={{ duration: 250 }} out:slide={{ duration: 200 }}><Slide1Onboarding /></div>
  {:else if $currentSlide === 2}
    <div in:fade={{ duration: 250 }} out:slide={{ duration: 200 }}><Slide2Realidad /></div>
  {:else if $currentSlide === 3}
    <div in:fade={{ duration: 250 }} out:slide={{ duration: 200 }}><Slide3SillaVacia /></div>
  {:else if $currentSlide === 4}
    <div in:fade={{ duration: 250 }} out:slide={{ duration: 200 }}><Slide4Contexto /></div>
  {:else if $currentSlide === 5}
    <div in:fade={{ duration: 250 }} out:slide={{ duration: 200 }}><Slide5Compartir /></div>
  {/if}
</main>

```

---

## 2. Reestructuración Narrativa de los 5 Slides

### Slide 1: Onboarding y Captura de Datos

* **Objetivo:** Recopilación rápida sin fricción.
* **Componentes:** Selectores de `Año de nacimiento` y `Estado`.
* **Copy de Botón:** "Descubrir mi historia" (avanza a Slide 2).

### Slide 2: El Choque de Realidad

* **Objetivo:** Presentar el dato principal de forma humanizada.
* **Copy Principal (XXxl):** *"De cada 100 personas de tu edad en [Estado], solo [X] votaron en 2024."*
* **Copy Secundario (Tesis central):** *"Nuestra generación vota con fuerza a los 18 años, pero muchos dejan de hacerlo durante sus 20s."*
* **Botonera:** Botón principal "Ver cómo se ve esto" (avanza a Slide 3).

### Slide 3: El Impacto Visual (La Silla Vacía)

* **Objetivo:** Mostrar el abstencionismo de forma tangible.
* **Componentes:** Componente `SillaVacia.svelte` (cuadrícula de 100 asientos).
* **Copy Principal:** *"Así se ve la mitad de tu generación faltando a las urnas."*
* **Animación:** Los 100 asientos deben renderizarse con un retardo escalonado (*stagger delay*) en los cuadros grises para acentuar visualmente los votos faltantes.
* **Botonera:** Botón "Comparar con el país" (avanza a Slide 4).

### Slide 4: El Contexto Histórico

* **Objetivo:** Mostrar la tendencia temporal con la gráfica de líneas animada.
* **Componentes:** Componente `LineaDeVida.svelte` optimizado.
* **Copy Principal:** *"No siempre fuimos así. En 2018 participábamos más, pero hoy estamos [X] puntos por debajo del promedio nacional."*
* **Animación D3:** El trazado de la línea debe dibujarse secuencialmente desde el punto de 2018 hasta 2024 al hacer la transición al slide.
* **Botonera:** Botón "¿Qué podemos hacer?" (avanza a Slide 5).

### Slide 5: Acción Ciudadana y Difusión

* **Objetivo:** Generación del insumo para redes sociales y cierre motivacional.
* **Componentes:** Preview de `Tarjeta.svelte` y botones de descarga/compartir.
* **Copy Principal:** *"El futuro de tu estado se decide con o sin ti. Haz que tu generación cuente."*
* **Copy de Botón Principal:** *"Descargar mi historia para compartir"* (Reemplaza "Generar tarjeta PNG 1080x1350").
* **Depuración de lenguaje:** Eliminar palabras técnicas ("PNG", "Lista Nominal", "Cohorte"). Mover explicaciones de cálculo al modal secundario "Cómo se calculó".

---

## 3. Sistema de Estilos y Tokens CSS (`src/styles/global.css`)

Remplazar las variables globales para garantizar el cumplimiento estricto de WCAG 2.1 AA (contraste mínimo `4.5:1` para texto regular y `3:1` para interfaz):

```css
:root {
  /* Fondos */
  --bg-main: #0B0F19;
  --bg-card: #161F33;
  --bg-card-hover: #1E2942;

  /* Tipografía y Contraste (WCAG AA) */
  --text-primary: #F9FAFB;     /* Ratio 15:1+ */
  --text-secondary: #CBD5E1;   /* Ratio 7:1+ */
  --text-muted: #94A3B8;       /* Para notas al pie y leyendas (mínimo 14px) */

  /* Colores Acento */
  --accent-pink: #E01E5A;      /* Rosa INE refinado */
  --accent-purple: #7C3AED;    /* Violeta para degradados */
  --accent-cyan: #0284C7;
  --status-voted: #10B981;     /* Verde esmeralda */
  --status-absent: #475569;    /* Gris pizarra */

  /* Fuentes */
  --font-base: 'Inter', -apple-system, sans-serif;
  --font-heading: 'Outfit', sans-serif;

  /* Focus & Borders */
  --border-subtle: rgba(255, 255, 255, 0.12);
  --border-focus: #38BDF8;
  --radius-lg: 16px;
  --radius-md: 12px;
}

/* Base de Lectura y Escalado */
body {
  background-color: var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-base);
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

h1, h2, h3 {
  font-family: var(--font-heading);
  color: var(--text-primary);
}

h1 { font-size: clamp(2rem, 5vw, 2.75rem); font-weight: 700; }
h2 { font-size: clamp(1.35rem, 3vw, 1.875rem); font-weight: 600; }

p {
  color: var(--text-secondary);
  font-size: clamp(1rem, 2vw, 1.125rem);
}

/* Indicadores de Foco para Teclado (A11y) */
button:focus-visible,
select:focus-visible,
a:focus-visible {
  outline: 3px solid var(--border-focus);
  outline-offset: 3px;
}

/* Botón Primary Unificado */
.btn-primary {
  background: linear-gradient(135deg, var(--accent-pink) 0%, var(--accent-purple) 100%);
  color: #FFFFFF;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.125rem;
  padding: 0.875rem 2rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(224, 30, 90, 0.35);
}

```

---

## 4. Ajustes Responsivos y Accesibilidad Visual

1. **Waffle Chart Adaptativo (`SillaVacia.svelte`):**
* Asegurar que la cuadrícula de 100 elementos mantenga una matriz de `10x10` en móviles (`width: 100%`, `max-width: 360px`, `gap: 4px` o `6px`).
* Agregar `aria-label` descriptivo al contenedor: `"Gráfica de 100 asientos: X votaron, Y no votaron"`.


2. **Tarjeta Compartible (`Tarjeta.svelte`):**
* Aumentar el tamaño del texto legal e inferior a un mínimo de `14px` para prevenir pérdida de legibilidad tras la compresión de PNG en redes sociales.


3. **Navegación por Teclado:**
* Al cambiar de slide, mover el foco del cursor automáticamente al título principal (`<h1>` o `<h2>`) del slide usando una directiva de Svelte (`use:focusTitle`) para notificar a lectores de pantalla.



---

## 5. Criterios de Aceptación para la Verificación

* [ ] La aplicación no utiliza *scroll* vertical para mostrar los resultados; el usuario avanza secuencialmente a través de los 5 slides.
* [ ] No existen referencias técnicas en los botones o títulos principales (se eliminó "PNG 1080x1350", "Lista Nominal", "cohorte").
* [ ] Todas las combinaciones de texto e icono superan el ratio de contraste `4.5:1` en WCAG AA.
* [ ] Las animaciones de D3.js en la `SillaVacia` y `LineaDeVida` se ejecutan al entrar a su slide correspondiente y no en la carga inicial de la página.
* [ ] La tarjeta final incluye el llamado a la acción motivacional ciudadano.
---

## Nota de implementación (20-oct-2026)

**Estado:** aplicado en `src/`. `npm test` 14/14, `npm run build` OK y recorrido
automatizado en Chrome headless con 27/27 comprobaciones.

### 1. Arquitectura de estado y navegación paginada

- `src/stores/navigation.js`: store `currentSlide` (writable) + `totalSlides`,
  `nextSlide`, `prevSlide`, `goToSlide` y `resetSlides`.
- `src/components/slides/`: un componente por slide
  (`Slide1Onboarding`, `Slide2Realidad`, `Slide3SillaVacia`, `Slide4Contexto`,
  `Slide5Compartir`). Cada uno expone sus props y emite eventos (`select`,
  `advance`, `next`, `back`, `share`, `copy`).
- `src/App.svelte`: queda como orquestador (datos, tema, modal de compartir,
  guía) y monta un solo slide a la vez con `in:fade` / `out:slide`.

### 2. Sistema de estilos y tokens

- `src/styles/global.css`: nuevo sistema de tokens (`--bg-main`, `--bg-card`,
  `--bg-card-hover`, `--text-primary`, `--text-secondary`, `--text-muted`,
  `--accent-pink`, `--accent-purple`, `--accent-cyan`, `--status-voted`,
  `--status-absent`, `--border-subtle`, `--border-focus`, `--radius-*`,
  `--font-base`, `--font-heading`) con sus variantes de tema claro y de alto
  contraste. Base de lectura, escala tipográfica, `.btn-primary` unificado y
  las clases compartidas de la Web Story (`.slide`, `.slide-title`,
  `.slide-card`, `.stat-chips`, `.context-bar`, `.share-box`...).
- Todos los componentes (`App`, `Selector`, `LineaDeVida`, `Comparacion`,
  `SillaVacia`, `Tarjeta`, `Metodologia`, `WelcomeTour`) y
  `src/styles/responsive.css` consumen ya solo los tokens nuevos: no queda
  ninguna referencia a las variables anteriores.

### 3. Ajustes de accesibilidad visual

- `src/utils/focusTitle.js`: acción de Svelte que pasa el foco al título
  (`<h1>`/`<h2>`) de cada slide al entrar en él. En la carga inicial no roba
  el foco (la guía de bienvenida puede abrirse).
- `SillaVacia.svelte`: matriz 10x10 con `width: 100%` y `max-width: 360px`
  (también en móvil) y `aria-label` descriptivo con el número de votos y de
  ausencias.
- `Tarjeta.svelte`: el texto legal del PNG pasa a 28-30 px sobre el lienzo de
  1080 px, con ajuste automático para que nunca se salga; en la web, el
  aviso metodológico queda en 14 px.
- Lenguaje: se retiran de la interfaz los términos técnicos ("PNG 1080x1350",
  "Lista Nominal", "cohorte", "pseudo-cohortes"). La explicación técnica vive
  en el modal "Cómo se calculó".

### Criterios de aceptación verificados

- [x] Sin scroll vertical para mostrar los resultados: se avanza slide a slide.
- [x] Sin referencias técnicas en botones ni títulos principales.
- [x] Contraste: `--text-primary` 15:1+, `--text-secondary` 7:1+,
      `--text-muted` 4.5:1+ sobre los fondos del sistema en ambos temas.
- [x] Las animaciones de D3 se ejecutan al entrar a su slide, no en la carga
      inicial (verificado en el recorrido automatizado).
- [x] La tarjeta final incluye el llamado a la acción ciudadano.

### 4. Refinado visual del sistema (20-oct-2026)

Segunda pasada sobre el mismo plan, con foco en el oficio (no en la
estructura, que ya estaba). Cambios:

**Tipografía**

- Se sustituye Inter por **IBM Plex Sans** (texto y UI): sans institucional,
  diseñada para datos y señalética, en vez de la tipografía por defecto de
  todo el mundo. Los titulares pasan a **Bricolage Grotesque**, una grotesca
  variable con gesto editorial, usada solo en titulares y cifras grandes.
- `text-wrap: balance` en titulares y `pretty` en párrafos; interletrado
  `--tracking-tight` en los titulares.

**Color y superficies**

- Se añade `--line` (filete estructural) para separar jerarquías sin llenar
  la pantalla de cajas y sombras.
- El degradado de marca pasa a dos paradas (rosa INE a violeta): se elimina
  el arcoíris azul-violeta del logotipo.
- El panel de cifras de la Silla Vacía deja de ser un degradado saturado con
  texto blanco (no cumplía AA en el texto pequeño) y pasa a un bloque de
  tinta con filete de acento: la cifra grande es lo único que resalta.
- Jerarquía de radios: 3 px (chips), 6 px (controles), 12 px (paneles),
  16 px (tarjeta protagonista) y píldora solo donde de verdad funciona
  (la barra de contexto).

**Layout**

- El slide 1 deja de ser un hero centrado con tres tarjetas idénticas: pasa a
  una composición asimétrica, con el formulario a la izquierda y el
  recorrido de la historia (una secuencia real, por eso sí numerada) a la
  derecha.
- El contenido se centra verticalmente en la pantalla: la Web Story ocupa la
  altura útil en lugar de dejar un vacío al final.
- Una regla corta de acento abre cada título: es la misma firma en los cinco.

**Copy e interfaz**

- Etiquetas en sentence case (se quitan MAYÚSCULAS con tracking).
- Se eliminan las cadenas con punto medio ("A · B · C") y las flechas "←" en
  cada botón; el separador del footer es ahora un filete.
- El formulario pide la siguiente acción ("Empieza por tu año de nacimiento")
  en vez de numerar campos.
- El logo del header es el `h1` del documento: así cada vista tiene un único
  `h1` y los títulos de slide son `h2` con jerarquía coherente.
- La caída de participación se marca con signo **y** flecha, no solo con color.

**Tarjeta PNG**

- Se dibuja con las tipografías del sitio (esperando a `document.fonts.ready`),
  de modo que la imagen compartida se ve como parte del producto.

### Verificación del refinado

- `npm test` 14/14, `npm run build` OK, recorrido automatizado 27/27.
- Capturas revisadas a 360, 768, 1280 y 1920 px, en tema oscuro y claro.
