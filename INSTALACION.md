# 🚀 Instrucciones de Instalación

## Requisitos Previos

- **Node.js:** v18.0.0 o superior
- **npm:** v9.0.0 o superior
- **Python:** 3.9+ (para el pipeline de datos)

## Instalación Paso a Paso

### 1. Instalar Dependencias de Node.js

```bash
npm install
```

Esto instalará:
- Vite (bundler)
- Svelte (framework UI)
- D3.js (visualizaciones)
- Plugins necesarios

### 2. Copiar Datos del INE

Copia los 6 archivos .zip del CCPC del INE en:
```
data/raw/
```

Archivos requeridos:
- `DatosAbiertos_DECEyEC_ConteosCensales2009.zip`
- `DatosAbiertos_DECEyEC_ConteosCensales2012.zip`
- `DatosAbiertos_DECEyEC_ConteosCensales2015.zip`
- `DatosAbiertos_DECEyEC_ConteosCensales2018.zip`
- `DatosAbiertos_DECEyEC_ConteosCensales2021.zip`
- `DatosAbiertos_DECEyEC_ConteosCensales2024.zip`

### 3. Ejecutar Pipeline de Datos (Python)

```bash
cd pipeline
python pipeline.py
```

Esto generará `data/cohorts.json` con los datos procesados.

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El sitio estará disponible en: http://localhost:5173

### 5. Build de Producción

```bash
npm run build
```

Genera los archivos optimizados en la carpeta `dist/`

### 6. Vista Previa del Build

```bash
npm run preview
```

## Estructura de Comandos

| Comando | Descripción |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo (hot reload) |
| `npm run build` | Build de producción optimizado |
| `npm run preview` | Vista previa del build |

## Verificación

### Tamaño del Build
```bash
npm run build
# Verificar que dist/ < 1 MB
```

### Lighthouse Score
1. Abrir Chrome DevTools
2. Tab "Lighthouse"
3. Ejecutar auditoría
4. Verificar: Rendimiento ≥ 90, Accesibilidad ≥ 90

### Accesibilidad
- Navegación completa por teclado (Tab, Enter, Escape)
- Contraste de color WCAG 2.1 AA
- Lectores de pantalla compatibles

## Problemas Comunes

### Error: "Cannot find module 'vite'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: Python no encontrado
Instalar Python 3.9+ desde https://www.python.org/

### Error: Datos no cargan
Verificar que `data/cohorts.json` existe y tiene contenido válido

## Soporte

Para preguntas técnicas sobre el sitio:
- Revisar documentación en `README.md`
- Consultar metodología en `METODOLOGIA.md`
- Ver licencias en `LICENCIAS.md`

---

**Última actualización:** 29-sep-2026
