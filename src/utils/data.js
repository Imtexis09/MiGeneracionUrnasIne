/**
 * Utilidades para cargar y procesar datos del CCPC
 * Fuente: INE, Conteos Censales 2009-2024
 */

// Catálogo de entidades federativas (32 estados)
export const ENTIDADES = [
  { cve: '01', nombre: 'Aguascalientes' },
  { cve: '02', nombre: 'Baja California' },
  { cve: '03', nombre: 'Baja California Sur' },
  { cve: '04', nombre: 'Campeche' },
  { cve: '05', nombre: 'Coahuila' },
  { cve: '06', nombre: 'Colima' },
  { cve: '07', nombre: 'Chiapas' },
  { cve: '08', nombre: 'Chihuahua' },
  { cve: '09', nombre: 'Ciudad de México' },
  { cve: '10', nombre: 'Durango' },
  { cve: '11', nombre: 'Guanajuato' },
  { cve: '12', nombre: 'Guerrero' },
  { cve: '13', nombre: 'Hidalgo' },
  { cve: '14', nombre: 'Jalisco' },
  { cve: '15', nombre: 'México' },
  { cve: '16', nombre: 'Michoacán' },
  { cve: '17', nombre: 'Morelos' },
  { cve: '18', nombre: 'Nayarit' },
  { cve: '19', nombre: 'Nuevo León' },
  { cve: '20', nombre: 'Oaxaca' },
  { cve: '21', nombre: 'Puebla' },
  { cve: '22', nombre: 'Querétaro' },
  { cve: '23', nombre: 'Quintana Roo' },
  { cve: '24', nombre: 'San Luis Potosí' },
  { cve: '25', nombre: 'Sinaloa' },
  { cve: '26', nombre: 'Sonora' },
  { cve: '27', nombre: 'Tabasco' },
  { cve: '28', nombre: 'Tamaulipas' },
  { cve: '29', nombre: 'Tlaxcala' },
  { cve: '30', nombre: 'Veracruz' },
  { cve: '31', nombre: 'Yucatán' },
  { cve: '32', nombre: 'Zacatecas' }
];

// Años de elecciones por familia
export const ELECCIONES = {
  intermedias: [2009, 2015, 2021],
  presidenciales: [2012, 2018, 2024],
  todas: [2009, 2012, 2015, 2018, 2021, 2024]
};

// Rango de años de nacimiento válidos
export const YEAR_RANGE = {
  min: 1940,
  max: 2006  // Últimos que tienen 18 años en 2024
};

/**
 * Carga los datos de cohortes desde el JSON procesado
 * @returns {Promise<Object>} Datos completos de cohortes
 */
export async function loadData() {
  try {
    const response = await fetch('/data/cohorts.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validar estructura básica
    if (!data.cohorts || !Array.isArray(data.cohorts)) {
      throw new Error('Formato de datos inválido: falta array de cohorts');
    }
    
    if (!data.meta) {
      throw new Error('Formato de datos inválido: falta metadata');
    }
    
    console.log(`✓ Datos cargados: ${data.cohorts.length} registros de cohortes`);
    return data;
    
  } catch (error) {
    console.error('Error cargando datos:', error);
    
    // Datos de respaldo para desarrollo (mock)
    return createMockData();
  }
}

/**
 * Obtener nombre de entidad por clave
 * @param {string} cve - Clave de entidad (01-32)
 * @returns {string} Nombre de la entidad
 */
export function getEntidadNombre(cve) {
  const entidad = ENTIDADES.find(e => e.cve === cve);
  return entidad ? entidad.nombre : 'Desconocida';
}

/**
 * Validar año de nacimiento
 * @param {number} year - Año de nacimiento
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateYearOfBirth(year) {
  if (!year || isNaN(year)) {
    return { valid: false, message: 'Por favor ingresa un año válido' };
  }
  
  if (year < YEAR_RANGE.min) {
    return { valid: false, message: `El año debe ser mayor a ${YEAR_RANGE.min}` };
  }
  
  if (year > YEAR_RANGE.max) {
    return { 
      valid: false, 
      message: 'Tu generación aún no tiene 18 años en 2024. Intenta con un año anterior.' 
    };
  }
  
  return { valid: true, message: '' };
}

/**
 * Crear datos mock para desarrollo/pruebas
 * @returns {Object} Datos simulados
 */
function createMockData() {
  console.warn('⚠️ Usando datos MOCK (archivo cohorts.json no encontrado)');
  
  return {
    cohorts: [
      {
        year_of_birth_min: 1998,
        year_of_birth_max: 2000,
        entidad_cve: '09',
        entidad_nombre: 'Ciudad de México',
        elections: [
          {
            year: 2018,
            type: 'presidencial',
            age_on_election: 18,
            lista_nominal: 150000,
            si_votaron: 90000,
            no_votaron: 60000,
            participacion_pct: 60.0,
            n_valido: true
          },
          {
            year: 2021,
            type: 'intermedia',
            age_on_election: 21,
            lista_nominal: 155000,
            si_votaron: 70000,
            no_votaron: 85000,
            participacion_pct: 45.2,
            n_valido: true
          },
          {
            year: 2024,
            type: 'presidencial',
            age_on_election: 24,
            lista_nominal: 160000,
            si_votaron: 100000,
            no_votaron: 60000,
            participacion_pct: 62.5,
            n_valido: true
          }
        ]
      }
    ],
    meta: {
      version: '1.0',
      generated_date: '2026-09-29',
      ccpc_version: '2009-2024',
      nacional_participacion: {
        '2009': 44.06,
        '2012': 62.08,
        '2015': 47.72,
        '2018': 63.14,
        '2021': 52.66,
        '2024': 59.67
      },
      validation_status: 'mock',
      notes: 'Datos de ejemplo para desarrollo'
    }
  };
}

/**
 * Verificar si una elección es presidencial
 * @param {number} year - Año de elección
 * @returns {boolean}
 */
export function isPresidencial(year) {
  return ELECCIONES.presidenciales.includes(year);
}

/**
 * Obtener tipo de elección
 * @param {number} year - Año de elección
 * @returns {string} 'presidencial' | 'intermedia' | 'desconocida'
 */
export function getElectionType(year) {
  if (ELECCIONES.presidenciales.includes(year)) return 'presidencial';
  if (ELECCIONES.intermedias.includes(year)) return 'intermedia';
  return 'desconocida';
}
