/**
 * printHelper.ts
 * Utilidad robusta para disparar la impresión / exportación a PDF
 * garantizando que los contenedores con scroll horizontal no recorten el documento
 * en navegadores móviles (iOS Safari, Chrome Android) ni en escritorio.
 */

export const triggerPrint = (options?: { isFacsimile?: boolean; modalId?: string }) => {
  const body = document.body;

  // Añadimos clases de contexto de impresión temporal
  if (options?.isFacsimile) {
    body.classList.add('is-printing-facsimile');
  } else if (options?.modalId) {
    body.classList.add('is-printing-modal');
  }

  // Pequeño timeout para permitir que el motor de renderizado (Blink / WebKit)
  // recalcule geometrías y anchos de tabla al 100% de la página antes de abrir el diálogo
  setTimeout(() => {
    try {
      window.print();
    } finally {
      // Limpieza de clases tras disparar el diálogo
      setTimeout(() => {
        body.classList.remove('is-printing-facsimile', 'is-printing-modal');
      }, 500);
    }
  }, 100);
};
