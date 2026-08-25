from app.core.rules_engine.loader import get_rules_for_year
from app.models.common import AuditTraceItem
from app.models.iva import (
    BienServicioIvaItem,
    Formulario300Casillas,
    IvaF300Input,
    IvaF300Output,
    IvaProrrateoInput,
    IvaProrrateoOutput,
)


def _nombre_periodo(periodicidad: str, periodo_num: int) -> str:
    if periodicidad.upper() == "BIMESTRAL":
        bimestres = {
            1: "Bimestre 1 (Ene - Feb)",
            2: "Bimestre 2 (Mar - Abr)",
            3: "Bimestre 3 (May - Jun)",
            4: "Bimestre 4 (Jul - Ago)",
            5: "Bimestre 5 (Sep - Oct)",
            6: "Bimestre 6 (Nov - Dic)",
        }
        return bimestres.get(periodo_num, f"Bimestre {periodo_num}")
    else:
        cuatrimestres = {
            1: "Cuatrimestre 1 (Ene - Abr)",
            2: "Cuatrimestre 2 (May - Ago)",
            3: "Cuatrimestre 3 (Sep - Dic)",
        }
        return cuatrimestres.get(periodo_num, f"Cuatrimestre {periodo_num}")


def calcular_prorrateo_iva_art490(payload: IvaProrrateoInput) -> IvaProrrateoOutput:
    _ = get_rules_for_year(payload.tax_year, payload.custom_uvt)
    trace: list[AuditTraceItem] = []

    # 1. Ingresos con derecho a descuento fiscal (Gravados 19% + Gravados 5% + Exentos 0%)
    ingresos_con_derecho = (
        payload.ingresos_gravados_19 + payload.ingresos_gravados_5 + payload.ingresos_exentos_0
    )

    # 2. Total ingresos operacionales computables para el prorrateo (Con derecho + Excluidos)
    ingresos_excluidos = payload.ingresos_excluidos
    total_ingresos_operacionales = ingresos_con_derecho + ingresos_excluidos

    # 3. Factor de prorrateo
    if total_ingresos_operacionales > 0:
        factor_decimal = min(1.0, max(0.0, ingresos_con_derecho / total_ingresos_operacionales))
    else:
        factor_decimal = 1.0

    factor_pct = round(factor_decimal * 100.0, 4)

    # 4. Asignación del IVA común
    iva_comun = payload.iva_comun_en_compras_gastos
    iva_descontable_aceptado = round(iva_comun * factor_decimal, -2)
    iva_rechazado_renta = round(iva_comun - iva_descontable_aceptado, -2)

    trace.append(
        AuditTraceItem(
            step_id="factor_prorrateo_art490",
            title="1. Factor de Prorrateo de IVA Común (Art. 490 E.T.)",
            statutory_reference="Art. 490 Estatuto Tributario",
            raw_input_cop=total_ingresos_operacionales,
            calculated_cop=factor_pct,
            final_allowed_cop=factor_pct,
            notes=(
                f"Ingresos con derecho a descuento (Gravados 19%/5% + Exentos 0%): ${ingresos_con_derecho:,.0f}. "
                f"Ingresos excluidos (sin derecho): ${ingresos_excluidos:,.0f}. "
                f"Factor resultante: {factor_pct:.2f}%."
            ),
        )
    )

    trace.append(
        AuditTraceItem(
            step_id="iva_comun_aceptado_f300",
            title="2. IVA Común Aceptado como Descontable en Formulario 300",
            statutory_reference="Art. 485 y 490 E.T.",
            raw_input_cop=iva_comun,
            calculated_cop=iva_comun * factor_decimal,
            final_allowed_cop=iva_descontable_aceptado,
            notes=f"De ${iva_comun:,.0f} de IVA común pagado, el {factor_pct:.2f}% (${iva_descontable_aceptado:,.0f}) se descuenta en la declaración de IVA.",
        )
    )

    trace.append(
        AuditTraceItem(
            step_id="iva_comun_rechazado_renta",
            title="3. IVA Común Rechazado (Mayor Valor del Costo/Gasto en Renta)",
            statutory_reference="Art. 490 y 115 E.T.",
            raw_input_cop=iva_comun,
            calculated_cop=iva_rechazado_renta,
            final_allowed_cop=iva_rechazado_renta,
            notes=(
                f"El remanente no descontable (${iva_rechazado_renta:,.0f} COP, equivalente al {100 - factor_pct:.2f}%) "
                "no se pierde: se lleva como mayor valor del costo o deducción en el Impuesto sobre la Renta (F-110/F-210)."
            ),
        )
    )

    explicacion = (
        f"Al vender productos gravados/exentos (${ingresos_con_derecho:,.0f}) y excluidos (${ingresos_excluidos:,.0f}), "
        f"tu factor de descuento es {factor_pct:.2f}%. De tus ${iva_comun:,.0f} de IVA común, "
        f"puedes descontar ${iva_descontable_aceptado:,.0f} en el Formulario 300 y deducir ${iva_rechazado_renta:,.0f} en Renta."
    )

    return IvaProrrateoOutput(
        tax_year=payload.tax_year,
        total_ingresos_con_derecho=ingresos_con_derecho,
        total_ingresos_operacionales=total_ingresos_operacionales,
        factor_prorrateo_porcentaje=factor_pct,
        factor_prorrateo_decimal=factor_decimal,
        iva_comun_total=iva_comun,
        iva_descontable_aceptado_f300=iva_descontable_aceptado,
        iva_rechazado_mayor_costo_renta=iva_rechazado_renta,
        explicacion_didactica=explicacion,
        audit_trace=trace,
    )


def calcular_formulario_300(payload: IvaF300Input) -> IvaF300Output:
    rules = get_rules_for_year(payload.tax_year, payload.custom_uvt)
    uvt = rules.uvt_value
    trace: list[AuditTraceItem] = []

    # 1. INGRESOS Y OPERACIONES REALIZADAS (Casillas 27 a 43)
    c27 = payload.ingresos_bienes_gravados_5
    c28 = payload.ingresos_bienes_gravados_19
    c29 = payload.ingresos_servicios_gravados_5
    c30 = payload.ingresos_servicios_gravados_19
    c34 = payload.operaciones_exentas_art477
    c35 = payload.exportaciones_bienes
    c36 = payload.exportaciones_servicios
    c37 = payload.operaciones_excluidas
    c38 = payload.operaciones_no_gravadas

    c41 = c27 + c28 + c29 + c30 + c34 + c35 + c36 + c37 + c38
    c42 = payload.devoluciones_en_ventas
    c43 = max(0.0, c41 - c42)

    trace.append(
        AuditTraceItem(
            step_id="ingresos_operaciones_f300",
            title="1. Total Ingresos y Operaciones del Período",
            statutory_reference="Art. 420 a 481 Estatuto Tributario",
            raw_input_cop=c41,
            calculated_cop=c43,
            final_allowed_cop=c43,
            notes=(
                f"Ingresos gravados 19%: ${c28 + c30:,.0f}; "
                f"Gravados 5%: ${c27 + c29:,.0f}; "
                f"Exentos (0%): ${c34 + c35 + c36:,.0f}; "
                f"Excluidos: ${c37:,.0f}; "
                f"Devoluciones: ${c42:,.0f}. Total ingresos netos: ${c43:,.0f}."
            ),
        )
    )

    # 2. LIQUIDACIÓN IVA GENERADO (Casillas 45 a 58)
    c45 = (c27 + c29) * 0.05
    c46 = (c28 + c30) * 0.19
    c56 = c45 + c46
    c57 = payload.devoluciones_en_compras * 0.19  # Reintegro de IVA en compras devueltas
    c58 = c56 + c57

    trace.append(
        AuditTraceItem(
            step_id="iva_generado_f300",
            title="2. Total Impuesto sobre las Ventas (IVA) Generado",
            statutory_reference="Art. 468, 468-1 y 468-3 E.T.",
            raw_input_cop=c43,
            calculated_cop=c58,
            final_allowed_cop=c58,
            notes=f"IVA generado al 19%: ${c46:,.0f} + IVA generado al 5%: ${c45:,.0f} + Reintegros: ${c57:,.0f} = Total IVA Generado: ${c58:,.0f}.",
        )
    )

    # 3. COMPRAS E IMPORTACIONES (Casillas 66 a 80)
    c66 = payload.compras_bienes_gravados_5
    c67 = payload.compras_bienes_gravados_19
    c68 = payload.servicios_gravados_5
    c69 = payload.servicios_gravados_19
    c72 = payload.importaciones_gravadas_5
    c73 = payload.importaciones_gravadas_19
    c74 = payload.compras_bienes_excluidos_exentos
    c75 = payload.servicios_excluidos_exentos
    c79 = c66 + c67 + c68 + c69 + c72 + c73 + c74 + c75
    c80 = payload.devoluciones_en_compras

    # 4. LIQUIDACIÓN IVA DESCONTABLE (Casillas 81 a 96)
    c81 = c66 * 0.05
    c82 = c67 * 0.19
    c83 = c68 * 0.05
    c84 = c69 * 0.19
    c87 = c72 * 0.05
    c88 = c73 * 0.19

    # Prorrateo de IVA común (Art. 490 E.T.)
    ingresos_con_derecho = c27 + c28 + c29 + c30 + c34 + c35 + c36
    total_ingresos_pro = ingresos_con_derecho + c37
    if total_ingresos_pro > 0:
        factor_prorrateo = min(1.0, max(0.0, ingresos_con_derecho / total_ingresos_pro))
    else:
        factor_prorrateo = 1.0

    c90 = payload.iva_comun_sujeto_prorrateo * factor_prorrateo
    iva_comun_rechazado = payload.iva_comun_sujeto_prorrateo * (1.0 - factor_prorrateo)

    c95 = c42 * 0.19  # Ajuste por devoluciones en ventas
    c96 = max(0.0, (c81 + c82 + c83 + c84 + c87 + c88 + c90) - c95)

    trace.append(
        AuditTraceItem(
            step_id="iva_descontable_f300",
            title="3. Total Impuesto sobre las Ventas (IVA) Descontable",
            statutory_reference="Art. 485, 488 y 490 E.T.",
            raw_input_cop=c79,
            calculated_cop=c96,
            final_allowed_cop=c96,
            notes=(
                f"IVA descontable directo compras/servicios: ${c81 + c82 + c83 + c84 + c87 + c88:,.0f} + "
                f"IVA común prorrateado ({factor_prorrateo * 100:.2f}%): ${c90:,.0f}. "
                f"Total IVA Descontable: ${c96:,.0f}."
            ),
        )
    )

    # 5. CONTROL DE SALDOS Y LIQUIDACIÓN PRIVADA (Casillas 98 a 106)
    diferencia = c58 - c96
    if diferencia >= 0:
        c98 = diferencia
        c99 = 0.0
    else:
        c98 = 0.0
        c99 = abs(diferencia)

    c100 = payload.saldo_a_favor_periodo_anterior
    c101 = payload.retenciones_iva_practicadas_a_favor
    c104 = payload.sanciones

    # Saldo neto del período
    saldo_neto = c98 - c99 - c100 - c101 + c104

    if saldo_neto >= 0:
        c105 = saldo_neto
        c106 = 0.0
    else:
        c105 = 0.0
        c106 = abs(saldo_neto)

    trace.append(
        AuditTraceItem(
            step_id="liquidacion_saldos_f300",
            title="4. Liquidación Privada y Saldo Final Formulario 300",
            statutory_reference="Art. 600 y Formulario 300 DIAN",
            raw_input_cop=saldo_neto,
            calculated_cop=saldo_neto,
            final_allowed_cop=round(c105 if c105 > 0 else -c106, -3),
            notes=(
                f"IVA Generado: ${c58:,.0f} - IVA Descontable: ${c96:,.0f} = Saldo período: (${c98:,.0f} a pagar / ${c99:,.0f} a favor). "
                f"Menos ReteIVA a favor: ${c101:,.0f}, Menos Saldo anterior: ${c100:,.0f} + Sanciones: ${c104:,.0f}. "
                f"Total definitivo: ${round(c105, -3):,.0f} a pagar / ${round(c106, -3):,.0f} a favor."
            ),
        )
    )

    # Formulario 300 Casillas oficiales con redondeo al millar
    casillas = Formulario300Casillas(
        ano=payload.tax_year,
        periodo=payload.periodo,
        tipo_periodicidad=payload.tipo_periodicidad.upper(),
        numero_formulario=f"300{payload.tax_year}{payload.periodo:02d}00001",
        nit=payload.nit,
        dv=payload.dv,
        razon_social=payload.razon_social,
        cod_direccion_seccional=32,
        actividad_economica=payload.actividad_economica,
        c27_ingresos_bienes_gravados_5=round(c27, -3),
        c28_ingresos_bienes_gravados_19=round(c28, -3),
        c29_ingresos_servicios_gravados_5=round(c29, -3),
        c30_ingresos_servicios_gravados_19=round(c30, -3),
        c34_operaciones_exentas_art477=round(c34, -3),
        c35_exportaciones_bienes=round(c35, -3),
        c36_exportaciones_servicios=round(c36, -3),
        c37_operaciones_excluidas=round(c37, -3),
        c38_operaciones_no_gravadas=round(c38, -3),
        c41_total_ingresos_brutos=round(c41, -3),
        c42_devoluciones_en_ventas=round(c42, -3),
        c43_total_ingresos_netos=round(c43, -3),
        c45_iva_gravados_5=round(c45, -3),
        c46_iva_gravados_19=round(c46, -3),
        c56_total_iva_generado_operaciones=round(c56, -3),
        c57_iva_devoluciones_en_compras=round(c57, -3),
        c58_total_iva_generado=round(c58, -3),
        c66_compras_bienes_gravados_5=round(c66, -3),
        c67_compras_bienes_gravados_19=round(c67, -3),
        c68_servicios_gravados_5=round(c68, -3),
        c69_servicios_gravados_19=round(c69, -3),
        c72_importaciones_gravadas_5=round(c72, -3),
        c73_importaciones_gravadas_19=round(c73, -3),
        c74_compras_bienes_excluidos_exentos=round(c74, -3),
        c75_servicios_excluidos_exentos=round(c75, -3),
        c79_total_compras_importaciones_brutas=round(c79, -3),
        c80_devoluciones_en_compras=round(c80, -3),
        c81_descontable_compras_5=round(c81, -3),
        c82_descontable_compras_19=round(c82, -3),
        c83_descontable_servicios_5=round(c83, -3),
        c84_descontable_servicios_19=round(c84, -3),
        c87_descontable_importaciones_5=round(c87, -3),
        c88_descontable_importaciones_19=round(c88, -3),
        c90_descontable_iva_comun_prorrateado=round(c90, -3),
        c95_iva_devoluciones_en_ventas=round(c95, -3),
        c96_total_iva_descontable=round(c96, -3),
        c98_saldo_a_pagar_periodo=round(c98, -3),
        c99_saldo_a_favor_periodo=round(c99, -3),
        c100_saldo_a_favor_periodo_anterior=round(c100, -3),
        c101_retenciones_iva_que_le_practicaron=round(c101, -3),
        c104_sanciones=round(c104, -3),
        c105_total_saldo_a_pagar=round(c105, -3),
        c106_total_saldo_a_favor=round(c106, -3),
    )

    per_txt = _nombre_periodo(payload.tipo_periodicidad, payload.periodo)
    if c105 > 0:
        saldo_txt = (
            f"Total saldo a pagar por este período: ${casillas.c105_total_saldo_a_pagar:,.0f} COP."
        )
    elif c106 > 0:
        saldo_txt = (
            f"Total saldo a favor por este período: ${casillas.c106_total_saldo_a_favor:,.0f} COP."
        )
    else:
        saldo_txt = "Declaración en cero ($ 0 COP a pagar)."

    resumen = (
        f"Declaración de IVA Formulario 300 ({payload.tipo_periodicidad.capitalize()} - {per_txt} {payload.tax_year}) para {payload.razon_social}. "
        f"Total IVA Generado en ventas: ${casillas.c58_total_iva_generado:,.0f}, "
        f"Total IVA Descontable en compras/gastos: ${casillas.c96_total_iva_descontable:,.0f}. "
        f"{saldo_txt}"
    )

    return IvaF300Output(
        tax_year=payload.tax_year,
        uvt_value=uvt,
        tipo_periodicidad=payload.tipo_periodicidad.upper(),
        periodo=payload.periodo,
        periodo_nombre=per_txt,
        razon_social=payload.razon_social,
        nit=payload.nit,
        dv=payload.dv,
        total_ingresos_brutos=round(c41, -3),
        total_ingresos_netos=round(c43, -3),
        total_iva_generado=round(c58, -3),
        total_compras_brutas=round(c79, -3),
        total_iva_descontable=round(c96, -3),
        factor_prorrateo_art490_pct=round(factor_prorrateo * 100.0, 2),
        iva_comun_rechazado_renta=round(iva_comun_rechazado, -3),
        saldo_periodo_a_pagar=round(c98, -3),
        saldo_periodo_a_favor=round(c99, -3),
        total_saldo_a_pagar=round(c105, -3),
        total_saldo_a_favor=round(c106, -3),
        casillas=casillas,
        audit_trace=trace,
        resumen_ejecutivo=resumen,
    )


def obtener_clasificador_bienes_servicios_iva() -> list[BienServicioIvaItem]:
    items = [
        # Canasta Familiar y Alimentos
        BienServicioIvaItem(
            id="al_carne",
            nombre="Carne fresca de bovino, porcino y pollo",
            categoria="Canasta Familiar",
            tratamiento="EXENTO_0",
            tarifa_pct=0.0,
            articulo_et="Art. 477 E.T.",
            derecho_devolucion_iva=True,
            descripcion_tecnica="Exento de IVA para el productor, con derecho a devolución bimestral de IVA en insumos.",
        ),
        BienServicioIvaItem(
            id="al_huevos_leche",
            nombre="Huevos frescos y leche líquida",
            categoria="Canasta Familiar",
            tratamiento="EXENTO_0",
            tarifa_pct=0.0,
            articulo_et="Art. 477 E.T.",
            derecho_devolucion_iva=True,
            descripcion_tecnica="Bienes básicos de primera necesidad exentos a tarifa 0%.",
        ),
        BienServicioIvaItem(
            id="al_arroz_pan",
            nombre="Arroz de consumo, pan tradicional, plátano, papa y hortalizas",
            categoria="Canasta Familiar",
            tratamiento="EXCLUIDO",
            tarifa_pct=0.0,
            articulo_et="Art. 424 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Bienes excluidos del IVA sin derecho a impuestos descontables.",
        ),
        BienServicioIvaItem(
            id="al_cafe_azucar",
            nombre="Café tostado/molido, azúcar de caña y pastas alimenticias",
            categoria="Canasta Familiar",
            tratamiento="GRAVADO_5",
            tarifa_pct=5.0,
            articulo_et="Art. 468-1 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Alimentos procesados gravados a la tarifa especial reducida del 5%.",
        ),
        BienServicioIvaItem(
            id="al_restaurantes_inc",
            nombre="Servicio de restaurantes y cafeterías (expendio de comidas)",
            categoria="Alimentación & Servicios",
            tratamiento="EXCLUIDO",
            tarifa_pct=0.0,
            articulo_et="Art. 426 E.T. y Art. 512-1 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Excluido de IVA; está sujeto al Impuesto Nacional al Consumo (INC 8%) si no opera bajo franquicia.",
        ),
        # Salud y Farmacia
        BienServicioIvaItem(
            id="salud_servicios_medicos",
            nombre="Servicios médicos, odontológicos, hospitalarios y de laboratorio",
            categoria="Salud",
            tratamiento="EXCLUIDO",
            tarifa_pct=0.0,
            articulo_et="Art. 476 Numeral 1 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Servicios para la salud humana están expresamente excluidos de IVA.",
        ),
        BienServicioIvaItem(
            id="salud_prepagada",
            nombre="Planes de medicina prepagada, complementarios y pólizas de salud",
            categoria="Salud",
            tratamiento="GRAVADO_5",
            tarifa_pct=5.0,
            articulo_et="Art. 468-3 Numeral 3 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Servicios de aseguramiento voluntario en salud gravados al 5%.",
        ),
        BienServicioIvaItem(
            id="salud_medicamentos_477",
            nombre="Medicamentos de uso humano y antibióticos esenciales",
            categoria="Salud",
            tratamiento="EXENTO_0",
            tarifa_pct=0.0,
            articulo_et="Art. 477 E.T.",
            derecho_devolucion_iva=True,
            descripcion_tecnica="Medicamentos clasificados bajo partidas arancelarias del Art. 477.",
        ),
        # Tecnología y Software
        BienServicioIvaItem(
            id="tec_hosting_cloud",
            nombre="Servicios de computación en la nube (Cloud Hosting, SaaS, PaaS, IaaS)",
            categoria="Tecnología & Software",
            tratamiento="EXCLUIDO",
            tarifa_pct=0.0,
            articulo_et="Art. 476 Numeral 21 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Servicios de almacenamiento y servidores en la nube excluidos de IVA por disposición legal.",
        ),
        BienServicioIvaItem(
            id="tec_licencias_software",
            nombre="Licencias de software para desarrollo digital y páginas web",
            categoria="Tecnología & Software",
            tratamiento="EXCLUIDO",
            tarifa_pct=0.0,
            articulo_et="Art. 476 Numeral 24 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Adquisición de licencias de software para el desarrollo comercial de contenidos digitales.",
        ),
        BienServicioIvaItem(
            id="tec_computadores_uvt",
            nombre="Computadores personales de escritorio o portátiles (hasta 50 UVT)",
            categoria="Tecnología & Hardware",
            tratamiento="EXCLUIDO",
            tarifa_pct=0.0,
            articulo_et="Art. 424 Numeral 5 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Excluidos si el valor comercial unitario no supera las 50 UVT.",
        ),
        BienServicioIvaItem(
            id="tec_celulares_uvt",
            nombre="Teléfonos celulares y smartphones (hasta 22 UVT)",
            categoria="Tecnología & Hardware",
            tratamiento="EXCLUIDO",
            tarifa_pct=0.0,
            articulo_et="Art. 424 Numeral 6 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Dispositivos móviles cuyo valor no supere las 22 UVT están excluidos; sobre el exceso gravan 19%.",
        ),
        # Educación y Cultura
        BienServicioIvaItem(
            id="edu_colegios_universidades",
            nombre="Servicios de educación formal, preescolar, básica, media y superior",
            categoria="Educación",
            tratamiento="EXCLUIDO",
            tarifa_pct=0.0,
            articulo_et="Art. 476 Numeral 6 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Matrículas, pensiones y derechos de grado en instituciones aprobadas por el MEN.",
        ),
        BienServicioIvaItem(
            id="edu_libros_revistas",
            nombre="Libros, revistas de carácter científico y cultural (Ley del Libro)",
            categoria="Educación & Cultura",
            tratamiento="EXENTO_0",
            tarifa_pct=0.0,
            articulo_et="Art. 478 E.T. y Ley 98 de 1993",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Libros impresos y electrónicos de carácter pedagógico y científico.",
        ),
        # Servicios Generales y Comercio
        BienServicioIvaItem(
            id="com_bienes_muebles_gen",
            nombre="Bienes muebles corporales generales (ropa, electrodomésticos, repuestos)",
            categoria="Comercio General",
            tratamiento="GRAVADO_19",
            tarifa_pct=19.0,
            articulo_et="Art. 468 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Tarifa general del 19% aplicable a la mayoría de bienes de consumo.",
        ),
        BienServicioIvaItem(
            id="serv_profesionales_gen",
            nombre="Honorarios y servicios profesionales (abogados, contadores, consultores)",
            categoria="Servicios Profesionales",
            tratamiento="GRAVADO_19",
            tarifa_pct=19.0,
            articulo_et="Art. 468 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Servicios prestados por personas jurídicas o naturales responsables de IVA gravados al 19%.",
        ),
        BienServicioIvaItem(
            id="serv_transporte_pasajeros",
            nombre="Servicio de transporte público terrestre, fluvial y marítimo de pasajeros",
            categoria="Transporte",
            tratamiento="EXCLUIDO",
            tarifa_pct=0.0,
            articulo_et="Art. 476 Numeral 9 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Transporte masivo de personas urbano y suburbano excluido de IVA.",
        ),
        BienServicioIvaItem(
            id="serv_arrendamiento_vivienda",
            nombre="Arrendamiento de inmuebles destinados exclusivamente para vivienda",
            categoria="Inmuebles & Arrendamiento",
            tratamiento="EXCLUIDO",
            tarifa_pct=0.0,
            articulo_et="Art. 476 Numeral 15 E.T.",
            derecho_devolucion_iva=False,
            descripcion_tecnica="Arriendo habitacional excluido de IVA; locales comerciales e inmuebles para negocio gravan al 19%.",
        ),
        # Exportaciones
        BienServicioIvaItem(
            id="exp_bienes_servicios",
            nombre="Exportación de bienes corporales y servicios prestados hacia el exterior",
            categoria="Exportaciones",
            tratamiento="EXENTO_0",
            tarifa_pct=0.0,
            articulo_et="Art. 479 y 481 E.T.",
            derecho_devolucion_iva=True,
            descripcion_tecnica="Exportaciones gozan de exención (0%) con derecho a solicitar en devolución el 100% del IVA en insumos.",
        ),
    ]
    return items
