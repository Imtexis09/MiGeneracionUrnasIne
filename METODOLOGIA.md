# Metodología: Mi Generación en las Urnas

## 📊 Fuente de Datos

### Conteos Censales de Proceso Constitucional (CCPC)
- **Institución:** Instituto Nacional Electoral (INE)
- **Período:** 2009–2024
- **Elecciones incluidas:** 6 procesos electorales federales
  - **Intermedias:** 2009, 2015, 2021
  - **Presidenciales:** 2012, 2018, 2024

### Acceso a Datos Originales
- **Página oficial:** https://www.ine.mx/
- **Sección:** Datos Abiertos → Conteos Censales de Proceso Constitucional
- **Formato:** CSV por año electoral
- **Actualización:** Datos definitivos certificados por el INE

---

## 🔢 Definiciones Clave

### 1. Participación Electoral
```
Participación (%) = 100 × (Sí Votaron) / (Sí Votaron + No Votaron)
```

**Importante:**
- Se calcula **solo entre personas en Lista Nominal**
- NUNCA como "% de la población total"
- Los "No Especificados" (NS) se excluyen del denominador siguiendo la fórmula oficial del INE
- Fórmula: `% = 100 × SV / (SV + NV)`

### 2. Generación (Cohorte)
Una **generación** o **cohorte** agrupa personas nacidas en un rango de **3 años consecutivos**.

**Ejemplo:**
- Cohorte 1998–2000: personas nacidas en 1998, 1999 o 2000

**¿Por qué 3 años?**
- La edad en los datos del CCPC es la edad cumplida **al día de la elección**
- Hay imprecisión de ±1 año (cumpleaños antes/después de la fecha electoral)
- Agrupar en bandas de 3 años absorbe esa imprecisión

**Cálculo:**
```
Año de nacimiento ≈ Año de elección − Edad
Cohorte mínima = (año_nacimiento // 3) × 3
Cohorte máxima = Cohorte mínima + 2
```

### 3. Pseudo-Cohorte (CRÍTICO)
⚠️ **Este análisis NO sigue a las mismas personas entre elecciones.**

Lo que hacemos:
- Seguimos **grupos de edad** en diferentes elecciones
- Comparamos cohortes en momentos distintos de su vida

**Cambios en la Lista Nominal:**
- Altas: nuevos ciudadanos inscritos
- Bajas: defunciones, pérdida de derechos políticos
- Cambios de domicilio entre entidades
- Actualización de credenciales

**Implicación:**
- Las cifras muestran **tendencias generacionales**, no trayectorias individuales
- Es una aproximación válida para análisis agregado

### 4. Familias de Elecciones (NO NEGOCIABLE)

Las elecciones se agrupan en dos **familias**:

#### Elecciones Intermedias
- **Años:** 2009, 2015, 2021
- **Se elige:** Diputados federales (500)
- **Participación promedio:** 40–50%
- **Característica:** menor movilización electoral

#### Elecciones Presidenciales
- **Años:** 2012, 2018, 2024
- **Se elige:** Presidente + Diputados + Senadores
- **Participación promedio:** 60–65%
- **Característica:** mayor movilización electoral

⚠️ **Regla crítica:** Solo se comparan elecciones **dentro de la misma familia**
- ✅ Correcto: comparar 2012 vs. 2018 vs. 2024 (todas presidenciales)
- ❌ Incorrecto: comparar 2018 vs. 2021 (familias distintas)

### 5. Edad vs. Generación
Este proyecto responde la pregunta:
> ¿La participación electoral es baja porque las personas son **jóvenes** (efecto edad), o porque pertenecen a **esta generación** (efecto cohorte)?

**Comparación a la misma edad:**
- Ejemplo: participación a los 25 años en diferentes elecciones
  - Cohorte 1987: 25 años en 2012 → X%
  - Cohorte 1993: 25 años en 2018 → Y%
  - Cohorte 1999: 25 años en 2024 → Z%

**Lenguaje descriptivo (neutral):**
- ✅ "En 2024, a los 25 años, participaron 55.3%"
- ❌ "Los jóvenes no votan porque son apáticos" (causal/prescriptivo)

### 6. Tamaño Mínimo de Muestra
**Regla:** Si una celda `entidad × cohorte × elección` tiene Lista Nominal < 1,000 personas:
- Se muestra el **dato nacional** con un aviso
- Ejemplo: "Dato insuficiente para Puebla (n=450). Mostrando dato nacional (n=12,300)"

**Razón:** muestras pequeñas generan cifras poco confiables

### 7. Casos Borde

#### Nacidos después de 2006
- Aún no tienen 18 años en ninguna elección 2009–2024
- **Acción:** mensaje amable, mostrar generación anterior como referencia

#### Edad > 100 años
- Se agrupan como "100+"
- Muy pocos registros; no afectan análisis

#### Edad < 18 en la elección
- Se excluyen (no podían votar)
- Solo se procesan edades 18–100

#### Segmentación por sexo
- **No disponible** en este MVP
- Razón: "No binario" solo existe en 2024; inconsistencia histórica

---

## 📈 Estructura de Datos Procesados

### Archivo: `data/cohorts.json`

```json
{
  "cohorts": [
    {
      "year_of_birth_min": 1990,
      "year_of_birth_max": 1992,
      "entidad_cve": "09",
      "entidad_nombre": "Ciudad de México",
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
        }
      ]
    }
  ],
  "meta": {
    "version": "1.0",
    "generated_date": "2026-10-01",
    "ccpc_version": "2009-2024",
    "nacional_participacion": {
      "2009": 44.06,
      "2012": 62.08,
      "2015": 47.72,
      "2018": 63.14,
      "2021": 52.66,
      "2024": 59.67
    },
    "validation_status": "passed",
    "notes": "NS excluidos del denominador; cohortes de 3 años; solo edad 18-100"
  }
}
```

### Campos del CCPC Original

| Campo | Descripción |
|---|---|
| `AELEC` | Año de elección (2009, 2012, 2015, 2018, 2021, 2024) |
| `EDOCVE` | Clave de entidad federativa (01–32) |
| `EDAD` | Años cumplidos al día de la elección |
| `LN` | Lista Nominal (personas inscritas) |
| `SV` | Sí votaron |
| `NV` | No votaron |
| `NS` | No especificados |

**Validación obligatoria:**
```python
assert (LN == SV + NV + NS).all()
```

---

## 🎨 Visualizaciones

### 1. Línea de Vida Cívica (F2)
- **Dos trazos separados:** intermedias y presidenciales
- **Eje X:** años de elección
- **Eje Y:** % de participación (0–100%)
- **Interactividad:** hover muestra edad y % exacto
- **Accesibilidad:** tabla equivalente debajo del gráfico

### 2. Silla Vacía (F4)
- **Grid:** 10×10 = 100 cuadros
- **Llenos:** personas que participaron
- **Vacíos:** personas que no participaron
- **Cálculo:** `asientos_llenos = round(participacion_pct)`
- **Texto:** siempre mostrar % exacto (ej: "55.3%")

### 3. Comparación Generacional (F3)
- Compara tu generación con generaciones anteriores **a la misma edad**
- Solo dentro de la misma familia de elecciones
- Muestra diferencia en puntos porcentuales

---

## 🔒 Límites y Advertencias

### Lo que SÍ muestra este sitio:
- ✅ Tendencias de participación por cohorte
- ✅ Comparación edad vs. generación
- ✅ Datos agregados oficiales del INE

### Lo que NO muestra:
- ❌ Seguimiento de personas individuales
- ❌ Resultados por partido político
- ❌ Predicciones o causalidad
- ❌ Datos de elecciones locales
- ❌ Voto anticipado o desde prisión

### Fecha de corte cartográfico:
- **Mayo 2023** (cartografía vigente del INE)

---

## 📚 Cómo Citar

**Formato sugerido:**
> Instituto Nacional Electoral (INE). *Conteos Censales de Proceso Constitucional 2009–2024*. Datos Abiertos. Consultado en: https://www.ine.mx/

**Referencia corta:**
> Fuente: INE, CCPC 2009–2024

---

## 🔗 Enlaces Oficiales

- **INE:** https://www.ine.mx/
- **Datos Abiertos INE:** https://www.ine.mx/transparencia/datos-abiertos/
- **Definiciones:** 
  - Lista Nominal: padrón de ciudadanos con credencial vigente
  - Sección Electoral: unidad geográfica básica
  - Participación: porcentaje de votantes respecto a la lista nominal

---

## ✅ Validación

### Pruebas Realizadas
1. **Totales nacionales** coinciden con tablero oficial INE (tolerancia 0.1%)
2. **Fórmula:** `LN = SV + NV + NS` verificada en todos los registros
3. **Participación 2024:** 59.67% nacional ✓

### Muestra de Validación
- 10 celdas aleatorias verificadas manualmente contra fuente oficial
- Reporte completo: `data/reporte_validacion.md`

---

## 📧 Contacto Técnico

**Preguntas sobre metodología:**
- vinculacion.deceyec@ine.mx

**Acceso a datos originales:**
- Portal de Datos Abiertos del INE

---

**Última actualización:** 29-sep-2026  
**Versión del documento:** 1.0  
**Estado de validación:** Aprobado
