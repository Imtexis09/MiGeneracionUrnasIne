# Mi Generación en las Urnas
**Hackathon INE 2026 · Reto 3: Storytelling con Datos**

> Un micrositio interactivo donde cualquier persona descubre la historia de su generación en las urnas 2009–2024, contada con datos agregados del CCPC del INE.

---

## 📋 Descripción General

### Qué es
Un sitio web estático de una sola página (SPA) que permite al usuario:
1. Seleccionar su **año de nacimiento** y **entidad** (estado de México)
2. Recibir una **visualización narrativa** de cómo ha participado su generación en elecciones federales 2009–2024
3. Comparar su generación con otras a la misma edad
4. Descargar una **tarjeta compartible** (PNG 1080×1350)

### Para qué
- **Problema:** datos electorales se presentan por región/elección; la gente piensa en **personas y generaciones**
- **Solución:** convertir una tabla en una biografía: *"Tu generación"*
- **Pregunta guía:** ¿Los jóvenes no votamos porque somos jóvenes, o porque somos de esta generación?
- **Mensaje:** *"La participación se aprende elección tras elección. Mira cómo lo ha hecho tu generación."*

### Público objetivo
- **Primario:** jóvenes 18–29 años
- **Secundario:** personas 30–45 años, docentes de civismo
- **Institucional:** DECEyEC, Juntas Locales, módulos de atención ciudadana del INE

---

## 🎯 Requisitos Funcionales (Must Have)

| ID | Funcionalidad | Descripción |
|---|---|---|
| **F1** | Selector año + entidad | Dropdowns accesibles por teclado; sin login; valida casos borde |
| **F2** | Línea de vida cívica | Dos trazos (intermedias/presidenciales) con % por elección; tabla accesible |
| **F3** | Comparación generacional | Compara a la misma edad entre elecciones de la misma familia |
| **F4** | Silla vacía | 100 asientos animados; respeta `prefers-reduced-motion`; % exacto en texto |
| **F6** | Tarjeta compartible | PNG 1080×1350 generado en canvas (sin enviar a servidores) |
| **F7** | Metodología y fuentes | Página con definiciones, límites, enlaces a bases del INE |

### Should Have
- **F5:** Brecha entidad vs. país (puntos porcentuales)
- **F9:** Hoja imprimible/QR para aulas (1 página PDF)

### Could Have (si sobra tiempo)
- **F8:** Modo "primera vez" para quienes cumplen 18 años

### Out of Scope
- Segmentación por sexo (existió en 2024 pero crearía complejidad innecesaria)
- Resultados por partido/candidato
- Predicciones o análisis causal
- Datos del Poder Judicial 2025
- Voto anticipado/prisión preventiva
- Versiones por entidad para Juntas Locales (fase 2)

---

## 🔧 Requisitos No Funcionales

### Accesibilidad
- **Estándar:** WCAG 2.1 AA
- Navegación completa por teclado (sin ratón necesario)
- Contraste ≥ 4.5:1 (texto normal), ≥ 3:1 (texto grande)
- Texto alternativo para todos los gráficos
- Tablas equivalentes para cada visualización (para lectores de pantalla)
- Soporte para `prefers-reduced-motion` (sin animaciones si el usuario lo prefiere)

### Rendimiento
- **Lighthouse score ≥ 90** en Rendimiento y Accesibilidad
- Tiempo a Interactivo: < 300 ms
- Peso inicial: < 1 MB
- Funciona en Android 5+, iOS 12+
- Funciona con conexiones 3G lentas

### Privacidad
- Solo datos agregados del CCPC; nada personal se envía ni se almacena
- **Cero cookies** de rastreo
- **Cero analítica** de terceros (Google Analytics, Mixpanel, etc.)
- Los selectores (año/entidad) **no se guardan** (ni en localStorage ni sessionStorage)
- Tipografías autoalojadas (no importadas de Google Fonts o CDN externo)

### Neutralidad
- Cero contenido partidista
- Cero resultados electorales por partido
- Cero llamados implícitos a votar
- Lenguaje descriptivo, nunca causal o prescriptivo
- Revisión con **checklist de neutralidad** (doble persona)

### Reproducibilidad
- Pipeline de datos debe ser **reproducible** (código Python + documentación)
- Todo debe correr sin servidor
- Hosting estático (Netlify, Cloudflare Pages, GitHub Pages)
- Copia offline incluida en el .zip final

---

## 🏗️ Arquitectura Técnica

### Stack Recomendado
```
Frontend:
├─ Vite (bundler; rápido, moderno)
├─ Svelte o React (componentes ligeros)
├─ D3.js (gráficos, opcional; recharts también funciona)
├─ Canvas HTML5 (generación de tarjeta PNG)
└─ CSS Puro (sin Tailwind/Bootstrap para mantener < 1 MB)

Datos:
├─ Python 3.9+ (pipeline)
├─ pandas (procesamiento)
└─ JSON (formato final; ~300 KB)

Hosting:
├─ Netlify o Cloudflare Pages (estático, HTTPS, CI/CD)
└─ GitHub Pages (alternativa)

Control de versiones:
└─ Git + GitHub/GitLab (repo privado con acceso INE)
```

### Estructura de Directorios
```
mi-generacion-en-las-urnas/
├── README.md (este archivo)
├── LICENCIAS.md (inventario de dependencias)
├── METODOLOGIA.md (explicación de cohortes y fórmulas)
├── .gitignore
├── package.json (dependencias npm)
├── vite.config.js
├── tsconfig.json (si usas TypeScript)
│
├── src/
│   ├── main.js (punto de entrada)
│   ├── App.svelte (o App.jsx; componente raíz)
│   ├── components/
│   │   ├── Selector.svelte (año + entidad)
│   │   ├── LineaDeVida.svelte (gráfico F2)
│   │   ├── Comparacion.svelte (texto F3)
│   │   ├── SillaVacia.svelte (100 asientos F4)
│   │   ├── Tarjeta.svelte (canvas F6)
│   │   └── Metodologia.svelte (F7)
│   ├── utils/
│   │   ├── data.js (carga cohorts.json)
│   │   ├── calculos.js (lógica de cohortes, participación)
│   │   ├── formato.js (redondeos, %s, texto dinámico)
│   │   └── a11y.js (accesibilidad: ARIA, roles)
│   ├── styles/
│   │   ├── global.css (reset, variables, fuentes)
│   │   ├── responsive.css (mobile-first)
│   │   └── dark-mode.css (si aplica)
│   └── assets/
│       ├── fonts/ (tipografía autoalojada)
│       └── icons/ (SVG propios)
│
├── public/
│   └── index.html (esqueleto)
│
├── data/
│   ├── cohorts.json (salida del pipeline; ~300 KB)
│   ├── meta.json (versión, fechas, notas)
│   └── raw/ (2009-2024 .csv descomprimidos, solo para desarrollo)
│
├── pipeline/
│   ├── pipeline.py (script principal)
│   ├── requirements.txt (pandas, etc.)
│   ├── validacion.py (pruebas contra tablero INE)
│   └── README.md (instrucciones para correr el pipeline)
│
├── dist/ (generado al hacer `npm run build`)
│   ├── index.html
│   ├── index-xxxxx.js (bundled)
│   ├── index-xxxxx.css (bundled)
│   └── data/cohorts.json (copia local)
│
└── tests/
    ├── calculos.test.js (validar cohortes)
    └── accesibilidad.test.js (WCAG 2.1 AA)
```

---

## 📊 Metodología de Datos (CRÍTICA)

### Datos de Entrada
**Fuente:** CCPC (Conteos Censales de Proceso Constitucional) 2009–2024, INE

**Archivos:** 6 CSVs (uno por elección)
- `DatosAbiertos_DECEyEC_ConteosCensales2009.csv`
- `DatosAbiertos_DECEyEC_ConteosCensales2012.csv`
- ... (2015, 2018, 2021, 2024)

**Columnas requeridas:**
```
AELEC        = Año de elección (2009, 2012, ..., 2024)
EDOCVE       = Clave de entidad (01 a 32)
EDAD         = Años cumplidos AL DÍA DE LA ELECCIÓN
LN           = Lista Nominal (personas inscritas)
SV           = Sí votaron
NV           = No votaron
NS           = No especificados (se excluyen del denominador)
```

**Validaciones obligatorias:**
```python
assert (LN == SV + NV + NS).all(), "LN != SV+NV+NS"
assert (SV + NV).sum() == total_nacional_publicado, "Totales no cuadran"
```

### Definiciones (No Negociables)

1. **Participación**
   - Fórmula: `% = 100 × SV / (SV + NV)` **entre personas en lista nominal**
   - NUNCA "% de la población"
   - NS se excluye del denominador (siguiendo la fórmula del INE)

2. **Generación (Cohorte)**
   - Grupo de **3 años de nacimiento** (ej: 1998–2000)
   - Año de nacimiento ≈ `AELEC − EDAD` (±1 año por imprecisión de edad exacta)
   - Se agrupa en bandas para absorber ese ±1

3. **Pseudo-Cohorte**
   - Se **sigue un grupo de edad** entre elecciones, **NO a personas**
   - La lista nominal cambia por altas, bajas y cambios de domicilio
   - **Leyenda visible en el sitio** explicando esto

4. **Familias de Elecciones** (CRÍTICO)
   - **Intermedias:** 2009, 2015, 2021 (participación ~40–50%)
   - **Presidenciales:** 2012, 2018, 2024 (participación ~60–65%)
   - **Solo comparar dentro de la misma familia**
   - La línea de vida se dibuja en **dos trazos separados**
   - Nunca comparar 2018 con 2021 como equivalentes

5. **Edad vs. Generación**
   - Comparar **el % a la misma edad** entre elecciones de la misma familia
   - Ejemplo: participación a los 25 años en 2012 vs. 2018 vs. 2024
   - **Lenguaje descriptivo:** "En 2024, a los 25 años, participaron X %" 
   - NUNCA causal: no decir "por eso jóvenes participan menos"

6. **Tamaño Mínimo**
   - Si una celda entidad×cohorte×elección tiene LN < 1,000 → mostrar dato nacional con aviso
   - Ejemplo: "Puebla, nacidos en 1972: dato nacional (n=1,200)" en vez de "Puebla (n=450)"

7. **Casos Borde**
   - **Nacidos 2007+:** aún sin elección federal en 2009–2024 → mensaje amable, mostrar generación anterior
   - **Edad > 100:** agrupar como "100+"
   - **Edad < 18 en la elección:** excluir (no podían votar)
   - **Sexo:** NO segmentar en el MVP ("No binario" existe solo en 2024)

8. **Silla Vacía**
   - 100 asientos = 100 personas de la LN de tu grupo + entidad
   - Calcular: `asientos_llenos = redondear(participacion% × 100)`
   - **SIEMPRE mostrar el % exacto en texto** (ej: "55% participó" aunque visualmente sean 55.3 asientos)

### Salida del Pipeline

```json
{
  "cohorts": [
    {
      "year_of_birth_min": 1990,
      "year_of_birth_max": 1992,
      "entidad_cve": "01",
      "entidad_nombre": "Aguascalientes",
      "elections": [
        {
          "year": 2009,
          "type": "intermedia",
          "age_on_election": 17,
          "lista_nominal": 45230,
          "si_votaron": 19943,
          "no_votaron": 25287,
          "participacion_pct": 44.06,
          "n_valido": true
        },
        ...
      ]
    },
    ...
  ],
  "meta": {
    "version": "1.0",
    "generated_date": "2026-10-01",
    "ccpc_version": "2009-2024",
    "nacional_participacion": {
      "2009": 44.06,
      "2012": 62.08,
      ...
    },
    "validation_status": "passed",
    "notes": "NS excluidos del denominador; cohortes de 3 años; solo edad 18-100"
  }
}
```

### Pipeline (Script Python)

```python
# pseudo-código; ver pipeline/pipeline.py para versión completa

import pandas as pd
import json
import glob

# 1. LEER
archivos = sorted(glob.glob('data/raw/DatosAbiertos_*.csv'))
dfs = []
for f in archivos:
    año = int(f.split('20')[1][:2])  # extraer año
    df = pd.read_csv(f, usecols=['EDOCVE','EDAD','LN','SV','NV','NS'])
    df['AELEC'] = 2000 + año if año >= 9 else 2000 + año
    dfs.append(df)

datos = pd.concat(dfs, ignore_index=True)

# 2. FILTRAR y VALIDAR
datos = datos[(datos['EDAD'] >= 18) & (datos['EDAD'] <= 100)]
assert (datos['LN'] == datos['SV'] + datos['NV'] + datos['NS']).all()

# 3. COHORTES
datos['year_of_birth'] = datos['AELEC'] - datos['EDAD']
datos['cohorte_min'] = (datos['year_of_birth'] // 3) * 3
datos['cohorte_max'] = datos['cohorte_min'] + 2

# 4. AGREGAR
cohortes = datos.groupby(
    ['cohorte_min', 'cohorte_max', 'EDOCVE', 'AELEC'],
    as_index=False
)[['LN','SV','NV','NS']].sum()

cohortes['participacion_pct'] = 100 * cohortes['SV'] / (cohortes['SV'] + cohortes['NV'])

# 5. SALIDA
output = {
    'cohorts': cohortes.to_dict('records'),
    'meta': { ... }
}

with open('data/cohorts.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"✓ {len(cohortes)} registros de cohortes")
print(f"✓ Participación nacional 2024: {cohortes[cohortes.AELEC==2024]['participacion_pct'].mean():.2f}%")
```

---

## 🚀 Componentes Principales

### 1. Selector (F1)
**Entrada:** año de nacimiento (1940–2006), entidad (32 estados)
- **Validación:** rechaza años futuros o anteriores a 1940
- **Accesibilidad:** dropdowns navegables por teclado, ARIA labels
- **UX:** texto claro ("¿En qué año naciste?"), valores por defecto inteligentes
- **Salida:** { year_of_birth, entidad_cve } → pasa al resto de componentes

### 2. Línea de Vida Cívica (F2)
**Gráfico:** dos trazos independientes (intermedias vs. presidenciales)
- Eje X: elecciones (2009, 2012, 2015, 2018, 2021, 2024)
- Eje Y: % de participación (0–100%)
- **Tabla equivalente:** debajo del gráfico, con los números exactos (accesibilidad)
- **Interactividad:** hover muestra edad de la cohorte en esa elección, % exacto
- **Animación:** respeta `prefers-reduced-motion`
- **Color:** contraste ≥ 4.5:1; sin depender solo del color (usar también patrones)

### 3. Comparación Generacional (F3)
**Entrada:** cohorte seleccionada, elección actual (2024), edad en 2024
**Lógica:**
```
edad_en_2024 = 2024 - año_nacimiento
edad_en_años_anteriores = edad_en_2024 + (2024 - año_anterior)

participacion_cohorte_2024 = % en 2024
participacion_generacion_anterior_a_esa_edad = % en año_anterior

diferencia = participacion_cohorte_2024 - participacion_generacion_anterior_a_esa_edad

Si diferencia > 0:
  texto = f"A los {edad_en_2024} años, tu generación en {entidad} participó {abs(diferencia):.1f} puntos por ENCIMA que quienes tenían {edad_en_2024} años en 2012."
Si diferencia < 0:
  texto = f"...participó {abs(diferencia):.1f} puntos por DEBAJO..."
```
**Salida:** un párrafo de 1–2 líneas, en tono neutral, con cifra exacta

### 4. Silla Vacía (F4)
**Visual:** grid de 10×10 = 100 cuadros
- Cuadros **llenos** (color: entidad participó)
- Cuadros **vacíos** (gris claro: no participaron)
- **Número de llenos:** `redondear(participacion% × 100)`
- **Animación:** cada 1 segundo, se "llena" un nuevo asiento (respetando `prefers-reduced-motion`)
- **Texto debajo:** "X de 100 personas en tu grupo en {entidad} participaron en 2024"
- **Tooltip:** pasar mouse sobre un asiento → "participó" o "no participó"

### 5. Tarjeta Compartible (F6)
**Generación:** en el navegador (HTML5 Canvas, sin servidor)
- **Tamaño:** 1080×1350 px (ratio Instagram Stories)
- **Contenido:**
  - Título: "Mi Generación en las Urnas"
  - 3 cifras clave (año, % participación 2024, brecha vs. 50 años)
  - URL: migenera cionenlasurnas.mx
  - Fuente: "Datos INE, CCPC 2009–2024"
  - Color: identidad visual propia (no logos INE)
- **Descarga:** botón "Descargar tarjeta" → PNG
- **Privacidad:** se genera localmente; no se envía a servidores

### 6. Metodología (F7)
**Página con:**
- Definición de "participación" (SV/(SV+NV))
- Explicación de cohortes y pseudo-cohortes
- Aviso: "no es seguimiento de personas, sino de grupos de edad"
- Límites: edades 18–100, elecciones 2009–2024, solo si LN > 1,000
- Enlaces a:
  - Página oficial CCPC del INE
  - Manual de uso CCPC
  - Definiciones (sección, lista nominal, etc.)
- Fecha de corte: mayo 2023 (cartografía INE)
- Cómo citar: "Fuente: INE, CCPC 2009–2024"

---

## 📦 Entregables (Checklist de Descalificación)

**Omitir UNO = descalificación automática**

| # | Entregable | Formato | Responsable | Fecha Límite |
|---|---|---|---|---|
| 1 | **Registro** en ine.mx/hackathon-2026 + carta de cesión anexa | Formulario web + PDF firmado | Representante | **15-oct** |
| 2 | Presentación ejecutiva | PDF o PPTX, ≤ 10 diapositivas | Diseño + Narrativa | 31-oct |
| 3 | Código / repositorio | GitHub/GitLab privado; acceso para evaluadores | Desarrollo | 31-oct |
| 4 | Carta de cesión de derechos | Firmada por **las 2 personas** | Representante | 31-oct |
| 5 | Carta declaratoria de decir verdad | Firmada por **las 2 personas** | Representante | 31-oct |
| 6 | Prototipo visual | Enlace web interactivo + PDF/PNG de respaldo | Desarrollo | 31-oct |
| 7 | Guion narrativo | 3–5 cuartillas, PDF (Arial/Calibri 11, interlineado 1.5) | Narrativa | 31-oct |
| 8 | Video/pitch | ≤ 3:00 min, MP4 1080p; enlace (Vimeo/YouTube/Drive); **probado desde otra cuenta** | Narrativa | 31-oct |
| 9 | **.zip** para envío | `NombreEquipo_StorytellingConDatos.zip` (< 15 MB) a grecia.castro@ine.mx y cirse.rodriguez@ine.mx | Representante | **antes de 23:59 del 31-oct** |

---

## 📅 Cronograma (34 días: 27-sep al 31-oct)

### Semana 1 (27–30 sep): Validación de Datos
| Tarea | Responsable | Puerta de Salida |
|---|---|---|
| Descargar 6 .zip del CCPC desde la página oficial del INE | A | Archivos locales en `data/raw/` |
| Confirmar estructura: edades simples, entidades, LN/SV/NV/NS | A | Script de lectura funciona sin errores |
| Validar totales nacionales contra tablero INE (tolerancia 0.1%) | A | Reporte de validación (`reporte_validacion.md`) |
| Formar equipo, roles, comunicación (Slack/Discord) | B | Equipo confirmado en registro |
| Leer bases v1–v3 del PRD | A+B | Ambas personas entienden reglas §3 |

### Semana 2 (1–7 oct): Pipeline + Diseño Base + Registro
| Tarea | Responsable | Puerta de Salida |
|---|---|---|
| **Pipeline completo:** CSVs → `cohorts.json` (~300 KB) | A | `data/cohorts.json` con 6 años, validado |
| **Registro INE** + cartas firmadas enviadas | B | Confirmación recibida por grecia.castro@ine.mx |
| Wireframes de los 6 componentes (F1–F7) | B | Mockups en Figma/papel, compartidos con A |
| Paleta de color, tipografía, identidad visual | B | Documento de diseño |
| `LICENCIAS.md`: inventario de dependencias | A | Archivo creado, solo MIT/BSD/Apache/OFL |

### Semana 3 (8–14 oct): Desarrollo Front-end Básico
| Tarea | Responsable | Puerta de Salida |
|---|---|---|
| Repo inicializado (Vite + Svelte/React) | A | `npm install && npm run dev` funciona |
| **F1 (Selector):** dos dropdowns, validación, accesibilidad | A | Demo en localhost:5173 |
| **F2 (Línea de vida):** gráfico de dos trazos con datos reales | A | Gráfico visible, tabla equivalente funciona |
| **F4 (Silla vacía):** grid 10×10 animado (sin F3 aún) | A | 100 cuadros se llenan según participación |
| Demo interna + feedback de B | A+B | Checklist funcional al 50% |

### Semana 4 (15–20 oct): Componentes Restantes + Hallazgo
| Tarea | Responsable | Puerta de Salida |
|---|---|---|
| **F3 (Comparación):** textos dinámicos por plantilla, revisados por neutralidad | A+B | 10 casos probados; checklist de neutralidad ✓ |
| **F6 (Tarjeta):** canvas, descarga PNG, probada en celular | A | Tarjeta funciona offline, sin servidor |
| **F7 (Metodología):** página con definiciones, enlaces, fuentes | B | Página publicada en el sitio |
| **Hallazgo real:** explorar datos, redactar el titular para el video | A+B | Documento: "Hallazgo para el guion" |
| Prueba con 5 jóvenes reales (testers) | B | Feedback recogido, iteraciones planeadas |

### Semana 5 (21–25 oct): Accesibilidad + Pulido + Extras
| Tarea | Responsable | Puerta de Salida |
|---|---|---|
| **Accesibilidad:** WCAG 2.1 AA (contraste, teclado, ARIA, lectores de pantalla) | A | Validación axe-core, Lighthouse ≥ 90 |
| **Rendimiento:** tree-shake, minify, optimizar imágenes, < 1 MB | A | `npm run build` < 1 MB total |
| **F5 (Brecha):** si hay tiempo, agregar puntos porcentuales vs. país | A | Feature opcional, no bloquea |
| **F9 (QR para aulas):** si hay tiempo, hoja imprimible 1 página | A | PDF generado, listo para docentes |
| Respaldo offline: `dist/` en el .zip final | A | Carpeta `dist/` completa |

### Semana 6 (26–29 oct): Video + Guion + Entregables
| Tarea | Responsable | Puerta de Salida |
|---|---|---|
| **Video (≤ 3:00):** guion, grabación, edición, subtítulos | B | MP4 1080p en Vimeo/YouTube privado |
| **Guion narrativo (3–5 cuartillas):** storyline + difusión (canales, público) | B | PDF finalizado |
| **Presentación (≤ 10 diapositivas):** resumen ejecutivo | B | PPTX o PDF |
| **Repo:** documentación, LICENCIAS.md, README en el repo | A | GitHub privado accesible al INE |
| **Doble revisión cruzada:** A revisa entregables de B, B revisa código de A | A+B | Checklist cruzado al 100% |

### Semana 7 (30–31 oct): Envío
| Tarea | Responsable | Puerta de Salida |
|---|---|---|
| Prueba de envío: correo de prueba a grecia.castro@ine.mx con el .zip | B | Confirmación: mail enviado, zip recibido |
| Verificación de enlace del video desde otra cuenta | B | Video abierto sin permisos denegados |
| Último checklist §11: ¿todos los 9 entregables presentes? | A+B | Checklist 100% |
| **ENVÍO:** `NombreEquipo_StorytellingConDatos.zip` < 15 MB **antes de 23:59** | B | Confirmación de envío guardada (screenshot email) |

---

## ⚠️ Reglas Críticas (No Negociables)

1. **Nunca comparar familias de elecciones:** 2018 (presidencial) vs. 2021 (intermedia) es incorrecto
2. **Lenguaje descriptivo, nunca prescriptivo:** "así fue" no "deberías"
3. **Siempre mostrar el % exacto en texto,** aunque visualmente sea redondeado
4. **Pseudocohortes:** aclarar en el sitio que no es seguimiento de personas
5. **LN < 1,000:** mostrar dato nacional con aviso, no datos locales falsos
6. **Cero cookies, cero analítica:** cumplir con privacidad
7. **Cesión de derechos:** no publicar repo con licencia abierta antes de resultados (§8 de PRD v3)
8. **Registro antes del 15-oct:** sin esto, automáticamente descalificado
9. **Doble revisión:** ambas personas revisan entregables de la otra
10. **Envío antes de 23:59 del 31-oct:** después = descalificación

---

## 🧪 Checklist de Calidad (Debe Pasar Antes de Envío)

### Funcionalidad
- [ ] F1: Selector de año (1940–2006) y entidad (32 estados), sin errores de rango
- [ ] F2: Línea de vida muestra dos trazos (intermedias/presidenciales), números correctos
- [ ] F3: Comparación generacional es correcta (misma edad, misma familia de elección)
- [ ] F4: Silla vacía muestra % exacto y respeta `prefers-reduced-motion`
- [ ] F6: Tarjeta PNG se genera, se descarga, contiene fuente INE
- [ ] F7: Metodología explica cohortes, pseudo-cohortes, límites

### Datos
- [ ] Todas las cifras salen de `cohorts.json`
- [ ] 10 celdas al azar coinciden con el tablero INE (muestra de 10)
- [ ] Validación: `LN = SV + NV + NS` ✓
- [ ] Participación nacional 2024 = 59.67 % ✓
- [ ] Sin edades < 18 ni > 100

### Accesibilidad (WCAG 2.1 AA)
- [ ] Contraste ≥ 4.5:1 (texto normal), ≥ 3:1 (texto grande)
- [ ] Navegación completa por teclado (sin ratón)
- [ ] Lectores de pantalla: ARIA labels, roles, tablas equivalentes
- [ ] `prefers-reduced-motion` respetado
- [ ] Lighthouse Accesibilidad ≥ 90

### Rendimiento
- [ ] Lighthouse Rendimiento ≥ 90
- [ ] Tiempo a Interactivo < 300 ms
- [ ] Peso inicial < 1 MB
- [ ] Funciona en Android 5+, iOS 12+ (testear en dispositivo real o emulador)
- [ ] Funciona con 3G simulado (DevTools → Throttling)

### Privacidad + Neutralidad
- [ ] Cero cookies (localStorage, sessionStorage: NO)
- [ ] Cero analítica de terceros (Google Analytics, Mixpanel: NO)
- [ ] Tipografías autoalojadas
- [ ] Checklist de neutralidad completado (sin resultados por partido, sin "deberías", etc.)

### Entregables
- [ ] Repo privado con acceso al INE
- [ ] `LICENCIAS.md` inventariado
- [ ] `METODOLOGIA.md` o sección en README explicando cohortes
- [ ] Video ≤ 3:00, MP4 1080p, enlace probado desde otra cuenta
- [ ] Guion narrativo 3–5 cuartillas, PDF
- [ ] Presentación ≤ 10 diapositivas
- [ ] Cartas de cesión y declaratoria firmadas
- [ ] .zip < 15 MB con todo dentro

### Entrega
- [ ] Prueba de envío realizada (correo de prueba funciona)
- [ ] .zip llamado `NombreEquipo_StorytellingConDatos.zip`
- [ ] Envío a grecia.castro@ine.mx y cirse.rodriguez@ine.mx
- [ ] **Antes de 23:59 del 31-oct**

---

## 🎬 Guion del Video (≤ 3:00)

```
0:00–0:15  GANCHO
"Nadie nace votando. Se aprende."
[Pausa visual: logo del proyecto]

0:15–1:15  DEMO
Pantalla: selector de año (1998) y entidad (Puebla)
"Mira cómo aprendió tu generación."
Muestra secuencialmente:
  - Línea de vida (2 trazos)
  - Silla vacía (100 asientos llenándose)
  - Comparación ("A los 24, X puntos arriba")
Voiceover: "Participación 2009–2024. Elección tras elección."

1:15–2:00  EL GIRO: Edad vs. Generación
Muestra dos líneas: cohorte 1998 vs. cohorte 1972 (a la misma edad)
"La pregunta clave: ¿participan menos porque son jóvenes,
 o porque son de esta generación?"
Voiceover con hallazgo real: [Ej: "La brecha entre 25 y 50 años 
es casi la misma desde 2009. Es un hábito que se construye con la edad."]

2:00–2:35  ADOPCIÓN
"¿Y cómo lo usa el INE?"
Muestra:
  - QR en módulo de credencialización
  - Hoja para aulas (comparar con generación de padres)
  - Redes: tarjeta compartible
Voiceover: "En módulos, en aulas, en redes. Herramientas 
que hablan de ti."

2:35–2:50  MÉTODO + LLAMADO
"¿De dónde salen estos números?"
Muestra página de Metodología (rápido)
"Datos del INE. Transparencia. Sin partidos. Sin agenda."
CTA suave: "Descubre tu generación en las urnas."

2:50–3:00  CIERRE
Logo del proyecto + URL
"Mi Generación en las Urnas · Hackathon INE 2026"
Fade to black.
```

**Notas:**
- Grabado en 1080p, audio claro (sin música que distraiga)
- Subtítulos en español
- Hallazgo final se redacta **después** de ver los datos (no antes)
- Tono: informativo, no político

---

## 📞 Contacto y Preguntas Abiertas

### Contactos Oficiales
- **Vinculación DECEyEC:** vinculacion.deceyec@ine.mx (preguntas sobre datos, logos, metodología)
- **Envío:** grecia.castro@ine.mx y cirse.rodriguez@ine.mx
- **Registro:** ine.mx/hackathon-2026

### Preguntas Frecuentes Técnicas
1. **¿Puedo usar Tailwind/Bootstrap?** Sí, pero mantén < 1 MB total. Mejor: CSS custom properties.
2. **¿Puedo almacenar datos en localStorage?** NO; la privacidad es crítica.
3. **¿Puedo agregar Google Analytics?** NO; es cero analítica.
4. **¿Puedo hacer dark mode?** Sí, siempre que respete contraste WCAG 2.1 AA.
5. **¿Puedo publicar el repo antes de resultados?** Solo si es privado o sin licencia explícita; consulta a vinculacion.deceyec@ine.mx.
6. **¿Qué pasa si un año no tiene edad simple, solo quinquenal?** Plan B ya existe en PRD v2; aquí está confirmado Plan A (edad simple todos los años).

---

## 📚 Referencias

- **Página oficial CCPC:** https://www.ine.mx/
- **Manual de uso CCPC:** [descargable desde la página de Conteos Censales]
- **Base primera del Hackathon:** [revisada en correo oficial del INE]
- **PRD v3 (este proyecto):** PRD_v3_Equipo_de_2_Mi_Generacion_en_las_Urnas.md

---

## ✅ Cómo Usar Este README

1. **Para equipos:** copiar todo este README a la raíz del repositorio
2. **Para agentes de IA:** seguir la estructura § por § en orden cronológico
3. **Para revisores:** usar el checklist §10 como validación final
4. **Para pivotes urgentes:** si surge retraso, ver §14 "Regla de recorte"

---

**Última actualización:** 27-sep-2026  
**Estado:** Listo para desarrollo  
**Equipo:** 2 personas (paritario)  
**Entrega:** Antes de 23:59 del 31-oct-2026

---

**🚀 ¡Que empiece el desarrollo!**
