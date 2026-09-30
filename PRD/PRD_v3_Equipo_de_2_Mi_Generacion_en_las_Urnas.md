# PRD v3 (equipo de 2 personas): "Mi Generación en las Urnas"
**Hackea la participación · Reto 3 (Storytelling con datos) · 27-sep-2026 · Estado: listo para desarrollo**

> **Cambios vs v2:** (1) alcance recortado para 2 personas; (2) roles y horas estimadas; (3) datos 2009 **verificados** con el zip real (Puerta G0 aprobada para 2009); (4) ajustes por hallazgos: edades atípicas, `NS`, casillas especiales; (5) cronograma ajustado a 2 personas con margen.

## 1. Producto en una línea
Micrositio estático donde la persona elige **año de nacimiento y entidad** (sin datos personales) y ve la historia de su generación en las urnas 2009–2024: línea de vida cívica, comparación con otras generaciones **a la misma edad**, "la silla vacía" y una **tarjeta compartible**.
**Mensaje:** *"La participación se aprende elección tras elección. Mira cómo lo ha hecho tu generación."* Tono neutral: sin partidos, candidatos ni resultados.

## 2. Datos verificados
**Fuente:** CCPC 2009–2024, INE (bases por elección en la página oficial de Conteos Censales).
| Hecho | Estado |
|---|---|
| Elecciones 2009, 2012, 2015, 2018, 2021, 2024. Dos familias: **intermedias** (2009, 2015, 2021) y **presidenciales** (2012, 2018, 2024) | Confirmado (INE) |
| Zip 2009: un CSV por entidad; una fila por **sección × sexo × edad simple**. Columnas: `AELEC, FELECCION, EDOCVE, EDONOM, MPIOCVE, MPIONOM, SECCION, TIPOSEC, DEF, DEL, SEXO, EDAD, LN, SV, NV, NS` | **Verificado** |
| `EDAD` = años cumplidos **al día de la elección**; `LN = SV + NV + NS` (cuadra exacto) | **Verificado** |
| Participación nacional 2009 = SV/(SV+NV) = **44.06 %** (32 entidades) | **Verificado** |
| Participación 2009 por edad: 18 años 49 %, 25 años 34 %, 50 años 53 %, 60–70 años ~58 % | **Verificado** (efecto edad visible) |
| Edades atípicas hasta 130; 9 % de celdas entidad×edad con LN < 1,000 (sobre todo edades altas) | **Verificado** → agrupar 90+ |
| No incluye votos en casillas especiales ni residentes en el extranjero; la sección es la del domicilio en la credencial; ~2.4 % de registros `NS` (excluidos del denominador por la fórmula INE) | Documentado por INE → va en Metodología |
| Zips 2012, 2015, 2018, 2021 y 2024 | **Verificado (27-sep)**: misma estructura; 2024 con diferencias de formato (BOM UTF-8, saltos CRLF, fecha `MM/DD/AAAA`, `DEL` vacío, `SEXO` con valor 2 = no binario, solo filas con datos). El pipeline `pipeline.py` ya las maneja |
| Participación nacional SV/(SV+NV): 2009 44.06 %, 2012 62.08 %, 2015 47.07 %, 2018 62.37 %, 2021 51.84 %, 2024 59.67 % | **Verificado**; `LN = SV+NV+NS` en los 6 años |
| `NS` (no especificados) crece: 2.4 % (2009), 0.2 % (2012), 6.1 % (2015), 6.8 % (2018), 4.3 % (2021), 6.4 % (2024) de la LN | Va en Metodología; la fórmula INE los excluye del denominador |

## 3. Reglas metodológicas (no negociables)
1. **Participación** = SV/(SV+NV) **entre personas en lista nominal**, nunca "% de la población".
2. **Generación** = año de nacimiento ≈ `AELEC − EDAD` (±1). Se agrupa en **bandas de 3 años** (p. ej. 1996–1998) para absorber ese ±1.
3. **Pseudo-cohorte:** se sigue un grupo de edad entre elecciones, **no a personas**. Leyenda visible.
4. **Solo comparar dentro de la misma familia** de elección (intermedias con intermedias; presidenciales con presidenciales). La línea de vida se dibuja en **dos trazos**.
5. **Edad vs. generación:** comparar el % **a la misma edad** entre elecciones de la misma familia (ej. 25 años en 2012, 2018, 2024). Lenguaje **descriptivo**, no causal.
6. **Edades:** 18–89 individuales; 90+ agrupado; edades > 100 se descartan como error de registro.
7. **Celdas con LN < 1,000:** se muestra el dato nacional con aviso.
8. **Silla vacía:** 100 asientos = 100 personas de la lista nominal de tu grupo y entidad; se muestra siempre el **% exacto** en texto.
9. **Casos borde:** nacidos después de 2006 (sin elección federal 2009–2024): mensaje amable y se muestra la generación previa. Sexo **no** se usa en el MVP ("No binario" existe solo en 2024).
10. Nada de "deberías votar"; solo "así ha sido".

## 4. Alcance para 2 personas
| ID | Funcionalidad | Prioridad |
|---|---|---|
| F1 | Selector año de nacimiento + entidad (teclado, sin login) | **Must** |
| F2 | Línea de vida cívica (dos trazos + tabla accesible) | **Must** |
| F3 | Comparación a la misma edad entre generaciones (texto por plantilla) | **Must** |
| F4 | Silla vacía (100 asientos, `prefers-reduced-motion`) | **Must** |
| F6 | Tarjeta PNG 1080×1350 en el navegador (canvas) | **Must** |
| F7 | Página de metodología y fuentes | **Must** |
| F5 | Brecha entidad vs. país (puntos porcentuales) | Should |
| F9 | Hoja imprimible/QR para aulas (1 página) | Should |
| F8 | Modo "primera vez" | **Fuera** salvo que sobre tiempo |

**Fuera de alcance:** cuentas, analítica, resultados por partido, predicciones, PJ 2025, voto anticipado, segmentación por sexo, versiones por entidad para Juntas.

## 5. Roles (paritario: **1 mujer + 1 hombre**)
| | Persona A: **Datos + Desarrollo** | Persona B: **Diseño + Narrativa + Coordinación (Representante)** |
|---|---|---|
| Datos | Pipeline, validación, `cohorts.json`, hallazgo | Revisa cifras contra el tablero INE (muestra de 10) |
| Producto | Front-end F1–F4, F6, F7 | UX, wireframes, copy, plantillas de texto, accesibilidad |
| Entregables | Repo, prototipo publicado, respaldo PDF/PNG | Guion, video, presentación, cartas, registro y envío |
| Control | Revisa entregables de B | Revisa entregables de A (**doble revisión cruzada**) |

Nota: el o la **representante** debe tener cuenta bancaria propia en una institución mexicana. Ambas personas: 18–35 años cumplidos al cierre, nacionalidad mexicana, residencia en México, credencial vigente, sin relación laboral con INE/OPLE, sin cargos partidistas ni candidaturas.

**Estimación de esfuerzo (≈ 10–12 h/semana por persona, 5 semanas):** A ≈ 55 h (datos 15, front-end 35, QA 5); B ≈ 50 h (diseño 15, textos 10, video 15, docs y envío 10).

## 6. Arquitectura simple
- **Pipeline (Python/pandas):** por cada CSV, leer solo `EDOCVE, EDAD, LN, SV, NV, NS`, agrupar por entidad × edad → unir años → cohortes de 3 años → `data/cohorts.json` (< 300 KB) + `data/meta.json` (versión, notas). Leer por archivo/bloques (el 2009 pesa 587 MB descomprimido).
- **Pruebas de datos:** (a) suma nacional = total del tablero INE (tolerancia 0.1 %); (b) LN = SV+NV+NS; (c) 10 celdas al azar verificadas contra el tablero.
- **Front-end:** sitio estático (Vite + Svelte o vanilla; SVG propio o D3 mínimo; canvas para tarjeta). Sin cookies, sin analítica de terceros, tipografías autoalojadas. Hosting estático (Netlify/Cloudflare Pages/GitHub Pages). Copia offline en `dist/` para el .zip.
- **Calidad:** WCAG 2.1 AA, Lighthouse ≥ 90 (Rendimiento y Accesibilidad), < 1 MB inicial; probado en Android gama baja, iOS Safari y escritorio.

## 7. Puerta G0: **APROBADA para los 6 años (Plan A)**. Se conserva el script como referencia
Los 6 años traen edad simple por entidad. **Tarea pendiente para A:** comparar los totales nacionales con el tablero INE (tolerancia 0.1 %) y muestrear 10 celdas; usar `pipeline.py` (genera `participacion_edad.json` de ~400 KB y `reporte_validacion.md`). El Plan B ya no aplica.

```python
import pandas as pd, glob
cols = ['EDOCVE','SEXO','EDAD','LN','SV','NV','NS']
fr = []
for f in sorted(glob.glob('*.csv')):
    d = pd.read_csv(f, encoding='latin1', usecols=lambda c: c in cols)
    fr.append(d.groupby(['EDOCVE','EDAD'], as_index=False)[['LN','SV','NV','NS']].sum())
d = pd.concat(fr).groupby(['EDOCVE','EDAD'], as_index=False).sum()
t = d[['LN','SV','NV','NS']].sum()
print(t.to_dict(), '| participación %', round(100*t.SV/(t.SV+t.NV), 2))
print('edad', d.EDAD.min(), d.EDAD.max(), '| entidades', d.EDOCVE.nunique())
```

## 8. Propiedad intelectual y neutralidad
- **Cesión:** derechos patrimoniales al INE por 10 años. **No** publicar el repo con licencia abierta antes de resultados; repo **privado con acceso al INE** o público sin licencia y explicado en el README. Dudas: vinculacion.deceyec@ine.mx.
- **Licencias:** solo librerías MIT/BSD/Apache, tipografías OFL, íconos propios o abiertos; hoja `LICENCIAS.md`.
- **Marca:** identidad propia; sin logos INE ni marcas de terceros ("Wrapped" no se usa). Solo: "Fuente: INE, CCPC 2009–2024".
- **Neutralidad:** sin resultados por partido/candidato; checklist revisado por ambas personas.
- **Privacidad:** solo datos agregados; los selectores no se guardan.

## 9. Criterios de evaluación → evidencia
| Criterio | Evidencia |
|---|---|
| Apego a la temática | Solo CCPC; prototipo funcional; guion y difusión |
| Claridad y solidez | Reglas §3 en el sitio y guion; verificación con tablero INE; tablas accesibles |
| Originalidad | Enfoque generacional + silla vacía + tarjeta |
| Viabilidad institucional | Estático, sin servidores, sin datos personales, reproducible |
| Potencial de aplicación | Difusión §10 con métricas |

## 10. Difusión (para el guion)
- **QR en Módulos de Atención Ciudadana** al entregar la credencial a personas de 18 años.
- **Aulas:** hoja F9 (comparar la generación propia con la de madres/padres).
- **Redes INE:** 5 piezas cortas (una por hallazgo), carrusel y reel de 30 s.
- **Métricas:** visitas, % que completa el flujo, tarjetas descargadas, escaneos QR por Junta, usos en aula.
- **Fase 2:** versiones por entidad para las 32 Juntas, lenguas indígenas, módulo PJ 2025.

## 11. Entregables y envío (omitir uno = descalificación)
| # | Entregable | Regla | Dueño | Revisa | ☐ |
|---|---|---|---|---|---|
| 1 | **Registro** (formulario único) en ine.mx/hackathon-2026 + **carta de cesión anexa** | **Antes del 15-oct** (meta: 5-oct) | B | A | ☐ |
| 2 | Presentación ejecutiva | ≤ 10 diapositivas | B | A | ☐ |
| 3 | Repositorio/código | Acceso para evaluadores (§8) | A | B | ☐ |
| 4 | Carta de cesión de derechos | Firmada por **las 2 personas** | B | A | ☐ |
| 5 | Carta declaratoria de decir verdad | Firmada por **las 2 personas** | B | A | ☐ |
| 6 | Prototipo visual | Enlace web interactivo **+ PDF/PNG de respaldo** | A | B | ☐ |
| 7 | Guion narrativo | 3–5 cuartillas, PDF (Arial/Calibri 11, interlineado 1.5): storyline + difusión (canales, formato, público) | B | A | ☐ |
| 8 | Video/pitch | ≤ 3:00, MP4 1080p, enlace con permisos de lectura (Vimeo, YouTube oculto, Drive/OneDrive), **probado desde otra cuenta** | B | A | ☐ |
| 9 | **.zip** `NombreEquipo_StorytellingConDatos.zip` a **grecia.castro@ine.mx** y **cirse.rodriguez@ine.mx** | **Antes de 23:59 del 31-oct-2026**; liviano (< 15 MB); enlace del video en un PDF/.txt | B | A | ☐ |

*La base primera tiene una frase truncada ("Se deberá contar con un"): confirmar por correo que no agrega requisitos.*

## 12. Hallazgo preliminar (datos reales, nacional; validar con el tablero antes de usarlo)
- **Curva por edad en forma de U, estable:** a los 18 años se participa más; a los 20–30 baja; después sube con la edad. Ejemplo 2024 (presidencial): 18 años 61.5 %, 25 años 46.9 %, 50 años 66.2 %.
- **Todas las edades se mueven juntas entre elecciones del mismo tipo:** en 2024 participaron menos que en 2012 personas de casi todas las edades (18: 66.7→61.5; 25: 52.3→46.9; 50: 70.7→66.2); en intermedias, 2021 supera a 2009 en todas las edades (25: 33.9→39.6). Es decir, cambia la **elección**, no solo la generación.
- **La brecha 25 vs. 50 años es casi constante:** 18.4 pts (2012), 16.5 (2018), 19.3 (2024); 18.9 (2009), 19.9 (2015), 19.6 (2021). **Titular candidato:** *"En 15 años la brecha entre quienes tienen 25 y 50 años casi no ha cambiado: el hábito se construye con la edad."*
- Por eso la línea de vida en zig-zag (p. ej. cohorte nacida en 1992: 56 %, 35 %, 53 %, 40 %, 52 % de 2012 a 2024) **debe** dibujarse en dos trazos (regla §3.4).
- Consecuencia de diseño: F3 pasa a comparar **brecha vs. la edad de referencia (50 años)** en la misma elección, además de la comparación a la misma edad; es más robusta a los efectos de cada elección.

## 13. Video (≤ 3:00)
0:00 Gancho: "Nadie nace votando. Se aprende." · 0:15 Demo (año, línea de vida, silla vacía) · 1:15 El giro: edad vs. generación con un hallazgo real · 2:00 Cómo lo usa el INE (QR, aulas) · 2:35 Método y transparencia · 2:50 Llamado a explorar.
**Regla:** el hallazgo se redacta **después** de ver los datos. Con 2009 ya se observa un fuerte efecto de edad; si al sumar 2012–2024 el efecto generacional es débil, el mensaje pasa a "es un hábito por etapa de vida", igual de publicable.

## 14. Plan de 34 días (hoy 27-sep)
| Fechas | A: Datos + Dev | B: Diseño + Narrativa | Puerta de salida |
|---|---|---|---|
| 27–30 sep | Descargar 5 zips, validar (§7) | Formar equipo, leer bases, wireframes | G0 cerrada; Plan A/B decidido |
| 1–5 oct | Pipeline + `cohorts.json` | **Registro + cartas firmadas**; sistema visual y copy base | **Registro enviado** |
| 6–12 oct | F1, F2 con datos reales | Plantillas de texto, diseño de silla vacía y tarjeta | Demo interna |
| 13–19 oct | F3, F4, F6, F7 | Guion v1, storyboard del video | Prototipo completo (sin pulir) |
| 20–24 oct | Accesibilidad, rendimiento, F5/F9 si hay tiempo | Prueba con **5** jóvenes; ajuste de textos | Lighthouse ≥ 90 |
| 25–28 oct | Repo, respaldo PDF/PNG, `LICENCIAS.md` | Video, presentación, guion final | Entregables 1–8 listos |
| 29–30 oct | Revisión cruzada de entregables | Ensayo de envío + verificar enlace del video | Checklist §11 al 100 % |
| **31 oct** | — | **Envío antes de las 18:00** (colchón de 6 h) | Confirmación guardada |

**Regla de recorte:** si en la semana del 13 de octubre hay retraso mayor a 3 días, se recorta en este orden: F9 → F5 → animaciones de F4 → segunda opción de tarjeta. **Nunca** se recortan F1–F4, F6, F7, ni ningún entregable obligatorio.

## 15. Riesgos
| Riesgo | Prob. | Mitigación |
|---|---|---|
| 2024 u otro año con estructura distinta | Media | Validar en G0; lector adaptable |
| Conclusión engañosa (edad/generación/tipo de elección) | Media | §3.4–3.5; revisión cruzada de la metodología |
| Sobrecarga (solo 2 personas) | **Alta** | Alcance fijo, regla de recorte, horas por semana pactadas |
| Persona clave enferma/no disponible | Media | Documentar todo en el repo; cada quien conoce el trabajo del otro (revisión cruzada) |
| Conflicto de licencias con la cesión | Media | §8 |
| Enlace del video sin permisos | Media | Prueba desde otra cuenta el 30-oct |
| Entregable faltante | Media | Checklist §11 con doble revisión |
| Sesgo político percibido | Baja | Sin resultados por partido; checklist de neutralidad |

## 16. Definición de terminado
- Toda cifra del sitio sale de `cohorts.json` y coincide con el tablero INE (10 casos verificados).
- Una persona nueva completa el flujo en < 90 s en su celular.
- El hallazgo principal se entiende en el video en < 30 s.
- Checklist §11 al 100 % y prueba de envío realizada.
