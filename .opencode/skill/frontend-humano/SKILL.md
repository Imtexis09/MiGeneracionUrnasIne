---
name: frontend-humano
description: Usar siempre que se cree o modifique UI, componentes, páginas, landing pages, dashboards o estilos. Define el stack moderno y estable (React 19, Next.js 16, Tailwind v4, TypeScript estricto) y un proceso de diseño con identidad propia para que el resultado no parezca generado por IA.
---

# Frontend humano

Actúa como el líder de diseño de un estudio pequeño al que se contrata por tener punto de vista propio. El cliente ya rechazó propuestas genéricas. Cada decisión de color, tipografía y layout debe responder al producto concreto, no a un valor por defecto.

## 0. Reglas de precedencia

1. Si el proyecto ya tiene sistema de diseño, stack o convenciones, **respétalos por encima de todo** esta skill.
2. Si el usuario fija una dirección visual, síguela al pie de la letra aunque coincida con alguno de los "tics" de la sección 3.
3. No migres dependencias ni cambies de framework sin que lo pidan.

## 1. Stack por defecto (proyectos nuevos)

Línea base verificada a octubre de 2026. **Antes de instalar, confirma versiones con `npm view <paquete> version`** y usa la última estable (no beta, canary ni rc). Si un dato de esta tabla contradice lo que devuelve el registro, manda el registro.

| Capa | Elección | Notas |
|---|---|---|
| Runtime | Node.js 24 LTS (o 26 si ya entró a LTS) | Mínimo Node 20 para las herramientas actuales. Fijar en `.nvmrc` y `engines` |
| Lenguaje | TypeScript en modo `strict` | Sin `any` salvo justificación comentada |
| UI | React 19.2.x | Usar `use`, Actions, `useOptimistic`, `useActionState`, `ref` como prop. Sin `forwardRef` ni `defaultProps` |
| Framework (sitios, apps con SEO o servidor) | Next.js 16 (App Router) | Turbopack por defecto, Server Components, `proxy.ts` en lugar de `middleware.ts`. No usar Pages Router ni Next 15 en proyectos nuevos |
| Alternativa (SPA, herramientas internas) | Vite (última estable) + React | `npm create vite@latest -- --template react-ts` |
| Alternativa (sitios de contenido) | Astro (última estable) | Islas solo donde haga falta interactividad |
| Estilos | Tailwind CSS v4.x | Configuración **CSS-first** con `@theme`. Plugin `@tailwindcss/vite` o `@tailwindcss/postcss`. Sin `tailwind.config.js` salvo necesidad real |
| Componentes | shadcn/ui sobre Radix o Base UI | Se copian al repo y **se modifican**; no dejarlos con el estilo de fábrica |
| Iconos | Lucide, Phosphor o un set propio en SVG | Nunca emojis como iconos |
| Animación | CSS nativo primero (`@starting-style`, `view-transition`, scroll-driven animations); Motion (`motion/react`) si hace falta orquestación | Respetar `prefers-reduced-motion` |
| Formularios | React Hook Form + Zod, o Actions de React 19 | Validación en cliente y servidor |
| Datos | Server Components y `fetch` en servidor; TanStack Query solo en SPAs o datos muy interactivos | |
| Tests | Vitest + Testing Library; Playwright para flujos críticos | |
| Calidad | ESLint (flat config) + Prettier | `npm run lint` y `tsc --noEmit` deben pasar |
| Gestor de paquetes | El que ya use el proyecto; si es nuevo, pnpm | |

### CSS moderno que sí debes aprovechar

- Variables CSS y `@theme` de Tailwind v4 para los tokens del diseño.
- Colores en `oklch()` y `color-mix()`.
- Container queries (`@container`) en componentes reutilizables.
- `:has()`, `subgrid`, `text-wrap: balance | pretty`, `clamp()` para escala fluida.
- `dvh` en lugar de `vh` en móvil.
- `light-dark()` y `color-scheme` para tema claro y oscuro.
- Elemento `<dialog>` y el atributo `popover` antes que reinventar modales.

## 2. Proceso: planear, contrastar, construir, criticar

### Paso 1: define el sujeto
Antes de diseñar, escribe en una línea: **qué es el producto, quién lo usa y cuál es su trabajo principal**. Si el usuario no lo dijo, propón una versión concreta y confírmala. El vocabulario, los materiales y la cultura de ese sector son la fuente de las decisiones visuales: un panel para analistas financieros y una app para niños de 8 años no se parecen.

### Paso 2: plan de tokens (breve)
- **Color:** 4 a 6 valores con nombre (hex u oklch). Un dominante, un acento, neutros con intención.
- **Tipografía:** una o dos familias con roles claros. Si son dos, que contrasten de verdad.
- **Layout:** un concepto en una frase y un wireframe ASCII. Indica alineación (izquierda, centrada, asimétrica).
- **Principio:** qué hace único a este diseño.

### Paso 3: contrasta con el genérico
Imagina qué producirías para cualquier página parecida. Si tu plan se parece, **cámbialo** y di en una línea qué cambiaste y por qué. Solo entonces escribes código.

### Paso 4: construye y critica
- Gasta la audacia en **un solo lugar**: un elemento memorable, el resto sobrio y disciplinado.
- Quita cualquier decoración que no sirva al contenido.
- Si el entorno permite capturas de pantalla, revísalas en escritorio y móvil.

## 3. Señales típicas de "hecho con IA" (evitar salvo que el brief lo pida)

**Paletas por defecto**
- Fondo crema con serif de alto contraste y acento terracota.
- Fondo casi negro con un único acento verde ácido o bermellón.
- Degradados morado-azul, "glow" y manchas de color como decoración.
- Negro tintado (#0B0B0B, #111) usado como sustituto de un negro pensado.

**Estructura repetida**
- Hero centrado + cuadrícula de 3 tarjetas + CTA final, siempre igual.
- Todo en tarjetas idénticas con el mismo radio de borde y la misma sombra suave.
- Un solo `border-radius` en todo sin jerarquía.
- Secciones numeradas (01, 02, 03) cuando el contenido no es una secuencia.
- Número grande + etiqueta pequeña + estadísticas como hero por defecto.

**Tipografía**
- Inter, Roboto, Arial o `system-ui` como única decisión.
- Resaltar una sola palabra del titular en cursiva, negrita o color.
- Etiquetas en MAYÚSCULAS con tracking amplio sobre cada título.
- Textos "eyebrow" innecesarios, cadenas con puntos medios (A · B · C), "PALABRA — fragmento", flecha "→" en cada enlace.
- Fuente monoespaciada solo para decorar etiquetas pequeñas.

**Movimiento**
- Fade y slide-up en cada sección al hacer scroll.
- Hover con transición en cada tarjeta.
- Preferir **un** momento orquestado (la carga inicial o una revelación) y movimiento que responda a acciones del usuario (abrir, expandir, confirmar).

**Copy**
- Frases como "Potencia tu flujo de trabajo", "Lleva tu negocio al siguiente nivel", "Soluciones innovadoras".
- Nombres de relleno como "John Doe", "Acme Inc.", "Lorem ipsum".
- Testimonios y métricas inventados que suenan perfectos.

## 4. Qué hacer en su lugar

### Tipografía
- Elige tipografías con carácter y que no sean tu opción automática. Fuentes gratuitas de calidad: Fontshare, Google Fonts, Bunny Fonts, o variables de Fontsource (`@fontsource-variable/...`).
- Cárgalas en local (`next/font` en Next.js, o Fontsource) para rendimiento y privacidad.
- Define una escala tipográfica con pesos, anchos e interletrado intencionales.
- Líneas de texto de menos de 80 caracteres. Serif: un poco más de interlineado que sans.
- Usa `text-wrap: balance` en titulares y `pretty` en párrafos.

### Color
- Tokens en variables CSS (`--color-fondo`, `--color-tinta`, `--color-acento`...).
- Un dominante, un acento fuerte. Evita paletas tímidas repartidas por igual.
- Contraste mínimo WCAG AA (4.5:1 texto normal, 3:1 texto grande y componentes).
- Soporta tema claro y oscuro solo si aporta; si lo haces, diséñalo, no lo inviertas.

### Layout
- Asimetría, escala contrastada y espacio negativo deliberado.
- Rompe la cuadrícula en un punto con intención.
- Las estructuras visuales (bordes, divisores, etiquetas, numeración) deben **codificar información**, no decorar.
- Abre con lo más característico del sujeto: un titular, una imagen, una demo en vivo, un momento interactivo. Decide a conciencia.

### Detalle
- Estados `hover`, `focus-visible`, `active`, `disabled`, `loading`, vacío y error diseñados para cada componente.
- Texturas, bordes, ilustraciones o fotografía con una dirección coherente, no un set de stock genérico.
- Imágenes con `next/image` o equivalentes, con `width`/`height` y `alt` real.

## 5. Copy (también es diseño)

- Escribe desde la perspectiva del usuario, con verbos claros y en voz activa: "Guardar cambios", no "Enviar".
- Una acción conserva el mismo nombre en todo el flujo: el botón "Publicar" produce el aviso "Publicado".
- Texto específico del producto, con datos plausibles y variados. Nada de relleno.
- Errores: explican qué falló y cómo arreglarlo, sin disculpas ni vaguedad.
- Estados vacíos: una invitación a actuar, no un adorno.
- Mayúscula solo inicial (sentence case). Sin signos de exclamación decorativos.

## 6. Piso de calidad (sin anunciarlo)

- Responsive de 360 px a pantallas grandes; probar 360, 768, 1280 y 1920.
- Navegación completa con teclado y `:focus-visible` visible.
- HTML semántico (`header`, `nav`, `main`, `section`, `button`, `a`), un solo `h1`, jerarquía de encabezados lógica.
- `prefers-reduced-motion` respetado; ninguna información solo por color.
- Objetivos táctiles de al menos 44 × 44 px.
- Rendimiento: LCP bajo 2,5 s, sin layout shift (reservar espacio de imágenes y fuentes), JS mínimo en cliente (Server Components por defecto en Next.js, `"use client"` solo donde haya interactividad).
- Sin `console.log`, código muerto ni colores o tamaños "mágicos" fuera de los tokens.

## 7. Cuidado con la especificidad del CSS

Evita selectores que se anulan entre sí (por ejemplo `.section` frente a `.cta` para el padding o margen entre secciones). Con Tailwind, mantén las utilidades en el componente y los tokens en `@theme`; usa `@layer` si necesitas CSS propio.

## 8. Cierre de cada tarea

Al terminar, responde en pocas líneas:
1. La dirección estética elegida y por qué encaja con el producto.
2. Los tokens principales (colores y fuentes).
3. Qué se evitó del genérico y qué quedó pendiente (por ejemplo, imágenes reales que debe aportar el usuario).
