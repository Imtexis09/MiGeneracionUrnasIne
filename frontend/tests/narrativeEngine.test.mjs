import { test } from 'node:test';
import assert from 'node:assert';

import { getNarrative } from '../src/utils/narrativeEngine.js';

test('getNarrative: 18-20 años es primera vez y no comparable', () => {
  const n = getNarrative(2006);
  assert.strictEqual(n.primeraVez, true);
  assert.strictEqual(n.comparable, false);
  assert.ok(n.insight.includes('primera vez'));
});

test('getNarrative: 21-29 años es comparable', () => {
  const n = getNarrative(2003);
  assert.strictEqual(n.primeraVez, false);
  assert.strictEqual(n.comparable, true);
  assert.ok(n.insight.includes('20s'));
});

test('getNarrative: 30-64 años es comparable', () => {
  const n = getNarrative(1990);
  assert.strictEqual(n.primeraVez, false);
  assert.strictEqual(n.comparable, true);
  assert.ok(n.insight.includes('estabilizarse'));
});

test('getNarrative: 65+ tiene caso propio', () => {
  const n = getNarrative(1950);
  assert.strictEqual(n.primeraVez, false);
  assert.strictEqual(n.comparable, true);
  assert.ok(n.insight.includes('alta y constante'));
});

test('getNarrative: cubre el rango válido del selector (1940-2006)', () => {
  assert.doesNotThrow(() => getNarrative(1940));
  assert.doesNotThrow(() => getNarrative(2006));
});
