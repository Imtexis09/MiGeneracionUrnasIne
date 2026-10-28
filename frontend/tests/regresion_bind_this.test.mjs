import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(RAIZ, 'src');

function listarSvelte(dir) {
  const salida = [];
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) salida.push(...listarSvelte(ruta));
    else if (entrada.endsWith('.svelte')) salida.push(ruta);
  }
  return salida;
}

function variablesBindThis(contenido) {
  const nombres = new Set();
  const re = /bind:this\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}/g;
  let m;
  while ((m = re.exec(contenido)) !== null) nombres.add(m[1]);
  return nombres;
}

function asignacionesPeligrosas(contenido, nombre) {
  const esc = nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `(?:^|[^.\\w$])${esc}\\s*\\.\\s*[A-Za-z_$][\\w$]*\\s*(?:<<|>>|[-+*/%&|^]|\\*\\*)?=(?!=)`,
    'gm'
  );
  const encontradas = [];
  let m;
  while ((m = re.exec(contenido)) !== null) {
    encontradas.push({
      linea: contenido.slice(0, m.index).split('\n').length,
      texto: m[0].trim()
    });
  }
  return encontradas;
}

test('ningún componente asigna propiedades de un elemento bind:this', () => {
  const archivos = listarSvelte(SRC);
  assert.ok(archivos.length > 0, 'no se encontraron componentes .svelte');

  const problemas = [];
  for (const archivo of archivos) {
    const contenido = readFileSync(archivo, 'utf8');
    for (const nombre of variablesBindThis(contenido)) {
      for (const hit of asignacionesPeligrosas(contenido, nombre)) {
        problemas.push(
          `${relative(RAIZ, archivo)}:${hit.linea} → \`${hit.texto}\` (bind:this={${nombre}})`
        );
      }
    }
  }

  assert.equal(
    problemas.length,
    0,
    'Asignar propiedades de un bind:this provoca un ciclo infinito de regeneración.\n' +
      'Usa un alias local (const el = ' + 'elemento' + ') o atributos width/height en el marcado.\n' +
      problemas.join('\n')
  );
});

test('Tarjeta regenera por clave de datos y no por referencia del DOM', () => {
  const contenido = readFileSync(join(SRC, 'components', 'Tarjeta.svelte'), 'utf8');

  assert.doesNotMatch(
    contenido,
    /\$\:\s*if\s*\([^)]*canvas[^)]*\)\s*\{\s*\n?\s*generateCard\(\)/,
    'Tarjeta.svelte vuelve a depender de `canvas` para generar: usa una clave de datos (claveTarjeta)'
  );
  assert.match(
    contenido,
    /claveTarjeta\s*!==\s*ultimaClaveGenerada/,
    'Tarjeta.svelte debe exponer la clave de datos que controla la regeneración'
  );
});