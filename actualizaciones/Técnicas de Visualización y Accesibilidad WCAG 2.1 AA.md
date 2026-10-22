# Guía de Implementación: Técnicas Avanzadas de Visualización y Accesibilidad (WCAG 2.1 AA)

**Proyecto:** Mi Generación en las Urnas — Hackathon INE Reto 3  
**Objetivo del Agente:** Integrar cinco técnicas clave de comunicación visual (Infografías, Visualización de Datos, Mapa Interactivo de Historias, Micro-animaciones y Efectos Parallax) sobre la arquitectura de 5 Slides, garantizando el cumplimiento estricto de la normativa de accesibilidad WCAG 2.1 Nivel AA.

---

## 1. Integración de las 5 Técnicas de Visualización

### 🎨 1.1 Infographics (Infografías y Tarjetas Resumidas)
* **Ubicación:** Slide 5 (Tarjeta Compartible) y bloques de resumen.
* **Implementación:**
  * Maquetar la tarjeta en el DOM con HTML5 semántico y CSS3 antes de exportarla a PNG.
  * Mantener ratios de contraste mínimos de **4.5:1** para texto sobre gradientes o fondos oscuros.
  * Proporcionar una versión en texto plano en el DOM visible para lectores de pantalla.

### 📊 1.2 Data Visualization (D3.js Interactiva)
* **Ubicación:** Slide 3 (*Waffle Chart* - La Silla Vacía) y Slide 4 (Gráfica de Líneas - Evolución Histórica).
* **Implementación:**
  * **Doble codificación visual (WCAG 1.4.1):** No confiar únicamente en el color. Combinar variaciones de tono con bordes de alto contraste (`border: 2px solid`), patrones de relleno o etiquetas numéricas explícitas.
  * **Acceso por teclado (WCAG 2.1.1):** Cada elemento interactivo en SVG/D3 debe incluir `tabindex="0"`, `role="graphics-symbol"` y atributos `aria-label`.
  * **Vista en Tabla Alternativa (WCAG 1.3.1):** Incluir un botón alternador para desplegar la información en una tabla semántica (`<table class="sr-only-toggle">`).

### 🗺️ 1.3 Interactive Story Map (Mapa Interactivo de México)
* **Ubicación:** Slide 1 (Onboarding / Selección de Estado).
* **Implementación:**
  * Reemplazar o complementar la selección por lista con un mapa SVG coroplético interactivo de los 32 estados de México.
  * **Contraste de bordes (WCAG 1.4.11):** Los límites de las entidades deben tener un contraste mínimo de **3:1** contra el fondo.
  * **Soporte Paralelo:** Mantener un selector desplegable (`<select>`) estándar en la interfaz como mecanismo de entrada alternativo para tecnologías de asistencia.

### 🎥 1.4 Video Content & Micro-animaciones
* **Ubicación:** Slide 2 (Métrica Principal) y Modal de Ficha Educativa.
* **Implementación:**
  * Utilizar micro-animaciones SVG/Lottie o clips explicativos breves (menos de 5 segundos) para ilustrar la pérdida de participación.
  * **Control de reproducción (WCAG 2.2.2):** Si la animación supera los 5 segundos de duración, agregar botones visibles de Pausa / Reproducción.
  * **Límite de parpadeo (WCAG 2.3.1):** Cero destellos o parpadeos superiores a 3 Hz para evitar riesgos de fotosensibilidad.

### 🌌 1.5 Parallax Scrolling / Transición en Profundidad
* **Ubicación:** Transición entre las 5 Slides.
* **Implementación:**
  * Aplicar un efecto sutil de desplazamiento en capas (fondo a velocidad reducida respecto al texto principal) durante el avance de pantalla.
  * **Anulación por Accesibilidad (WCAG 2.3.3):** Desactivar automáticamente cualquier movimiento cuando el sistema operativo del usuario tenga activada la preferencia `prefers-reduced-motion: reduce`.

---

## 2. Hoja de Estilos de Accesibilidad (`src/styles/accessibility.css`)

Agregar las siguientes utilidades CSS al proyecto para forzar el cumplimiento normativo:

```css
/* ==========================================================================
   SOPORTE WCAG 2.1 AA — MOVIMIENTO REDUCIDO Y CONTRASTE
   ========================================================================== */

/* 1. Anulación de Efectos Parallax y Animaciones para Usuarios Sensibles */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .parallax-layer-bg,
  .parallax-layer-fg {
    transform: none !important;
    transition: opacity 0.2s ease !important;
  }
}

/* 2. Anillo de Foco Accesible (Keyboard Focus) */
:focus-visible {
  outline: 3px solid #38BDF8 !important;
  outline-offset: 4px !important;
  border-radius: 4px;
}

/* 3. Ocultamiento Semántico para Lectores de Pantalla */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 4. Tabla Alternativa para Gráficas D3 */
.data-table-fallback {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  color: var(--text-primary);
}

.data-table-fallback th,
.data-table-fallback td {
  border: 1px solid var(--border-subtle);
  padding: 0.75rem;
  text-align: left;
}

.data-table-fallback th {
  background-color: var(--bg-card);
  font-weight: 600;
}
```

---

## 3. Implementación del Mapa Interactivo (Svelte + SVG)

Plantilla accesible para el componente del mapa (`src/components/MapaMexico.svelte`):

```html
<script>
  import { createEventDispatcher } from 'svelte';
  export var selectedState = '';

  const dispatch = createEventDispatcher();

  function handleSelect(stateCode) {
    selectedState = stateCode;
    dispatch('select', { state: stateCode });
  }
</script>

<div class="map-container" role="region" aria-label="Mapa interactivo de la República Mexicana">
  <svg viewBox="0 0 1000 600" class="map-svg" aria-hidden="false">
    <!-- Ejemplo de entidad SVG accesible -->
    <path
      d="...path_geo_campeche..."
      id="state-CAMP"
      class="state-path"
      class:active={selectedState === 'Campeche'}
      tabindex="0"
      role="button"
      aria-label="Campeche. Haz clic o presiona Enter para seleccionar."
      aria-pressed={selectedState === 'Campeche'}
      on:click={() => handleSelect('Campeche')}
      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect('Campeche')}
    />
  </svg>

  <!-- Selector Alternativo Accesible -->
  <div class="fallback-selector">
    <label for="state-select-fallback" class="sr-only">Seleccionar estado desde la lista</label>
    <select 
      id="state-select-fallback" 
      bind:value={selectedState} 
      on:change={() => dispatch('select', { state: selectedState })}
    >
      <option value="">-- O selecciona tu estado de la lista --</option>
      <option value="Campeche">Campeche</option>
      <option value="Yucatán">Yucatán</option>
      <!-- Demás estados -->
    </select>
  </div>
</div>

<style>
  .state-path {
    fill: var(--bg-card);
    stroke: #64748B; /* Contraste 3:1 mínimo */
    stroke-width: 1.5;
    cursor: pointer;
    transition: fill 0.2s ease, stroke 0.2s ease;
  }

  .state-path:hover,
  .state-path:focus {
    fill: var(--accent-purple);
    stroke: var(--border-focus);
    outline: none;
  }

  .state-path.active {
    fill: var(--accent-pink);
    stroke: #FFFFFF;
    stroke-width: 2.5;
  }

  .fallback-selector {
    margin-top: 1rem;
  }
</style>
```

---

## 4. Checklist de Aceptación para el Agente

- [ ] Todas las gráficas en D3 poseen un botón alternador para ver la información en formato de tabla HTML.
- [ ] Ningún elemento interactivo o de texto depende únicamente del color para comunicar su estado o significado.
- [ ] La consulta CSS `@media (prefers-reduced-motion: reduce)` anula las animaciones de movimiento y los efectos Parallax entre Slides.
- [ ] El mapa interactivo permite selección tanto gráfica (clic/touch/teclado sobre el mapa SVG) como mediante selector `<select>` nativo.
- [ ] El contraste de cualquier texto visible respecto a su fondo cumple o supera la relación `4.5:1` verificada.