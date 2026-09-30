# 📁 Estructura del Proyecto - Mi Generación en las Urnas

## ✅ Estructura de Directorios Creada

```
mi-generacion-en-las-urnas/
│
├── 📄 README.md                    ← Documentación principal del proyecto
├── 📄 LEEME.md                     ← Instrucciones del paquete hackathon
├── 📄 ESTRUCTURA_PROYECTO.md       ← Este archivo (mapa de carpetas)
├── 📄 .gitignore                   ← (pendiente de crear)
├── 📄 package.json                 ← (pendiente de crear)
├── 📄 vite.config.js               ← (pendiente de crear)
├── 📄 tsconfig.json                ← (opcional, si usas TypeScript)
├── 📄 LICENCIAS.md                 ← (pendiente: inventario de dependencias)
├── 📄 METODOLOGIA.md               ← (pendiente: explicación de cohortes)
│
├── 📁 src/                         ← Código fuente del sitio web
│   ├── 📄 main.js                  ← (pendiente: punto de entrada)
│   ├── 📄 App.svelte               ← (pendiente: componente raíz)
│   │
│   ├── 📁 components/              ← Componentes de la UI
│   │   ├── 📄 Selector.svelte      ← (pendiente: F1 - año + entidad)
│   │   ├── 📄 LineaDeVida.svelte   ← (pendiente: F2 - gráfico)
│   │   ├── 📄 Comparacion.svelte   ← (pendiente: F3 - texto comparativo)
│   │   ├── 📄 SillaVacia.svelte    ← (pendiente: F4 - 100 asientos)
│   │   ├── 📄 Tarjeta.svelte       ← (pendiente: F6 - canvas PNG)
│   │   └── 📄 Metodologia.svelte   ← (pendiente: F7 - fuentes)
│   │
│   ├── 📁 utils/                   ← Lógica de negocio
│   │   ├── 📄 data.js              ← (pendiente: carga cohorts.json)
│   │   ├── 📄 calculos.js          ← (pendiente: cohortes, participación)
│   │   ├── 📄 formato.js           ← (pendiente: % y textos dinámicos)
│   │   └── 📄 a11y.js              ← (pendiente: accesibilidad ARIA)
│   │
│   ├── 📁 styles/                  ← Estilos CSS
│   │   ├── 📄 global.css           ← (pendiente: reset, variables)
│   │   ├── 📄 responsive.css       ← (pendiente: mobile-first)
│   │   └── 📄 dark-mode.css        ← (opcional)
│   │
│   └── 📁 assets/                  ← Recursos estáticos
│       ├── 📁 fonts/               ← Tipografías autoalojadas
│       └── 📁 icons/               ← SVG propios
│
├── 📁 public/                      ← Archivos públicos
│   └── 📄 index.html               ← (pendiente: esqueleto HTML)
│
├── 📁 data/                        ← Datos procesados y sin procesar
│   ├── 📄 cohorts.json             ← (pendiente: salida del pipeline ~300 KB)
│   ├── 📄 meta.json                ← (pendiente: versión, fechas)
│   ├── 📄 participacion_edad.json  ← Datos existentes (del paquete inicial)
│   ├── 📄 reporte_validacion.md    ← Reporte existente (del paquete inicial)
│   │
│   └── 📁 raw/                     ← ⚠️ AQUÍ VAN LOS 6 ARCHIVOS .ZIP ⚠️
│       ├── 📄 INSTRUCCIONES_ARCHIVOS_ZIP.md  ← Guía de archivos ZIP
│       ├── 📦 DatosAbiertos_DECEyEC_ConteosCensales2009.zip  ← (pendiente)
│       ├── 📦 DatosAbiertos_DECEyEC_ConteosCensales2012.zip  ← (pendiente)
│       ├── 📦 DatosAbiertos_DECEyEC_ConteosCensales2015.zip  ← (pendiente)
│       ├── 📦 DatosAbiertos_DECEyEC_ConteosCensales2018.zip  ← (pendiente)
│       ├── 📦 DatosAbiertos_DECEyEC_ConteosCensales2021.zip  ← (pendiente)
│       └── 📦 DatosAbiertos_DECEyEC_ConteosCensales2024.zip  ← (pendiente)
│
├── 📁 pipeline/                    ← Scripts de procesamiento de datos
│   ├── 📄 pipeline.py              ← Script existente (del paquete inicial)
│   ├── 📄 requirements.txt         ← (pendiente: pandas, etc.)
│   ├── 📄 validacion.py            ← (pendiente: pruebas vs tablero INE)
│   └── 📄 README.md                ← (pendiente: instrucciones de uso)
│
├── 📁 tests/                       ← Pruebas automatizadas
│   ├── 📄 calculos.test.js         ← (pendiente: validar cohortes)
│   └── 📄 accesibilidad.test.js    ← (pendiente: WCAG 2.1 AA)
│
├── 📁 dist/                        ← Build de producción (generado por Vite)
│   └── (se genera con `npm run build`)
│
├── 📁 PRD/                         ← Documentos de requisitos del producto
│   ├── 📄 PRD_Reto3_Mi_Generacion_en_las_Urnas.md     ← v1 (histórico)
│   ├── 📄 PRD_v2_Reto3_Mi_Generacion_en_las_Urnas.md  ← v2 (histórico)
│   └── 📄 PRD_v3_Equipo_de_2_Mi_Generacion_en_las_Urnas.md  ← v3 VIGENTE
│
└── 📁 Historial/                   ← Carpeta para versiones/respaldos
```

---

## 🎯 Acción Inmediata Requerida

### ⚠️ PASO 1: Copiar los 6 Archivos ZIP

**Debes copiar los 6 archivos .zip del INE a:**

```
c:\Users\atp09\Downloads\MiGeneracionUrnas\data\raw\
```

**Archivos requeridos:**
1. `DatosAbiertos_DECEyEC_ConteosCensales2009.zip`
2. `DatosAbiertos_DECEyEC_ConteosCensales2012.zip`
3. `DatosAbiertos_DECEyEC_ConteosCensales2015.zip`
4. `DatosAbiertos_DECEyEC_ConteosCensales2018.zip`
5. `DatosAbiertos_DECEyEC_ConteosCensales2021.zip`
6. `DatosAbiertos_DECEyEC_ConteosCensales2024.zip`

### 📥 Cómo Descargarlos

Si aún no tienes los archivos, descárgalos desde:
- **Sitio oficial INE:** https://www.ine.mx/
- **Sección:** Datos Abiertos → Conteos Censales de Proceso Constitucional

---

## 📋 Estado del Proyecto

### ✅ Completado
- [x] Estructura de directorios creada
- [x] Documentación principal (README.md) presente
- [x] Pipeline básico (pipeline.py) existente
- [x] Datos de ejemplo (participacion_edad.json) presentes
- [x] PRDs (versiones 1, 2, 3) documentados
- [x] Instrucciones para archivos ZIP creadas

### ⏳ Pendiente
- [ ] **Copiar 6 archivos .zip del INE** a `data/raw/`
- [ ] Crear `package.json` con dependencias (Vite, Svelte/React, D3.js)
- [ ] Crear `vite.config.js`
- [ ] Crear `.gitignore`
- [ ] Desarrollar componentes de la UI (F1-F7)
- [ ] Escribir utilidades de cálculo y formato
- [ ] Implementar estilos CSS (global, responsive)
- [ ] Crear `LICENCIAS.md` (inventario de dependencias)
- [ ] Crear `METODOLOGIA.md` (explicación de cohortes)
- [ ] Ejecutar pipeline para generar `cohorts.json`
- [ ] Configurar validaciones y pruebas
- [ ] Crear `public/index.html`

---

## 🚀 Próximos Pasos Recomendados

### Semana 1 (Actual: 27-30 sep)
1. ✅ Estructura de directorios creada
2. **📦 Copiar los 6 archivos .zip a `data/raw/`**
3. Validar que el pipeline.py funciona con los datos
4. Formar equipo y asignar roles (si aún no está hecho)

### Semana 2 (1-7 oct)
5. Ejecutar pipeline completo: CSVs → cohorts.json
6. Registro oficial en INE (antes del 15-oct)
7. Crear wireframes de componentes
8. Inicializar proyecto frontend (Vite + Svelte/React)

---

## 📝 Notas Importantes

- La carpeta `data/raw/` está lista para recibir los archivos ZIP
- **NO descomprimas manualmente** los archivos; el pipeline lo hace
- Los archivos .csv se quedarán en `data/raw/` solo para desarrollo
- El archivo final `cohorts.json` (~300 KB) es el que usará el sitio
- La estructura sigue exactamente el README.md oficial del proyecto

---

**Estado:** Estructura lista ✅ | Esperando archivos ZIP 📦
**Fecha:** 29-sep-2026
