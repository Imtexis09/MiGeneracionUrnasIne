---
name: diseno-ui-ux
description: Usar siempre que se diseñe o revise la interfaz, la experiencia o el aspecto gráfico de un sitio o app web: layouts, jerarquía visual, tipografía, color, espaciado, componentes, formularios, navegación, flujos, estados, accesibilidad, copy de interfaz y sistemas de diseño. Define el proceso y los criterios para que el resultado sea usable, accesible y con identidad propia, no genérico ni "hecho con IA". Complementa a frontend-humano (que define el stack técnico).
---

# Diseño UI/UX web

Esta skill define **qué diseñar y cómo decidirlo**. La implementación técnica (React, Next.js, Tailwind, etc.) la cubre `frontend-humano`; si ambas aplican, usa esta para las decisiones de diseño y aquella para el código.

## 0. Reglas de precedencia

1. Si el proyecto ya tiene sistema de diseño, marca o guía de estilo, **se respeta por encima de esta skill**.
2. Si el usuario fija una dirección visual concreta, se sigue aunque coincida con alguno de los tics de la sección 10.
3. La usabilidad y la accesibilidad no se sacrifican por estilo. Ante un conflicto, gana el usuario final.
4. No inventes datos del negocio (métricas, testimonios, logos de clientes, precios). Si faltan, usa marcadores claramente señalados o pregunta.

## 1. Proceso de trabajo

Sigue estos pasos en orden. Para tareas pequeñas (un componente, un ajuste) basta con los pasos 1, 2 y 6.

1. **Entender.** Escribe en una línea: *qué es el producto, quién lo usa, cuál es la tarea principal y cómo se mide el éxito*. Si falta, propón una versión y confírmala.
2. **Priorizar contenido.** Lista qué necesita ver y hacer el usuario, en orden de importancia. El diseño parte del contenido real, no de una plantilla vacía.
3. **Estructurar.** Arquitectura de información: secciones, navegación, rutas y flujos clave (inicio → objetivo). Un flujo, una pantalla principal, una acción principal.
4. **Boceto de baja fidelidad.** Wireframe en ASCII o descripción por bloques. Compara dos conceptos antes de elegir uno.
5. **Sistema visual.** Tokens de color, tipografía, espaciado, radios, sombras y movimiento (sección 9).
6. **Contrastar con el genérico.** Pregúntate: "¿esto es lo que produciría para cualquier producto parecido?". Si la respuesta es sí, cambia esa parte y di qué cambiaste.
7. **Construir y revisar.** Verifica con la lista de la sección 11. Si el entorno permite capturas, revisa móvil y escritorio.

## 2. Principios de UX que guían las decisiones

Basados en las heurísticas de Nielsen, Don Norman y Steve Krug. Úsalos como criterios de revisión.

- **Visibilidad del estado del sistema.** El usuario siempre sabe dónde está, qué pasó y qué está cargando.
- **Coincidencia con el mundo real.** Lenguaje del usuario, no del sistema ("Notificaciones", no "Configuración de webhooks").
- **Control y libertad.** Deshacer, cancelar, volver. Evita callejones sin salida.
- **Consistencia y estándares.** Lo parecido se ve y se comporta igual. Respeta convenciones (logo arriba a la izquierda lleva al inicio, carrito arriba a la derecha).
- **Prevención de errores.** Valida a tiempo, restringe entradas imposibles, confirma solo acciones destructivas.
- **Reconocer antes que recordar.** Muestra opciones en lugar de pedir memorizarlas.
- **Flexibilidad y eficiencia.** Atajos y valores por defecto razonables para quien repite la tarea.
- **Diseño estético y minimalista.** Cada elemento compite por la atención; elimina lo que no ayuda.
- **Recuperación de errores.** Mensajes que dicen qué falló y cómo arreglarlo.
- **Ayuda y documentación.** Ayuda contextual, breve y cerca del problema.

Leyes de UX útiles: **Hick** (menos opciones, decisiones más rápidas), **Fitts** (objetivos importantes grandes y cercanos), **Jakob** (los usuarios esperan que tu sitio funcione como los demás), **Miller** (agrupar la información en bloques), **proximidad y similitud** (lo relacionado va junto), **efecto de posición serial** (lo importante al principio y al final de listas).

Reduce la **carga cognitiva**: divulgación progresiva (mostrar lo básico primero), agrupación, valores por defecto, y una sola acción primaria por vista.

## 3. Jerarquía visual y composición

- **Un punto focal por pantalla.** El ojo debe saber a dónde ir primero. Se logra con tamaño, peso, contraste, color y espacio, no con más adornos.
- **Tres niveles de énfasis** suelen bastar: primario (acción o titular principal), secundario, terciario (metadatos).
- **Rejilla y alineación.** Usa una rejilla de 12 columnas (o la que corresponda) y alinea a bordes comunes. Rompe la rejilla en un solo punto y con intención.
- **Espacio negativo.** El espacio en blanco agrupa y separa. Más espacio *entre* grupos que *dentro* de ellos (proximidad).
- **Escala de espaciado** de base 4 u 8 px (4, 8, 12, 16, 24, 32, 48, 64, 96, 128). Evita valores sueltos.
- **Patrones de lectura.** Contenido denso: patrón F (alinear a la izquierda, encabezados informativos). Páginas con poco texto: patrón Z. Diseña para **escanear**: encabezados claros, párrafos cortos, listas cuando el contenido es una lista.
- **Above the fold.** Lo primero que se ve debe comunicar qué es, para quién y qué hacer. No hace falta que todo quepa sin hacer scroll.

## 4. Tipografía

- **Una o dos familias.** Si son dos, que contrasten claramente (por ejemplo, serif de display + sans de texto). Una sola familia con buena variedad de pesos también funciona.
- **Escala tipográfica** con una razón fija (1,2 a 1,333) o definida a mano. Define: display, h1–h4, cuerpo, pequeño, etiqueta.
- **Cuerpo:** 16 px mínimo (1rem). Interlineado 1,5 a 1,7 en texto corrido; titulares 1,1 a 1,25. Serif con un poco más de interlineado que sans.
- **Medida (largo de línea):** 45 a 75 caracteres, nunca más de 80.
- **Peso y contraste:** no uses pesos muy finos (<300) para texto pequeño. Contraste suficiente (sección 7).
- **Alineación:** texto largo alineado a la izquierda. Evita justificado sin guionado y centrado en párrafos de más de 2 o 3 líneas.
- **Tipografía fluida** con `clamp()` para titulares. Usa `text-wrap: balance` en titulares y `pretty` en párrafos.
- **Rendimiento:** máximo 2 familias y 3 o 4 pesos cargados; fuentes variables si es posible; `font-display: swap` y fallback con métricas similares para evitar saltos de layout.
- **Elige con intención:** deja de usar por defecto Inter, Roboto, Arial o `system-ui` como única decisión. Fuentes de calidad con licencia abierta: Fontshare, Google Fonts, Bunny Fonts, Fontsource.

## 5. Color

- **Paleta base de 4 a 6 colores con nombre y rol:** fondo, superficie, tinta (texto), acento, y uno o dos neutros. Más los colores semánticos (éxito, aviso, error, información).
- **Regla 60-30-10** como punto de partida: dominante (neutros), secundario, acento.
- **Define en `oklch()`** y genera escalas (50–950) a partir de un tono; así los pasos son perceptualmente uniformes.
- **Contraste mínimo WCAG 2.2 AA:** 4,5:1 para texto normal, 3:1 para texto grande (≥24 px, o ≥18,66 px en negrita) y para componentes de interfaz y gráficos.
- **El color nunca es el único portador de significado.** Añade icono, texto o patrón (por ejemplo, un error lleva icono y mensaje, no solo borde rojo).
- **Tema oscuro:** se diseña, no se invierte. Evita negro puro #000 con blanco puro #FFF a tamaños pequeños, baja la saturación de los acentos, usa elevación por luminosidad de superficie en lugar de sombras.
- **Acento escaso.** Si todo es destacado, nada lo es. Reserva el acento para la acción principal y los estados activos.

## 6. Componentes, estados e interacción

### Estados obligatorios por componente
Reposo, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`, `éxito`, y para listas y datos: **vacío**, **cargando (skeleton)** y **sin resultados**.

### Botones y acciones
- Una acción primaria por vista. Secundaria con menos peso, terciaria como enlace.
- El texto del botón dice qué ocurre: "Guardar cambios", "Crear cuenta", no "Enviar" ni "Aceptar".
- Acciones destructivas: color y posición diferenciados, con confirmación o la opción de deshacer.
- Tamaño táctil: **mínimo 24 × 24 px (WCAG 2.2 AA)** y **recomendado 44 × 44 px** (o 48 dp en móvil). Separación suficiente entre objetivos adyacentes.

### Formularios
- Etiqueta **visible** encima del campo (no solo placeholder). El placeholder es ejemplo, no etiqueta.
- Pide solo lo necesario. Una columna. Agrupa campos relacionados. Marca los opcionales, no los obligatorios, si casi todos lo son.
- Tipos de entrada y `autocomplete` correctos; teclado móvil adecuado (`inputmode`).
- Validación en línea al salir del campo (no mientras se escribe); error junto al campo, con causa y solución.
- No borrar lo escrito tras un error. No pedir de nuevo datos ya dados (WCAG 3.3.7 Entrada redundante).
- Autenticación sin pruebas cognitivas obligatorias: permitir pegar contraseñas, gestores de contraseñas y alternativas al CAPTCHA (WCAG 3.3.8).

### Navegación
- Máximo 5 a 7 elementos en la navegación principal. Etiquetas descriptivas, no ingeniosas.
- Indica la ubicación actual (`aria-current`, estilo activo). Migas de pan en jerarquías profundas.
- Móvil: acciones frecuentes al alcance del pulgar; evita esconder lo esencial tras un menú hamburguesa cuando hay espacio.
- Búsqueda visible en sitios con mucho contenido.
- Si hay cabeceras o banners fijos, asegúrate de que **no tapen el elemento enfocado** (WCAG 2.4.11).

### Feedback y microinteracciones
- Toda acción tiene respuesta inmediata (<100 ms percibido): cambio de estado, spinner, mensaje.
- Carga: skeletons para contenido, barras de progreso para procesos con duración conocida, spinner solo para esperas cortas.
- Modales solo cuando se necesita una decisión; con foco atrapado, cierre con Esc y retorno del foco. Mejor `<dialog>` nativo.
- Arrastrar siempre con alternativa de un solo puntero o teclado (WCAG 2.5.7).

### Movimiento
- Sirve a una función: orientar, confirmar, mostrar causa y efecto, o guiar la atención una vez.
- Duraciones: 100–200 ms microinteracciones, 200–400 ms transiciones de vista. Curvas de aceleración suave (ease-out al entrar).
- Un **único momento orquestado** (la carga inicial o una revelación) vale más que efectos en cada sección.
- Respeta `prefers-reduced-motion` y evita parpadeos (<3 por segundo).

## 7. Accesibilidad (piso, no extra)

Objetivo: **WCAG 2.2 nivel AA**. Es la versión vigente y la que citan la mayoría de normativas (incluida la Ley Europea de Accesibilidad, en vigor desde el 28 de junio de 2025, que se apoya en EN 301 549). WCAG 3.0 sigue en borrador; no lo uses como criterio de cumplimiento.

Novedades de 2.2 que se incumplen con frecuencia:
- **2.4.11 Foco no oculto:** el elemento enfocado no puede quedar tapado por cabeceras, banners de cookies o chats.
- **2.5.7 Movimientos de arrastre:** ofrece alternativa sin arrastrar.
- **2.5.8 Tamaño del objetivo:** mínimo 24 × 24 px (con excepciones para enlaces en línea).
- **3.2.6 Ayuda consistente:** el contacto o la ayuda aparece en el mismo lugar en todas las páginas.
- **3.3.7 Entrada redundante** y **3.3.8 Autenticación accesible.**

Lista base:
- HTML semántico: `header`, `nav`, `main`, `section`, `button` para acciones, `a` para navegación. Un solo `h1`, sin saltos de nivel.
- Todo operable con teclado, orden de foco lógico, `:focus-visible` claro (contraste ≥3:1, grosor ≥2 px).
- Enlace "saltar al contenido".
- Texto alternativo útil en imágenes informativas; `alt=""` en decorativas.
- Etiquetas asociadas a todos los campos; errores anunciados (`aria-live` o `role="alert"`).
- ARIA solo cuando HTML nativo no basta. **Un ARIA mal usado empeora la accesibilidad.**
- Zoom hasta 200 % y reflujo a 320 px sin perder contenido ni scroll horizontal.
- Respeta preferencias del sistema: `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`.
- Vídeo con subtítulos; audio con transcripción.
- No uses *overlays* de "accesibilidad en una línea": no sustituyen un diseño accesible.

## 8. Responsive y contexto de uso

- **Mobile-first.** Diseña primero la vista de 360–390 px y amplía. Revisa 360, 768, 1280 y 1920.
- Breakpoints basados en el contenido (cuando se rompe), no en dispositivos concretos.
- Usa **container queries** para componentes reutilizables y `clamp()` para escalas fluidas.
- Considera entrada táctil, ratón y teclado; no dependas de `hover` para funciones esenciales.
- Contenido largo y tablas: scroll contenido en su propio contenedor, nunca scroll horizontal de página.
- Considera conexiones lentas y pantallas pequeñas, claras y oscuras, y texto más largo (idiomas con +30 % de extensión).

## 9. Sistema de diseño (tokens)

Antes de componer pantallas, define y reutiliza:

| Token | Contenido |
|---|---|
| Color | Fondo, superficie, tinta (primaria, secundaria), borde, acento, estados semánticos; claro y oscuro |
| Tipografía | Familias, escala, pesos, interlineados, interletrado |
| Espaciado | Escala base 4/8 px |
| Forma | 2–3 radios con **jerarquía** (no un único radio para todo), grosores de borde |
| Elevación | Máximo 3 niveles; sombras con tinte del fondo, no gris genérico |
| Movimiento | Duraciones y curvas |
| Iconografía | Un solo set, mismo trazo y tamaño (16/20/24 px) |

Los tokens son variables CSS (`@theme` en Tailwind v4). Nombres por **función** (`--color-superficie`, `--color-acento`), no por valor (`--azul-500`) en la capa de uso.

## 10. Señales de "hecho con IA" y alternativas

Son valores por defecto, no decisiones. Evítalos salvo que el brief los pida.

**Visuales**
- Degradados morado-azul, manchas de color y "glow" como decoración.
- Fondo crema + serif de alto contraste + acento terracota, o negro casi puro + un acento verde ácido.
- Tarjetas idénticas con mismo radio y misma sombra suave para todo el contenido.
- Hero centrado + 3 tarjetas de características + CTA, repetido en cualquier producto.
- Número grande + etiqueta + degradado como hero de estadísticas.
- Imágenes de stock genéricas y abstracciones sin relación con el producto.

**Tipográficos y estructurales**
- Resaltar una sola palabra del titular (cursiva, negrita o color).
- Etiquetas en MAYÚSCULAS con interletrado amplio sobre cada título.
- Numeración 01/02/03 donde el contenido no es una secuencia.
- Cadenas con puntos medios (A · B · C), flechas "→" en cada enlace.
- Monoespaciada solo como adorno en etiquetas pequeñas.

**Copy**
- "Potencia tu flujo de trabajo", "Lleva tu negocio al siguiente nivel", "Soluciones innovadoras".
- Nombres de relleno (John Doe, Acme), testimonios y métricas inventados que suenan perfectos.

**Qué hacer en su lugar**
- Parte del **mundo del sujeto**: sus materiales, vocabulario, objetos y cultura visual. Un taller, una clínica y una fintech no deben verse igual.
- Abre con lo más característico del producto: una demo, una imagen propia, un dato real, una interacción.
- **Gasta la audacia en un solo lugar**; el resto, sobrio y disciplinado.
- Prefiere fotografía real, ilustración propia o elementos con textura sobre stock genérico.
- Detalles hechos a mano (ilustraciones, tipografía con rasgos, imperfección controlada) diferencian frente a lo "pulido pero igual".
- Las tendencias (neobrutalismo, vidrio líquido, tipografía cinética, 3D) se usan como acento y solo si encajan con el sector. En salud, legal, finanzas o B2B, la contención suele transmitir confianza; en lectura prolongada, prioriza legibilidad.

## 11. Patrones oscuros (prohibidos)

No diseñes: cancelaciones escondidas o más difíciles que la alta, casillas premarcadas para consentimientos o suscripciones, falsa urgencia o escasez, "confirmshaming" (textos que culpan al rechazar), costes ocultos hasta el último paso, botones de rechazo de cookies ocultos o menos visibles que el de aceptar, y publicidad disfrazada de contenido.

## 12. Contenido y copy de interfaz

- Escribe desde la perspectiva del usuario, con **voz activa** y verbos claros. Mayúscula solo inicial (sentence case).
- Una acción conserva su nombre en todo el flujo: el botón "Publicar" produce el aviso "Publicado".
- Cada elemento escrito hace **un** trabajo. Si no ayuda a entender o actuar, se quita.
- **Errores:** qué falló + cómo arreglarlo, sin disculpas ni vaguedad ni culpar al usuario ("La contraseña necesita al menos 8 caracteres").
- **Estados vacíos:** invitan a actuar ("Aún no tienes proyectos. Crea el primero").
- **Confirmaciones:** breves y específicas.
- Contenido realista y variado (nombres, cifras, longitudes). Prueba con textos largos y cortos.
- Imágenes con `alt` real; sin texto incrustado en imágenes.

## 13. Rendimiento como parte del diseño

- Objetivos de Core Web Vitals: **LCP ≤ 2,5 s**, **INP ≤ 200 ms**, **CLS ≤ 0,1**.
- Reserva espacio para imágenes, vídeo y fuentes (evita saltos de layout).
- Imágenes en AVIF o WebP, con dimensiones explícitas, `loading="lazy"` fuera del primer pliegue y la imagen principal con prioridad.
- Menos efectos pesados (blur, sombras grandes, vídeos de fondo, shaders) en móvil; ofrece alternativa estática.
- Limita fuentes, scripts de terceros y animaciones que bloqueen el hilo principal.

## 14. Lista de revisión final

**Usabilidad**
- [ ] ¿Se entiende en 5 segundos qué es, para quién y qué hacer?
- [ ] ¿Hay una sola acción primaria clara por vista?
- [ ] ¿Los flujos clave se completan sin pasos innecesarios?
- [ ] ¿Existen estados de carga, vacío, error y éxito?

**Visual**
- [ ] ¿Hay un punto focal y tres niveles de énfasis?
- [ ] ¿Espaciado, radios y tipografía salen de tokens?
- [ ] ¿Una sola cosa memorable y el resto contenido?
- [ ] ¿Se evitó la lista de la sección 10?

**Accesibilidad**
- [ ] Contraste AA, foco visible y no oculto, objetivos ≥24 px (ideal 44 px).
- [ ] Todo funciona con teclado y `prefers-reduced-motion`.
- [ ] Un solo `h1`, semántica correcta, etiquetas y `alt` reales.

**Técnico**
- [ ] Funciona de 360 px a pantalla grande, sin scroll horizontal.
- [ ] LCP/INP/CLS dentro de los objetivos.
- [ ] Sin patrones oscuros ni datos inventados.

## 15. Cierre de cada tarea

Responde en pocas líneas:
1. La dirección de diseño elegida y por qué encaja con el producto y el usuario.
2. Los tokens principales (colores, fuentes, espaciado).
3. Decisiones de UX relevantes (flujo, jerarquía, estados).
4. Qué se evitó del genérico y qué falta por aportar (imágenes, copy real, datos).
