# Paquete Hackathon INE — Reto 3: "Mi Generación en las Urnas"

- `PRD/PRD_v3_Equipo_de_2_...md` — **versión vigente** (equipo de 2 personas, hallazgos y G0 aprobada).
- `PRD/PRD_v2_...md` y `PRD/PRD_Reto3_...md` — versiones anteriores (referencia histórica).
- `pipeline/pipeline.py` — convierte los 6 zips del INE en `data/participacion_edad.json`.
  Uso: `python pipeline/pipeline.py data/raw data`
- `pipeline/cohorts_builder.py` — genera `public/data/cohorts.json` para el sitio.
  Uso: `python pipeline/cohorts_builder.py data/participacion_edad.json public/data/cohorts.json`
- `data/participacion_edad.json` — datos por año, entidad y edad.
- `data/reporte_validacion.md` — tabla de validación por año.

Nota: los .zip originales del INE (2009–2024) no se incluyen en el paquete por su tamaño; descárgalos de la página oficial de Conteos Censales.
