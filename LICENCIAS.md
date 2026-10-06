# Inventario de Dependencias y Licencias

Este documento lista todas las dependencias del proyecto y sus respectivas licencias, cumpliendo con los requisitos de transparencia del Hackathon INE 2026.

## Dependencias de Producción

### D3.js v7.9.0
- **Licencia:** ISC License
- **Propósito:** Visualización de datos (gráficos de línea de vida)
- **URL:** https://d3js.org/
- **Licencia verificada:** Compatible con uso comercial y modificación
- **Tipo:** MIT/ISC (permisiva)

## Dependencias de Desarrollo

### Vite v5.0.0
- **Licencia:** MIT License
- **Propósito:** Build tool y bundler
- **URL:** https://vitejs.dev/
- **Tipo:** Permisiva

### Svelte v4.2.0
- **Licencia:** MIT License
- **Propósito:** Framework de componentes UI
- **URL:** https://svelte.dev/
- **Tipo:** Permisiva

### @sveltejs/vite-plugin-svelte v3.0.0
- **Licencia:** MIT License
- **Propósito:** Integración de Svelte con Vite
- **URL:** https://github.com/sveltejs/vite-plugin-svelte
- **Tipo:** Permisiva

## Tipografías

### Google Fonts: Outfit + Inter
- **Fuentes:** Outfit (headings, 600–800) e Inter (body, 400–700)
- **Licencia:** SIL Open Font License 1.1
- **Propósito:** Tipografía del sitio (vía Google Fonts, `display=swap`, con fallback a system fonts)

## Recursos Propios

### Iconos SVG
- **Autor:** Equipo del proyecto
- **Licencia:** Creación propia
- **Ubicación:** `src/assets/icons/`

### Estilos CSS
- **Autor:** Equipo del proyecto
- **Licencia:** Creación propia
- **Ubicación:** `src/styles/`

### Componentes Svelte
- **Autor:** Equipo del proyecto
- **Licencia:** Creación propia
- **Ubicación:** `src/components/`

## Datos

### Conteos Censales de Proceso Constitucional (CCPC) 2009–2024
- **Fuente:** Instituto Nacional Electoral (INE)
- **Licencia:** Datos Abiertos del Gobierno de México
- **URL:** https://www.ine.mx/
- **Formato:** CSV procesados a JSON
- **Ubicación:** `data/cohorts.json`
- **Nota:** Datos agregados públicos; sin información personal

## Cumplimiento de Requisitos

✅ **Todas las licencias son permisivas** (MIT, ISC, BSD, Apache 2.0)
✅ **Cero dependencias con restricciones GPL** (que requerirían código abierto obligatorio)
✅ **Cero dependencias de analítica** (Google Analytics, Mixpanel, etc.)
✅ **Cero dependencias de tracking** (cookies de terceros)
✅ **Tipografías** con licencia abierta (Google Fonts SIL OFL) y fallback a system fonts
✅ **Peso total < 1 MB** (verificar con `npm run build`)

## Verificación de Licencias

Ejecutar para verificar todas las licencias:

```bash
npm list --depth=0
```

## Auditoría de Seguridad

```bash
npm audit
```

## Fecha de Verificación

- **Última revisión:** 29-sep-2026
- **Revisado por:** Equipo de Desarrollo
- **Estado:** Todas las dependencias cumplen con requisitos del hackathon

## Notas Legales

Este proyecto es propiedad del equipo participante del Hackathon INE 2026, Reto 3. Los derechos patrimoniales serán cedidos al INE según lo establecido en la Carta de Cesión de Derechos firmada.

**Restricción:** No se debe publicar este repositorio con licencia abierta antes de los resultados del hackathon (ver §8 del PRD v3).

---

**Última actualización:** 29-sep-2026
