# Mi Generación en las Urnas

Micrositio interactivo para descubrir la historia de tu generación en las elecciones federales mexicanas 2009–2024, construido con datos abiertos del INE.

**Hackathon INE 2026 · Reto 3 — Storytelling con Datos**

---

## ¿Qué es?

Una aplicación web estática que permite a cualquier persona responder:

> "¿Qué tan activa ha sido mi edad en las urnas a lo largo de mi vida?"

A partir del año de nacimiento y la entidad federativa, muestra:

- **Línea de Vida Cívica** — participación electoral de tu cohorte en cada elección (intermedias vs presidenciales).
- **Comparación Generacional** — cómo participó tu generación a la misma edad que generaciones anteriores.
- **Silla Vacía** — visualización de 100 asientos con el % de participación exacto.
- **Tarjeta Compartible** — PNG 1080×1350 listo para Instagram Stories, generado localmente.
- **Metodología** — definiciones, límites del análisis y fuentes.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Svelte 4 + Vite 5 |
| Visualización | D3.js 7 |
| Datos | JSON estático (`public/data/cohorts.json`) |
| Pipeline | Python 3 (pandas) |
| Hosting sugerido | Vercel / Netlify / Cloudflare Pages |

## Inicio rápido

```bash
npm install
npm run dev        # http://localhost:5173
```

## Pipeline de datos

Los 6 archivos `.zip` del CCPC del INE van en `data/raw/`. **No se incluyen en el
repositorio** por su tamaño (~50–100 MB); deben descargarse de la fuente oficial
(ver `data/raw/INSTRUCCIONES_ARCHIVOS_ZIP.md`):

```bash
pip install -r pipeline/requirements.txt
python pipeline/pipeline.py data/raw data
python pipeline/cohorts_builder.py data/participacion_edad.json public/data/cohorts.json
```

Salidas:
- `data/participacion_edad.json` — agregado año × entidad × edad (`[LN, SV, NV, NS]`).
- `data/reporte_validacion.md` — validación de totales contra el INE.
- `public/data/cohorts.json` — cohortes de 3 años consumidas por el sitio (~713 KB).

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente en :4173 |
| `npm test` | Ejecuta la suite de tests (node --test) |

## Estructura

```
├── src/
│   ├── components/       # Selector, LineaDeVida, Comparacion, SillaVacia, Tarjeta, Metodologia, WelcomeTour
│   ├── utils/            # data, calculos, formato, a11y
│   ├── styles/           # global.css, responsive.css
│   ├── App.svelte
│   └── main.js
├── public/
│   ├── data/             # cohorts.json, reporte_validacion.md (datos reales del sitio)
│   └── images/           # logos e icono de pestaña
├── data/                 # participacion_edad.json, reporte_validacion.md, raw/ (ZIP, no versionados)
├── pipeline/             # pipeline.py, cohorts_builder.py, requirements.txt
├── tests/                # calculos.test.mjs, regresion_bind_this.test.mjs
├── images/               # Recursos gráficos de origen
├── Frontend/             # Especificaciones y plan de desarrollo del frontend
├── PRD/                  # Documentos de requisitos (v1–v3)
├── Historial/            # Bitácoras de desarrollo, deploy y pruebas
├── actualizaciones/      # Planes de actualización (ver índice README.md)
├── dist/                 # Build de producción (generado por `npm run build`)
├── index.html
├── vercel.json           # Configuración de despliegue
└── .gitignore
```

## Privacidad y neutralidad

- Cero cookies y cero analítica de terceros.
- Sin `localStorage`. Solo se usa `sessionStorage` de forma efímera para no repetir
  el recorrido guiado dentro de la misma sesión; se borra al cerrar la pestaña.
- Todo el procesamiento de datos ocurre en el navegador del usuario.
- **Fuentes**: las tipografías (Inter, Outfit) se cargan desde Google Fonts. Es la
  única petición a un tercero y no implica cookies ni rastreo. (Pendiente: autoalojarlas
  para eliminar la dependencia externa — ver `actualizaciones/pendientes/PENDIENTES.md`.)
- Lenguaje descriptivo, sin resultados por partido ni llamados a votar.

## Documentación

- `INSTALACION.md` — instalación detallada.
- `METODOLOGIA.md` — metodología de cohortes y definiciones.
- `LICENCIAS.md` — inventario de dependencias y datos.
- `Historial/` — bitácora de desarrollo, correcciones y pruebas de escritorio.
- `actualizaciones/README.md` — índice de planes (implementados y pendientes).

## Entregables del Hackathon

Ver `Historial/CHECKLIST_ENTREGA.md`.
