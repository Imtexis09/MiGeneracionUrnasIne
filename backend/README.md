# Backend (pipeline de datos)

Convierte los Conteos Censales de Proceso Constitucional (CCPC) 2009–2024 del INE en el JSON que consume el frontend. Python 3.9+.

1. Descarga los 6 ZIP del INE en `data/raw/` (ver `data/raw/INSTRUCCIONES_ARCHIVOS_ZIP.md`; no se incluyen por su tamaño).
2. Ejecuta desde esta carpeta:

```bash
pip install -r requirements.txt
python pipeline.py data/raw data
python cohorts_builder.py data/participacion_edad.json ../frontend/public/data/cohorts.json
```

| Archivo | Descripción |
|---|---|
| `pipeline.py` | ZIP del INE → `data/participacion_edad.json` (año × entidad × edad, `[LN, SV, NV, NS]`) y `data/reporte_validacion.md` |
| `cohorts_builder.py` | `participacion_edad.json` → cohortes de 3 años en `../frontend/public/data/cohorts.json` |
| `data/` | Salidas ya generadas y carpeta `raw/` para los ZIP |
