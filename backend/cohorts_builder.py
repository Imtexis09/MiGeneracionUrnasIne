#!/usr/bin/env python3
"""Transforma data/participacion_edad.json al esquema cohorts que consume el frontend.

Uso: python cohorts_builder.py [RUTA_JSON_ENTRADA] [RUTA_SALIDA]

Cohortes de 3 años (min = floor(año_nacimiento/3)*3). Para cada cohorte y
entidad se agregan las edades correspondientes en cada elección:
  edad_en_eleccion = año_elección - año_nacimiento

Salida: lista de cohorts {year_of_birth_min, year_of_birth_max, entidad_cve,
entidad_nombre, elections:[{year, type, age_on_election, lista_nominal,
si_votaron, no_votaron, participacion_pct, n_valido}]} + meta con
nacional_participacion por año.
"""
import json, os, sys
from datetime import date

YEARS = [2009, 2012, 2015, 2018, 2021, 2024]
INTERMEDIAS = {2009, 2015, 2021}
# 1938 (no 1940): la cohorte 1938-1940 debe incluir los 3 años de nacimiento completos
BIRTH_MIN, BIRTH_MAX = 1938, 2006
MIN_LN_VALIDO = 1000

ENTIDADES = {
    '01': 'Aguascalientes', '02': 'Baja California', '03': 'Baja California Sur',
    '04': 'Campeche', '05': 'Coahuila', '06': 'Colima', '07': 'Chiapas',
    '08': 'Chihuahua', '09': 'Ciudad de México', '10': 'Durango',
    '11': 'Guanajuato', '12': 'Guerrero', '13': 'Hidalgo', '14': 'Jalisco',
    '15': 'México', '16': 'Michoacán', '17': 'Morelos', '18': 'Nayarit',
    '19': 'Nuevo León', '20': 'Oaxaca', '21': 'Puebla', '22': 'Querétaro',
    '23': 'Quintana Roo', '24': 'San Luis Potosí', '25': 'Sinaloa',
    '26': 'Sonora', '27': 'Tabasco', '28': 'Tamaulipas', '29': 'Tlaxcala',
    '30': 'Veracruz', '31': 'Yucatán', '32': 'Zacatecas', '00': 'Nacional',
}


def cohort_min(year):
    return (year // 3) * 3


def main(src_path, out_path):
    with open(src_path, encoding='utf-8') as f:
        src = json.load(f)
    data = src['data']

    cohorts = []
    by_key = {}  # (cmin, cmax, entidad) -> entry

    for year in YEARS:
        if str(year) not in data:
            continue
        for entidad, ages in data[str(year)].items():
            for age_str, (ln, sv, nv, ns) in ages.items():
                age = int(age_str)
                birth = year - age
                if birth < BIRTH_MIN or birth > BIRTH_MAX:
                    continue
                cmin = cohort_min(birth)
                cmax = cmin + 2
                key = (cmin, cmax, entidad)
                entry = by_key.setdefault(key, {
                    'year_of_birth_min': cmin,
                    'year_of_birth_max': cmax,
                    'entidad_cve': entidad,
                    'entidad_nombre': ENTIDADES.get(entidad, 'Desconocida'),
                    '_agg': {},  # year -> [ln, sv, nv]
                })
                agg = entry['_agg'].setdefault(year, [0, 0, 0])
                agg[0] += ln
                agg[1] += sv
                agg[2] += nv

    for entry in by_key.values():
        elections = []
        midpoint = (entry['year_of_birth_min'] + entry['year_of_birth_max']) // 2
        for year in sorted(entry['_agg']):
            ln, sv, nv = entry['_agg'][year]
            if ln == 0:
                continue
            participacion = 100 * sv / (sv + nv) if (sv + nv) > 0 else 0.0
            elections.append({
                'year': year,
                'type': 'intermedia' if year in INTERMEDIAS else 'presidencial',
                'age_on_election': year - midpoint,
                'lista_nominal': ln,
                'si_votaron': sv,
                'no_votaron': nv,
                'participacion_pct': round(participacion, 2),
                'n_valido': ln >= MIN_LN_VALIDO,
            })
        if elections:
            del entry['_agg']
            entry['elections'] = elections
            cohorts.append(entry)

    cohorts.sort(key=lambda c: (c['entidad_cve'], c['year_of_birth_min']))

    # Participación nacional por año (entidad 00)
    nacional = {}
    for year in YEARS:
        if str(year) not in data or '00' not in data[str(year)]:
            continue
        sv = sum(v[1] for v in data[str(year)]['00'].values())
        nv = sum(v[2] for v in data[str(year)]['00'].values())
        if sv + nv > 0:
            nacional[str(year)] = round(100 * sv / (sv + nv), 2)

    out = {
        'cohorts': cohorts,
        'meta': {
            'version': '2.0',
            'generated_date': date.today().isoformat(),
            'ccpc_version': '2009-2024',
            'nacional_participacion': nacional,
            'validation_status': 'validado',
            'notes': 'Cohortes de 3 años agregadas desde Conteos Censales del INE. '
                     'Pseudo-cohortes: comparan cortes transversales, no seguimiento individual.',
        },
    }

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(f'Cohortes: {len(cohorts)} | Nacional: {nacional}')
    print(f'Salida: {out_path} ({os.path.getsize(out_path)//1024} KB)')


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'data/participacion_edad.json'
    out = sys.argv[2] if len(sys.argv) > 2 else '../frontend/public/data/cohorts.json'
    main(src, out)
