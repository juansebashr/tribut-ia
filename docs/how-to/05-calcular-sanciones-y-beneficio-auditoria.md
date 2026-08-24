# Cómo Calcular Sanciones Tributarias y Simular el Beneficio de Auditoría

Esta guía explica cómo calcular las sanciones por corrección y extemporaneidad aplicando el principio de favorabilidad del Art. 640 y cómo verificar el cumplimiento del Beneficio de Auditoría del Art. 689-3 E.T.

---

## 1. Firmeza de las Declaraciones Tributarias & Beneficio de Auditoría

### Término General de Firmeza de la DIAN (Art. 714 E.T.)

Por regla general, la declaración de renta queda en **firme a los 3 años** contados a partir del vencimiento del plazo para declarar (o de la fecha de presentación si fue extemporánea). Si la declaración arroja saldo a favor, el término de firmeza será de 3 años contados a partir de la fecha de presentación de la solicitud de devolución o compensación.

> **Suspensión e Interrupción de la Firmeza**: Si dentro de ese lapso la DIAN profiere y notifica un **Emplazamiento para Corregir (Art. 685 E.T.)** o un **Requerimiento Especial (Art. 703 E.T.)**, el término de firmeza se suspende o interrumpe, permitiéndole a la administración tributaria revisar a fondo, practicar pruebas y proferir una Liquidación Oficial de Revisión.

---

### Beneficio de Auditoría (Art. 689-3 E.T.)

El Beneficio de Auditoría es una prerrogativa legal que reduce sustancialmente el término general de firmeza de 3 años a solo **6 o 12 meses**, blindando definitivamente la declaración contra revisiones posteriores de la DIAN, siempre que se cumplan las siguientes condiciones copulativas:

1. **Oportunidad en la Presentación y Pago:** Presentar la declaración y realizar el pago total del impuesto liquidado dentro de los plazos fijados por el Gobierno Nacional.
2. **Impuesto Mínimo del Año Anterior:** El impuesto neto de renta del año gravable anterior debe ser igual o superior a **71 UVT** ($3.716.850 COP en 2026).
3. **Incremento Porcentual Mínimo:**
   - **Firmeza en 6 Meses:** Incrementar el impuesto neto de renta en al menos un **35%** respecto al año anterior.
   - **Firmeza en 12 Meses:** Incrementar el impuesto neto de renta en al menos un **25%** respecto al año anterior.

| Mecanismo de Firmeza | Término Legal | Requisitos Principales | Base Legal |
| :--- | :--- | :--- | :--- |
| **Firmeza Ordinaria** | **3 Años** (36 meses) | Regla general para declaraciones presentadas en debida forma. | Art. 714 E.T. |
| **Pérdidas Fiscales** | **5 Años** (60 meses) | Declaraciones donde se liquiden o compensen pérdidas fiscales. | Art. 714 Inc. 5 E.T. |
| **Beneficio de Auditoría (Meta 1)** | **12 Meses** | Incremento $\ge 25\%$ + Impuesto anterior $\ge 71\text{ UVT}$ + Pago oportuno. | Art. 689-3 E.T. |
| **Beneficio de Auditoría (Meta 2)** | **6 Meses** | Incremento $\ge 35\%$ + Impuesto anterior $\ge 71\text{ UVT}$ + Pago oportuno. | Art. 689-3 E.T. |

### Ejemplo vía API REST (`POST /api/v1/beneficios/simular-auditoria`)

```bash
curl -X POST "https://fiscol-31954329640.us-central1.run.app/api/v1/beneficios/simular-auditoria" \
     -H "Content-Type: application/json" \
     -d '{
       "tax_year": 2026,
       "impuesto_neto_ano_anterior": 15000000
     }'
```

---

## 2. Liquidación de Sanciones (Arts. 641, 644, 647, 648, 640 y 639 E.T.)

### Sanción por Corrección (Art. 644)

- **10%** del mayor valor a pagar si se corrige voluntariamente antes del emplazamiento.
- **20%** tras emplazamiento para corregir de la DIAN.

### Sanción por Extemporaneidad (Art. 641)

- **5% por mes o fracción de mes** del impuesto a cargo (máximo 100% voluntario / 200% emplazado).
- **10% por mes** tras emplazamiento de la DIAN.

### Sanción por Inexactitud (Arts. 647, 648, 709 y 710)

- **¿Cuándo se genera? (Art. 647):** Omisión de ingresos gravados o de bienes, inclusión de costos, deducciones, descuentos, exenciones, pasivos o retenciones inexistentes, compras a proveedores ficticios, o utilización de datos falsos o desfigurados que deriven en un menor impuesto o mayor saldo a favor.
- **Tarifas (Art. 648):**
  - **100% (General):** Sobre el mayor valor determinado en la liquidación oficial.
  - **160% (Facturas Falsas / Proveedores Ficticios):** Sustentación de costos con operaciones inexistentes (Art. 648 Num. 2).
  - **200% (Abuso Tributario):** En operaciones constitutivas de abuso fiscal (Art. 648 Num. 1).
- **Reducción Procesal por Aceptación (Arts. 709 y 710):**
  - **35%:** En respuesta al Requerimiento Especial (se allana y paga el mayor valor).
  - **70%:** Con la interposición del Recurso de Reconsideración.

### Reducciones del Principio de Favorabilidad (Art. 640)

- **50% de descuento** si no se han cometido infracciones en los 2 años anteriores.
- **25% de descuento** si no se han cometido infracciones en el último año.
- *(Nota: No aplica a conductas dolosas, facturas falsas o abuso tributario según el Parágrafo 3 del Art. 640).*

### Control de Sanción Mínima (Art. 639)

Ninguna sanción tributaria puede ser inferior a **10 UVT** ($523.500 COP para el año gravable 2026).

---

## 3. Intereses Moratorios Diarios Compuestos (Arts. 634 y 635 E.T.)

Los intereses corren día a día desde la fecha de vencimiento legal hasta la fecha de pago efectivo sobre el capital insoluto:

$$I = K \times \left( \left(1 + \frac{\text{Tasa E.A.}}{100}\right)^{\frac{D}{365}} - 1 \right)$$

- **Tasa:** Tasa de usura certificada por la Superintendencia Financiera menos dos (2) puntos porcentuales (~23.0% E.A.).
- **Independencia:** La sanción mínima del Art. 639 **no** aplica a los intereses de mora.
- **Total Consolidado:** $\text{Total a Pagar} = \text{Capital Insoluto} + \text{Sanción Reducida} + \text{Intereses de Mora}$.

---

## 4. Ejemplo de Cálculo vía API (`POST /api/v1/beneficios/calcular-sancion`)

```bash
curl -X POST "https://fiscol-31954329640.us-central1.run.app/api/v1/beneficios/calcular-sancion" \
     -H "Content-Type: application/json" \
     -d '{
       "tipo_sancion": "inexactitud_general",
       "monto_base_cop": 20000000,
       "es_voluntario_sin_emplazamiento": true,
       "sin_sanciones_ultimos_2_anos": true,
       "sin_sanciones_ultimo_1_ano": true,
       "incluir_intereses_mora": true,
       "dias_mora": 90,
       "tasa_interes_anual_pct": 23.0,
       "tax_year": 2026
     }'
```
