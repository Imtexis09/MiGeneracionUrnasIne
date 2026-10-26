/**
 * Utilidades para cargar y procesar datos del CCPC
 * Fuente: INE, CCPC 2009-2024
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
  min: 1938, // Primera cohorte de los datos (1938-1940)
  max: 2006  // Últimos que tienen 18 años en 2024
};

/**
 * Carga los datos de cohortes desde el JSON procesado.
 *
 * Es una carga ÚNICA: la promesa se guarda en memoria y se comparte, así que
 * llamar varias veces no vuelve a descargar ni a parsear el archivo. También la
 * publica en `window.__COHORTS_PROMISE__` para que las pantallas de la guía
 * (la app incrustada en un iframe del mismo origen) reutilicen los datos de la
 * ventana principal en lugar de pedirlos otra vez.
 * @returns {Promise<Object>} Datos completos de cohortes
 */
let promesaDatos = null;

export function loadData() {
  if (promesaDatos) return promesaDatos;
  promesaDatos = cargarDatos().catch((error) => {
    promesaDatos = null; // permite reintentar tras un fallo
    throw error;
  });
  if (typeof window !== 'undefined') window.__COHORTS_PROMISE__ = promesaDatos;
  return promesaDatos;
}

/** Datos ya cargados (o en camino) por la ventana principal, si somos su iframe */
async function datosDelPadre() {
  try {
    if (typeof window !== 'undefined' && window.parent !== window) {
      const p = window.parent.__COHORTS_PROMISE__; // lanza si es de otro origen
      if (p) return await p;
    }
  } catch (e) { /* otro origen o el padre falló: se pide por cuenta propia */ }
  return null;
}

async function cargarDatos() {
  const delPadre = await datosDelPadre();
  if (delPadre) return delPadre;

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
    
    return data;
    
  } catch (error) {
    console.error('Error cargando datos:', error);

    throw error;
  }
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
    return { valid: false, message: `El año de nacimiento no puede ser anterior a ${YEAR_RANGE.min}. Revisa el año que ingresaste e intenta de nuevo.` };
  }
  
  if (year > YEAR_RANGE.max) {
    return { 
      valid: false, 
      message: 'Tu generación aún no tiene 18 años en 2024. Intenta con un año anterior.' 
    };
  }
  
  return { valid: true, message: '' };
}
