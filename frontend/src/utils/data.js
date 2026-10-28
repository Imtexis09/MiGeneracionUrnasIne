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

export const ELECCIONES = {
  intermedias: [2009, 2015, 2021],
  presidenciales: [2012, 2018, 2024],
  todas: [2009, 2012, 2015, 2018, 2021, 2024]
};

export const YEAR_RANGE = {
  min: 1938, 
  max: 2006  
};

let promesaDatos = null;

export function loadData() {
  if (promesaDatos) return promesaDatos;
  promesaDatos = cargarDatos().catch((error) => {
    promesaDatos = null; 
    throw error;
  });
  if (typeof window !== 'undefined') window.__COHORTS_PROMISE__ = promesaDatos;
  return promesaDatos;
}

async function datosDelPadre() {
  try {
    if (typeof window !== 'undefined' && window.parent !== window) {
      const p = window.parent.__COHORTS_PROMISE__; 
      if (p) return await p;
    }
  } catch (e) {  }
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