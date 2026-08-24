#!/usr/bin/env python3
"""Script CLI para extraer y normalizar casillas patrimoniales y cedulares

de un borrador de Formulario 210 (JSON o diccionario).
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def extraer_datos_borrador(data: dict[str, Any]) -> dict[str, Any]:
    """Normaliza y extrae las casillas patrimoniales de un borrador F210."""
    contribuyente = data.get("contribuyente", {})
    casillas = data.get("casillas_formulario_210", data.get("casillas", data))

    patrimonio_bruto = float(
        casillas.get("casilla_29_patrimonio_bruto", casillas.get("patrimonio_bruto", 0.0))
    )
    deudas = float(casillas.get("casilla_30_deudas", casillas.get("deudas", 0.0)))
    patrimonio_liquido_actual = float(
        casillas.get(
            "casilla_31_patrimonio_liquido_actual",
            casillas.get("patrimonio_liquido_actual", patrimonio_bruto - deudas),
        )
    )
    patrimonio_liquido_anterior = float(
        casillas.get(
            "casilla_32_patrimonio_liquido_ano_anterior",
            casillas.get(
                "patrimonio_liquido_ano_anterior",
                casillas.get("patrimonio_liquido_anterior", 0.0),
            ),
        )
    )

    renta_ordinaria = float(
        casillas.get(
            "casilla_64_renta_liquida_ordinaria_cedula_general",
            casillas.get(
                "casilla_94_renta_liquida_ordinaria_cedula_general_final",
                casillas.get("renta_liquida_ordinaria", 0.0),
            ),
        )
    )
    rentas_exentas = float(
        casillas.get(
            "casilla_92_total_rentas_exentas_imputables",
            casillas.get("rentas_exentas", 0.0),
        )
    )
    incrngo = float(
        casillas.get(
            "casilla_34_incrngo_trabajo",
            casillas.get("ingresos_no_constitutivos_renta", 0.0),
        )
    )
    ganancia_ocasional = float(
        casillas.get(
            "casilla_104_ganancia_ocasional_gravable",
            casillas.get("ganancias_ocasionales_netas", 0.0),
        )
    )
    impuesto_a_cargo = float(
        casillas.get(
            "casilla_133_total_impuesto_a_cargo",
            casillas.get("impuesto_renta_pagado", 0.0),
        )
    )
    retenciones = float(
        casillas.get(
            "casilla_135_total_retenciones_fuente",
            casillas.get("retenciones_fuente_asumidas", 0.0),
        )
    )
    consumo_estimado = float(
        data.get("estimacion_gastos_personales_anuales", data.get("gastos_personales", 0.0))
    )

    # Si consumo estimado es 0, estimar un consumo prudencial básico del 30% del ingreso
    if consumo_estimado <= 0:
        consumo_estimado = round(renta_ordinaria * 0.35, -3)

    return {
        "contribuyente": contribuyente.get("nombre", "CONTRIBUYENTE DECLARANTE"),
        "nit": contribuyente.get("nit", "00000000-0"),
        "tax_year": int(contribuyente.get("tax_year", data.get("tax_year", 2026))),
        "patrimonio_liquido_ano_anterior": patrimonio_liquido_anterior,
        "patrimonio_bruto_ano_actual": patrimonio_bruto,
        "deudas_ano_actual": deudas,
        "patrimonio_liquido_ano_actual": patrimonio_liquido_actual,
        "renta_liquida_ordinaria_cedula_general": renta_ordinaria,
        "rentas_exentas_totales": rentas_exentas,
        "ingresos_no_constitutivos_renta": incrngo,
        "ganancias_ocasionales_netas": ganancia_ocasional,
        "impuesto_renta_y_ganancia_ocasional_pagado": impuesto_a_cargo,
        "retenciones_fuente_asumidas_en_el_ano": retenciones,
        "gastos_personales_y_consumo_estimado": consumo_estimado,
        "reajustes_fiscales_activos_fijos": float(data.get("reajustes_fiscales", 0.0)),
        "valorizaciones_nominales_inmuebles": float(data.get("valorizaciones", 0.0)),
        "nuevas_deudas_adquiridas_en_el_ano": float(data.get("nuevas_deudas", 0.0)),
        "desahorro_o_liquidacion_activos_anteriores": float(data.get("desahorro", 0.0)),
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extraer parámetros de comparación patrimonial desde borrador F210"
    )
    parser.add_argument("draft_file", help="Ruta al archivo JSON del borrador F210")
    parser.add_argument("--out", help="Ruta de salida JSON (opcional)")

    args = parser.parse_args()

    file_path = Path(args.draft_file)
    if not file_path.exists():
        print(f"❌ Error: El archivo {args.draft_file} no existe.", file=sys.stderr)
        sys.exit(1)

    try:
        with open(file_path, encoding="utf-8") as f:
            raw_data = json.load(f)
        extracted = extraer_datos_borrador(raw_data)

        if args.out:
            with open(args.out, "w", encoding="utf-8") as f:
                json.dump(extracted, f, indent=2, ensure_ascii=False)
            print(f"✅ Datos extraídos guardados en: {args.out}")
        else:
            print(json.dumps(extracted, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"❌ Error al procesar borrador: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
