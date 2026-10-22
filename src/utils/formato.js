/**
 * Utilidades de formato y texto dinámico
 * Para mantener neutralidad y consistencia en el sitio
 */

/**
 * Formatear porcentaje exacto (siempre mostrar número exacto en texto)
 * CRÍTICO: Requisito del README - mostrar % exacto aunque visualmente sea redondeado
 * @param {number} pct - Porcentaje
 * @returns {string}
 */
export function formatExactPercent(pct) {
  if (pct === null || pct === undefined) return '0.0%';
  
  // Siempre 1 decimal mínimo
  return pct.toFixed(1) + '%';
}

/**
 * Generar texto de comparación generacional
 * NEUTRAL: no causal, descriptivo
 * @param {Object} comparison - Datos de comparación
 * @returns {string}
 */
export function generateComparisonText(comparison) {
  if (!comparison) return '';
  
  const { current, previous } = comparison;
  
  if (!previous || previous.length === 0) {
    return `Tu generación participó ${formatExactPercent(current.participacion)} en ${current.year}.`;
  }
  
  // Comparar con la generación anterior más cercana
  const prev = previous[previous.length - 1];
  const diff = current.participacion - prev.participacion;
  const absDiff = Math.abs(diff);
  
  if (diff > 0.5) {
    return `A los ${current.age} años, tu generación participó ${formatExactPercent(current.participacion)} en ${current.year}, ${absDiff.toFixed(1)} puntos porcentuales por encima de quienes tenían ${prev.age} años en ${prev.year} (${formatExactPercent(prev.participacion)}).`;
  } else if (diff < -0.5) {
    return `A los ${current.age} años, tu generación participó ${formatExactPercent(current.participacion)} en ${current.year}, ${absDiff.toFixed(1)} puntos porcentuales por debajo de quienes tenían ${prev.age} años en ${prev.year} (${formatExactPercent(prev.participacion)}).`;
  } else {
    return `A los ${current.age} años, tu generación participó ${formatExactPercent(current.participacion)} en ${current.year}, prácticamente igual que quienes tenían ${prev.age} años en ${prev.year} (${formatExactPercent(prev.participacion)}).`;
  }
}

/**
 * Generar texto para Silla Vacía
 * @param {number} filled - Número de asientos llenos
 * @param {number} pct - Porcentaje exacto
 * @param {string} entidad - Nombre de la entidad
 * @returns {string}
 */
export function generateSillaVaciaText(filled, pct, entidad) {
  return `${filled} de 100 personas de tu generación en ${entidad} participaron en 2024 (${formatExactPercent(pct)})`;
}

/**
 * Formatear rango de cohorte
 * @param {number} min - Año mínimo
 * @param {number} max - Año máximo
 * @returns {string}
 */
export function formatCohortRange(min, max) {
  return `${min}–${max}`;
}

/**
 * Generar texto de leyenda para pseudo-cohorte
 * @returns {string}
 */
export function getPseudoCohortDisclaimer() {
  return 'Nota metodológica: Este análisis sigue grupos de edad entre elecciones, no personas individuales. La lista de personas registradas para votar cambia por altas, bajas y cambios de domicilio.';
}

/**
 * Generar rango de años para selector
 * @param {number} min - Año mínimo
 * @param {number} max - Año máximo
 * @returns {Array<number>}
 */
export function generateYearRange(min, max) {
  const years = [];
  for (let year = max; year >= min; year--) {
    years.push(year);
  }
  return years;
}

/**
 * Generar texto de citación
 * @returns {string}
 */
export function getCitationText() {
  return 'Fuente: Instituto Nacional Electoral (INE). Conteos Censales de Proceso Constitucional 2009–2024. Datos Abiertos.';
}
