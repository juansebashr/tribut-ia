from typing import Literal

from app.core.rules_engine.loader import get_rules_for_year
from app.models.common import AuditTraceItem
from app.models.comparacion_patrimonial import (
    ComparacionPatrimonialRequest,
    ComparacionPatrimonialResponse,
)


def liquidar_comparacion_patrimonial(
    payload: ComparacionPatrimonialRequest,
) -> ComparacionPatrimonialResponse:
    """Motor determinístico de cálculo para el control por Comparación Patrimonial

    conforme a los Artículos 236 y 237 del Estatuto Tributario Nacional.
    """
    rules = get_rules_for_year(payload.tax_year, payload.custom_uvt)
    uvt = rules.uvt_value
    cg_rules = rules.persona_natural.cedula_general

    trace: list[AuditTraceItem] = []

    # 1. VARIACIÓN PATRIMONIAL (Art. 236 E.T.)
    patrimonio_ant = payload.patrimonio_liquido_ano_anterior
    patrimonio_bruto_act = payload.patrimonio_bruto_ano_actual
    deudas_act = payload.deudas_ano_actual
    patrimonio_act = max(0.0, patrimonio_bruto_act - deudas_act)

    variacion_patrimonial_bruta = patrimonio_act - patrimonio_ant

    trace.append(
        AuditTraceItem(
            step_id="variacion_patrimonial_bruta",
            title="1. Variación Patrimonial Bruta",
            statutory_reference="Art. 236, 261, 282 E.T.",
            raw_input_cop=patrimonio_act,
            calculated_cop=variacion_patrimonial_bruta,
            final_allowed_cop=variacion_patrimonial_bruta,
            notes=f"Patrimonio Líquido Actual (${patrimonio_act:,.0f}) menos Patrimonio Líquido Anterior (${patrimonio_ant:,.0f}) = Variación de ${variacion_patrimonial_bruta:,.0f}.",
        )
    )

    # 2. AJUSTES AL PATRIMONIO (Art. 70, 73 E.T. - Incrementos o decrementos nominales)
    reajustes = payload.reajustes_fiscales_activos_fijos
    valorizaciones = payload.valorizaciones_nominales_o_revalorizaciones
    desvalorizaciones = payload.desvalorizaciones_o_castigos_nominales
    ajustes_netos = (reajustes + valorizaciones) - desvalorizaciones

    incremento_a_justificar = max(0.0, variacion_patrimonial_bruta - ajustes_netos)

    trace.append(
        AuditTraceItem(
            step_id="incremento_patrimonial_a_justificar",
            title="2. Incremento Patrimonial Fiscal a Justificar",
            statutory_reference="Art. 70, 73, 236 E.T.",
            raw_input_cop=variacion_patrimonial_bruta,
            calculated_cop=incremento_a_justificar,
            final_allowed_cop=incremento_a_justificar,
            notes=f"Variación (${variacion_patrimonial_bruta:,.0f}) menos Reajustes Fiscales y Valorizaciones (${ajustes_netos:,.0f}) = ${incremento_a_justificar:,.0f}.",
        )
    )

    # 3. RENTAS Y FUENTES JUSTIFICATIVAS (Capacidad de absorción y capitalización)
    renta_ordinaria = payload.renta_liquida_ordinaria_cedula_general
    renta_pension_div = payload.rentas_liquidas_pensiones_y_dividendos
    rentas_exentas = payload.rentas_exentas_totales
    incrngo = payload.ingresos_no_constitutivos_renta
    ganancia_ocasional = payload.ganancia_ocasional_neta
    otros_no_gravados = payload.ingresos_no_gravados_o_recibidos_exterior
    nuevas_deudas = payload.nuevas_deudas_adquiridas_en_el_ano
    desahorro = payload.desahorro_o_liquidacion_activos_anteriores

    total_rentas_justificativas = (
        renta_ordinaria
        + renta_pension_div
        + rentas_exentas
        + incrngo
        + ganancia_ocasional
        + otros_no_gravados
        + nuevas_deudas
        + desahorro
    )

    trace.append(
        AuditTraceItem(
            step_id="total_fuentes_justificativas",
            title="3. Total Fuentes y Flujos Justificativos",
            statutory_reference="Art. 236, 237 E.T.",
            raw_input_cop=total_rentas_justificativas,
            calculated_cop=total_rentas_justificativas,
            final_allowed_cop=total_rentas_justificativas,
            notes=f"Rentas Ordinarias (${renta_ordinaria:,.0f}) + Pensiones/Div (${renta_pension_div:,.0f}) + Exentas/INCRNGO (${rentas_exentas + incrngo:,.0f}) + GO Neta (${ganancia_ocasional:,.0f}) + Deudas Nuevas (${nuevas_deudas:,.0f}) + Desahorro (${desahorro:,.0f}) + Otros (${otros_no_gravados:,.0f}).",
        )
    )

    # 4. DETRACCIONES Y CONSUMOS (Disminución de capacidad financiera)
    impuesto_pagado = payload.impuesto_renta_y_ganancia_ocasional_pagado
    retenciones = payload.retenciones_fuente_asumidas_en_el_ano
    gastos_consumo = payload.gastos_personales_y_consumo_estimado
    perdidas = payload.perdidas_extraordinarias_no_deducibles

    total_detracciones = impuesto_pagado + retenciones + gastos_consumo + perdidas

    trace.append(
        AuditTraceItem(
            step_id="total_detracciones_consumos",
            title="4. Detracciones, Impuestos Pagados y Gastos Personales",
            statutory_reference="Art. 236 E.T.",
            raw_input_cop=total_detracciones,
            calculated_cop=total_detracciones,
            final_allowed_cop=total_detracciones,
            notes=f"Impuestos pagados (${impuesto_pagado:,.0f}) + Retenciones (${retenciones:,.0f}) + Gastos/Consumos estimados (${gastos_consumo:,.0f}) + Pérdidas (${perdidas:,.0f}).",
        )
    )

    # 5. CAPACIDAD NETA DE JUSTIFICACIÓN Y COMPARACIÓN
    capacidad_justificacion_neta = max(0.0, total_rentas_justificativas - total_detracciones)
    diferencia_no_justificada = max(0.0, incremento_a_justificar - capacidad_justificacion_neta)
    existe_renta = diferencia_no_justificada > 0.0

    trace.append(
        AuditTraceItem(
            step_id="comparacion_patrimonial_resultado",
            title="5. Resultado del Control por Comparación Patrimonial",
            statutory_reference="Art. 236, 237 E.T.",
            raw_input_cop=incremento_a_justificar,
            calculated_cop=diferencia_no_justificada,
            final_allowed_cop=diferencia_no_justificada,
            notes=(
                f"Capacidad Neta Justificativa (${capacidad_justificacion_neta:,.0f}) vs Incremento a Justificar (${incremento_a_justificar:,.0f}). "
                + (
                    f"⚠️ Se genera una Renta Líquida Gravable por Comparación Patrimonial de ${diferencia_no_justificada:,.0f}."
                    if existe_renta
                    else "✅ El incremento patrimonial se encuentra 100% justificado y soportado."
                )
            ),
        )
    )

    # 6. CÁLCULO DEL IMPUESTO ESTIMADO (Art. 241 E.T.)
    renta_adicional_cop = diferencia_no_justificada
    renta_adicional_uvt = renta_adicional_cop / uvt if uvt > 0 else 0.0

    impuesto_uvt = 0.0
    if existe_renta and renta_adicional_uvt > 0:
        for bracket in cg_rules.tabla_marginal_art241:
            if bracket.desde_uvt <= renta_adicional_uvt < bracket.hasta_uvt:
                impuesto_uvt = (
                    renta_adicional_uvt - bracket.desde_uvt
                ) * bracket.tarifa + bracket.uvt_adicional
                break
            elif renta_adicional_uvt >= bracket.hasta_uvt and bracket.hasta_uvt > 9000000:
                impuesto_uvt = (
                    renta_adicional_uvt - bracket.desde_uvt
                ) * bracket.tarifa + bracket.uvt_adicional
                break

    impuesto_estimado_cop = round((impuesto_uvt * uvt) / 1000.0) * 1000.0

    # 7. PORCENTAJE DE JUSTIFICACIÓN Y ESTADO
    if incremento_a_justificar == 0:
        porcentaje_justificacion = 100.0
    else:
        porcentaje_justificacion = min(
            100.0,
            round((capacidad_justificacion_neta / incremento_a_justificar) * 100.0, 2),
        )

    estado_patrimonial: Literal["JUSTIFICADO_CORRECTAMENTE", "ALERTA_DESAJUSTE_PATRIMONIAL"] = (
        "ALERTA_DESAJUSTE_PATRIMONIAL" if existe_renta else "JUSTIFICADO_CORRECTAMENTE"
    )

    # 8. EXPLICACIÓN DIDÁCTICA Y RECOMENDACIONES DE DEFENSA TRIBUTARIA
    if existe_renta:
        explicacion_didactica = (
            f"Existe una diferencia no justificada de ${diferencia_no_justificada:,.0f} COP ({renta_adicional_uvt:,.2f} UVT). "
            f"Según el Art. 236 del E.T., la DIAN presumirá este valor como Renta Líquida Gravable adicional, "
            f"generando un impuesto estimado de ${impuesto_estimado_cop:,.0f} COP a tarifas marginales del Art. 241 E.T."
        )
        recomendaciones_defensa = [
            "Verificar si se omitieron desembolsos de créditos o deudas reales adquiridas en el año con entidades financieras o particulares (Art. 283 E.T.).",
            "Comprobar si existió desahorro de cuentas bancarias, CDTs o venta de activos que ya estaban declarados en el patrimonio líquido del año anterior.",
            "Revisar si se aplicaron los reajustes fiscales de activos fijos (Art. 70 o 73 E.T.) que incrementan el costo fiscal sin requerir flujo de efectivo.",
            "Constatar si se recibieron indemnizaciones por daño emergente, remesas familiares del exterior o herencias debidamente documentadas.",
            "Ajustar la estimación de gastos personales y consumos si estos fueron cubiertos por otros miembros del núcleo familiar con ingresos propios.",
        ]
    else:
        explicacion_didactica = (
            f"El patrimonio líquido se encuentra plenamente justificado. La capacidad neta de justificación "
            f"(${capacidad_justificacion_neta:,.0f} COP) es suficiente para respaldar el incremento patrimonial fiscal "
            f"(${incremento_a_justificar:,.0f} COP) con un margen de holgura de ${capacidad_justificacion_neta - incremento_a_justificar:,.0f} COP."
        )
        recomendaciones_defensa = [
            "Conservar los extractos bancarios de saldo al 31 de diciembre de los dos últimos años.",
            "Mantener copias de las escrituras públicas de compraventa y los certificados de tradición de los bienes raíces adquiridos.",
            "Tener a disposición los certificados de ingresos y retenciones (Formulario 220) y extractos de cesantías que respaldan los flujos del año.",
        ]

    return ComparacionPatrimonialResponse(
        tax_year=payload.tax_year,
        uvt_value=uvt,
        patrimonio_liquido_ano_anterior=patrimonio_ant,
        patrimonio_bruto_ano_actual=patrimonio_bruto_act,
        deudas_ano_actual=deudas_act,
        patrimonio_liquido_ano_actual=patrimonio_act,
        variacion_patrimonial_bruta=variacion_patrimonial_bruta,
        ajustes_patrimoniales_netos=ajustes_netos,
        incremento_patrimonial_a_justificar=incremento_a_justificar,
        total_rentas_justificativas=total_rentas_justificativas,
        total_detracciones_consumos=total_detracciones,
        capacidad_justificacion_neta=capacidad_justificacion_neta,
        diferencia_no_justificada=diferencia_no_justificada,
        existe_renta_por_comparacion_patrimonial=existe_renta,
        renta_liquida_gravable_adicional_cop=renta_adicional_cop,
        renta_liquida_gravable_adicional_uvt=renta_adicional_uvt,
        impuesto_estimado_comparacion_patrimonial_cop=impuesto_estimado_cop,
        estado_patrimonial=estado_patrimonial,
        porcentaje_justificacion=porcentaje_justificacion,
        explicacion_didactica=explicacion_didactica,
        recomendaciones_defensa_dian=recomendaciones_defensa,
        audit_trace=trace,
    )
