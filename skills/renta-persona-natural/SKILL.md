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

## Workflow en 3 Fases

### Fase 1: Ingesta y Desglose Documental en CSV (`transacciones_depuradas.csv`)

1. Escanear todos los archivos del directorio de documentos del contribuyente (`/documentos_renta` o carpeta especificada).
2. Extraer cada transaccion identificando: fecha, archivo de origen, nombre del tercero, NIT, descripcion, tipo de movimiento (`INGRESO`, `EGRESO`, `PATRIMONIO_ACTIVO`, `PATRIMONIO_PASIVO`, `RETENCION`), valor en COP, preclasificacion de cedula y concepto tributario.
3. Guardar las filas en `transacciones_depuradas.csv` usando el esquema definido en `templates/transacciones_template.csv`.
4. Reportar al usuario el numero de movimientos extraidos y solicitar revision si existen transacciones con confianza `REQUIERE_REVISION`.

### Fase 2: Clasificacion Cedular y Aplicacion de Beneficios

1. Consultar el catalogo exhaustivo en `beneficios_tributarios_pn.md` para verificar los articulos del Estatuto Tributario, topes en UVT y reglas de exclusion.
2. Agrupar transacciones en sus respectivas cedulas:
   - **Cedula General - Rentas de Trabajo**: Salarios, honorarios y compensaciones laborales.
   - **Cedula General - Rentas de Capital**: Rendimientos financieros, arrendamientos y regalias.
   - **Cedula General - Rentas No Laborales**: Ingresos comerciales y de servicios independientes con costos procedentes.
   - **Cedula de Pensiones**: Mesadas pensionales (exentas hasta 1.000 UVT mes).
   - **Cedula de Dividendos**: Dividendos ordinarios o con componentes no gravados.
   - **Ganancias Ocasionales**: Venta de inmuebles poseidos por mas de 2 anos, herencias y donaciones.
3. Aplicar las deducciones y rentas exentas con estricto orden matematico:
   - **Paso A**: Restar INCRNGO (Salud 4%, Pension 4% y FSP).
   - **Paso B**: Imputar Deducciones Ordinarias (Vivienda hasta 1.200 UVT, Prepagada hasta 192 UVT, Dependientes 10% hasta 384 UVT, GMF 50%).
   - **Paso C**: Calcular Renta Exenta Laboral del 25% (Art. 206 Num. 10 E.T., max 790 UVT).
   - **Paso D**: Aplicar Limite Conjunto del 40% o 1.340 UVT ($70.149.000 en 2026).
   - **Paso E**: Imputar Deducciones Especiales Extra-Cupo (Dependientes adicionales de 72 UVT c/u max 288 UVT y 1% de compras en factura electronica max 240 UVT).
4. Generar la consolidacion ejecutando:
   ```bash
   python skills/renta-persona-natural/scripts/consolidar_transacciones.py transacciones_depuradas.csv --year 2026 --uvt 52350 --nombre "NOMBRE COMPLETO" --nit "NIT_SIN_DV" --out payload_declaracion.json
   ```

### Fase 3: Inyeccion a la API de TributIA y Verificacion Visual

1. Enviar los valores a la aplicacion web de TributIA:
   ```bash
   python skills/renta-persona-natural/scripts/inyectar_tributia.py payload_declaracion.json --api-url http://localhost:8000
   ```
2. La plataforma web recibe el payload, dispara el recalculo reactivo, aplica la mascara contable colombiana (`$120'000.000`), llena el Formulario 210 oficial y situa el Termometro Progresivo en el bracket correspondiente.
3. Presentar al contribuyente el resumen con: Renta Liquida Gravable, Tarifa Marginal, Impuesto a Cargo, Retenciones aplicadas y Saldo Neto a Pagar o a Favor.

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
