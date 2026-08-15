# 🗄️ Modelo de Entidades y Estado de Sesión

Este diagrama ERD describe la estructura lógica de los datos manipulados por la plataforma TributIA y sincronizados bidireccionalmente entre el servidor y el cliente.

```mermaid
erDiagram
    SESSION_STATE ||--|| METADATA : contains
    SESSION_STATE ||--|| PERSONA_NATURAL_INPUT : contains
    SESSION_STATE ||--|| PERSONA_JURIDICA_INPUT : contains
    SESSION_STATE ||--|| CALCULATION_RESULTS : contains
    CALCULATION_RESULTS ||--o| FORM_210_CASILLAS : generates
    CALCULATION_RESULTS ||--o| FORM_110_CASILLAS : generates
    CALCULATION_RESULTS ||--|{ AUDIT_TRACE_STEP : produces

    SESSION_STATE {
        string session_id PK "Identificador único de la sesión (default: 'default')"
        datetime updated_at "Timestamp de última modificación"
    }

    METADATA {
        string nombre "Nombre o Razón Social del contribuyente"
        string nit "Número de Identificación Tributaria (sin DV)"
        int tax_year "Año gravable (2022, 2024, 2025, 2026)"
        float custom_uvt "Valor de la UVT en COP"
        string active_module "Módulo activo en UI (pn, pj, calendario, etc.)"
        string active_subtab "Sub-pestaña activa (calc, f210, marginal)"
    }

    PERSONA_NATURAL_INPUT {
        float patrimonio_bruto "Total bienes y derechos"
        float deudas "Pasivos a 31 de diciembre"
        float rentas_trabajo "Salarios, honorarios y compensaciones"
        float viaticos "Viáticos y gastos de viaje"
        float aporte_salud_obligatorio "Aportes EPS"
        float aporte_pension_obligatorio "Aportes Fondo de Pensiones"
        boolean aplica_dependiente_general "Deducción 10% ingresos"
        float medicina_prepagada_anual "Planes complementarios y pólizas"
        float intereses_vivienda_anual "Intereses crédito hipotecario / leasing"
        float compras_factura_electronica "Deducción 1% Art. 336"
        float aportes_voluntarios_pension_afc "Fondos voluntarios y AFC"
        float ganancias_ocasionales_brutas "Activos fijos, herencias, loterías"
        float retenciones_fuente_practicadas "Anticipos y retenciones del año"
    }

    PERSONA_JURIDICA_INPUT {
        float ingresos_brutos_operacionales "Ventas brutas del objeto social"
        float ingresos_no_constitutivos_renta "INCRNGO aplicables a sociedades"
        float costos_ventas_operacionales "Costo de ventas"
        float gastos_administracion_ventas "Gastos operacionales"
        float utilidad_contable_antes_impuestos "Utilidad antes de impuestos (TTD)"
        float retenciones_fuente_practicadas "Retenciones practicadas a la empresa"
    }

    CALCULATION_RESULTS {
        float renta_liquida_gravable "Base gravable en COP"
        float renta_liquida_gravable_uvt "Base gravable en UVT"
        float impuesto_bruto_renta "Impuesto calculado por Art. 241 o Art. 240"
        float tarifa_marginal_maxima "Tarifa marginal alcanzada (0% - 39%)"
        float saldo_a_pagar "Valor final a pagar a la DIAN"
        float saldo_a_favor "Saldo a favor generado"
    }

    AUDIT_TRACE_STEP {
        int step_index "Número de paso en la auditoría"
        string title "Descripción del rubro depurado"
        string statutory_reference "Artículo del Estatuto Tributario"
        float calculated_cop "Valor inicialmente declarado"
        float limit_cop "Tope legal aplicable"
        float excess_rejected_cop "Exceso desconocido por ley"
        float final_allowed_cop "Valor final aceptado en la depuración"
    }
```
