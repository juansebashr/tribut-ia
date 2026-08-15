# 📊 Diagrama de Secuencia: Pipeline de Liquidación Tributaria

Este diagrama ilustra el flujo de ejecución interno para liquidar la Cédula General y el Formulario 210 según el Estatuto Tributario y la Ley 2277 de 2022.

```mermaid
sequenceDiagram
    autonumber
    participant UI as 🖥️ Interfaz Web / API
    participant Endpoint as 🌐 Endpoint /calculate
    participant Liquidator as ⚙️ liquidacion_pn.py
    participant Rules as 📜 rules_engine.py
    participant RulesJSON as 📁 rules_2026.json

    UI->>Endpoint: POST /api/v1/calculate/persona-natural/calculate (Input Pydantic)
    Endpoint->>Rules: get_rules(tax_year=2026, custom_uvt=52350)
    Rules->>RulesJSON: Cargar parámetros si no están en caché
    RulesJSON-->>Rules: Matriz legal (UVT, límites, tarifas, Art. 241)
    Rules-->>Endpoint: Reglas consolidadas

    Endpoint->>Liquidator: liquidar_persona_natural(input_data, rules)
    
    rect rgb(240, 248, 255)
        Note over Liquidator: Paso 1: Ingresos Brutos y No Constitutivos (INCRNGO)
        Liquidator->>Liquidator: INCRNGO = Salud (4%) + Pensión (4%)
        Liquidator->>Liquidator: Ingreso Neto = Ingresos Brutos - INCRNGO
    end

    rect rgb(255, 250, 240)
        Note over Liquidator: Paso 2: Deducciones Imputables y Rentas Exentas
        Liquidator->>Liquidator: Intereses Vivienda (Tope 1.200 UVT)
        Liquidator->>Liquidator: Medicina Prepagada (Tope 192 UVT)
        Liquidator->>Liquidator: Dependiente General 10% (Tope 384 UVT)
        Liquidator->>Liquidator: Compras Factura Electrónica 1% (Tope 240 UVT)
        Liquidator->>Liquidator: Renta Exenta 25% (Art. 206 Num. 10, Tope 790 UVT)
    end

    rect rgb(245, 255, 245)
        Note over Liquidator: Paso 3: Límite Conjunto del 40% y 1.340 UVT (Art. 336 E.T.)
        Liquidator->>Liquidator: Tope 40% = Ingreso Neto * 0.40
        Liquidator->>Liquidator: Tope Absoluto = 1.340 UVT
        Liquidator->>Liquidator: Límite Final = MIN(Deducciones Solicitadas, Tope 40%, Tope 1.340 UVT)
        Liquidator->>Liquidator: Renta Líquida Gravable = Ingreso Neto - Límite Final - Deducciones Extracupo
    end

    rect rgb(255, 245, 245)
        Note over Liquidator: Paso 4: Impuesto según Tabla Marginal Art. 241 E.T.
        Liquidator->>Liquidator: Ubicar tramo (0%, 19%, 28%, 33%, 35%, 37%, 39%)
        Liquidator->>Liquidator: Impuesto Bruto = ((Base UVT - Desde UVT) * Tarifa + Base Fija UVT) * Valor UVT
        Liquidator->>Liquidator: Redondeo al múltiplo de 1.000 más cercano (Art. 868 E.T.)
        Liquidator->>Liquidator: Mapear casillas oficiales Formulario 210 DIAN
    end

    Liquidator-->>Endpoint: PersonaNaturalOutput (Resultados + Trazabilidad de Auditoría)
    Endpoint-->>UI: JSON HTTP 200
```
