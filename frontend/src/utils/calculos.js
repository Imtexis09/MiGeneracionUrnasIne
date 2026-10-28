import { ELECCIONES } from './data.js';

function calculateCohortRange(yearOfBirth) {
  const cohortMin = Math.floor(yearOfBirth / 3) * 3;
  const cohortMax = cohortMin + 2;
  
  return { min: cohortMin, max: cohortMax };
}

export function findCohortData(allData, yearOfBirth, entidadCve) {
  if (!allData || !allData.cohorts) return null;
  
  const { min, max } = calculateCohortRange(yearOfBirth);
  
  
  const cohort = allData.cohorts.find(c => 
    c.year_of_birth_min === min &&
    c.year_of_birth_max === max &&
    c.entidad_cve === entidadCve
  );
  
  if (cohort) {
    return cohort;
  }
  
  
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

export function separateElectionFamilies(elections) {
  if (!elections || !Array.isArray(elections)) {
    return { intermedias: [], presidenciales: [] };
  }
  
  return {
    intermedias: elections.filter(e => e.type === 'intermedia'),
    presidenciales: elections.filter(e => e.type === 'presidencial')
  };
}

export function compareGenerationsAtSameAge(cohortData, allData, yearOfBirth, targetAge = 24) {
  if (!cohortData || !allData) return null;
  
  
  const currentElection = cohortData.elections.find(e => 
    Math.abs(e.age_on_election - targetAge) <= 1
  );
  
  if (!currentElection) return null;
  
  const currentType = currentElection.type;
  const currentYear = currentElection.year;

  
  const comparisons = [];
  const familyKey = currentType === 'intermedia' ? 'intermedias' : 'presidenciales';

  for (let prevYear of (ELECCIONES[familyKey] || [])) {
    if (prevYear >= currentYear) continue;
    
    
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

export function getLatestElection(elections) {
  if (!elections || elections.length === 0) return null;
  
  return elections.reduce((latest, current) => 
    current.year > latest.year ? current : latest
  );
}

export function calculateFilledSeats(participacionPct) {
  return Math.round(participacionPct);
}