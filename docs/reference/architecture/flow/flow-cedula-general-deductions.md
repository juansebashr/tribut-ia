# 🌲 Flowchart: Algoritmo de Topes de Rentas Exentas y Deducciones

Diagrama de flujo de decisión para la depuración de la Cédula General y aplicación de límites del Artículo 336 del Estatuto Tributario (reforma Ley 2277 de 2022).

```mermaid
flowchart TD
    Start([Inicio Depuración Cédula General]) --> Ingresos[1. Calcular Ingresos Brutos Laborales y No Laborales]
    Ingresos --> Incrngo[2. Restar INCRNGO: Salud y Pensión Obligatoria]
    Incrngo --> IngNeto[3. Obtener Ingreso Neto Cedular]
    
    IngNeto --> DedSol[4. Calcular Deducciones Imputables Solicitadas:\n- Intereses Vivienda (Máx 1.200 UVT)\n- Medicina Prepagada (Máx 192 UVT)\n- Dependiente Económico 10% (Máx 384 UVT)\n- 50% GMF 4x1000]
    
    DedSol --> Base25[5. Base Renta Exenta 25% = Ingreso Neto - Deducciones Imputables]
    Base25 --> Calc25[6. Renta Exenta 25% = MIN(Base * 0.25, 790 UVT)]
    
    Calc25 --> SumSol[7. Suma Total de Beneficios Ordinarios = Deducciones + Rentas Exentas + 25%]
    
    SumSol --> Check40{¿Suma Total > 40% del Ingreso Neto?}
    Check40 -- Sí --> Cap40[Aplicar Tope del 40%]
    Check40 -- No --> Mantener1[Mantener Suma Solicitada]
    
    Cap40 --> Check1340{¿Supera 1.340 UVT?}
    Mantener1 --> Check1340
    
    Check1340 -- Sí --> Cap1340[Limitar a 1.340 UVT ($70'149.000 en 2026)]
    Check1340 -- No --> Aceptado[Aceptar Valor Calculado]
    
    Cap1340 --> DedExtra[8. Aplicar Deducciones Especiales Extra-Cupo:\n- Dependientes adicionales 72 UVT c/u\n- 1% Compras Factura Electrónica máx 240 UVT]
    Aceptado --> DedExtra
    
    DedExtra --> RLG[9. Renta Líquida Gravable = Ingreso Neto - Beneficios Aceptados - Deducciones Extra-Cupo]
    RLG --> Art241[10. Evaluar en Tabla Marginal Art. 241 E.T. (7 Tramos)]
    Art241 --> End([Fin: Impuesto Bruto Formulario 210])

    classDef highlight fill:#dbeafe,stroke:#2563eb,stroke-width:2px;
    classDef cap fill:#fee2e2,stroke:#ef4444,stroke-width:2px;
    classDef finish fill:#dcfce7,stroke:#22c55e,stroke-width:2px;
    
    class IngNeto,SumSol,RLG highlight;
    class Cap40,Cap1340 cap;
    class End finish;
```
