# Cómo Analizar el Control por Comparación Patrimonial (Arts. 236 y 237 E.T.)

Esta guía práctica explica cómo utilizar el motor y la API de **Fiscol** para verificar la justificación del incremento patrimonial de una Persona Natural y prevenir liquidaciones oficiales por **Renta Líquida Gravable por Comparación Patrimonial**.

---

## 1. Fundamento Legal (Arts. 236 y 237 E.T.)

El mecanismo de control por comparación patrimonial es una herramienta legal que utiliza la DIAN para detectar omisión de ingresos o activos ocultos:

$$\text{Patrimonio Líquido Actual} - \text{Patrimonio Líquido Anterior} \le \text{Rentas Justificadas Netas}$$

Si una persona natural adquiere bienes, inmuebles, vehículos o incrementa sus saldos bancarios, debe demostrar de dónde provinieron los recursos económicos para financiar dicho aumento. Si el incremento patrimonial supera las rentas e ingresos netos justificados, la ley presume que la diferencia es **renta líquida gravable por comparación patrimonial** (Art. 236 E.T.), tributando a las tarifas progresivas del Art. 241 E.T. sin derecho a deducciones ni rentas exentas.

> **Término General de Firmeza (Art. 714 E.T.):** Por regla general, la declaración de renta queda en **firme a los 3 años** contados a partir del vencimiento del plazo para declarar (o de la fecha de presentación si fue extemporánea). Si dentro de ese lapso la DIAN profiere y notifica un **Emplazamiento para Corregir (Art. 685 E.T.)** o un **Requerimiento Especial (Art. 703 E.T.)**, el término de firmeza se suspende o interrumpe, permitiéndole a la administración revisar a fondo y liquidar oficialmente el tributo.

---

## 2. Fórmulas de Cálculo

1. **Variación Patrimonial Bruta:**
   $$\Delta\text{PL} = \text{Patrimonio Líquido Año Actual} - \text{Patrimonio Líquido Año Anterior}$$

2. **Incremento a Justificar:**
   $$\text{Incremento a Justificar} = \max(0, \Delta\text{PL} - \text{Reajustes Fiscales (Arts. 70/73)} - \text{Valorizaciones})$$

3. **Capacidad Neta de Justificación:**
   $$\text{Capacidad Neta} = (\text{Rentas Ordinarias} + \text{Pensiones/Div} + \text{Rentas Exentas} + \text{INCRNGO} + \text{GO Neta} + \text{Nuevas Deudas} + \text{Desahorro}) - (\text{Impuestos Pagados} + \text{Gastos Personales})$$

4. **Diferencia No Justificada (Art. 236 E.T.):**
   $$\text{Renta por Comparación Patrimonial} = \max(0, \text{Incremento a Justificar} - \text{Capacidad Neta})$$

---

## 3. Ejemplo de Uso vía API REST

### Petición HTTP (`POST /api/v1/persona-natural/comparacion-patrimonial`)

```bash
curl -X POST "https://fiscol-31954329640.us-central1.run.app/api/v1/persona-natural/comparacion-patrimonial" \
     -H "Content-Type: application/json" \
     -d '{
       "tax_year": 2026,
       "patrimonio_liquido_ano_anterior": 180000000,
       "patrimonio_bruto_ano_actual": 520000000,
       "deudas_ano_actual": 220000000,
       "reajustes_fiscales_activos_fijos": 20000000,
       "renta_liquida_ordinaria_cedula_general": 90000000,
       "rentas_exentas_totales": 22000000,
       "ingresos_no_constitutivos_renta": 9000000,
       "nuevas_deudas_adquiridas_en_el_ano": 120000000,
       "desahorro_o_liquidacion_activos_anteriores": 30000000,
       "impuesto_renta_y_ganancia_ocasional_pagado": 10000000,
       "retenciones_fuente_asumidas_en_el_ano": 4000000,
       "gastos_personales_y_consumo_estimado": 48000000
     }'
```

### Respuesta

```json
{
  "tax_year": 2026,
  "uvt_value": 52350.0,
  "patrimonio_liquido_ano_anterior": 180000000.0,
  "patrimonio_bruto_ano_actual": 520000000.0,
  "deudas_ano_actual": 220000000.0,
  "patrimonio_liquido_ano_actual": 300000000.0,
  "variacion_patrimonial_bruta": 120000000.0,
  "ajustes_patrimoniales_netos": 20000000.0,
  "incremento_patrimonial_a_justificar": 100000000.0,
  "total_rentas_justificativas": 271000000.0,
  "total_detracciones_consumos": 62000000.0,
  "capacidad_justificacion_neta": 209000000.0,
  "diferencia_no_justificada": 0.0,
  "existe_renta_por_comparacion_patrimonial": false,
  "renta_liquida_gravable_adicional_cop": 0.0,
  "renta_liquida_gravable_adicional_uvt": 0.0,
  "impuesto_estimado_comparacion_patrimonial_cop": 0.0,
  "estado_patrimonial": "JUSTIFICADO_CORRECTAMENTE",
  "porcentaje_justificacion": 100.0,
  "explicacion_didactica": "El patrimonio líquido se encuentra plenamente justificado. La capacidad neta de justificación ($209.000.000 COP) es suficiente para respaldar el incremento patrimonial fiscal ($100.000.000 COP) con un margen de holgura de $109.000.000 COP.",
  "recomendaciones_defensa_dian": [
    "Conservar los extractos bancarios de saldo al 31 de diciembre de los dos últimos años.",
    "Mantener copias de las escrituras públicas de compraventa y los certificados de tradición de los bienes raíces adquiridos.",
    "Tener a disposición los certificados de ingresos y retenciones (Formulario 220) y extractos de cesantías que respaldan los flujos del año."
  ]
}
```
