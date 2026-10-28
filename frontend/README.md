# Frontend

Svelte 4 + Vite 5 + D3.js 7. Sitio estático, sin servidor. Requiere Node 18+.

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # tests (node --test)
npm run build     # producción en dist/
npm run preview   # sirve dist/ en :4173
```

Despliegue: Vercel (`vercel.json`) con raíz del proyecto en `frontend/`; también sirve Netlify o Cloudflare Pages (build `npm run build`, salida `dist`).

## Estructura
```
src/      App.svelte, components/ (y slides/), stores/, utils/, styles/
public/   data/ (cohorts.json, reporte_validacion.md), fonts/, images/
tests/    calculos, narrativeEngine, regresión
```

## Datos
Lee `public/data/cohorts.json`, generado por `../backend`. Si regeneras los datos, copia también `backend/data/reporte_validacion.md` a `public/data/`.

## Privacidad
Sin cookies, sin analítica, sin terceros. Tipografías autoalojadas. Solo `sessionStorage` efímero para no repetir el recorrido guiado. Lenguaje descriptivo, sin resultados por partido ni llamados a votar.
