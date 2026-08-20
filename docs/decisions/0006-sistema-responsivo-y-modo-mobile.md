# ADR 0006: Sistema Responsivo, Menú Off-Canvas y Modo Mobile

**Fecha:** 2026-08-20  
**Estado:** Aceptado  
**Contexto:** TributIA Suite Tributaria DIAN  

---

## 1. Contexto y Problema

TributIA nació como una plataforma contable y pedagógica de alta densidad de información (formularios de múltiples casillas, tablas de depuración cedular, simuladores en vivo y calendarios tributarios). Originalmente, la interfaz estaba optimizada principalmente para monitores de escritorio de alta resolución (`>= 1440px`).

Al ser utilizada en **laptops (1024px – 1366px)** con el menú lateral extendido o en **dispositivos móviles (smartphones y tablets de 375px a 768px)**, se evidenciaron los siguientes retos de experiencia de usuario:
1. Desbordamiento horizontal del documento global (`scrollWidth > innerWidth`), generando barras de desplazamiento dobles indeseadas.
2. Contracción excesiva de columnas en cuadrículas fijas (`display: grid; grid-template-columns: 1fr 1fr 1fr;` o `1.15fr 0.85fr`), truncando etiquetas e inputs.
3. Inaccesibilidad en móviles de tablas complejas de alta dimensionalidad (Formulario 210, Tabla DANE de 70 años del Art. 73, y la Hoja de Cálculo Fiscal de Conciliación Exógena).
4. Auto-zoom molesto en navegadores móviles (iOS Safari) provocado por campos de texto con tamaño de fuente inferior a 16px.
5. Popovers informativos de casillas que se salían de los límites de la pantalla táctil.

---

## 2. Decisión Tomada

Se decidió implementar una **arquitectura responsiva integral y modo móvil nativo** basada en estándares CSS modernos, sin sobrecargar con librerías externas pesadas:

1. **Navegación Móvil Off-Canvas:**
   - En pantallas `<= 768px`, el `#app-sidebar` pasa a posición fija con `transform: translateX(-100%)` y se despliega como un drawer lateral con `transform: translateX(0)`.
   - Se añadió un botón accesible de menú hamburguesa (`.mobile-menu-btn`) y un backdrop con desenfoque (`#sidebar-backdrop`) que bloquea el scroll de fondo y permite cierre inmediato por toque exterior.
   - Autocierre automático del drawer al navegar a cualquier módulo o submódulo.

2. **Sistema de Cuadrículas con `minmax(0, ...)`:**
   - Se crearon clases utilitarias (`.calc-grid`, `.responsive-grid-2`, `.responsive-grid-equal`, `.responsive-grid-3`, `.responsive-grid-split`, `.responsive-grid-3-wide`) utilizando `minmax(0, ...)` en lugar de `1fr` plano para prevenir el desbordamiento forzado por el contenido mínimo interno.
   - En pantallas `<= 1280px` (laptops con sidebar extendido) y `<= 992px` (tablets), las columnas transicionan automáticamente a 1 columna o a layouts fluidos (`repeat(auto-fit, minmax(260px, 1fr))`).

3. **Contenedores con Scroll Horizontal Táctil (`.table-responsive` y `.spreadsheet-table-container`):**
   - Las tablas complejas (F210, Art. 73 y Hoja de Conciliación) se encapsulan en contenedores con scroll horizontal interno (`overflow-x: auto; -webkit-overflow-scrolling: touch;`), barra de scroll delgada estilizada y badge didáctico (`.table-scroll-hint`) que guía al usuario.
   - Se fijó `min-width` estructural en las tablas (e.g., `min-width: 1180px` en conciliación) para preservar la legibilidad de todas las columnas.

4. **Optimización Táctil de Entradas y Popovers:**
   - Tamaño de fuente de `15px`/`16px` en inputs móviles con `padding-left: 24px` en entradas monetarias para evitar colisiones con el prefijo `$ COP` y suprimir el auto-zoom de Safari.
   - Modales y popovers (`#casilla-popover`) adaptados como *bottom-sheets* con ancho táctil seguro (`width: 92vw; bottom: 20px;`).

---

## 3. Consecuencias y Beneficios

- **Exactitud y Usabilidad Multi-dispositivo:** La suite tributaria es 100% operable desde smartphones, tablets, laptops compactas y estaciones de trabajo de escritorio.
- **Cero Desbordamiento Horizontal:** Comprobado matemáticamente mediante la suite de pruebas Playwright en todos los módulos (`scrollWidth == innerWidth`).
- **Rendimiento:** Implementación puramente basada en CSS nativo y JavaScript vanilla, con cero impacto en el tiempo de carga del bundle.
