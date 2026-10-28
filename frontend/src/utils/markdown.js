function escapar(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function enLinea(texto) {
  let t = escapar(texto);
  const codigos = [];
  t = t.replace(/`([^`]+)`/g, (_, c) => {
    codigos.push(c);
    return `\u0000${codigos.length - 1}\u0000`;
  });
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => {
    if (!/^(https?:|mailto:|\/|#|\.{0,2}\/)/i.test(url)) return txt;
    const externo = /^https?:/i.test(url);
    return `<a href="${url}"${externo ? ' target="_blank" rel="noopener noreferrer"' : ''}>${txt}</a>`;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  t = t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codigos[+i]}</code>`);
  return t;
}

function celdas(linea) {
  return linea.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

const esSeparadorTabla = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);

export function mdToHtml(md) {
  const lineas = String(md ?? '').replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lineas.length) {
    const l = lineas[i];

    if (!l.trim()) { i++; continue; }

    if (/^```/.test(l)) {
      const buf = [];
      i++;
      while (i < lineas.length && !/^```/.test(lineas[i])) buf.push(lineas[i++]);
      i++;
      out.push(`<pre><code>${escapar(buf.join('\n'))}</code></pre>`);
      continue;
    }

    const h = l.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const nivel = Math.min(6, h[1].length + 2);
      out.push(`<h${nivel}>${enLinea(h[2].replace(/\s*#+\s*$/, ''))}</h${nivel}>`);
      i++;
      continue;
    }

    if (/^\s*([-*_])\s*(\1\s*){2,}$/.test(l)) { out.push('<hr />'); i++; continue; }

    if (l.includes('|') && i + 1 < lineas.length && esSeparadorTabla(lineas[i + 1])) {
      const cab = celdas(l);
      i += 2;
      const filas = [];
      while (i < lineas.length && lineas[i].includes('|') && lineas[i].trim()) {
        filas.push(celdas(lineas[i++]));
      }
      out.push(
        '<div class="md-tabla" tabindex="0" role="region" aria-label="Tabla (desplazable)"><table><thead><tr>' +
        cab.map((c) => `<th scope="col">${enLinea(c)}</th>`).join('') +
        '</tr></thead><tbody>' +
        filas.map((f) => `<tr>${f.map((c) => `<td>${enLinea(c)}</td>`).join('')}</tr>`).join('') +
        '</tbody></table></div>'
      );
      continue;
    }

    if (/^>\s?/.test(l)) {
      const buf = [];
      while (i < lineas.length && /^>\s?/.test(lineas[i])) buf.push(lineas[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${enLinea(buf.join(' '))}</blockquote>`);
      continue;
    }

    const li = l.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (li) {
      const ordenada = /\d/.test(li[2]);
      const items = [];
      while (i < lineas.length) {
        const m = lineas[i].match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
        if (m) {
          items.push(m[3].replace(/^\[( |x)\]\s+/i, (_, c) => (c.trim() ? '☑ ' : '☐ ')));
          i++;
        } else if (/^\s{2,}\S/.test(lineas[i]) && items.length) {
          items[items.length - 1] += ' ' + lineas[i++].trim();
        } else break;
      }
      const tag = ordenada ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${enLinea(t)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const buf = [];
    while (
      i < lineas.length &&
      lineas[i].trim() &&
      !/^(#{1,6}\s|```|>\s?|\s*([-*+]|\d+\.)\s+)/.test(lineas[i]) &&
      !(lineas[i].includes('|') && i + 1 < lineas.length && esSeparadorTabla(lineas[i + 1]))
    ) {
      buf.push(lineas[i++].trim());
    }
    out.push(`<p>${enLinea(buf.join(' '))}</p>`);
  }

  return out.join('\n');
}