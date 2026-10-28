export function getNarrative(birthYear, participationData = null) {
  const ageIn2024 = 2024 - birthYear;

  
  
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