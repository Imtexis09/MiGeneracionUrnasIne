# Especificaciones Técnicas y de Diseño (Frontend)
**Proyecto:** Reto 3 - "Mi Generación en las Urnas" (Hackathon INE)
**Documento:** Lineamientos de UI/UX y Arquitectura Frontend
**Target:** Jóvenes, estudiantes universitarios, ciudadanía general.

---

## 1. Arquitectura y Stack Tecnológico Recomendado

Dado que se requiere una página web estática pero altamente interactiva para consumir el archivo `datos/participacion_edad.json`, se recomienda el siguiente stack moderno:

*   **Core / Framework:** React 18+ (con Vite para un build ultra rápido) o Vanilla JS moderno (ES6+) estructurado en módulos.
*   **Estilos:** Tailwind CSS (permite un desarrollo ágil, sistema de diseño estricto y un bundle final muy ligero).
*   **Visualización de Datos:** Recharts (si se usa React) o Chart.js/ECharts. Son responsivas por defecto y manejan bien animaciones fluidas.
*   **Gestión de Estado (si aplica):** Zustand o Context API (evitar Redux por la simplicidad del flujo de datos).
*   **Despliegue:** GitHub Pages, Vercel o Netlify (alojamiento estático).

---

## 2. Sistema de Diseño (Design System)

### 2.1. Paleta de Colores
Buscamos un equilibrio entre la identidad institucional del INE y un estilo "Tech/Editorial" atractivo para los jóvenes.

*   **Fondo Base (Light Mode):** `#F8FAFC` (Slate 50) - Limpio, reduce la fatiga visual.
*   **Fondo Superficies (Cards):** `#FFFFFF` con sombras suaves (`shadow-sm` de Tailwind).
*   **Color Primario (Acento):** `#D9006C` (Magenta INE modernizado) - Usar en botones, CTAs y datos clave.
*   **Color Secundario (Datos e Interacción):** `#4F46E5` (Indigo 600) - Excelente contraste para gráficas.
*   **Paleta Categórica para Gráficas (Grupos de edad):**
    *   *18-24 años:* `#F59E0B` (Amber) - Energía, juventud.
    *   *25-29 años:* `#10B981` (Emerald) - Transición.
    *   *30+ años:* `#6366F1` (Indigo) - Estabilidad.

### 2.2. Tipografía
Recomiendo usar fuentes de Google Fonts optimizadas para lectura en pantallas móviles.

*   **Headings (Títulos):** `Outfit` o `Geist` (Pesos: 600, 700, 800) - Aporta un carácter moderno y audaz.
*   **Body (Textos generales y UI):** `Inter` o `Plus Jakarta Sans` (Pesos: 400, 500) - Máxima legibilidad en tablas y tooltips.

### 2.3. Breakpoints (Mobile-First)
Todo el CSS debe diseñarse primero para móviles y escalar hacia escritorio.
*   `sm`: 640px (Tablets verticales)
*   `md`: 768px (Tablets horizontales)
*   `lg`: 1024px (Laptops, vista completa de dashboard)

---

## 3. Estructura de la Interfaz (Layout)

La experiencia debe sentirse como un artículo interactivo (Data Storytelling) más que como un panel de administración aburrido.

### Sección 1: Hero Dinámico (Captación)
*   **UI:** Gran encabezado tipográfico.
*   **Interacción Principal:** Un mini-formulario tipo *Mad Libs*.
    *   *Ejemplo visual:* "Hola, tengo [ Input: 22 ] años, vivo en [ Select: Puebla ] y quiero saber cómo vota mi generación."
*   **Comportamiento:** Al llenar esto, el estado global de la app cambia y *todas* las gráficas subsecuentes se pre-filtran para ese usuario.

### Sección 2: KPIs y Banderas (Highlight Cards)
*   **UI:** Grid de 3 columnas (en desktop) / 1 columna (en móvil).
*   **Contenido:**
    1.  % de participación del rango de edad seleccionado (último año).
    2.  Comparativa vs Promedio Nacional.
    3.  Tendencia (ej. "↓ 5% menos que en 2018").
*   **Animación:** `CountUp` (los números suben rápidamente desde 0 al cargar).

### Sección 3: El Dashboard Interactivo (El "Core")
Aquí se consume el archivo `datos/participacion_edad.json`.

*   **Gráfica Principal (Línea de tiempo):**
    *   Eje X: Años (2009, 2012, 2015, 2018, 2021, 2024).
    *   Eje Y: % de participación.
    *   Líneas: Múltiples líneas comparando rangos de edad.
    *   *Detalle Pro:* Tooltips interactivos. Al hacer *hover* en un nodo (ej. 2018), mostrar el % exacto de todas las líneas en ese punto.
*   **Controles:** Toggle buttons (botones estilo pastilla) encima de la gráfica para cambiar rápidamente la vista entre "Nacional" y "Estatal".

### Sección 4: Generador de Impacto (Social Share)
*   **UI:** Un bloque visualmente destacado simulando un "Story" de Instagram/WhatsApp.
*   **Funcionalidad (HTML2Canvas):** Un botón que diga "Compartir mi estadística". Captura el div del KPI personalizado y permite al usuario descargar una imagen PNG con un mensaje predefinido y el hashtag `#MiGeneraciónEnLasUrnas`.

---

## 4. Estrategia de Fetching y Manejo de Datos

Como el archivo es un JSON estático (`datos/participacion_edad.json`), la estrategia debe ser eficiente para no bloquear el hilo principal.

```javascript
// Ejemplo de lógica de carga recomendada (React/Vite)
import { useState, useEffect } from 'react';

export const useElectionData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // En producción, esto apuntará a la ruta relativa del archivo compilado
        const response = await fetch('./datos/participacion_edad.json'); 
        const json = await response.json();
        // Indexar o transformar datos aquí para búsquedas rápidas (ej. O(1) por estado/año)
        setData(json);
      } catch (error) {
        console.error("Error cargando los datos censales:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, isLoading };
};
```

**Recomendación de rendimiento:** Si el JSON resulta ser muy pesado (más de 2MB), implementar *memoization* (`useMemo`) en las funciones que filtran los datos por estado y año para evitar re-renders costosos al interactuar con las gráficas.

---

## 5. Accesibilidad (a11y) y UX

Para un proyecto institucional y ciudadano, la accesibilidad no es negociable.

*   **Contraste:** Validar que los colores de las gráficas pasen el estándar WCAG AA contra el fondo blanco/gris.
*   **Atributos ARIA:**
    *   Asegurar que todas las gráficas tengan un `aria-label` descriptivo y un rol de `figure` o `img`.
    *   Proveer una tabla HTML oculta (`sr-only`) con los mismos datos que la gráfica para los lectores de pantalla.
*   **Navegación por Teclado:** Asegurar que los selectores de año, estado y edad tengan un estado `:focus` o `:focus-visible` claramente delineado en CSS (ej. `ring-2 ring-indigo-500`).