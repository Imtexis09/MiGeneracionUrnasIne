# Guía de Accesibilidad Web: WCAG 2.1 Nivel AA

## Introducción

Las **Pautas de Accesibilidad al Contenido Web (WCAG 2.1)** son desarrolladas por el W3C (*World Wide Web Consortium*) a través de la *Web Accessibility Initiative* (WAI). Su objetivo principal es asegurar que el contenido y las aplicaciones digitales sean accesibles para todas las personas, independientemente de sus capacidades físicas, sensoriales o cognitivas.

El **Nivel AA** es el estándar de cumplimiento de accesibilidad recomendado globalmente por la mayoría de las legislaciones y normativas del sector (por ejemplo, la Directiva Europea EN 301 549 o la Section 508 de EE. UU.). Cumplir con el Nivel AA implica haber satisfecho también todos los criterios del **Nivel A**.

---

## Los 4 Principios Rectores (POUR)

WCAG 2.1 organiza sus requisitos en torno a cuatro principios fundamentales:

1. **Perceptible (*Perceivable*):** La información y los componentes de la interfaz de usuario deben presentarse de manera que los usuarios puedan percibirlos mediante sus sentidos disponibles.
2. **Operable (*Operable*):** Los componentes de la interfaz de usuario y la navegación deben ser utilizables mediante diversos métodos de entrada.
3. **Comprensible (*Understandable*):** La información y el funcionamiento de la interfaz deben ser comprensibles y predecibles.
4. **Robusto (*Robust*):** El contenido debe ser lo suficientemente sólido para que pueda ser interpretado de forma fiable por una gran variedad de agentes de usuario, incluidas las tecnologías de asistencia.

---

## Criterios de Conformidad del Nivel AA (WCAG 2.1)

A continuación se resumen los criterios clave de Nivel AA ordenados por su principio correspondiente, incluyendo los introducidos específicamente en la versión 2.1:

### 1. Principio: Perceptible

#### 1.2 Material multimedia dependiente del tiempo
* **1.2.4 Subtítulos en directo (Nivel AA):** Se proporcionan subtítulos en tiempo real para el contenido de audio emitido en directo.
* **1.2.5 Audiodescripción grabada (Nivel AA):** Se proporciona audiodescripción para todo el contenido de vídeo grabado.

#### 1.4 Adaptable y Distinguible
* **1.4.3 Contraste mínimo (Nivel AA):**
  * Texto normal: Relación de contraste mínima de **4.5:1** respecto al fondo.
  * Texto grande ($\ge 18\text{pt}$ o $\ge 14\text{pt}$ en negrita): Relación de contraste mínima de **3:1**.
* **1.4.4 Redimensionamiento del texto (Nivel AA):** El texto puede ampliarse hasta un **200%** sin pérdida de contenido o funcionalidad y sin requerir tecnologías de asistencia.
* **1.4.10 Reflujo / Reflow (WCAG 2.1 - Nivel AA):** El contenido puede presentarse sin pérdida de información ni necesidad de desplazarse en dos dimensiones para:
  * Contenido vertical en un ancho equivalente a **320px CSS**.
  * Contenido horizontal en una altura equivalente a **256px CSS**.
* **1.4.11 Contraste no textual (WCAG 2.1 - Nivel AA):** Los componentes de interfaz gráfica (iconos, bordes de campos, estados activos) tienen una relación de contraste mínima de **3:1** con los colores adyacentes.
* **1.4.12 Espaciado de texto (WCAG 2.1 - Nivel AA):** Permite a los usuarios ajustar el espaciado sin romper la maquetación:
  * Altura de línea a al menos 1.5 veces el tamaño de la fuente.
  * Espaciado entre párrafos a al menos 2 veces el tamaño de la fuente.
  * Espaciado entre letras (kerning) a al menos 0.12 veces el tamaño de la fuente.
  * Espaciado entre palabras a al menos 0.16 veces el tamaño de la fuente.
* **1.4.13 Contenido al pasar el puntero o el foco (WCAG 2.1 - Nivel AA):** La información emergente (*tooltips*, menús desplegables) debe ser descartable, accesible con el puntero y persistente.

---

### 2. Principio: Operable

#### 2.4 Navegable y estructurado
* **2.4.5 Múltiples vías (Nivel AA):** Hay más de un modo disponible para localizar una página web dentro de un conjunto de páginas (ej. buscador, mapa web, menú de navegación).
* **2.4.6 Encabezados y etiquetas (Nivel AA):** Los encabezados y las etiquetas describen el tema o propósito de forma clara y precisa.
* **2.4.7 Foco visible (Nivel AA):** Cualquier interfaz de usuario que se pueda operar mediante teclado tiene un modo de funcionamiento donde el indicador del foco del teclado es visible.

#### 2.5 Modalidades de entrada (Novedades en WCAG 2.1)
* **2.5.1 Gestos con el puntero (Nivel AA):** Toda funcionalidad que utilice gestos multipunto o basados en trayectorias (ej. pellizcar para hacer zoom, deslizar) puede operarse con un único puntero sin gesto basado en trayectoria.
* **2.5.2 Cancelación del puntero (Nivel AA):** La activación de un evento se completa al soltar el clic/toque (*up-event*), permitiendo cancelar la acción si se arrastra fuera del elemento.
* **2.5.3 Inclusión del nombre en la etiqueta (Nivel AA):** Para los componentes de la interfaz con texto visual o imágenes con texto, el nombre accesible (*aria-label*) contiene el texto visible.
* **2.5.4 Activación por movimiento (Nivel AA):** La funcionalidad que se puede operar mediante el movimiento del dispositivo (ej. agitar) se puede operar mediante componentes de interfaz ordinarios y se puede desactivar.

---

### 3. Principio: Comprensible

#### 3.1 Legible
* **3.1.2 Idioma de las partes (Nivel AA):** El idioma de cada pasaje o frase en el contenido puede ser determinado por software cuando difiere del idioma predeterminado de la página.

#### 3.2 Predecible
* **3.2.3 Navegación consistente (Nivel AA):** Los mecanismos de navegación que se repiten en varias páginas se presentan en el mismo orden relativo cada vez.
* **3.2.4 Identificación consistente (Nivel AA):** Los componentes que tienen la misma funcionalidad se identifican de manera coherente (mismos nombres/iconos para la misma función).

#### 3.3 Entrada de datos y asistencia con errores
* **3.3.3 Sugerencia ante errores (Nivel AA):** Si se detecta un error de entrada y se disponen de sugerencias para corregirlo, se ofrecen al usuario a menos que comprometa la seguridad.
* **3.3.4 Prevención de errores en transacciones (Nivel AA):** Para páginas que realizan transacciones legales, financieras o modifican datos del usuario, las acciones son reversibles, verificables o confirmables antes de finalizar.

---

### 4. Principio: Robusto

#### 4.1 Compatible
* **4.1.3 Mensajes de estado (WCAG 2.1 - Nivel AA):** Los mensajes de estado o actualización en vivo (ej. alert, notificaciones, filtros aplicados) pueden ser determinados por software a través de funciones o propiedades (`role="status"`, `aria-live`) para que las tecnologías de asistencia los anuncien sin perder el foco.

---

## Resumen de Niveles de Conformidad

| Nivel | Descripción | Cobertura legal y técnica |
| :--- | :--- | :--- |
| **Nivel A** | Requisitos mínimos indispensables para evitar barreras críticas de accesibilidad. | Requisito base (insuficiente por sí solo para el marco regulatorio actual). |
| **Nivel AA** | Aborda las barreras más comunes para personas con discapacidad visual, auditiva, motora y cognitiva. | **Estándar legal e industrial recomendado para aplicaciones y páginas web.** |
| **Nivel AAA** | Requisitos avanzados o específicos para escenarios muy especializados. | Deseable en contextos específicos, no exigido globalmente. |