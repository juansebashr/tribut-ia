# Cómo Simular el Reajuste Fiscal de Activos Fijos (Art. 73 E.T.)

Esta guía práctica explica cómo utilizar el simulador y la API de TributIA para determinar el **costo fiscal ajustado** y optimizar legalmente el impuesto de Ganancia Ocasional o Renta al enajenar bienes raíces, acciones o aportes en sociedades adquiridos desde 1955.

---

## 1. Fundamento Legal (Art. 73 E.T.)

El Artículo 73 del Estatuto Tributario faculta a los contribuyentes personas naturales para determinar el costo fiscal de sus activos fijos enajenados multiplicando el **costo histórico de adquisición comprobado** por el factor de incremento porcentual certificado anualmente por el Gobierno Nacional / DANE:

$$\text{Costo Fiscal Ajustado} = \text{Costo Histórico de Adquisición} \times \text{Factor Multiplicador Art. 73}$$

$$\text{Ganancia Ocasional Bruta} = \max(0, \text{Precio de Venta} - \text{Costo Fiscal Ajustado})$$

---

## 2. Tipos de Activos y Factores

La tabla oficial cubre 4 tipologías de activos desde el año 1955 hasta 2024:
1. **Acciones y Aportes en Sociedades (`acciones_aportes`)**
2. **Bienes Raíces Urbanos (`bienes_raices_urbanos`)**
3. **Bienes Raíces Rurales Agropecuarios (`bienes_raices_rurales_agro`)**
4. **Bienes Raíces Rurales Generales (`bienes_raices_rurales`)**

---

## 3. Ejemplo de Uso vía API REST

### Petición HTTP (`POST /api/v1/beneficios/simular-articulo-73`)

```bash
curl -X POST "https://tributia-31954329640.us-central1.run.app/api/v1/beneficios/simular-articulo-73" \
     -H "Content-Type: application/json" \
     -d '{
       "ano_adquisicion": "2015",
       "tipo_activo": "bienes_raices_urbanos",
       "costo_adquisicion_historico_cop": 150000000,
       "precio_venta_cop": 400000000,
       "tarifa_impuesto_pct": 15.0
     }'
```

### Respuesta

```json
{
  "ano_adquisicion": "2015",
  "tipo_activo": "bienes_raices_urbanos",
  "factor_multiplicador": 1.63,
  "costo_adquisicion_historico_cop": 150000000.0,
  "costo_fiscal_ajustado_cop": 244500000.0,
  "precio_venta_cop": 400000000.0,
  "ganancia_sin_ajuste_cop": 250000000.0,
  "impuesto_sin_ajuste_cop": 37500000.0,
  "ganancia_con_ajuste_cop": 155500000.0,
  "impuesto_con_ajuste_cop": 23325000.0,
  "ahorro_tributario_cop": 14175000.0,
  "tarifa_aplicada_pct": 15.0,
  "explicacion": "Al aplicar el factor multiplicador 1.63x del Art. 73 E.T. correspondiente al año 2015, el costo fiscal se incrementó de $150.000.000 a $244.500.000, reduciendo la ganancia gravable en $94.500.000 y generando un ahorro en impuesto de $14.175.000 COP."
}
```
