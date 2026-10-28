# Instrucciones para Archivos de Datos Abiertos del INE

## Ubicación de los 6 Archivos ZIP

**Copia los 6 archivos .zip descargados del CCPC del INE en esta carpeta:**

```
backend/data/raw/
```

## Archivos Requeridos

Los 6 archivos que debes descargar desde la página oficial del INE (Conteos Censales de Proceso Constitucional) son:

1. `DatosAbiertos_DECEyEC_ConteosCensales2009.zip`
2. `DatosAbiertos_DECEyEC_ConteosCensales2012.zip`
3. `DatosAbiertos_DECEyEC_ConteosCensales2015.zip`
4. `DatosAbiertos_DECEyEC_ConteosCensales2018.zip`
5. `DatosAbiertos_DECEyEC_ConteosCensales2021.zip`
6. `DatosAbiertos_DECEyEC_ConteosCensales2024.zip`

## Estructura Esperada

Después de copiar los archivos, esta carpeta debe contener:

```
data/raw/
├── DatosAbiertos_DECEyEC_ConteosCensales2009.zip
├── DatosAbiertos_DECEyEC_ConteosCensales2012.zip
├── DatosAbiertos_DECEyEC_ConteosCensales2015.zip
├── DatosAbiertos_DECEyEC_ConteosCensales2018.zip
├── DatosAbiertos_DECEyEC_ConteosCensales2021.zip
└── DatosAbiertos_DECEyEC_ConteosCensales2024.zip
```

## Siguiente Paso

Una vez copiados los archivos ZIP, ejecuta el pipeline de procesamiento:

```bash
python pipeline.py data/raw data
```

Esto leerá los archivos, validará los datos y generará `data/participacion_edad.json`
(agregado año × entidad × edad). Después, `cohorts_builder.py` transforma ese archivo
en `public/data/cohorts.json`, que es el que consume el sitio web.

## Notas Importantes

- **NO descomprimas manualmente** los archivos; el pipeline lo hace automáticamente
- Los archivos .csv descomprimidos se quedarán en `data/raw/` solo durante el desarrollo
- El archivo final (`frontend/public/data/cohorts.json`) es el que usará el sitio web
- Cada archivo .zip contiene datos de Lista Nominal (LN), Sí votaron (SV), No votaron (NV) por edad y entidad
- **Tamaño total aproximado:** ~50-100 MB (los .zip originales no se incluyen en el repositorio por su tamaño)

## Fuente Oficial

Descarga los archivos desde:
- **Página oficial:** https://www.ine.mx/
- **Sección:** Datos Abiertos → Conteos Censales de Proceso Constitucional
