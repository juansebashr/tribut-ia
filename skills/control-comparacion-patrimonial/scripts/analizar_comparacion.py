#!/usr/bin/env python3
"""Script CLI principal de Auditoría y Control por Comparación Patrimonial (Arts.

236 y 237 E.T.).

Analiza un borrador del Formulario 210, calcula la variación patrimonial frente
a la capacidad de justificación neta, evalúa el riesgo y genera el árbol de
preguntas y documentos requeridos.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any

# Permitir imports desde el root y backend de Fiscol si se ejecuta standalone
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.models.comparacion_patrimonial import (  # noqa: E402
    ComparacionPatrimonialRequest,
)
from app.services.comparacion_patrimonial import (  # noqa: E402
    liquidar_comparacion_patrimonial,
)


def cargar_cuestionario_diagnostico() -> list[dict[str, Any]]:
    """Carga el catálogo de preguntas y documentos de soporte."""
    template_path = (
        Path(__file__).resolve().parent.parent / "templates" / "cuestionario_diagnostico.json"
    )
    if template_path.exists():
        with open(template_path, encoding="utf-8") as f:
            data = json.load(f)
            return data.get("categorias_diagnosticas", [])
    return []


def analizar_borrador_f210(
    extracted_data: dict[str, Any], custom_uvt: float | None = None
) -> dict[str, Any]:
    """Ejecuta el cálculo patrimonial y enriquece el diagnóstico con el cuestionario."""
    tax_year = int(extracted_data.get("tax_year", 2026))

    req = ComparacionPatrimonialRequest(
        tax_year=tax_year,
        custom_uvt=custom_uvt,
        patrimonio_liquido_ano_anterior=float(
            extracted_data.get("patrimonio_liquido_ano_anterior", 0.0)
        ),
        patrimonio_bruto_ano_actual=float(extracted_data.get("patrimonio_bruto_ano_actual", 0.0)),
        deudas_ano_actual=float(extracted_data.get("deudas_ano_actual", 0.0)),
        reajustes_fiscales_activos_fijos=float(
            extracted_data.get("reajustes_fiscales_activos_fijos", 0.0)
        ),
        valorizaciones_nominales_o_revalorizaciones=float(
            extracted_data.get(
                "valorizaciones_nominales_o_revalorizaciones",
                extracted_data.get("valorizaciones_nominales_inmuebles", 0.0),
            )
        ),
        renta_liquida_ordinaria_cedula_general=float(
            extracted_data.get("renta_liquida_ordinaria_cedula_general", 0.0)
        ),
        rentas_exentas_totales=float(
            extracted_data.get(
                "total_rentas_exentas_deducciones_c90",
                extracted_data.get("rentas_exentas_totales", 0.0),
            )
        ),
        ingresos_no_constitutivos_renta=float(
            extracted_data.get(
                "ingresos_no_constitutivos_renta_c34",
                extracted_data.get("ingresos_no_constitutivos_renta", 0.0),
            )
        ),
        ganancia_ocasional_neta=float(
            extracted_data.get(
                "ganancia_ocasional_neta",
                extracted_data.get("ganancias_ocasionales_netas", 0.0),
            )
        ),
        nuevas_deudas_adquiridas_en_el_ano=float(
            extracted_data.get(
                "nuevas_deudas_adquiridas_en_el_ano",
                extracted_data.get("nuevas_deudas", 0.0),
            )
        ),
        desahorro_o_liquidacion_activos_anteriores=float(
            extracted_data.get("desahorro_o_liquidacion_activos_anteriores", 0.0)
        ),
        impuesto_renta_y_ganancia_ocasional_pagado=float(
            extracted_data.get(
                "impuesto_renta_y_ganancia_ocasional_pagado",
                extracted_data.get("casilla_125_total_impuesto_a_cargo", 0.0),
            )
        ),
        retenciones_fuente_asumidas_en_el_ano=float(
            extracted_data.get(
                "retenciones_fuente_asumidas_en_el_ano",
                extracted_data.get("casilla_133_total_retenciones_fuente", 0.0),
            )
        ),
        gastos_personales_y_consumo_estimado=float(
            extracted_data.get("gastos_personales_y_consumo_estimado", 0.0)
        ),
    )

    res = liquidar_comparacion_patrimonial(req)
    res_dict = res.model_dump()

    # Añadir metadata del contribuyente
    res_dict["contribuyente"] = extracted_data.get("contribuyente", "CONTRIBUYENTE")
    res_dict["nit"] = extracted_data.get("nit", "00000000-0")

    # Si hay desajuste, adjuntar las categorías de preguntas pertinentes
    if res.existe_renta_por_comparacion_patrimonial:
        categorias = cargar_cuestionario_diagnostico()
        res_dict["cuestionario_diagnostico"] = categorias
        res_dict["instruccion_agente"] = (
            "⚠️ ATENCIÓN AGENTE: Se ha detectado un descuadre de Comparación Patrimonial "
            f"de ${res.diferencia_no_justificada:,.0f} COP ({res.renta_liquida_gravable_adicional_uvt:,.2f} UVT). "
            "Debes presentarle al usuario las preguntas del cuestionario y solicitar los soportes documentales "
            "para encontrar los pasivos, desahorros o reajustes fiscales que justifiquen el incremento antes de formular el plan."
        )
    else:
        res_dict["cuestionario_diagnostico"] = []
        res_dict["instruccion_agente"] = (
            "✅ CONSISTENCIA PATRIMONIAL BLINDADA: El patrimonio líquido actual se encuentra 100% justificado "
            f"con las rentas y recursos del periodo (Capacidad neta: ${res.capacidad_justificacion_neta:,.0f} COP vs "
            f"Incremento: ${res.incremento_patrimonial_a_justificar:,.0f} COP). No se requiere ajuste por Art. 236 E.T."
        )

    return res_dict


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Auditoría y Diagnóstico de Comparación Patrimonial para Personas Naturales"
    )
    parser.add_argument(
        "draft_json", help="Ruta al archivo JSON con el borrador del Formulario 210"
    )
    parser.add_argument("--uvt", type=float, help="Valor personalizado de la UVT (opcional)")
    parser.add_argument("--out", help="Ruta para guardar el informe JSON del diagnóstico")

    args = parser.parse_args()

    file_path = Path(args.draft_json)
    if not file_path.exists():
        print(f"❌ Error: El archivo {args.draft_json} no existe.", file=sys.stderr)
        sys.exit(1)

    try:
        with open(file_path, encoding="utf-8") as f:
            raw_data = json.load(f)

        # Import helper de extracción
        script_dir = Path(__file__).resolve().parent
        if str(script_dir) not in sys.path:
            sys.path.insert(0, str(script_dir))
        from extraer_f210_borrador import extraer_datos_borrador

        extracted = extraer_datos_borrador(raw_data)
        diagnostic = analizar_borrador_f210(extracted, custom_uvt=args.uvt)

        if args.out:
            with open(args.out, "w", encoding="utf-8") as f:
                json.dump(diagnostic, f, indent=2, ensure_ascii=False)
            print(f"✅ Diagnóstico de Comparación Patrimonial guardado en: {args.out}")
        else:
            print(json.dumps(diagnostic, indent=2, ensure_ascii=False))

    except Exception as e:
        print(f"❌ Error durante el análisis de comparación patrimonial: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
