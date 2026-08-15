# 📋 Mapeo Oficial de Casillas — Formulario 210 DIAN

Correspondencia entre el modelo de datos de TributIA y las casillas oficiales del Formulario 210 de la DIAN.

| Casilla | Campo en TributIA | Descripción Oficial DIAN |
| :---: | :--- | :--- |
| **28** | `patrimonio_bruto` | Total patrimonio bruto a 31 de diciembre |
| **29** | `deudas` | Deudas y pasivos respaldados con documentos |
| **30** | `patrimonio_liquido` | Patrimonio líquido ($\text{Casilla 28} - \text{Casilla 29}$) |
| **32** | `rentas_trabajo_brutas` | Ingresos brutos por rentas de trabajo |
| **33** | `incrngo_trabajo` | Ingresos no constitutivos de renta ni ganancia ocasional |
| **34** | `renta_liquida_trabajo` | Renta líquida ordinaria de trabajo ($\text{C32} - \text{C33}$) |
| **35** | `rentas_exentas_trabajo` | Rentas exentas de trabajo (incluye 25% Art. 206) |
| **36** | `deducciones_imputables_trabajo` | Deducciones imputables (vivienda, prepagada, dependientes) |
| **37** | `rentas_exentas_deducciones_limitadas` | Total rentas exentas y deducciones limitadas al 40% / 1.340 UVT |
| **38** | `renta_liquida_ordinaria_trabajo` | Renta líquida ordinaria ($\text{C34} - \text{C37}$) |
| **39** | `renta_liquida_gravable` | Renta líquida gravable de la cédula general |
| **108** | `impuesto_rentas_liquidas_gravables` | Impuesto sobre las rentas líquidas gravables (Art. 241 E.T.) |
| **113** | `total_impuesto_a_cargo` | Total impuesto sobre la renta líquida |
| **118** | `retenciones_ano_gravable` | Retenciones en la fuente que le practicaron en el año |
| **134** | `saldo_a_pagar_impuesto` | Saldo a pagar por impuesto ($\text{C113} - \text{C118}$) |
| **137** | `saldo_a_favor` | Saldo a favor del contribuyente |
| **980** | `pago_total` | Pago total de la declaración |
