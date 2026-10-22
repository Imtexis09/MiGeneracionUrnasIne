# Guía de Refactorización: Lenguaje Claro, Lógica Dinámica y Compatibilidad
**Proyecto:** Mi Generación en las Urnas — Hackathon INE Reto 3
**Objetivo del Agente:** Aplicar la simplificación total del lenguaje (Lenguaje Claro Ciudadano), adaptar la narrativa dinámicamente según el año de nacimiento del usuario, solucionar problemas de renderizado de imágenes en iOS/Safari y agregar una sección de material educativo.

---

## 1. Mapeo de Lenguaje Claro Ciudadano (Estandarización de Textos)

Queda estrictamente prohibido usar jerga técnica, electoral o estadística en las vistas principales. Todo el texto debe ajustarse al siguiente glosario de conversión:

| Término Técnico / Burocrático (NO USAR) | Término Ciudadano Sencillo (USAR) |
|---|---|
| `Entidad Federativa` | **Tu estado** |
| `Cohorte de edad / Grupo quinquenal` | **Tu generación** |
| `Participación electoral` | **Cuántas personas van a votar** |
| `Abstencionismo / Sillas vacías` | **Personas que no fueron a votar** |
| `Procesamiento local en cliente` | **Tus datos están seguros y no salen de tu celular** |
| `Generar tarjeta PNG 1080x1350` | **Descargar imagen para compartir** |
| `Indicadores de participación` | **Resultados de tu estado** |
| `Lista Nominal / Padrón` | **Personas registradas para votar** |

### Textos Específicos por Pantalla (Slide):

*   **Slide 1 (Inicio):**
    *   *Título:* "¿Qué tan activa es tu edad en las urnas?"
    *   *Subtítulo:* "Selecciona tu año de nacimiento y tu estado para descubrirlo en menos de un minuto."
    *   *Botón:* **"Ver la historia de mi generación"**

*   **Slide 2 (Resumen de Impacto):**
    *   *Frase Principal:* **"De cada 100 personas de tu edad en [Estado], [X] fueron a votar en 2024."**
    *   *Frase Complementaria:* **"[Y] personas prefirieron no participar."**

*   **Slide 3 (La Silla Vacía):**
    *   *Título:* **"Así se ven las personas que no votaron"**
    *   *Explicación:* "Cada cuadro representa a una persona de tu generación. Los cuadros de color votaron; los cuadros grises se quedaron en casa."

*   **Slide 4 (Evolución en el tiempo):**
    *   *Título:* **"¿Cómo ha cambiado la asistencia a las urnas?"**
    *   *Explicación:* "Comparamos las últimas elecciones para ver si tu generación está votando más o menos que antes."

*   **Slide 5 (Compartir y Actuar):**
    *   *Título:* **"El futuro de tu estado también depende de ti"**
    *   *Llamado a la acción:* **"Comparte esta imagen con tus amigos para recordarles por qué cada voto cuenta."**
    *   *Botón:* **"Guardar imagen para mis Historias"**

---

## 2. Lógica Narrativa Dinámica según el Año de Nacimiento

El agente debe implementar una función que evalúe la edad calculada (`2024 - AñoNacimiento`) y ajuste el texto para evitar inconsistencias históricas:

```javascript
// src/utils/narrativeEngine.js

export function getNarrative(birthYear, participationData) {
  const ageIn2024 = 2024 - birthYear;

  // CASO 1: Jóvenes que votaron por 1ª vez en 2024 (18 a 20 años)
  if (ageIn2024 <= 20) {
    return {
      insight: "¡2024 fue una de tus primeras elecciones! La primera vez que votamos participamos mucho, pero el reto es no dejar de hacerlo en las siguientes.",
      comparable: false
    };
  }

  // CASO 2: Jóvenes en sus 20s (21 a 29 años)
  if (ageIn2024 > 20 && ageIn2024 <= 29) {
    return {
      insight: "La mayoría de las personas votan con entusiasmo a los 18 años, pero al llegar a los 20s la asistencia a las urnas cae considerablemente.",
      comparable: true
    };
  }

  // CASO 3: Adultos y Adultos Mayores (30 años o más)
  return {
    insight: "Con los años, la participación suele estabilizarse. Revisa cómo se compara el compromiso de tu generación frente a los más jóvenes.",
    comparable: true
  };
}
```

---

## 3. Compatibilidad con iOS / Safari y Fuentes Locales

Para corregir errores donde el lienzo (Canvas) no descarga las imágenes correctamente en iPhone o Safari debido a bloqueos de CORS en Google Fonts:

1.  **Autoalojar Tipografías:**
    *   Descargar los archivos `.woff2` de Inter y Outfit y guardarlos en `public/fonts/`.
    *   Definir `@font-face` en `src/styles/global.css` apuntando a las rutas locales `/fonts/outfit.woff2` e `/fonts/inter.woff2`.
    *   Eliminar la petición externa `<link href="https://fonts.googleapis.com">` del `index.html`.

2.  **Ajuste de Exportación de Imagen en `Tarjeta.svelte`:**
    *   Asegurar el uso de `scale: 2` para alta definición retina en móviles.
    *   Agregar un pequeño retardo (`await new Promise(r => setTimeout(r, 100))`) antes de renderizar el canvas para garantizar que el DOM móvil haya cargado todos los estilos.

---

## 4. Ficha Educativa para Docentes y Talleres (Requisito INE)

Para cumplir al 100% con la entrega de "Material Educativo y Herramientas de Divulgación" del INE:

1.  En la barra superior (`Header.svelte`) y en la pantalla final (Slide 5), agregar un botón secundario: **"Material para profesores y talleres"**.
2.  Al hacer clic, abre un modal con una **Ficha Resumen Educativa** que incluye:
    *   Preguntas disparadoras para debate grupal (ej. *"¿Por qué creen que los jóvenes participan menos a los 23 años que a los 18?"*).
    *   Resumen imprimible de la participación del estado seleccionado.
    *   Opción de **"Imprimir / Guardar Ficha Educativa en PDF"**.

---

## 5. Checklist de Entrega para el Agente

- [ ] Todos los términos técnicos reemplazados por sus equivalentes ciudadanos.
- [ ] Fuentes convertidas a locales (`public/fonts/`) y eliminadas las llamadas a CDN de Google.
- [ ] Verificada la descarga de imágenes PNG en navegador Safari/iOS.
- [ ] Implementada la lógica dinámica para nacidos entre 1950 y 2006.
- [ ] Agregado el modal de "Ficha Educativa" para docentes.