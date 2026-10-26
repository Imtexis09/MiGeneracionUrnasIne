#!/usr/bin/env python3
"""Pipeline CCPC 2009-2024 -> data/participacion_edad.json (+ reporte de validación).
Uso: python pipeline.py CARPETA_CON_ZIPS [SALIDA_DIR]
Lee los .zip directamente (sin descomprimir). Agrega a entidad x edad.
Participación = SV/(SV+NV) (fórmula INE, sobre lista nominal). Edad: 18-89 individual; 90+ agrupado; >100 se descarta."""
import sys, io, json, zipfile, glob, os
import pandas as pd

YEARS = [2009, 2012, 2015, 2018, 2021, 2024]
COLS = ['EDOCVE', 'SEXO', 'EDAD', 'LN', 'SV', 'NV', 'NS']
MAX_AGE_VALID, TOP = 100, 90

def read_csv(zf, name):
    raw = zf.read(name)
    for enc in ('utf-8-sig', 'latin1'):
        try:
            txt = raw.decode(enc); break
        except UnicodeDecodeError:
            continue
    return pd.read_csv(io.StringIO(txt), usecols=lambda c: c.strip().upper() in COLS,
                       dtype={'EDOCVE': 'int16'}).rename(columns=lambda c: c.strip().upper())

def load_year(path, year):
    frames, sex_vals = [], set()
    with zipfile.ZipFile(path) as zf:
        for n in sorted(x for x in zf.namelist() if x.lower().endswith('.csv')):
            d = read_csv(zf, n)
            sex_vals |= set(d['SEXO'].dropna().unique())
            frames.append(d.groupby(['EDOCVE', 'EDAD'], as_index=False)[['LN', 'SV', 'NV', 'NS']].sum())
    d = pd.concat(frames).groupby(['EDOCVE', 'EDAD'], as_index=False).sum()
    d['AELEC'] = year
    return d, sorted(int(v) for v in sex_vals)

def main(src, out):
    os.makedirs(out, exist_ok=True)
    allf, rep = [], ['# Reporte de validación CCPC\n',
        '| Año | LN | SV | NV | NS | % Part. SV/(SV+NV) | LN=SV+NV+NS | Entidades | Edad min-max | SEXO | Edades >100 (descartadas, LN) |',
        '|---|---|---|---|---|---|---|---|---|---|---|']
    for y in YEARS:
        p = glob.glob(os.path.join(src, f'*ConteosCensales{y}.zip'))
        if not p: print('FALTA', y); continue
        d, sx = load_year(p[0], y)
        t = d[['LN', 'SV', 'NV', 'NS']].sum()
        bad = d[d.EDAD > MAX_AGE_VALID].LN.sum()
        rep.append(f"| {y} | {t.LN:,} | {t.SV:,} | {t.NV:,} | {t.NS:,} | {100*t.SV/(t.SV+t.NV):.2f} | "
                   f"{'sí' if t.LN == t.SV+t.NV+t.NS else 'NO (dif ' + str(t.LN-t.SV-t.NV-t.NS) + ')'} | "
                   f"{d.EDOCVE.nunique()} | {d.EDAD.min()}-{d.EDAD.max()} | {sx} | {bad:,} |")
        d = d[(d.EDAD >= 18) & (d.EDAD <= MAX_AGE_VALID)].copy()
        d['EDAD'] = d.EDAD.clip(upper=TOP)
        allf.append(d.groupby(['AELEC', 'EDOCVE', 'EDAD'], as_index=False)[['LN', 'SV', 'NV', 'NS']].sum())
    df = pd.concat(allf)
    nat = df.groupby(['AELEC', 'EDAD'], as_index=False)[['LN', 'SV', 'NV', 'NS']].sum(); nat['EDOCVE'] = 0
    df = pd.concat([df, nat])
    data = {}
    for (y, e), g in df.groupby(['AELEC', 'EDOCVE']):
        data.setdefault(str(y), {})[f'{e:02d}'] = {str(int(r.EDAD)): [int(r.LN), int(r.SV), int(r.NV), int(r.NS)] for r in g.itertuples()}
    meta = {'fuente': 'INE, Conteos Censales de Participación Ciudadana 2009-2024', 'campos': ['LN', 'SV', 'NV', 'NS'],
            'participacion': 'SV/(SV+NV) sobre lista nominal', 'edad_tope': TOP, 'entidad_00': 'Nacional',
            'nota': 'No incluye casillas especiales ni residentes en el extranjero'}
    with open(os.path.join(out, 'participacion_edad.json'), 'w') as f:
        json.dump({'meta': meta, 'data': data}, f, separators=(',', ':'))
    small = df[(df.EDOCVE != 0) & (df.LN < 1000)]
    rep += ['', f'Celdas año×entidad×edad con LN<1000: {len(small)} de {len(df[df.EDOCVE!=0])} ({100*len(small)/len(df[df.EDOCVE!=0]):.1f}%)']
    open(os.path.join(out, 'reporte_validacion.md'), 'w').write('\n'.join(rep) + '\n')
    print('\n'.join(rep)); print('JSON kB:', os.path.getsize(os.path.join(out, 'participacion_edad.json'))//1024)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'data')
