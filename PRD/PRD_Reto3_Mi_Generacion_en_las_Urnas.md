# PRD: "Mi Generación en las Urnas"
**Hackea la participación · Reto 3 (Storytelling con datos) · Versión 1.0 · 27-sep-2026**

## 1. Resumen
Un micrositio donde cualquier persona ingresa **solo su año de nacimiento y su entidad** (cero datos personales) y recibe la historia de su generación en las urnas 2009–2024, contada con los datos agregados de los CCPC. Termina en una **tarjeta compartible** tipo "Wrapped cívico".

**Idea diferenciadora:** casi todos los equipos harán un tablero de "participación por región" o una infografía. Nosotros contamos algo que nadie ve en esos tableros: **cómo se comporta una generación a lo largo del tiempo** (seguimiento de cohortes), y respondemos la pregunta que la gente sí se hace: *¿los jóvenes no votamos porque somos jóvenes, o porque somos de esta generación?*

**Pregunta guía del reto:** ¿Cómo traducir los datos de participación en mensajes comprensibles? → Convirtiendo una tabla en una biografía: "tu generación".

## 2. Problema y oportunidad
- Los datos de participación se presentan por elección y por territorio; la ciudadanía piensa en **personas y etapas de vida**, no en secciones.
- El público joven (18–35, incluido el propio jurado del concurso) desconfía de mensajes institucionales genéricos, pero comparte contenido que habla de *sí mismo*.
- El INE necesita material educativo y herramientas de divulgación (necesidad declarada en el Reto 3).

## 3. Público objetivo
1. **Primario:** jóvenes de 18–29, incluyendo quienes están tramitando su primera credencial.
2. **Secundario:** personas de 30–45 (comparan su generación con la de sus hijos/as) y docentes de civismo.
3. **Institucional:** Juntas Locales, DECEyEC, ENCÍVICA 2024–2026.

## 4. Mensaje central
> **"La participación no es un rasgo de personalidad, es un hábito que se construye elección tras elección. Mira cómo lo ha construido tu generación."**

Tono: neutral, veraz, sin partidos, candidatos ni resultados. Solo participación.

## 5. Experiencia de usuario (flujo de 60 segundos)
1. **Entrada:** "¿En qué año naciste y en qué estado vives?" (dos selectores; sin login, sin cookies de rastreo).
2. **Tu línea de vida cívica:** una línea de tiempo 2009→2024 con las elecciones federales, marcando cuándo tu generación tenía 18, 25, 30, etc. y qué porcentaje participó.
3. **El giro (efecto edad vs. generación):** compara tu generación con la que tenía tu misma edad hace 15 años. Ejemplo de mensaje: *"A tus 24 años, tu generación participó X pts por encima/debajo de quienes tenían 24 en 2009."*
4. **La silla vacía (visual clave):** una cuadrícula de 100 asientos; los asientos "vacíos" son quienes no participaron en tu grupo y entidad. Se anima al avanzar las elecciones. Un solo elemento visual, memorable y preciso.
5. **¿Y si...? (contrafactual honesto):** "Si tu generación en tu entidad hubiera participado como la generación que hoy tiene 50 años a tu edad, habrían sido ~N personas más." Se presenta como **comparación**, nunca como predicción ni culpa.
6. **Tarjeta compartible:** imagen 1080×1350 con 3 datos y un mensaje. Se genera en el navegador (sin enviar nada a servidores).
7. **Cierre:** "Conoce dónde y cómo participar" con enlace a los canales oficiales del INE.

**Modo primera vez (18 años):** variante para quien acaba de sacar credencial: "Tu generación tiene X millones de personas en la lista nominal; sé de las que llegan a la primera elección."

## 6. Requisitos funcionales
| ID | Requisito | Prioridad |
|---|---|---|
| F1 | Selector de año de nacimiento y entidad | Must |
| F2 | Línea de vida con % de participación por elección para la cohorte | Must |
| F3 | Comparativo generación vs. generación a la misma edad | Must |
| F4 | Visual "silla vacía" (100 asientos) | Must |
| F5 | Contrafactual "¿Y si...?" con metodología visible | Should |
| F6 | Tarjeta compartible (PNG) | Must |
| F7 | Vista de metodología y fuentes ("¿de dónde salen estos números?") | Must |
| F8 | Modo primera vez | Could |
| F9 | Versión imprimible/QR para módulos y planteles | Should |

## 7. Requisitos no funcionales
- **Privacidad:** solo datos agregados del CCPC; nada personal se envía ni se almacena. Cumple el requisito de "sin datos personales".
- **Accesibilidad:** WCAG 2.1 AA, contraste alto, texto alternativo, navegación por teclado, lectura en lector de pantalla (la tabla equivalente de cada gráfica).
- **Rendimiento:** sitio estático, <1 MB por vista, funciona en celulares de gama baja y con datos limitados.
- **Neutralidad:** cero contenido partidista; revisión con lista de verificación.
- **Reutilizable:** código abierto y datos preprocesados en CSV/JSON para que el INE lo aloje sin servidores.

## 8. Metodología de datos (punto crítico para "solidez")
1. **Validar primero** qué granularidad ofrece la plataforma CCPC (entidad/distrito/sección, sexo, rangos de edad, elecciones 2009–2024). *Este PRD supone que hay rangos de edad por elección; si no los hay, ver plan B.*
2. **Cohortes sintéticas (pseudo-paneles):** se sigue un rango de edad de una elección a la siguiente (quienes tenían 18–24 en 2009 son ~24–30 en 2015...). **No es seguimiento de personas**: la lista nominal cambia por altas, bajas y cambios de domicilio. Esto se dice explícitamente en el sitio.
3. **Separar edad de generación:** comparar cohortes a la misma edad en distintas elecciones. Considerar que los tipos de elección (presidencial vs. intermedia) cambian el nivel general; **normalizar por tipo de elección** (comparar 2012 con 2018 y 2024; 2009 con 2015 y 2021 por separado) para no fabricar una conclusión falsa.
4. **Incertidumbre visible:** rangos y notas cuando el tamaño de grupo sea pequeño. Se prioriza claridad y precisión sobre efecto visual, como pide la convocatoria.
5. **Plan B (si no hay edad por elección):** pivotar a "Mi Entidad en el tiempo" (línea de vida territorial + silla vacía) manteniendo mecánica, tarjeta y difusión. El equipo lo decide en el día 3.

## 9. Cómo responde a cada criterio de evaluación
| Criterio | Cómo lo cumplimos |
|---|---|
| Apego a la temática | Usa exclusivamente CCPC 2009–2024; responde la pregunta guía con un prototipo funcional |
| Claridad y solidez | Método explícito, pseudo-cohortes declaradas, normalización por tipo de elección, tablas accesibles |
| Originalidad | Enfoque generacional (cohortes) + silla vacía + tarjeta: no es "otro tablero por estado" |
| Viabilidad institucional | Sitio estático, sin infraestructura, sin datos personales, replicable por las 32 Juntas Locales |
| Potencial de aplicación | Se integra a ENCÍVICA, módulos de credencialización, campañas escolares y redes del INE (ver §10) |

## 10. Propuesta de difusión (parte del guion narrativo)
- **Momento de mayor impacto:** QR en los **Módulos de Atención Ciudadana** al entregar la credencial a personas de 18 años: "Conoce a tu generación".
- **Planteles:** kit de una hoja para docentes (actividad de 15 min: cada estudiante compara su generación con la de sus padres/madres).
- **Redes del INE:** serie de 5 piezas cortas (una por hallazgo) + reto "Comparte tu tarjeta". Formatos: carrusel, reel de 30 s.
- **Juntas Locales:** versión por entidad con su propio dato de apertura, en un solo clic.
- **Lenguaje:** español claro; propuesta de adaptación a lenguas indígenas prioritarias como fase 2.
- **Métricas propuestas para el INE:** visitas, % que completa el flujo, tarjetas compartidas, escaneos QR por Junta, uso en aulas.

## 11. Entregables (checklist de descalificación)
**Generales:** ☐ Presentación ≤10 diapositivas ☐ Repositorio/código ☐ Carta de cesión de derechos firmada por todas las personas integrantes ☐ Carta declaratoria de decir verdad firmada por todas.
**Reto 3:** ☐ Prototipo visual (enlace web interactivo + PDF/PNG de respaldo) ☐ Guion narrativo 3–5 cuartillas PDF (storyline + difusión: canales, formato, público) ☐ Video ≤3 min, MP4 1080p, en enlace con permisos de lectura.
**Envío:** un .zip con nombre del equipo y eje ("NombreEquipo_StorytellingConDatos.zip") a grecia.castro@ine.mx y cirse.rodriguez@ine.mx **antes de las 23:59 del 31-oct-2026**.

## 12. Video de 3 minutos (guion base)
- 0:00–0:15 Gancho: "Nadie nace votando. Se aprende. Esta es la historia de tu generación."
- 0:15–1:15 Demo del flujo (año, línea de vida, silla vacía).
- 1:15–2:00 El giro: edad vs. generación, con un hallazgo real.
- 2:00–2:35 Cómo el INE lo despliega (QR en módulos, escuelas, Juntas).
- 2:35–3:00 Método y transparencia + llamado a explorar.

## 13. Equipo y roles (2 o 4 personas, **paritario**)
Ejemplo para 4: (1) datos/estadística, (2) desarrollo front-end, (3) diseño/UX y accesibilidad, (4) narrativa/difusión y coordinación. **Representante de equipo** con cuenta bancaria a su nombre. Todas las personas: 18–35 años, credencial vigente, sin relación laboral con INE/OPLE, sin cargos partidistas.

## 14. Cronograma (hoy es 27-sep; faltan 34 días)
| Fechas | Hito |
|---|---|
| 27–30 sep | Formar equipo paritario, descargar y explorar CCPC, **decidir Plan A o B** |
| **Antes del 15-oct** | **Registro** en ine.mx/hackathon-2026 + carta de cesión adjunta (no esperar a la última semana) |
| 1–10 oct | Limpieza de datos, pseudo-cohortes, primeros hallazgos |
| 11–18 oct | Prototipo web funcional (F1–F4, F6, F7) |
| 19–24 oct | Contrafactual, accesibilidad, pruebas con 10 jóvenes reales |
| 25–28 oct | Guion, video, presentación |
| 29–30 oct | Revisión de checklist, cartas firmadas, prueba del .zip |
| **31 oct** | Envío temprano (meta: antes de las 18:00) |

## 15. Riesgos
| Riesgo | Mitigación |
|---|---|
| CCPC no trae edad por elección | Plan B territorial; decidir en día 3 |
| Conclusión estadística engañosa (edad/generación/tipo de elección) | Normalización, revisión metodológica y lenguaje de "comparación" |
| Percepción de sesgo político | Cero resultados electorales; lista de verificación de neutralidad |
| Cesión de derechos por 10 años sobre el trabajo | Leer la base 11ª antes de registrarse; usar solo materiales y fuentes con licencia propia |
| Faltar un entregable (descalifica) | Checklist §11 y revisión cruzada de dos personas |
| Sobrealcance | Must primero; F8 y F5 son recortables |

## 16. Criterios de éxito
- El jurado entiende el hallazgo en <30 s en el video.
- Una persona sin contexto completa el flujo en <90 s.
- Cada cifra del sitio es trazable a la metodología.
- La propuesta incluye una ruta concreta de adopción por el INE.

## 17. Preguntas abiertas
1. ¿Qué granularidad y desagregación exactas publica la plataforma CCPC? (define Plan A/B)
2. ¿Se puede pedir aclaración a vinculacion.deceyec@ine.mx sobre uso de logos/identidad del INE en el prototipo?
3. ¿Qué hallazgo real emerge? El guion final debe construirse **con el dato**, no antes: si el efecto generación es débil, el mensaje cambia a "es hábito de edad" y sigue siendo publicable.
