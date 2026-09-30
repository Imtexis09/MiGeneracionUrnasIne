/**
 * Utilidades de formato y texto dinámico
 * Para mantener neutralidad y consistencia en el sitio
 */

/**
 * Formatear número con separadores de miles
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  
  return new Intl.NumberFormat('es-MX').format(num);
}

/**
 * Formatear porcentaje con un decimal
 * @param {number} pct - Porcentaje (0-100)
 * @param {number} decimals - Número de decimales (default: 1)
 * @returns {string} Porcentaje formateado
 */
export function formatPercent(pct, decimals = 1) {
  if (pct === null || pct === undefined) return '0.0%';
  
  return `${pct.toFixed(decimals)}%`;
}

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
 * Generar texto descriptivo de participación
 * Lenguaje neutral, no prescriptivo
 * @param {number} pct - Porcentaje de participación
 * @param {string} context - Contexto adicional
 * @returns {string}
 */
export function describeParticipacion(pct, context = '') {
  const formatted = formatExactPercent(pct);
  
  if (context) {
    return `En ${context}, participó ${formatted} de la generación`;
  }
  
  return `Participó ${formatted}`;
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
 * Obtener etiqueta de familia de elección
 * @param {string} type - 'intermedia' | 'presidencial'
 * @returns {string}
 */
export function getElectionLabel(type) {
  const labels = {
    'intermedia': 'Elección Intermedia',
    'presidencial': 'Elección Presidencial'
  };
  
  return labels[type] || 'Elección';
}

/**
 * Generar texto de leyenda para pseudo-cohorte
 * @returns {string}
 */
export function getPseudoCohortDisclaimer() {
  return 'Nota metodológica: Este análisis sigue grupos de edad entre elecciones, no personas individuales. La Lista Nominal cambia por altas, bajas y cambios de domicilio.';
}

/**
 * Truncar texto con elipsis
 * @param {string} text - Texto original
 * @param {number} maxLength - Longitud máxima
 * @returns {string}
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generar texto accesible para lectores de pantalla
 * @param {Object} data - Datos de elección
 * @returns {string}
 */
export function generateA11yText(data) {
  return `Elección ${data.year}, tipo ${data.type}, edad ${data.age_on_election} años, participación ${formatExactPercent(data.participacion_pct)}`;
}

/**
 * Validar y limpiar entrada de texto
 * @param {string} input - Texto de entrada
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (!input) return '';
  
  // Remover caracteres potencialmente peligrosos
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 100);
}

/**
 * Generar mensaje amable para casos borde
 * @param {string} caseType - Tipo de caso borde
 * @returns {string}
 */
export function getBorderCaseMessage(caseType) {
  const messages = {
    'too_young': 'Tu generación aún no ha participado en elecciones federales (2009-2024). Puedes explorar la generación anterior para tener una referencia.',
    'too_old': 'Para este análisis consideramos generaciones desde 1940. Los datos históricos están limitados a ese período.',
    'no_data': 'No encontramos datos suficientes para tu selección. Intenta con otra entidad o año de nacimiento.',
    'small_sample': 'La muestra para tu entidad es pequeña (menos de 1,000 personas). Mostramos el dato nacional como referencia.'
  };
  
  return messages[caseType] || 'No hay datos disponibles para esta selección.';
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
 * Formatear fecha legible
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Generar texto de citación
 * @returns {string}
 */
export function getCitationText() {
  return 'Fuente: Instituto Nacional Electoral (INE). Conteos Censales de Proceso Constitucional 2009–2024. Datos Abiertos.';
}
