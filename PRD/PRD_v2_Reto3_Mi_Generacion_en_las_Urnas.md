# PRD v2: "Mi Generación en las Urnas"
**Hackea la participación · Reto 3 (Storytelling con datos) · v2.0 · 27-sep-2026 · Estado: listo para desarrollo**

> **Qué cambió vs v1:** se verificó la plataforma CCPC (ya no hay supuestos sobre los datos); se corrigió el denominador ("participación entre la lista nominal", no "entre toda la población"); se corrigió la lógica de cohortes por tipo de elección; se eliminó el nombre "Wrapped" (marca ajena), el uso de logos INE y la licencia abierta (choca con la cesión de derechos); se quitó el contrafactual causal; se añadieron arquitectura, esquema de datos, historias de usuario con criterios de aceptación y definición de terminado.

## 1. Datos verificados (fuente: página oficial CCPC + Manual de uso, INE)
| Hecho | Implicación para el producto |
|---|---|
| Elecciones federales **2009, 2012, 2015, 2018, 2021, 2024** | 6 puntos. Dos familias: **intermedias** (2009, 2015, 2021) y **presidenciales** (2012, 2018, 2024). El propio INE compara cada familia por separado |
| Desagregación por entidad, distrito federal y local, municipio, **sección**, sexo, **edad**, etapa de vida, **grupo quinquenal** (18-19, 20-24, …, 100+), tipo de sección, población indígena/afromexicana | Cohortes por edad y entidad son viables |
| Indicadores: **lista nominal, sí votaron, no votaron**; % participación = sí votaron / (sí votaron + no votaron) | Usamos esa fórmula exacta; el denominador es la **lista nominal**, no toda la población |
| Bases descargables por elección (.zip, "DatosAbiertos_DECEyEC_ConteosCensales20XX") y base **estática** | Pipeline reproducible y sitio sin servidor |
| Cartografía con corte a **mayo de 2023**; "No binario" solo existe en 2024; hay "votos no especificados" | No segmentar por sexo en el MVP; notas metodológicas visibles |
| Existe además el Proceso Extraordinario del Poder Judicial 2024-2025 (otra base) | **Fuera de alcance**: no es comparable con las federales |

**Único punto que sigue por confirmar (Puerta G0):** si el .zip trae edad **simple** (1 año) o solo grupos quinquenales. No pude descargar los archivos desde mi entorno. El manual muestra el filtro de "Edad" por rango, por lo que es probable que exista. Define Plan A o B (§7).

## 2. Resumen del producto
Micrositio donde la persona elige **año de nacimiento y entidad** (sin datos personales) y obtiene la historia de su generación en las urnas: línea de vida cívica 2009–2024, comparación con otras generaciones **a la misma edad**, visual "la silla vacía" y una **tarjeta compartible**.

**Pregunta que responde:** ¿la participación baja por ser joven, o por ser de esta generación? **Mensaje central:** *"La participación se aprende elección tras elección. Mira cómo lo ha hecho tu generación."* Tono neutral: sin partidos, candidatos ni resultados.

**Objetivo del reto (INE):** material educativo y de divulgación que traduzca datos a mensajes comprensibles.

## 3. Público
Primario: 18–29 años (incluye quien acaba de tramitar su credencial). Secundario: 30–45 y docentes de civismo. Institucional: DECEyEC, Juntas Locales, ENCÍVICA.

## 4. Alcance
**MVP (obligatorio para el 31-oct):** F1–F5, F7 y F9 (ver §6). **Extras solo si sobra tiempo:** modo "primera vez" pulido, versiones por entidad para Juntas Locales.
**Fuera de alcance:** cuentas, analítica personal, resultados por partido, predicciones, datos del PJ 2025, voto anticipado/prisión preventiva, segmentación por sexo.

## 5. Reglas metodológicas (no negociables; son el criterio de "solidez")
1. **Definición:** "participación" = % de personas **inscritas en la lista nominal** de ese grupo que sí votaron. Se escribe así en el sitio, sin decir "% de la población".
2. **Generación (cohorte):** grupo de **3 años de nacimiento** (p. ej., 1996–1998) para absorber la imprecisión de ±1 año entre edad a la fecha de elección y año de nacimiento.
3. **Pseudo-cohorte:** se sigue un grupo de edad entre elecciones, **no a personas**; la lista nominal cambia por altas, bajas y cambios de domicilio. Leyenda visible.
4. **Comparar solo dentro de la misma familia de elección** (intermedias con intermedias, presidenciales con presidenciales). Nunca comparar 2018 con 2021 como si fueran equivalentes. La línea de vida se dibuja como **dos trazos** (intermedias / presidenciales).
5. **Edad vs. generación:** comparar el % de participación **a la misma edad** entre elecciones de la misma familia (p. ej., 24–26 años en 2012 vs. 2018 vs. 2024). Redacción **descriptiva**, nunca causal ("en 2024, quienes tenían 25 participaron X puntos por encima/debajo de quienes tenían 25 en 2012").
6. **Tamaño mínimo:** si una celda entidad×cohorte×elección tiene lista nominal menor a 1,000, se muestra el dato nacional con aviso.
7. **Silla vacía:** 100 asientos = 100 personas de **la lista nominal** de tu grupo y entidad; se rellenan redondeando, y **siempre se muestra el % exacto** en texto.
8. **Casos borde:** nacidos después de 2006 (aún sin elección federal en CCPC): mensaje "todavía no tienes elección federal 2009–2024" y se muestra la generación inmediata anterior. Rango de edad muy alto (100+): agrupado. Migración: los datos son de la entidad de registro en lista nominal.
9. **Sin contenido de opinión:** no se dice "deberías votar más"; se dice "así ha sido".

## 6. Requisitos funcionales e historias de usuario
| ID | Historia | Criterio de aceptación |
|---|---|---|
| F1 | Como visitante, elijo año de nacimiento y entidad | Selectores accesibles por teclado; sin login; valida rangos y casos borde (§5.8) |
| F2 | Veo mi **línea de vida cívica** | Dos trazos (intermedias/presidenciales) con % por elección y edad de mi generación en cada una; leyenda de pseudo-cohorte; tabla equivalente accesible |
| F3 | Comparo mi generación con otras a la misma edad | Muestra la comparación de §5.5 con cifra, año y entidad; texto generado por plantilla, revisado por neutralidad |
| F4 | Veo la **silla vacía** | 100 asientos animados por elección; % exacto en texto; respeta `prefers-reduced-motion` |
| F5 | Veo la **brecha** entre entidad y país | Diferencia en puntos porcentuales para mi cohorte (sin lenguaje causal ni hipotético) |
| F6 | Descargo mi **tarjeta** | PNG 1080×1350 generado en el navegador (canvas); sin enviar datos; contiene fuente y URL |
| F7 | Consulto **metodología y fuentes** | Página con definiciones, límites (§5), enlaces a bases INE y fecha de corte de cartografía |
| F8 | Uso el **modo primera vez** (Could) | Para 18 años: tamaño de su generación en lista nominal y su brecha con la anterior |
| F9 | Imprimo/proyecto una **versión de aula/QR** (PDF de 1 hoja) | Incluye QR y actividad de 15 min para docentes |

## 7. Datos y arquitectura
**Puerta G0 (30-sep, responsable: datos).** Descargar los 6 .zip; confirmar por script: (a) columnas de edad (simple o quinquenal), entidad, lista nominal, sí/no votaron; (b) que la suma nacional coincida con los totales publicados en el tablero (tolerancia 0.1%); (c) tamaño de celdas.
- **Plan A (edad simple):** cohortes de 3 años de nacimiento, línea de vida completa.
- **Plan B (solo quinquenal):** pierde la línea de vida por persona; se mantiene **"Tu edad en el tiempo"** (mismo grupo quinquenal a través de elecciones de la misma familia) + silla vacía + tarjeta + brecha por entidad. Mismo producto, el giro pasa a "edad vs. época". Decisión ese mismo día, sin rediseñar UI.

**Pipeline (Python/pandas, un script reproducible):** raw .zip → tabla larga `election_year, entidad_cve, edad, lista_nominal, si_votaron, no_votaron` → agregación por cohorte de 3 años → `data/cohorts.json` (~33 entidades × ~35 cohortes × 6 elecciones; <300 KB) + `data/meta.json` (fechas, notas, versión). Pruebas: la suma de cohortes = total publicado.

**Front-end:** sitio **estático** (Vite + Svelte o React; SVG/D3 ligero para gráficos; canvas para la tarjeta). Hosting estático (Netlify/Cloudflare Pages/GitHub Pages). **Sin cookies, sin analítica de terceros, tipografías autoalojadas.** Copia offline (carpeta `dist/`) incluida en el .zip como respaldo.

**Calidad:** WCAG 2.1 AA (contraste, teclado, lector de pantalla, texto alternativo, sin depender solo del color); Lighthouse ≥ 90 en Rendimiento y Accesibilidad; peso inicial < 1 MB; probado en Android de gama baja, iOS Safari y desktop.

## 8. Propiedad intelectual y neutralidad (para no descalificarse ni frenar la adopción)
- **Cesión:** los derechos patrimoniales pasan al INE por 10 años. Por tanto **no** publicar el repo con licencia abierta antes de los resultados. Usar repo **privado con acceso al INE** o público sin licencia y aclararlo en el README; consultar a vinculacion.deceyec@ine.mx si hay duda.
- **Inventario de licencias** (hoja `LICENCIAS.md`): solo librerías MIT/BSD/Apache, tipografías OFL, íconos propios o de licencia abierta. Nada de recursos con derechos de terceros.
- **Marca:** identidad visual propia; **no usar logos INE ni nombres de marcas de terceros** (p. ej., no llamarlo "Wrapped"). Solo citar "Fuente: INE, CCPC 2009–2024".
- **Neutralidad:** cero datos de resultados por partido o candidato, cero llamados a votar por opciones, revisión con checklist por dos personas.
- **Privacidad:** solo datos agregados del CCPC; los selectores no se guardan.

## 9. Criterios de evaluación → evidencia en el proyecto
| Criterio | Evidencia |
|---|---|
| Apego a la temática | Solo CCPC 2009–2024; prototipo funcional; guion y difusión |
| Claridad y solidez | §5 completo en el sitio y el guion; pruebas de la suma nacional; tablas accesibles |
| Originalidad | Enfoque generacional + silla vacía + tarjeta (no un tablero por estado) |
| Viabilidad institucional | Estático, sin servidores, sin datos personales, pipeline reproducible, bajo costo |
| Potencial de aplicación | Ruta de adopción de §10 con métricas |

## 10. Propuesta de difusión (contenido del guion)
- **QR en Módulos de Atención Ciudadana** al entregar la credencial a personas de 18 años.
- **Aulas:** hoja F9 para docentes (comparar generación propia vs. la de sus padres/madres).
- **Redes INE:** 5 piezas cortas (una por hallazgo) + carrusel + reel de 30 s.
- **32 Juntas Locales:** versión con dato de apertura por entidad (parámetro en URL).
- **Métricas para el INE:** visitas, % que completa el flujo, tarjetas descargadas, escaneos QR por Junta, usos en aula.
- **Fase 2 propuesta:** lenguas indígenas y datos del PJ 2025 como módulo independiente.

## 11. Entregables y checklist de envío (omitir uno = descalificación)
| # | Entregable | Formato / regla | Responsable | Estado |
|---|---|---|---|---|
| 1 | **Registro** (un formulario por equipo) en ine.mx/hackathon-2026 con **carta de cesión anexa** | **Antes del 15-oct** | Representante | ☐ |
| 2 | Presentación ejecutiva | ≤ 10 diapositivas | Narrativa | ☐ |
| 3 | Código / enlace a repositorio | Con acceso para evaluadores (§8) | Desarrollo | ☐ |
| 4 | Carta de cesión de derechos | Firmada por **todas** las personas | Representante | ☐ |
| 5 | Carta declaratoria de decir verdad | Firmada por **todas** las personas | Representante | ☐ |
| 6 | Prototipo visual | Enlace web interactivo **+ PDF/PNG de respaldo** | Diseño/Desarrollo | ☐ |
| 7 | Guion narrativo | 3–5 cuartillas, PDF (Arial/Calibri 11, interlineado 1.5 por seguridad): storyline + difusión (canales, formato, público) | Narrativa | ☐ |
| 8 | Video / pitch | ≤ 3:00, MP4 1080p, enlace (Vimeo, YouTube oculto, Drive/OneDrive) con permisos de lectura, **verificado desde cuenta ajena** | Narrativa/Diseño | ☐ |
| 9 | Envío | Un **.zip** llamado `NombreEquipo_StorytellingConDatos.zip` a **grecia.castro@ine.mx y cirse.rodriguez@ine.mx**, **antes de 23:59 del 31-oct-2026**; el video va como enlace dentro de un .txt/PDF; mantener el .zip liviano (< 15 MB) | Representante | ☐ |

**Requisitos del equipo:** 2 o 4 personas, **paritario** (1+1 o 2+2), 18–35 años cumplidos al cierre, mexicanas, residentes en México, con credencial vigente; sin relación laboral con INE/OPLE, sin cargos partidistas ni candidaturas. Representante con cuenta bancaria propia en institución mexicana. *(La base primera tiene una frase truncada en "Se deberá contar con un"; conviene confirmar por correo que no añade otro requisito.)*

## 12. Video (guion base, ≤ 3:00)
0:00 Gancho: "Nadie nace votando. Se aprende." · 0:15 Demo (año, línea de vida, silla vacía) · 1:15 El giro: edad vs. generación con un hallazgo real · 2:00 Cómo lo usa el INE (QR, aulas, Juntas) · 2:35 Método y transparencia · 2:50 Llamado a explorar.
**Regla:** el hallazgo del guion se escribe **después** de ver los datos; si el efecto generacional es débil, el mensaje cambia a "es un hábito por etapa de vida", igual de publicable.

## 13. Equipo (ejemplo para 4, paritario)
Datos/estadística · Front-end · Diseño/UX + accesibilidad · Narrativa/difusión + coordinación (representante). Con 2 personas: datos+desarrollo y diseño+narrativa.

## 14. Plan (hoy 27-sep; quedan 34 días)
| Fechas | Hito | Puerta de salida |
|---|---|---|
| 27–30 sep | Equipo formado, descarga de datos, **Puerta G0** | Plan A/B decidido |
| 1–7 oct | Pipeline y `cohorts.json`; wireframes; **registro enviado** (no esperar al 15) | Totales cuadran con el tablero INE |
| 8–14 oct | F1, F2, F4 funcionando con datos reales | Demo interna |
| 15–20 oct | F3, F5, F6, F7; hallazgo real y redacción de plantillas | Checklist de neutralidad |
| 21–25 oct | Accesibilidad, rendimiento, pruebas con 10 jóvenes; F9 | Lighthouse ≥ 90 |
| 26–29 oct | Guion, video, presentación, cartas firmadas | Entregables 1–8 completos |
| 30 oct | Ensayo de envío (correo de prueba interno con el .zip) | Enlace del video abierto desde otra cuenta |
| **31 oct** | **Envío antes de las 18:00** (colchón de 6 h) | Confirmación guardada |

## 15. Riesgos
| Riesgo | Prob. | Mitigación |
|---|---|---|
| Solo hay grupos quinquenales | Media | Plan B definido en G0 |
| Conclusión engañosa (edad/generación/tipo de elección) | Media | §5.4–5.5; revisión estadística por 2ª persona |
| Sesgo político percibido | Baja | Checklist de neutralidad; sin resultados por partido |
| Conflicto de licencias con la cesión | Media | §8 |
| Entregable faltante | Media | Checklist §11 con doble revisión |
| Enlace de video sin permisos | Media | Prueba desde cuenta ajena el 30-oct |
| Sobrealcance | Alta | MVP fijo; F8 y extras recortables |

## 16. Definición de terminado
- Todas las cifras del sitio salen de `cohorts.json` y coinciden con el tablero INE (muestreo de 10 casos verificado).
- Un usuario nuevo completa el flujo en < 90 s en su celular.
- El hallazgo principal se entiende en el video en < 30 s.
- Checklist §11 al 100 % y prueba de envío realizada.
