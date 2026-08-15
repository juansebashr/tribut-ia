# Guía How-To: Simular Tasa Mínima de Tributación (TTD 15% - PJ)

Esta guía explica cómo calcular el Formulario 110 y verificar si una sociedad comercial activa la Tasa de Tributación Depurada (TTD) del 15% establecida en el Parágrafo 6 del Artículo 240 del Estatuto Tributario.

---

## 1. Fundamento de la Tasa Mínima de Tributación (TTD)

$$\text{TTD} = \frac{\text{Impuesto Depurado (ID)}}{\text{Utilidad Depurada (UD)}} \ge 15\%$$

Si $\text{TTD} < 15\%$, la empresa debe liquidar un **Impuesto a Adicionar (IA)** para alcanzar la tasa efectiva mínima del 15%:

$$\text{IA} = (\text{UD} \times 15\%) - \text{ID}$$

---

## 2. Ejecución vía API

```bash
curl -X POST http://localhost:8000/api/v1/calculate/persona-juridica/calculate \
-H "Content-Type: application/json" \
-d '{
"tax_year": 2026,
"custom_uvt": 52350,
"ingresos_brutos_operacionales": 1200000000,
"ingresos_no_operacionales": 50000000,
"devoluciones_rebajas_descuentos": 20000000,
"ingresos_no_constitutivos_renta": 10000000,
"costos_ventas_operacionales": 650000000,
"gastos_administracion_ventas": 180000000,
"gastos_ventas_distribucion": 100000000,
"gastos_financieros": 30000000,
"utilidad_contable_antes_impuestos": 260000000,
"gastos_no_deducibles": 15000000,
"descuento_tributario_ica": 12000000,
"retenciones_en_la_fuente": 35000000,
"autorretenciones_practicadas": 20000000
}'
```

