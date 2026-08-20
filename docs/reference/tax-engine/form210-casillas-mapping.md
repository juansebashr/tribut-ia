# Mapeo Oficial de Casillas — Formulario 210 DIAN (Declaración de Renta Personas Naturales)

Correspondencia canónica entre el modelo de datos de **TributIA** y las casillas oficiales del Formulario 210 de la DIAN bajo la **Ley 2277 de 2022** y el **Estatuto Tributario**.

---

## 1. Sección Patrimonio (Casillas 28 a 30)

| Casilla | Campo en TributIA | Descripción Oficial DIAN | Fórmula / Regla |
| :---: | :--- | :--- | :--- |
| **28** | `patrimonio_bruto` | Total patrimonio bruto poseído a 31 de diciembre | Bienes, cuentas bancarias, inmuebles, vehículos e inversiones. |
| **29** | `deudas` | Deudas y pasivos con soporte documental | Créditos hipotecarios, libranzas, tarjetas y deudas comerciales. |
| **30** | `patrimonio_liquido` | Patrimonio líquido | $\text{C30} = \max(0, \text{C28} - \text{C29})$ |

---

## 2. Cédula General — Rentas de Trabajo (Casillas 32 a 45)

| Casilla | Campo en TributIA | Descripción Oficial DIAN | Fórmula / Regla |
| :---: | :--- | :--- | :--- |
| **32** | `rentas_trabajo` | Ingresos brutos por rentas de trabajo | Salarios, honorarios laborales, viáticos, cesantías y bonificaciones. |
| **33** | `incrngo_trabajo` | Ingresos no constitutivos de renta (INCRNGO) | Aportes obligatorios a Salud (4%) y Pensión (4% + FSP). Art. 55-56 E.T. |
| **34** | `renta_liquida_trabajo` | Renta líquida de trabajo | $\text{C34} = \text{C32} - \text{C33}$ |
| **35** | `rentas_exentas_trabajo` | Rentas exentas de trabajo | 25% exenta laboral (Art. 206 Num. 10 - tope 790 UVT) + Aportes AFC/FVP. |
| **36** | `deducciones_imputables_trabajo` | Deducciones imputables ordinarias | 10% dependiente general, intereses vivienda, medicina prepagada, 50% GMF. |
| **37** | `rentas_exentas_deducciones_limitadas` | Total exenciones y deducciones limitadas | $\min(\text{C35} + \text{C36}, \min(0.40 \times \text{C34}, 1.340 \text{ UVT}))$ |
| **38** | `renta_liquida_ordinaria_trabajo` | Renta líquida ordinaria | $\text{C38} = \text{C34} - \text{C37}$ |
| **39** | `deduccion_dependientes_72uvt` | Deducción por dependientes adicionales | Hasta 4 dependientes adicionales a 72 UVT c/u (Art. 336 Num. 2). Extra-cupo. |
| **40** | `deduccion_factura_electronica` | Deducción del 1% compras factura electrónica | 1% de compras pagadas electrónicamente (Tope 240 UVT - Art. 336 Num. 5). Extra-cupo. |
| **41** | `total_exentas_deducciones_trabajo` | Total rentas exentas y deducciones de trabajo | $\text{C41} = \text{C37} + \text{C39} + \text{C40}$ |
| **42** | `renta_liquida_gravable_trabajo` | **Renta líquida gravable de trabajo** | $\mathbf{\text{C42} = \max(0, \text{C34} - \text{C41})}$ |

---

## 3. Cédula General — Rentas de Capital (Casillas 46 a 57)

| Casilla | Campo en TributIA | Descripción Oficial DIAN | Fórmula / Regla |
| :---: | :--- | :--- | :--- |
| **46** | `rentas_capital` | Ingresos brutos por rentas de capital | Intereses, rendimientos financieros, arrendamientos y regalías. |
| **47** | `incrngo_capital` | INCRNGO rentas de capital | Componente inflacionario sobre rendimientos financieros (Art. 38, 40-1 E.T.). |
| **48** | `renta_liquida_capital` | Renta líquida rentas de capital | $\text{C48} = \text{C46} - \text{C47}$ |
| **54** | `rentas_exentas_deducciones_capital` | Rentas exentas y deducciones limitadas de capital | Limitadas al 40% / 1.340 UVT conjunto. |
| **55** | `deduccion_factura_elec_capital` | Deducción 1% compras factura electrónica (Capital) | Art. 336 Num. 5 E.T. |
| **56** | `renta_liquida_gravable_capital` | **Renta líquida gravable de capital** | $\mathbf{\text{C56} = \max(0, \text{C48} - \text{C54} - \text{C55})}$ |

---

## 4. Cédula General — Rentas No Laborales (Casillas 58 a 72)

| Casilla | Campo en TributIA | Descripción Oficial DIAN | Fórmula / Regla |
| :---: | :--- | :--- | :--- |
| **58** | `rentas_nolaborales` | Ingresos brutos rentas no laborales | Comercio, honorarios no laborales, venta de activos $< 2$ años. |
| **59** | `incrngo_nolaborales` | INCRNGO rentas no laborales | Art. 36-1 a 57 E.T. |
| **60** | `costos_procedentes_nolaborales` | Costos y deducciones procedentes | Costos directos de operación con soporte (Art. 107 E.T.). |
| **61** | `renta_liquida_nolaborales` | Renta líquida no laboral | $\text{C61} = \max(0, \text{C58} - \text{C59} - \text{C60})$ |
| **70** | `rentas_exentas_deducciones_nolab` | Rentas exentas y deducciones limitadas no laborales | Limitadas al 40% / 1.340 UVT conjunto. |
| **71** | `deduccion_factura_elec_nolab` | Deducción 1% compras factura electrónica (No Laboral) | Art. 336 Num. 5 E.T. |
| **72** | `renta_liquida_gravable_nolaboral` | **Renta líquida gravable no laboral** | $\mathbf{\text{C72} = \max(0, \text{C61} - \text{C70} - \text{C71})}$ |

---

## 5. Cédula General — Renta Líquida Gravable Consolidada (Casilla 78)

| Casilla | Campo en TributIA | Descripción Oficial DIAN | Fórmula / Regla |
| :---: | :--- | :--- | :--- |
| **74** | `renta_liquida_ordinaria_cedula_general` | Renta líquida ordinaria cédula general | $\text{C74} = \text{C38} + \text{C50} + \text{C63}$ |
| **75** | `compensaciones_perdidas` | Compensaciones por pérdidas fiscales | Art. 147 E.T. |
| **76** | `total_deducciones_dependientes` | Total deducciones dependientes 72 UVT | $\text{C76} = \text{C39} + \text{C51} + \text{C64}$ |
| **77** | `total_deducciones_factura_elec` | Total deducciones 1% factura electrónica | $\text{C77} = \text{C40} + \text{C55} + \text{C71}$ |
| **78** | `renta_liquida_gravable_cedula_general` | **Renta líquida gravable cédula general** | $\mathbf{\text{C78} = \max(0, \text{C74} - \text{C75} - \text{C76} - \text{C77})}$ |

---

## 6. Ganancias Ocasionales (Casillas 80 a 89)

| Casilla | Campo en TributIA | Descripción Oficial DIAN | Fórmula / Regla |
| :---: | :--- | :--- | :--- |
| **80** | `go_ingresos_activos_fijos` | Ingresos por venta de activos fijos poseídos $\ge 2$ años | Venta de inmuebles, vehículos o acciones (Art. 300 E.T.). |
| **81** | `go_costos_activos_fijos` | Costos de los activos fijos enajenados | Costo fiscal de adquisición o reajuste fiscal (Art. 70, 73 E.T.). |
| **82** | `go_ganancias_herencias` | Ganancias ocasionales por herencias, legados o donaciones | Art. 302 E.T. |
| **83** | `go_ganancias_loterias` | Ganancias ocasionales por loterías, rifas y apuestas | Art. 304 E.T. (Tarifa 35%). |
| **84** | `go_ganancia_neta` | Ganancia ocasional neta | $(\text{C80} - \text{C81}) + \text{C82} + \text{C83}$ |
| **85** | `go_exentas_no_gravadas` | Ganancias ocasionales exentas y no gravadas | Vivienda de habitación (hasta 5.000 UVT Art. 311-1), herencias (Art. 307). |
| **86** | `go_gravables` | Ganancias ocasionales gravables | $\text{C86} = \max(0, \text{C84} - \text{C85})$ |
| **87** | `go_impuesto_loterias` | Impuesto a ganancias ocasionales por loterías | $\text{C83} \times 35\%$ |
| **88** | `go_impuesto_otras` | Impuesto ganancias ocasionales (Tarifa general 15%) | $(\text{C86} - \text{C83}) \times 15\%$ (Art. 313, 314 E.T.) |
| **89** | `go_total_impuesto` | **Total impuesto ganancias ocasionales** | $\mathbf{\text{C89} = \text{C87} + \text{C88}}$ |

---

## 7. Liquidación Privada & Impuesto Neto (Casillas 92 a 138)

| Casilla | Campo en TributIA | Descripción Oficial DIAN | Fórmula / Regla |
| :---: | :--- | :--- | :--- |
| **92** | `renta_liquida_gravable_total` | Total renta líquida gravable (General + Pensiones + Dividendos) | $\text{C78} + \text{C90} + \text{C91}$ |
| **97** | `impuesto_sobre_rentas_cedula_general` | **Impuesto sobre la cédula general** | **Aplicación de la tabla progresiva de 7 tramos del Art. 241 E.T. sobre C78.** |
| **108** | `impuesto_rentas_liquidas_gravables` | Total impuesto sobre las rentas líquidas gravables | $\text{C97} + \text{Impuesto Dividendos (Art. 242)}$ |
| **113** | `total_impuesto_a_cargo` | Total impuesto a cargo | $\text{C108} + \text{C89} - \text{Descuentos Tributarios (Art. 254-259)}$ |
| **118** | `retenciones_ano_gravable` | Retenciones en la fuente practicadas en el año | Retenciones certificadas por empleadores, bancos y agentes retenedores. |
| **119** | `anticipo_ano_anterior` | Anticipo de renta liquidado en el año anterior | Casilla 129 de la declaración del año previo. |
| **120** | `saldo_favor_ano_anterior` | Saldo a favor del año gravable anterior | Casilla 137 del año anterior (sin solicitud de devolución). |
| **134** | `saldo_a_pagar_impuesto` | **Saldo neto a pagar por impuesto** | $\mathbf{\max(0, \text{C113} - \text{C118} - \text{C119} - \text{C120})}$ |
| **137** | `saldo_a_favor` | **Saldo a favor del contribuyente** | $\mathbf{\max(0, (\text{C118} + \text{C119} + \text{C120}) - \text{C113})}$ |
| **980** | `pago_total` | Total a pagar en bancos (Recibo 490) | $\text{C134} + \text{Sanciones} + \text{Anticipo año siguiente}$ |
