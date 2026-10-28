export function formatExactPercent(pct) {
  if (pct === null || pct === undefined) return '0.0%';
  
  
  return pct.toFixed(1) + '%';
}

export function generateComparisonText(comparison) {
  if (!comparison) return '';
  
  const { current, previous } = comparison;
  
  if (!previous || previous.length === 0) {
    return `Tu generación participó ${formatExactPercent(current.participacion)} en ${current.year}.`;
  }
  
  
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

export function generateSillaVaciaText(filled, pct, entidad) {
  return `${filled} de 100 personas de tu generación en ${entidad} participaron en 2024 (${formatExactPercent(pct)})`;
}

export function formatCohortRange(min, max) {
  return `${min}–${max}`;
}

export function getPseudoCohortDisclaimer() {
  return 'Nota metodológica: Este análisis sigue grupos de edad entre elecciones, no personas individuales. La lista de personas registradas para votar cambia por altas, bajas y cambios de domicilio.';
}

export function generateYearRange(min, max) {
  const years = [];
  for (let year = max; year >= min; year--) {
    years.push(year);
  }
  return years;
}

export function getCitationText() {
  return 'Fuente: Instituto Nacional Electoral (INE). Conteos Censales de Proceso Constitucional (CCPC) 2009–2024. Datos abiertos.';
}