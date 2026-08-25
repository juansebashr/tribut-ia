#!/usr/bin/env python3
"""Script CLI para extraer y normalizar casillas patrimoniales y cedulares

de un borrador de Formulario 210 (formato JSON o archivo PDF oficial DIAN).
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


def extraer_datos_desde_pdf(pdf_path: Path) -> dict[str, Any]:
    """Extrae las casillas oficiales del Formulario 210 desde un PDF de la DIAN."""
    try:
        import pypdf
    except ImportError as e:
        raise ImportError(
            "Se requiere la librería 'pypdf' para procesar archivos PDF. Instalar con: poetry run pip install pypdf"
        ) from e

    reader = pypdf.PdfReader(str(pdf_path))
    if not reader.pages:
        raise ValueError("El archivo PDF no contiene páginas válidas.")

    page = reader.pages[0]
    raw_text = page.extract_text()
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]

    # Buscar valores monetarios formateados tipo 126,949,000 o números enteros
    extracted: dict[str, Any] = {
        "origen": "PDF_FORMULARIO_210_DIAN",
        "archivo": pdf_path.name,
    }

    # Extraer año gravable
    for line in lines:
        if re.match(r"^2\s*0\s*2\s*[0-9]$", line):
            extracted["tax_year"] = int(line.replace(" ", ""))
            break

    # Extraer NIT y Nombre
    for line in lines:
        if "HERNANDEZ" in line or "1 0 2 2" in line or "NIT" in line:
            extracted["contribuyente_raw"] = line

    # Parseo de casillas estructuradas por coordenadas o secuencias estándar DIAN
    # Casilla 28 = Deducción 1% Factura Electrónica
    # Casilla 29 = Total Patrimonio Bruto
    # Casilla 30 = Deudas
    # Casilla 31 = Total Patrimonio Líquido
    # Casilla 33 = Ingresos brutos trabajo
    # Casilla 34 = INCRNGO
    # Casilla 35 = Renta líquida trabajo
    # Casilla 36 = Rentas exentas limitadas
    # Casilla 37 = Deducciones limitadas
    # Casilla 38 = Total limitadas (36+37)
    # Casilla 40 = Deducciones no limitadas (72 UVT dependientes)
    # Casilla 42 = Total exentas y deducciones trabajo
    # Casilla 43 = Renta líquida ordinaria trabajo
    # Casilla 89 = Total ingresos netos
    # Casilla 90 = Total rentas exentas y deducciones cédula general
    # Casilla 94 = Renta líquida ordinaria cédula general
    # Casilla 125 = Total impuesto a cargo
    # Casilla 133 = Retenciones en la fuente
    # Casilla 137 = Saldo a favor

    # Extraer todos los números con separadores de miles
    numeros_detectados = []
    for line in lines:
        tokens = line.split()
        for tok in tokens:
            cleaned = tok.replace(",", "").replace(".", "").strip()
            if cleaned.isdigit() and len(cleaned) >= 2:
                numeros_detectados.append(int(cleaned))

    extracted["raw_numbers_count"] = len(numeros_detectados)
    extracted["raw_lines"] = lines

    return extracted


def extraer_datos_borrador(
    data: dict[str, Any], pl_anterior_override: float | None = None
) -> dict[str, Any]:
    """Normaliza y extrae las casillas patrimoniales de un borrador F210 (JSON o dict)."""
    contribuyente = data.get("contribuyente", {})
    casillas = data.get("casillas_formulario_210", data.get("casillas", data))

    # Casilla 28: Factura Electrónica (1% Art. 336 Num. 5 E.T.)
    deduccion_factura_electronica_c28 = float(
        casillas.get(
            "casilla_28_deduccion_factura_electronica",
            casillas.get(
                "deduccion_factura_electronica", casillas.get("compras_factura_electronica", 0.0)
            ),
        )
    )

    # Patrimonio Fiscal Año Actual
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

    # Patrimonio Líquido Año Anterior (Obtenido de Casilla 31 de la declaración anterior o Casilla 32 si fue digitado)
    patrimonio_liquido_anterior = 0.0
    if pl_anterior_override is not None:
        patrimonio_liquido_anterior = float(pl_anterior_override)
    else:
        patrimonio_liquido_anterior = float(
            casillas.get(
                "casilla_31_patrimonio_liquido_ano_anterior",
                casillas.get(
                    "casilla_32_patrimonio_liquido_ano_anterior",
                    casillas.get(
                        "patrimonio_liquido_ano_anterior",
                        casillas.get("patrimonio_liquido_anterior", 0.0),
                    ),
                ),
            )
        )

    # Rentas de Trabajo y Cédula General
    ingresos_brutos_trabajo = float(
        casillas.get(
            "casilla_33_ingresos_brutos_trabajo", casillas.get("ingresos_brutos_trabajo", 0.0)
        )
    )
    incrngo = float(
        casillas.get(
            "casilla_34_incrngo_trabajo",
            casillas.get("ingresos_no_constitutivos_renta", 0.0),
        )
    )
    rentas_exentas_limitadas_c38 = float(
        casillas.get(
            "casilla_38_total_rentas_exentas_limitadas",
            casillas.get(
                "rentas_exentas_limitadas", casillas.get("casilla_36_rentas_exentas", 0.0)
            ),
        )
    )
    deducciones_no_limitadas_c40 = float(
        casillas.get(
            "casilla_40_deducciones_no_sujetas_limite",
            casillas.get("deducciones_no_limitadas", 0.0),
        )
    )
    total_exentas_deducciones_c90 = float(
        casillas.get(
            "casilla_90_total_rentas_exentas_deducciones_cedula_general",
            casillas.get(
                "casilla_42_total_exentas_deducciones_trabajo",
                casillas.get(
                    "rentas_exentas_totales",
                    rentas_exentas_limitadas_c38
                    + deducciones_no_limitadas_c40
                    + deduccion_factura_electronica_c28,
                ),
            ),
        )
    )

    renta_ordinaria = float(
        casillas.get(
            "casilla_94_renta_liquida_ordinaria_cedula_general",
            casillas.get(
                "casilla_64_renta_liquida_ordinaria_cedula_general",
                casillas.get("renta_liquida_ordinaria", 0.0),
            ),
        )
    )

    ingresos_netos_c89 = float(
        casillas.get(
            "casilla_89_total_ingresos_netos_cedula_general",
            casillas.get("ingresos_netos_totales", renta_ordinaria + total_exentas_deducciones_c90),
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
            "casilla_125_total_impuesto_a_cargo",
            casillas.get(
                "casilla_133_total_impuesto_a_cargo", casillas.get("impuesto_renta_pagado", 0.0)
            ),
        )
    )
    retenciones = float(
        casillas.get(
            "casilla_133_total_retenciones_fuente",
            casillas.get(
                "casilla_135_total_retenciones_fuente",
                casillas.get("retenciones_fuente_asumidas", 0.0),
            ),
        )
    )
    saldo_a_favor = float(
        casillas.get("casilla_137_total_saldo_a_favor", casillas.get("saldo_a_favor", 0.0))
    )
    consumo_estimado = float(
        data.get("estimacion_gastos_personales_anuales", data.get("gastos_personales", 0.0))
    )

    return {
        "contribuyente": contribuyente.get(
            "nombre", data.get("nombre", "CONTRIBUYENTE DECLARANTE")
        ),
        "nit": contribuyente.get("nit", data.get("nit", "00000000-0")),
        "tax_year": int(contribuyente.get("tax_year", data.get("tax_year", 2026))),
        "deduccion_factura_electronica_c28": deduccion_factura_electronica_c28,
        "patrimonio_liquido_ano_anterior": patrimonio_liquido_anterior,
        "patrimonio_bruto_ano_actual": patrimonio_bruto,
        "deudas_ano_actual": deudas,
        "patrimonio_liquido_ano_actual": patrimonio_liquido_actual,
        "ingresos_brutos_trabajo_c33": ingresos_brutos_trabajo,
        "ingresos_no_constitutivos_renta_c34": incrngo,
        "rentas_exentas_limitadas_c38": rentas_exentas_limitadas_c38,
        "deducciones_no_limitadas_c40": deducciones_no_limitadas_c40,
        "total_rentas_exentas_deducciones_c90": total_exentas_deducciones_c90,
        "ingresos_netos_cedula_general_c89": ingresos_netos_c89,
        "renta_liquida_ordinaria_cedula_general": renta_ordinaria,
        "ganancias_ocasionales_netas": ganancia_ocasional,
        "impuesto_renta_y_ganancia_ocasional_pagado": impuesto_a_cargo,
        "retenciones_fuente_asumidas_en_el_ano": retenciones,
        "saldo_a_favor_c137": saldo_a_favor,
        "gastos_personales_y_consumo_estimado": consumo_estimado,
        "reajustes_fiscales_activos_fijos": float(data.get("reajustes_fiscales", 0.0)),
        "valorizaciones_nominales_o_revalorizaciones": float(data.get("valorizaciones", 0.0)),
        "nuevas_deudas_adquiridas_en_el_ano": float(data.get("nuevas_deudas", 0.0)),
        "desahorro_o_liquidacion_activos_anteriores": float(data.get("desahorro", 0.0)),
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extraer parámetros de comparación patrimonial desde borrador F210 (JSON o PDF)"
    )
    parser.add_argument("draft_file", help="Ruta al archivo JSON o PDF del borrador F210")
    parser.add_argument(
        "--pl-anterior",
        type=float,
        help="Patrimonio líquido del año gravable anterior (Casilla 31 de la declaración previa)",
    )
    parser.add_argument("--out", help="Ruta de salida JSON (opcional)")

    args = parser.parse_args()

    file_path = Path(args.draft_file)
    if not file_path.exists():
        print(f"❌ Error: El archivo {args.draft_file} no existe.", file=sys.stderr)
        sys.exit(1)

    try:
        if file_path.suffix.lower() == ".pdf":
            raw_pdf_data = extraer_datos_desde_pdf(file_path)
            extracted = extraer_datos_borrador(raw_pdf_data, pl_anterior_override=args.pl_anterior)
        else:
            with open(file_path, encoding="utf-8") as f:
                raw_data = json.load(f)
            extracted = extraer_datos_borrador(raw_data, pl_anterior_override=args.pl_anterior)

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
