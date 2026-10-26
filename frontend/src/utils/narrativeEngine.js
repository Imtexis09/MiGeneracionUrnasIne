/**
 * Motor narrativo dinámico según el año de nacimiento.
 *
 * Ajusta el texto de la historia para evitar inconsistencias históricas
 * (por ejemplo, no decirle a un adulto mayor que su generación está
 * "desapareciendo de las urnas" si no votó en 2024, ni comparar con otros
 * grupos a alguien cuya cohorte solo tiene un dato).
 *
 * @param {number} birthYear - Año de nacimiento del usuario
 * @param {Object} participationData - Datos de la cohorte (opcional, futuro)
 * @returns {Object} { insight, comparable, primeraVez, slide4 }
 */

export function getNarrative(birthYear, participationData = null) {
  const ageIn2024 = 2024 - birthYear;

  // Caso 1: Jóvenes que votaron por primera vez en 2024 (18 a 20 años).
  // No tienen histórico propio para comparar con otras generaciones.
  if (ageIn2024 <= 20) {
    return {
      primeraVez: true,
      comparable: false,
      insight:
        "¡2024 fue una de tus primeras elecciones! La primera vez que votamos participamos mucho, pero el reto es no dejar de hacerlo en las siguientes.",
      slide4: {
        titulo: "¿Cómo va tu generación en su primera elección?",
        explicacion:
          "Tu generación votó por primera vez en 2024, así que todavía no hay elecciones anteriores con las que comparar su participación. Esta es su marca de referencia: la próxima elección verás si sube o baja."
      }
    };
  }

  // Caso 2: Jóvenes en sus 20s (21 a 29 años).
  // La participación cae considerablemente respecto a los 18 años.
  if (ageIn2024 > 20 && ageIn2024 <= 29) {
    return {
      primeraVez: false,
      comparable: true,
      insight:
        "La mayoría de las personas votan con entusiasmo a los 18 años, pero al llegar a los 20s la asistencia a las urnas cae considerablemente.",
      slide4: {
        titulo: "¿Cómo ha cambiado la asistencia a las urnas?",
        explicacion:
          "Comparamos las últimas elecciones para ver si tu generación está votando más o menos que antes."
      }
    };
  }

  // Caso 3: Adultos (30 a 64 años).
  // La participación tiende a estabilizarse con los años.
  if (ageIn2024 > 29 && ageIn2024 <= 64) {
    return {
      primeraVez: false,
      comparable: true,
      insight:
        "Con los años, la participación suele estabilizarse. Revisa cómo se compara el compromiso de tu generación frente a los más jóvenes.",
      slide4: {
        titulo: "¿Cómo ha cambiado la asistencia a las urnas?",
        explicacion:
          "Comparamos las últimas elecciones para ver si tu generación está votando más o menos que antes."
      }
    };
  }

  // Caso 4: Adultos mayores (65 años o más).
  // Su generación mantiene una participación alta y constante.
  return {
    primeraVez: false,
    comparable: true,
    insight:
      "Tu generación mantiene una participación alta y constante a lo largo de las elecciones. Es una de las que más acude a las urnas.",
    slide4: {
      titulo: "¿Cómo ha cambiado la asistencia a las urnas?",
      explicacion:
        "Comparamos las últimas elecciones para ver si tu generación está votando más o menos que antes."
    }
  };
}
