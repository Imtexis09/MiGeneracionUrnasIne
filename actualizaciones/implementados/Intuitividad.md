# Plan de Mejora de Intuitibilidad — Mi Generación en las Urnas

**Fecha:** 09-okt-2026  
**Autor:** Equipo de Desarrollo  
**Objetivo:** Mejorar la experiencia de usuario y hacer que la aplicación sea autoexplicativa para cualquier persona, sin necesidad de leer la metodología o guías previas.

---

## Diagnóstico de Intuitibilidad

Después de revisar a fondo todos los componentes frontend, se identificaron los siguientes aspectos que podrían resultar no intuitivos para usuarios no técnicos:

1. **Flujo de selección confuso**: El formulario "mad libs" requiere comprender que se necesitan dos inputs (año + entidad) antes de ver resultados.
2. **Presentación densa de KPIs**: Tres tarjetas con porcentajes y comparaciones pueden abrumar al usuario promedio.
3. **Gráficos D3 sin leyenda clara**: Líneas y puntos requieren interpretación; usuarios no familiarizados con gráficos políticos pueden no distinguir significados.
4. **Metáfora "silla vacía"**: El concepto de 100 asientos no es inmediatamente comprensible sin explicación.
5. **Generación de tarjeta en canvas**: El usuario no comprende que la tarjeta se genera localmente en tiempo real.
6. **Falta de onboarding**: La aplicación espera que el usuario explore por sí mismo sin indicaciones iniciales.

Los principales cuellos de botella son:
- Comprender que se necesitan 2 inputs (año + entidad)
- Interpretar gráficos D3 sin leyenda explicativa
- Entender la metáfora de "silla vacía"
- Reconocer el concepto de pseudo-cohortes

---

## Plan por Fases

### Fase 1: Onboarding y Flujo Inicial
**Objetivo**: Que el usuario entienda rápidamente que necesita 2 inputs.

| Tarea | Descripción | Componente | Comentario |
|-------|-------------|------------|------------|
| 1.1 | Añadir indicador visual de "2 pasos requeridos" | `Selector.svelte` | Contador de pasos (0/1/2) |
| 1.2 | Mostrar progreso: "Paso 1 de 2 - Año" / "Paso 2 de 2 - Entidad" | `Selector.svelte` | Mensajes dinámicos según estado |
| 1.3 | Mejorar mensaje inicial con contador de pasos completados | `Selector.svelte` | Reemplazar texto estático por dinámico |

### Fase 2: Onboarding Guiado (Welcome Tour)
**Objetivo**: Recorrido explicativo al primer uso.

| Tarea | Descripción | Componente | Comentario |
|-------|-------------|------------|------------|
| 2.1 | Crear componente `WelcomeTour` con 3 pasos secuenciales | Nuevo `WelcomeTour.svelte` | Usa `sessionStorage` para recordar si ya se mostró |
| 2.2 | Paso 1: Explicar que debe elegir año de nacimiento | `WelcomeTour.svelte` | |
| 2.3 | Paso 2: Explicar que debe elegir su entidad federativa | `WelcomeTour.svelte` | |
| 2.4 | Paso 3: Mostrar preview rápido de resultados | `WelcomeTour.svelte` | |
| 2.5 | Añadir botón "Skip" y "Mostrar nuevamente" en configuración | `App.svelte` | Accessible desde el footer |

### Fase 3: Mejoras en KPIs y Presentación
**Objetivo**: Reducir overwhelment informativo.

| Tarea | Descripción | Componente | Comentario |
|-------|-------------|------------|------------|
| 3.1 | Implementar "progressive disclosure" en KPIs | `App.svelte` | Mostrar solo participación % principal inicialmente |
| 3.2 | Añadir tooltips explicativos en cada KPI al hover | `App.svelte` | Texto breve sobre qué significa cada métrica |
| 3.3 | Mover `comparacionFrase` a primer plano | `App.svelte` | Debajo del KPI principal, destacado |

### Fase 4: Claridad Visual en Gráficos
**Objetivo**: Que la Línea de Vida sea autoexplicativa.

| Tarea | Descripción | Componente | Comentario |
|-------|-------------|------------|------------|
| 4.1 | Añadir leyenda fija debajo del gráfico | `LineaDeVida.svelte` | Azul = Presidenciales, Verde/celeste = Intermedias |
| 4.2 | Include rango de edad implícito por cohort | `LineaDeVida.svelte` | "Generación nacida entre X e Y" |
| 4.3 | Mejorar tooltips: hacer fijas en lugar de seguir mouse | `LineaDeVida.svelte` | Mejor legibilidad en móvil |
| 4.4 | Añadir labels a puntos de la gráfica (edad en elección) | `LineaDeVida.svelte` | Tooltip on-click o hover persistente |

### Fase 5: Mejoras en Silla Vacía
**Objetivo**: Clarificar la metáfora de los 100 asientos.

| Tarea | Descripción | Componente | Comentario |
|-------|-------------|------------|------------|
| 5.1 | Añadir texto explicativo arriba: "Estos 100 asientos representan a las 100 personas..." | `SillaVacia.svelte` | Texto introductorio contextualizado |
| 5.2 | Mantener `sillaVaciaText` abajo pero reducir prominencia | `SillaVacia.svelte` | Información secundaria |
| 5.3 | Añadir leyenda de colores: azul = votó, gris = no votó | `SillaVacia.svelte` | Clave visual de interpretación |
| 5.4 | Respetar `prefers-reduced-motion` en animación inicial | `SillaVacia.svelte` | Sin animación para accesibilidad |

### Fase 6: Tarjeta Compartible y Metodología
**Objetivo**: Mejorar entendimiento de la generación de la tarjeta.

| Tarea | Descripción | Componente | Comentario |
|-------|-------------|------------|------------|
| 6.1 | Añadir nota visible: "Se genera en tu navegador, no se envía a servidores" | `Tarjeta.svelte` | Persistente, no solo al generar |
| 6.2 | Mejorar texto del botón: "Generar y descargar tarjeta PNG" | `Tarjeta.svelte` | Más descriptivo |
| 6.3 | Añadir disclaimer de pseudo-cohortes en tarjeta | `Tarjeta.svelte` | Además de Línea de Vida |
| 6.4 | Previsualización con indicador "generando..." | `Tarjeta.svelte` | Estado visual durante creación |

---

## Resumen de Componentes Afectados

| Componente | # Tareas | Complejidad | Horas Estimadas |
|------------|----------|-------------|-----------------|
| `Selector.svelte` | 3 | Baja | 2-3 |
| `WelcomeTour.svelte` | 5 | Media | 4-5 (nuevo componente) |
| `App.svelte` | 3 | Media | 3-4 |
| `LineaDeVida.svelte` | 4 | Media | 4-5 |
| `SillaVacia.svelte` | 4 | Baja | 3-4 |
| `Tarjeta.svelte` | 4 | Baja | 3-4 |
| **Total** | **23** | | **19-25 horas** |

**Orden recomendado de implementación**:  
1. Fases 1-2 (onboarding inmediato - impacto más alto)  
2. Fase 3 (KPIs - segundo impacto)  
3. Fases 4-6 (claridad visual - completan la experiencia)

---

## Éxitos Esperados

Después de implementar este plan:

- ✅ **Nuevo usuario entiende el flujo en menos de 30 segundos**
- ✅ **Ningún KPI resulta abrumador** (progressive disclosure)
- ✅ **Gráficos son autoexplicativos** (leyenda fija, tooltips claros)
- ✅ **Metáfora "silla vacía" es inmediatamente comprensible**
- ✅ **Tarjeta generativa es transparente** (hecho local, sin envío a servidores)
- ✅ **Accesibilidad mejorada** (respeto a `prefers-reduced-motion`)
- ✅ **Reducción de consultas a soporte** sobre "qué significa esto"

---

## Comandos de Referencia

```bash
npm install          # Ya instalado
npm run dev          # Servidor desarrollo con hot reload
npm run build        # Build producción
npm test             # Tests unitarios (12 tests passing)
# Python pipeline (si es necesario para regenerar datos):
python pipeline/pipeline.py data/raw data
python pipeline/cohorts_builder.py data/participacion_edad.json public/data/cohorts.json
```

---