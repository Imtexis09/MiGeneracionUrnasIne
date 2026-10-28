let primeraEjecucion = true;

export function focusTitle(node) {
  const enfocar = () => {
    try {
      node.focus({ preventScroll: true });
    } catch (e) {
      
      try {
        node.focus();
      } catch (e2) {  }
    }
  };

  if (primeraEjecucion) {
    
    primeraEjecucion = false;
  } else {
    enfocar();
  }

  return {
    destroy() {
      
    }
  };
}