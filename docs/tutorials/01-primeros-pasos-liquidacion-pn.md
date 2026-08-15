# Tutorial: Primeros Pasos Liquidando Renta de Persona Natural (F210)

En este tutorial aprenderás a realizar una liquidación completa de impuesto de renta para una Persona Natural en Colombia (Año Gravable 2026 / UVT $52.350) usando TributIA.

---

## Objetivo
Liquidar a un empleado con ingresos brutos de **$120'000.000 COP**, aportes obligatorios de seguridad social, medicina prepagada e intereses de vivienda, verificando el Formulario 210 y el Termómetro Progresivo.

---

## Pasos a Seguir

### Paso 1: Ingreso de Datos Básicos y UVT
1. Abre [http://localhost:8000](http://localhost:8000).
2. En la cabecera, verifica que el año seleccionado sea **2026** y el valor UVT sea **$52.350**.
3. En la sección **Identificación del Declarante**, ingresa:
- **Nombre**: `CARLOS ALBERTO PEREZ GOMEZ`
- **NIT**: `1234567890` (El sistema calculará automáticamente el DV `4` usando Módulo 11).

### Paso 2: Diligenciamiento de Ingresos Laborales
1. En la tarjeta **1. Ingresos Brutos Cédula General**, digita:
- **Rentas de Trabajo (Salarios / Honorarios)**: `120'000.000`
- El sistema formatea automáticamente el campo con la máscara contable colombiana.

### Paso 3: Aportes Obligatorios de Seguridad Social (INCRNGO)
1. En la tarjeta **2. Ingresos No Constitutivos de Renta (INCRNGO)**, digita:
- **Aportes Obligatorios a Salud**: `4'800.000` (4%)
- **Aportes Obligatorios a Pensión**: `4'800.000` (4%)
2. El Ingreso Neto Cedular se calculará en `$110'400.000 COP`.

### Paso 4: Deducciones Imputables y Rentas Exentas
1. En la tarjeta **3. Deducciones Imputables & Rentas Exentas**:
- Activa el interruptor **Deducción por Dependiente Económico (10%)**: Aceptará `$11'040.000 COP`.
- **Intereses de Vivienda**: Digita `12'000.000`.
- **Factura Electrónica (1% compras)**: Digita `15'000.000` (Deducción de `$150.000 COP`).
2. El motor calcula automáticamente la **Renta Exenta del 25% (Art. 206 Num. 10 E.T.)** sobre la base residual y aplica el límite conjunto del 40% y 1.340 UVT ($70'149.000 COP).

### Paso 5: Revisión de Resultados y Formulario 210
1. Revisa las tarjetas superiores de KPI:
- **Renta Líquida Gravable**: `$88'643.500 COP` (1.693,29 UVT).
- **Impuesto Bruto de Renta**: `$5'996.000 COP`.
- **Tramo Marginal**: Tramo 2 (19%).
2. Cambia a la sub-pestaña ** Formulario 210 DIAN Real** para ver cada casilla diligenciada con exactitud legal.
3. Cambia a la sub-pestaña ** Tarifa Progresiva & Termómetro** para visualizar la aguja del termómetro y la descomposición por rebanadas de ingreso.

