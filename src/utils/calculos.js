/**
 * Cálculos de cohortes y participación electoral
 * Metodología: CCPC INE 2009-2024
 */

import { ELECCIONES } from './data.js';

/**
 * Calcular rango de cohorte para un año de nacimiento
 * Cohortes de 3 años según metodología INE
 * @param {number} yearOfBirth - Año de nacimiento
 * @returns {Object} { min: number, max: number }
 */
export function calculateCohortRange(yearOfBirth) {
  const cohortMin = Math.floor(yearOfBirth / 3) * 3;
  const cohortMax = cohortMin + 2;
  
  return { min: cohortMin, max: cohortMax };
}

/**
 * Encontrar datos de cohorte para un año y entidad
 * @param {Object} allData - Datos completos del JSON
 * @param {number} yearOfBirth - Año de nacimiento del usuario
 * @param {string} entidadCve - Clave de entidad (01-32)
 * @returns {Object|null} Datos de la cohorte o null
 */
export function findCohortData(allData, yearOfBirth, entidadCve) {
  if (!allData || !allData.cohorts) return null;
  
  const { min, max } = calculateCohortRange(yearOfBirth);
  
  // Buscar cohorte exacta
  const cohort = allData.cohorts.find(c => 
    c.year_of_birth_min === min &&
    c.year_of_birth_max === max &&
    c.entidad_cve === entidadCve
  );
  
  if (cohort) {
    return cohort;
  }
  
  // Si no hay datos para esa entidad, buscar dato nacional (cve: '00')
  const nationalCohort = allData.cohorts.find(c =>
    c.year_of_birth_min === min &&
    c.year_of_birth_max === max &&
    c.entidad_cve === '00'
  );
  
  if (nationalCohort) {
    return {
      ...nationalCohort,
      _isNational: true,
      _originalEntidad: entidadCve
    };
  }
  
  return null;
}

/**
 * Filtrar elecciones por familia (intermedias o presidenciales)
 * @param {Array} elections - Array de elecciones de una cohorte
 * @param {string} type - 'intermedia' | 'presidencial' | 'todas'
 * @returns {Array} Elecciones filtradas
 */
export function filterElectionsByType(elections, type = 'todas') {
  if (!elections || !Array.isArray(elections)) return [];
  
  if (type === 'todas') return elections;
  
  return elections.filter(e => e.type === type);
}

/**
 * Separar elecciones en dos familias
 * @param {Array} elections - Array de elecciones
 * @returns {Object} { intermedias: Array, presidenciales: Array }
 */
export function separateElectionFamilies(elections) {
  if (!elections || !Array.isArray(elections)) {
    return { intermedias: [], presidenciales: [] };
  }
  
  return {
    intermedias: elections.filter(e => e.type === 'intermedia'),
    presidenciales: elections.filter(e => e.type === 'presidencial')
  };
}

/**
 * Calcular participación para una elección
 * Fórmula: % = 100 × SV / (SV + NV)
 * @param {number} siVotaron - Número de personas que sí votaron
 * @param {number} noVotaron - Número de personas que no votaron
 * @returns {number} Porcentaje de participación
 */
export function calculateParticipacion(siVotaron, noVotaron) {
  const total = siVotaron + noVotaron;
  
  if (total === 0) return 0;
  
  return (siVotaron / total) * 100;
}

/**
 * Obtener la edad de la cohorte en una elección específica
 * @param {number} yearOfBirth - Año de nacimiento (punto medio de cohorte)
 * @param {number} electionYear - Año de elección
 * @returns {number} Edad aproximada
 */
export function getAgeAtElection(yearOfBirth, electionYear) {
  return electionYear - yearOfBirth;
}

/**
 * Comparar participación entre generaciones a la misma edad
 * @param {Object} cohortData - Datos de la cohorte actual
 * @param {Object} allData - Datos completos
 * @param {number} yearOfBirth - Año de nacimiento del usuario
 * @param {number} targetAge - Edad objetivo para comparación
 * @returns {Object|null} Datos de comparación
 */
export function compareGenerationsAtSameAge(cohortData, allData, yearOfBirth, targetAge = 24) {
  if (!cohortData || !allData) return null;
  
  // Encontrar elección de la cohorte actual a la edad objetivo
  const currentElection = cohortData.elections.find(e => 
    Math.abs(e.age_on_election - targetAge) <= 1
  );
  
  if (!currentElection) return null;
  
  const currentType = currentElection.type;
  const currentYear = currentElection.year;

  // Buscar generaciones anteriores a la misma edad en elecciones de la misma familia
  const comparisons = [];
  const familyKey = currentType === 'intermedia' ? 'intermedias' : 'presidenciales';

  for (let prevYear of (ELECCIONES[familyKey] || [])) {
    if (prevYear >= currentYear) continue;
    
    // Calcular qué año de nacimiento tendría alguien con targetAge en prevYear
    const prevBirthYear = prevYear - targetAge;
    const prevCohort = findCohortData(allData, prevBirthYear, cohortData.entidad_cve);
    
    if (prevCohort) {
      const prevElection = prevCohort.elections.find(e => e.year === prevYear);
      
      if (prevElection) {
        comparisons.push({
          year: prevYear,
          yearOfBirth: prevBirthYear,
          participacion: prevElection.participacion_pct,
          age: prevElection.age_on_election
        });
      }
    }
  }
  
  return {
    current: {
      year: currentYear,
      yearOfBirth: yearOfBirth,
      participacion: currentElection.participacion_pct,
      age: currentElection.age_on_election
    },
    previous: comparisons,
    type: currentType
  };
}

/**
 * Calcular diferencia en puntos porcentuales
 * @param {number} value1 - Primer valor
 * @param {number} value2 - Segundo valor
 * @returns {number} Diferencia
 */
export function calculateDifference(value1, value2) {
  return value1 - value2;
}

/**
 * Validar si hay suficientes datos (LN > 1000)
 * @param {Object} election - Datos de una elección
 * @returns {boolean}
 */
export function hasValidSampleSize(election) {
  return election && election.lista_nominal >= 1000;
}

/**
 * Obtener participación nacional para un año
 * @param {Object} meta - Metadata del JSON
 * @param {number} year - Año de elección
 * @returns {number|null} Participación nacional
 */
export function getNacionalParticipacion(meta, year) {
  if (!meta || !meta.nacional_participacion) return null;
  
  return meta.nacional_participacion[year.toString()] || null;
}

/**
 * Calcular punto medio de cohorte
 * @param {number} min - Año mínimo de cohorte
 * @param {number} max - Año máximo de cohorte
 * @returns {number} Año medio
 */
export function getCohortMidpoint(min, max) {
  return Math.floor((min + max) / 2);
}

/**
 * Obtener última elección disponible
 * @param {Array} elections - Array de elecciones
 * @returns {Object|null} Última elección
 */
export function getLatestElection(elections) {
  if (!elections || elections.length === 0) return null;
  
  return elections.reduce((latest, current) => 
    current.year > latest.year ? current : latest
  );
}

/**
 * Calcular asientos llenos para visualización Silla Vacía
 * @param {number} participacionPct - Porcentaje de participación
 * @returns {number} Número de asientos llenos (0-100)
 */
export function calculateFilledSeats(participacionPct) {
  return Math.round(participacionPct);
}
