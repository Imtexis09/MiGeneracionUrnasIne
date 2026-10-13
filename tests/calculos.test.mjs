import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  calculateCohortRange,
  findCohortData,
  separateElectionFamilies,
  calculateParticipacion,
  getAgeAtElection,
  compareGenerationsAtSameAge,
  getLatestElection,
  calculateFilledSeats,
  hasValidSampleSize,
} from '../src/utils/calculos.js';

const allData = JSON.parse(fs.readFileSync('public/data/cohorts.json', 'utf-8'));

test('calculateCohortRange produce cohortes de 3 años alineadas', () => {
  assert.deepStrictEqual(calculateCohortRange(2002), { min: 2001, max: 2003 });
  assert.deepStrictEqual(calculateCohortRange(1999), { min: 1998, max: 2000 });
});

test('findCohortData encuentra cohorte real en CDMX', () => {
  const c = findCohortData(allData, 2002, '09');
  assert.ok(c, 'debe encontrar la cohorte');
  assert.strictEqual(c.entidad_cve, '09');
  assert.ok(c.elections.length >= 1);
});

test('findCohortData hace fallback a nacional para entidad inexistente', () => {
  const c = findCohortData(allData, 2002, '99');
  assert.ok(c, 'debe caer a la cohorte nacional');
  assert.strictEqual(c.entidad_cve, '00');
  assert.strictEqual(c._isNational, true);
});

test('compareGenerationsAtSameAge funciona con tipo presidencial (regresión)', () => {
  const c = findCohortData(allData, 2002, '09');
  const latest = getLatestElection(c.elections);
  assert.strictEqual(latest.type, 'presidencial');
  const comp = compareGenerationsAtSameAge(c, allData, 2002, latest.age_on_election);
  assert.ok(comp, 'no debe lanzar error');
  assert.strictEqual(comp.type, 'presidencial');
});

test('compareGenerationsAtSameAge funciona con tipo intermedia', () => {
  // Buscar una cohorte cuya elección más reciente sea intermedia (2021)
  const c = allData.cohorts.find(
    x => x.entidad_cve === '09' && x.elections.some(e => e.year === 2021 && e.type === 'intermedia')
      && !x.elections.some(e => e.year === 2024)
  );
  if (c) {
    const latest = getLatestElection(c.elections);
    const comp = compareGenerationsAtSameAge(c, allData, c.year_of_birth_min + 1, latest.age_on_election);
    assert.ok(comp === null || comp.type === 'intermedia');
  }
});

test('separateElectionFamilies separa correctamente', () => {
  const { intermedias, presidenciales } = separateElectionFamilies([
    { type: 'intermedia' }, { type: 'presidencial' }, { type: 'intermedia' },
  ]);
  assert.strictEqual(intermedias.length, 2);
  assert.strictEqual(presidenciales.length, 1);
});

test('calculateParticipacion = SV/(SV+NV)', () => {
  assert.strictEqual(calculateParticipacion(60, 40), 60);
  assert.strictEqual(calculateParticipacion(0, 0), 0);
});

test('getAgeAtElection resta años', () => {
  assert.strictEqual(getAgeAtElection(2000, 2024), 24);
});

test('getLatestElection devuelve la más reciente', () => {
  const latest = getLatestElection([{ year: 2018 }, { year: 2024 }, { year: 2021 }]);
  assert.strictEqual(latest.year, 2024);
});

test('calculateFilledSeats redondea el porcentaje', () => {
  assert.strictEqual(calculateFilledSeats(59.68), 60);
});

test('hasValidSampleSize exige LN >= 1000', () => {
  assert.strictEqual(hasValidSampleSize({ lista_nominal: 1500 }), true);
  assert.strictEqual(hasValidSampleSize({ lista_nominal: 500 }), false);
});

test('cohorts.json: tipos válidos, años permitidos, participación en [0,100]', () => {
  const validYears = new Set([2009, 2012, 2015, 2018, 2021, 2024]);
  for (const c of allData.cohorts) {
    for (const e of c.elections) {
      assert.ok(['intermedia', 'presidencial'].includes(e.type), `tipo inválido: ${e.type}`);
      assert.ok(validYears.has(e.year), `año inválido: ${e.year}`);
      assert.ok(e.participacion_pct >= 0 && e.participacion_pct <= 100, `pct fuera de rango: ${e.participacion_pct}`);
    }
  }
});
