# Cómo Realizar la Planeación Tributaria en Pareja & Manejo de Bienes Compartidos (Arts. 8, 119, 236, 241, 302 y 387 E.T.)

Esta guía práctica explica cómo utilizar el simulador y la API de **Fiscol** para estructurar la titularidad de activos familiares, evitar contingencias de inconsistencia patrimonial ante la DIAN y optimizar legítimamente la carga tributaria consolidada del hogar.

---

## 1. La Regla de Oro: Individualidad Fiscal (Art. 8 E.T.)

En Colombia existe una separación total entre el **derecho civil y de familia** (donde opera la sociedad conyugal) y el **derecho tributario**:

> **Artículo 8 del Estatuto Tributario:** *«Los cónyuges e integrantes de unión marital de hecho, individualmente considerados, son sujetos gravables en cuanto a sus correspondientes bienes y rentas.»*

* **No existen declaraciones conjuntas:** Cada cónyuge declara únicamente los ingresos percibidos a su nombre y los activos que figuren bajo su titularidad jurídica (escritura pública, matrícula de vehículos, cuentas bancarias).
* **La sociedad conyugal no es contribuyente:** No tiene NIT ni presenta declaraciones de renta mientras esté vigente el matrimonio.

---

## 2. Diagnóstico de Riesgos: "¿Qué pasa si uno pone la plata y el bien queda a nombre del otro?"

Cuando un cónyuge financia la adquisición de un bien y este se escritura 100% a nombre de su pareja sin ingresos suficientes:

1. **Riesgo de Comparación Patrimonial (Arts. 236 y 237 E.T.):**
   Para el cónyuge titular se genera un incremento patrimonial injustificado. La DIAN presume automáticamente que la diferencia es **renta líquida gravable no declarada**, liquidando el impuesto a tarifas ordinarias de hasta el 39%.
2. **Riesgo de Donación Involuntaria (Art. 302 E.T.):**
   Si se transfiere el dinero o el bien a título gratuito, constituye una donación entre vivos gravada como **Ganancia Ocasional al 15%** para el cónyuge receptor.

### 🛡️ Soluciones Jurídicas Válidas

* **Copropiedad / Proindiviso:** Escriturar el activo en porcentajes proporcionales (50/50 u 80/20) según el aporte real de cada uno. Cada cónyuge declara su porcentaje respectivo de costo fiscal y patrimonio.
* **Contrato de Mutuo / Préstamo entre Cónyuges (Art. 283 E.T.):** Si el bien queda a nombre de uno solo, el titular declara el activo en patrimonio bruto y paralelamente un pasivo (cuenta por pagar) a favor de su pareja con documento de **fecha cierta** ante notario. El aportante declara una cuenta por cobrar.
* **Gananciales (Art. 47 E.T.):** La repartición 50/50 de bienes es **Ingreso No Constitutivo de Renta ni Ganancia Ocasional (INCRNGO)** únicamente al momento de la liquidación formal de la sociedad conyugal (por divorcio, disolución voluntaria o fallecimiento).

---

## 3. Estrategias Maestras de Optimización

1. **Aprovechamiento Duplicado de los Tramos del 0% (Art. 241 E.T.):**
   Las primeras 1.090 UVT ($57.061.500 COP en 2026) tributan al 0%. Al repartir activos generadores de rentas de capital (arriendos, inversiones) al 50/50, ambos cónyuges aprovechan el tramo del 0% y el límite individual de rentas exentas del 40% (1.340 UVT).
2. **Distribución de Dependientes Económicos (Art. 387 y Art. 336 Num. 2 E.T.):**
   Concurrencia de padres en deducción de hijos o inclusión de cónyuge dependiente si gana menos de 260 UVT anuales.
3. **Intereses de Vivienda (Art. 119 E.T.):**
   Concentración del 100% de la deducción en el cónyuge con mayor tasa marginal (hasta 1.200 UVT).
4. **Venta de Casa de Habitación en Copropiedad (Art. 311-1 E.T.):**
   Exención de hasta 5.000 UVT por cónyuge (hasta 10.000 UVT combinadas).

---

## 4. Ejemplo de Uso vía API REST

### Petición HTTP (`POST /api/v1/beneficios/simular-tributacion-pareja`)

```bash
curl -X POST "https://fiscol-31954329640.us-central1.run.app/api/v1/beneficios/simular-tributacion-pareja" \
     -H "Content-Type: application/json" \
     -d '{
       "tax_year": 2026,
       "conyuge_a": {
         "nombre": "Cónyuge A",
         "ingresos_laborales_anuales": 140000000,
         "aportes_seguridad_social_salud_pension": 11200000,
         "tiene_dependiente_general_387": true,
         "numero_dependientes_adicionales_72uvt": 1,
         "otras_deducciones_y_exentas_cedula_general": 28000000
       },
       "conyuge_b": {
         "nombre": "Cónyuge B",
         "ingresos_laborales_anuales": 30000000,
         "aportes_seguridad_social_salud_pension": 2400000,
         "tiene_dependiente_general_387": false,
         "numero_dependientes_adicionales_72uvt": 0,
         "otras_deducciones_y_exentas_cedula_general": 6000000
       },
       "rentas_capital_conjuntas_arriendos_intereses": 60000000,
       "costos_procedentes_rentas_capital": 6000000,
       "intereses_credito_vivienda_conjunto_anual": 24000000,
       "valor_activo_adquirido_en_el_ano": 350000000,
       "esquema_adquisicion_activo": "COPROPIEDAD_PROINDIVISO_50_50",
       "distribucion_intereses_vivienda": "100_CONYUGE_A"
     }'
```

### Respuesta

```json
{
  "tax_year": 2026,
  "uvt_value": 52350.0,
  "escenario_no_optimizado": {
    "nombre_escenario": "Escenario Tradicional / Sin Planificación",
    "total_impuesto_familiar_cop": 25482000.0,
    "tarifa_efectiva_familiar_pct": 14.16
  },
  "escenario_optimizado": {
    "nombre_escenario": "Escenario de Planeación Conyugal Optimizada",
    "total_impuesto_familiar_cop": 14619000.0,
    "tarifa_efectiva_familiar_pct": 8.12
  },
  "ahorro_tributario_familiar_neto_cop": 10863000.0,
  "porcentaje_ahorro_familiar_pct": 42.63,
  "analisis_riesgo_patrimonial": {
    "riesgo_comparacion_patrimonial_conyuge_titular": false,
    "monto_desajuste_potencial_cop": 0.0,
    "diagnostico_legal": "ESTRUCTURA BLINDADA: La titularidad en proindiviso 50/50 distribuye el costo fiscal y el patrimonio entre ambos cónyuges.",
    "solucion_recomendada": "Asegurar que la escritura pública de compraventa establezca explícitamente el porcentaje de participación del 50% para cada uno."
  }
}
```
