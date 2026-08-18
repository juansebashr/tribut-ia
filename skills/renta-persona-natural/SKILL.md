---
name: renta-persona-natural
description: Use when analyzing bank statements, tax certificates, or financial documents to calculate, audit, and file individual income tax (Renta Personas Naturales - Formulario 210) for Colombian tax residents.
---

# Renta Personas Naturales Colombia (Formulario 210)

## Overview

Este skill automatiza el analisis de documentos bancarios, certificados de retencion y soportes contables para personas naturales residentes fiscales en Colombia, generando un libro de transacciones en CSV, clasificando por cedulas segun el Estatuto Tributario y la Ley 2277 de 2022, aplicando todos los beneficios tributarios legales y transmitiendo la liquidacion a la plataforma TributIA.

---

## When to Use

Use este skill cuando:
- El usuario tenga un directorio con extractos bancarios (PDF/Excel), certificados de ingresos y retenciones (Formulario 220), certificados de vivienda, medicina prepagada o facturas electronicas.
- Se requiera desglosar y clasificar entradas y salidas de dinero por concepto tributario.
- Se deba liquidar el impuesto sobre la renta de personas naturales (Cedula General, Pensiones, Dividendos y Ganancias Ocasionales).
- Se necesite inyectar la liquidacion en la API de TributIA para visualizar el Formulario 210 y el Termometro Progresivo.

**NO usar para:**
- Declaraciones de Personas Juridicas (Sociedades comerciales - Formulario 110).
- Declaraciones de IVA (Formulario 300) o Retencion en la Fuente (Formulario 350).

---

## Workflow en 4 Fases con Conciliacion Exogena

### Paso 0: Deteccion de Documentos Especiales

Al iniciar el analisis del directorio, verificar la presencia de dos documentos clave:
1. `DIAN - Facturas electronicas [Ano].xlsx` (o `.csv`): Usado para extraer el total de compras con pago electronico y liquidar la deduccion del 1% (Art. 336 Num. 5 E.T.).
2. `DIAN - Informacion exogena [Ano].xlsx` (o `.csv`): Usado para cruzar los valores reportados por terceros ante la DIAN frente a los certificados del contribuyente.

> **Regla de Continuidad**: Si el usuario NO tiene estos archivos, el flujo NO se detiene; continua normalmente liquidando con los certificados disponibles, omitiendo la conciliacion exogena y la deduccion del 1% si faltan.

---

### Fase 1: Ingesta y Desglose Documental en CSV (`transacciones_depuradas.csv`)

1. Escanear todos los archivos del directorio de documentos del contribuyente (`/documentos_renta` o carpeta especificada).
2. Extraer cada transaccion identificando: fecha, archivo de origen, nombre del tercero, NIT, descripcion, tipo de movimiento (`INGRESO`, `EGRESO`, `PATRIMONIO_ACTIVO`, `PATRIMONIO_PASIVO`, `RETENCION`), valor en COP, preclasificacion de cedula y concepto tributario.
3. Guardar las filas en `transacciones_depuradas.csv` usando el esquema definido en `templates/transacciones_template.csv`.

---

### Paso 1.5: Motor de Conciliacion Automatica contra Informacion Exogena

Si existe el archivo de Informacion Exogena, ejecutar el motor de conciliacion:
```bash
python skills/renta-persona-natural/scripts/conciliar_exogena.py transacciones_depuradas.csv "DIAN - Informacion exogena 2025.xlsx" --facturas "DIAN - Facturas electronicas 2025.xlsx" --out-csv conciliacion_exogena.csv --out-json estado_conciliacion.json
```
El script clasifica cada partida en:
- `MATCH_EXACTO`: Coincide el NIT y el valor reportado por el tercero.
- `DIFERENCIA_VALOR`: Coincide el NIT pero existe discrepancia numerica entre el certificado y la exogena.
- `SOLO_EN_CERTIFICADOS`: Registros del contribuyente no reportados en la exogena (se conservan en el calculo).
- `SOLO_EN_EXOGENA`: Partidas reportadas en la DIAN sin soporte en extractos/certificados (ej. cuentas bancarias antiguas, vehiculos, otros ingresos).

---

### Fase 2: Clasificacion Cedular y Aplicacion de Beneficios

1. Consultar el catalogo exhaustivo en `beneficios_tributarios_pn.md` para verificar los articulos del Estatuto Tributario, topes en UVT y reglas de exclusion.
2. **Ajuste Obligatorio por Inversiones y Cedula de Rentas de Capital (Revision Paso a Paso)**:
   - **Paso 2.1 (Exclusion del Capital Invertido)**: El dinero invertido (principal) NO es ingreso; constituye un activo en el **Patrimonio Bruto (Casilla 29)** a 31 de diciembre. El ingreso bruto tributario es unicamente el rendimiento o utilidad generada.
   - **Paso 2.2 (Componente Inflacionario - Art. 38, 40-1 y 41 E.T.)**: Para personas naturales no obligadas a llevar contabilidad, restar como INCRNGO (Casilla 59) el porcentaje certificado de inflacion sobre los rendimientos percibidos de entidades financieras y FICs (ej. 55,43% para 2025).
   - **Paso 2.3 (Regla de los 2 Anos en Venta de Acciones y Activos - Art. 300 E.T.)**:
     - Si el activo/accion fue poseido por **menos de 2 anos**: La utilidad neta (precio de venta - costo fiscal de adquisicion) se clasifica en la **Cedula General (Rentas No Laborales)** y tributa a la tarifa marginal del Art. 241 (hasta el 39%).
     - Si el activo/accion fue poseido por **2 anos o mas**: La utilidad neta se clasifica como **Ganancia Ocasional (Art. 300 E.T.)** y tributa a la tarifa fija del **15%** (Art. 313 y 314 E.T.).
     - En ambos casos, se debe restar el **Costo Fiscal de Adquisicion (Art. 71, 73 y 90 E.T.)** para no tributar sobre el capital recuperado.
3. Agrupar transacciones en sus respectivas cedulas (Trabajo, Capital, No Laborales, Pensiones, Dividendos, Ganancias Ocasionales).
4. Aplicar las deducciones y rentas exentas (INCRNGO, Deducciones ordinarias, 25% exenta laboral, tope 1.340 UVT, y deducciones extra-cupo).

---

### Paso 2.5: Aclaracion Interactiva con el Usuario sobre Discrepancias

Si el reporte de conciliacion contiene partidas `SOLO_EN_EXOGENA` o `DIFERENCIA_VALOR`:
1. El skill le presenta al usuario cada discrepancia con los datos de la DIAN (Tercero, NIT, Concepto y Valor).
2. Pregunta al usuario si desea incorporarlas a su declaracion o descartarlas (ej. cuentas inactivas de saldo menor, avaluo oficial de vehiculo, otros ingresos).
3. Con base en la respuesta del usuario, se actualizan las partidas en `transacciones_depuradas.csv` con resolucion `INCLUIDO_POR_EXOGENA` o `DESCARTADO_USUARIO`.

---

### Fase 3: Consolidacion e Inyeccion a la API de TributIA

1. Consolidar el CSV validado con el estado de conciliacion:
   ```bash
   python skills/renta-persona-natural/scripts/consolidar_transacciones.py transacciones_depuradas.csv --year 2025 --uvt 49799 --nombre "NOMBRE" --nit "NIT" --reconciliation estado_conciliacion.json --out payload_declaracion.json
   ```
2. Enviar los valores a la aplicacion web de TributIA:
   ```bash
   python skills/renta-persona-natural/scripts/inyectar_tributia.py payload_declaracion.json --api-url http://localhost:8000
   ```
3. Presentar al contribuyente el resumen con: Renta Liquida Gravable, Tarifa Marginal, Impuesto a Cargo, Retenciones aplicadas, Saldo Neto a Pagar o a Favor, y estado de conciliacion DIAN.

---

## Heuristicas de Clasificacion Documental

| Tipo de Documento | Campos y Datos Clave a Extraer | Concepto Tributario a Asignar |
| :--- | :--- | :--- |
| **Certificado Formulario 220 (Ingresos y Retenciones)** | Casilla 37 (Pagos laborales), Casilla 49 (Salud), Casilla 50 (Pension), Casilla 53 (Retenciones) | `SALARIO`, `INCRNGO_SALUD`, `INCRNGO_PENSION`, `RETENCION_FUENTE` |
| **Extracto Bancario (Cuentas Ahorros/Corriente)** | Saldo a 31 de diciembre, Rendimientos financieros, Retenciones practicadas (ReteFuente 7%), GMF 4x1000 cobrado | `PATRIMONIO_CUENTAS`, `RENTAS_CAPITAL`, `RETENCION_FUENTE`, `DED_GMF` |
| **Certificado Credito Hipotecario / Leasing** | Intereses pagados durante el ano, Saldo de la deuda a 31 de diciembre | `DED_VIVIENDA`, `DEUDA_HIPOTECARIA` |
| **Certificado Medicina Prepagada** | Pagos anuales por contratos de cobertura de salud | `DED_PREPAGADA` |
| **Certificado Fondos Voluntarios / Cuentas AFC** | Aportes voluntarios realizados en el ano gravable | `EXENTA_AFC` o `EXENTA_FVP` |
| **Facturas Electronicas de Compras Personales** | Sumatoria total de compras pagadas con medios electronicos | `DED_FACTURA_ELEC` |
| **Escrituras de Venta de Inmuebles** | Precio de venta, costo fiscal de adquisicion, anos de posesion | `GO_ACTIVOS` (si posesion >= 2 anos) o `RENTAS_NOLABORALES` |

---

## Common Mistakes

| Error Comun | Realidad Legal / Correccion |
| :--- | :--- |
| Tratar las deducciones de dependientes de 72 UVT dentro del limite del 40% | Las deducciones del Art. 336 Num. 2 (72 UVT por dependiente) estan legalmente excluidas del limite del 40% y de las 1.340 UVT. |
| Incluir el 1% de compras en factura electronica dentro del tope de 1.340 UVT | La deduccion del 1% del Art. 336 Num. 5 es extra-cupo, no consume las 1.340 UVT. |
| Mezclar ganancias ocasionales en la tabla del Art. 241 | Las ganancias ocasionales van a tarifa fija (15% o 35% loterias) y disfrutan de exenciones del Art. 307 y 311-1. |
| Olvidar restar los INCRNGO antes de calcular el 25% de renta exenta laboral | El 25% del Art. 206 Num. 10 se calcula sobre la base neta residual tras detraer INCRNGO y demas deducciones. |
