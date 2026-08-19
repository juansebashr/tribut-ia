#!/usr/bin/env python3
"""
consolidar_transacciones.py
Agrega y consolida transacciones desde un archivo CSV clasificado hacia un payload JSON
compatible con la API de TributIA (PersonaNaturalInput / SessionState).
"""

import sys
import csv
import json
import argparse
from pathlib import Path
from typing import Dict, Any


def consolidar_csv_a_payload(csv_path: str, tax_year: int = 2026, custom_uvt: float = 52350.0,
                              nombre: str = "", nit: str = "") -> Dict[str, Any]:
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"No se encontró el archivo CSV en: {csv_path}")

    # Inicializar acumuladores
    patrimonio_bruto = 0.0
    deudas = 0.0
    rentas_trabajo = 0.0
    viaticos = 0.0
    otros_ingresos_brutos = 0.0
    rentas_capital = 0.0
    incrngo_capital = 0.0
    rentas_nolaborales = 0.0
    incrngo_nolaborales = 0.0
    costos_nolaborales = 0.0

    aporte_salud = 0.0
    aporte_pension = 0.0
    aplica_dependiente_general = False
    num_dep_adicionales = 0

    medicina_prepagada = 0.0
    intereses_vivienda = 0.0
    gmf_total = 0.0
    compras_factura_elec_total = 0.0
    aportes_afc_fvp = 0.0
    otras_rentas_exentas = 0.0

    go_activos = 0.0
    go_costos = 0.0
    go_herencias = 0.0
    go_loterias = 0.0
    go_exentas = 0.0

    retenciones_fuente = 0.0
    anticipo_ano_anterior = 0.0
    saldo_favor_anterior = 0.0

    with open(path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            concepto = row.get("concepto_tributario", "").strip().upper()
            cedula = row.get("cedula_destino", "").strip().upper()
            tipo_mov = row.get("tipo_movimiento", "").strip().upper()
            
            raw_val = row.get("valor_cop", "0").replace("$", "").replace("'", "").replace(".", "").replace(",", "").strip()
            try:
                val = float(raw_val) if raw_val else 0.0
            except ValueError:
                val = 0.0

            if val <= 0:
                continue

            # Mapeo según concepto y tipo de movimiento
            if tipo_mov == "PATRIMONIO_ACTIVO" or concepto == "PATRIMONIO_CUENTAS" or concepto == "PATRIMONIO_BIENES":
                patrimonio_bruto += val
            elif tipo_mov == "PATRIMONIO_PASIVO" or concepto == "DEUDA_HIPOTECARIA" or concepto == "DEUDA_FINANCIERA":
                deudas += val
            elif concepto in ("SALARIO", "HONORARIOS_LABORALES", "COMPENSACIONES"):
                rentas_trabajo += val
            elif concepto == "VIATICOS":
                viaticos += val
            elif concepto == "RENTAS_CAPITAL" or (cedula == "CAPITAL" and tipo_mov == "INGRESO"):
                rentas_capital += val
            elif concepto == "INCRNGO_CAPITAL":
                incrngo_capital += val
            elif concepto == "RENTAS_NOLABORALES" or (cedula == "NO_LABORAL" and tipo_mov == "INGRESO"):
                rentas_nolaborales += val
            elif concepto == "INCRNGO_NOLABORALES":
                incrngo_nolaborales += val
            elif concepto == "COSTOS_NOLABORALES":
                costos_nolaborales += val
            elif concepto == "INCRNGO_SALUD":
                aporte_salud += val
            elif concepto == "INCRNGO_PENSION":
                aporte_pension += val
            elif concepto == "DED_DEPENDIENTES" or concepto == "DED_DEPENDIENTE_GENERAL":
                aplica_dependiente_general = True
            elif concepto == "DED_DEP_ADICIONAL":
                num_dep_adicionales += 1
            elif concepto == "DED_PREPAGADA":
                medicina_prepagada += val
            elif concepto == "DED_VIVIENDA":
                intereses_vivienda += val
            elif concepto == "DED_GMF":
                gmf_total += val
            elif concepto == "DED_FACTURA_ELEC":
                compras_factura_elec_total += val
            elif concepto in ("EXENTA_AFC", "EXENTA_FVP", "APORTES_AFC_FVP"):
                aportes_afc_fvp += val
            elif concepto == "EXENTA_OTRAS":
                otras_rentas_exentas += val
            elif concepto == "GO_ACTIVOS":
                go_activos += val
            elif concepto == "GO_COSTOS":
                go_costos += val
            elif concepto == "GO_HERENCIAS":
                go_herencias += val
            elif concepto == "GO_LOTERIAS":
                go_loterias += val
            elif concepto == "GO_EXENTAS":
                go_exentas += val
            elif concepto == "RETENCION_FUENTE" or tipo_mov == "RETENCION":
                retenciones_fuente += val
            elif concepto == "ANTICIPO_ANTERIOR":
                anticipo_ano_anterior += val
            elif concepto == "SALDO_FAVOR_ANTERIOR":
                saldo_favor_anterior += val
            elif tipo_mov == "INGRESO" and cedula == "TRABAJO":
                rentas_trabajo += val
            elif tipo_mov == "INGRESO":
                otros_ingresos_brutos += val

    # Buscar archivo de conciliación si existe
    reconciliation_state = {}
    recon_file = path.parent / "estado_conciliacion.json"
    if not recon_file.exists():
        recon_file = Path("estado_conciliacion.json")
    if recon_file.exists():
        try:
            with open(recon_file, "r", encoding="utf-8") as rf:
                reconciliation_state = json.load(rf)
        except Exception:
            pass

    payload = {
        "session_id": "default",
        "metadata": {
            "nombre": nombre or "CONTRIBUYENTE DECLARANTE",
            "nit": nit or "1234567890",
            "tax_year": tax_year,
            "custom_uvt": custom_uvt,
            "active_module": "pn",
            "active_subtab": "calc"
        },
        "persona_natural": {
            "tax_year": tax_year,
            "custom_uvt": custom_uvt,
            "patrimonio_bruto": patrimonio_bruto,
            "deudas": deudas,
            "rentas_trabajo": rentas_trabajo,
            "viaticos": viaticos,
            "otros_ingresos_brutos": otros_ingresos_brutos,
            "rentas_capital": rentas_capital,
            "incrngo_capital": incrngo_capital,
            "rentas_nolaborales": rentas_nolaborales,
            "incrngo_nolaborales": incrngo_nolaborales,
            "costos_nolaborales": costos_nolaborales,
            "aporte_salud_obligatorio": aporte_salud,
            "aporte_pension_obligatorio": aporte_pension,
            "aplica_dependiente_general": aplica_dependiente_general,
            "numero_dependientes_adicionales_72uvt": min(4, num_dep_adicionales),
            "medicina_prepagada_anual": medicina_prepagada,
            "intereses_vivienda_anual": intereses_vivienda,
            "gmf_4x1000_total": gmf_total,
            "compras_factura_electronica": compras_factura_elec_total,
            "aportes_voluntarios_pension_afc": aportes_afc_fvp,
            "otras_rentas_exentas": otras_rentas_exentas,
            "ganancias_ocasionales_brutas_activos_fijos": go_activos,
            "costos_ganancia_ocasional": go_costos,
            "ganancias_ocasionales_brutas_herencias": go_herencias,
            "ganancias_ocasionales_brutas_loterias": go_loterias,
            "ganancias_ocasionales_exentas_solicitadas": go_exentas,
            "retenciones_fuente_practicadas": retenciones_fuente,
            "anticipo_ano_anterior": anticipo_ano_anterior,
            "saldo_a_favor_ano_anterior": saldo_favor_anterior
        },
        "reconciliation": reconciliation_state
    }
    return payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Consolida transacciones de CSV para TributIA")
    parser.add_argument("csv_file", help="Ruta al archivo CSV de transacciones depuradas")
    parser.add_argument("--year", type=int, default=2026, help="Año gravable (default: 2026)")
    parser.add_argument("--uvt", type=float, default=52350.0, help="Valor UVT (default: 52350)")
    parser.add_argument("--nombre", type=str, default="", help="Nombre del declarante")
    parser.add_argument("--nit", type=str, default="", help="NIT del declarante")
    parser.add_argument("--reconciliation", type=str, default=None, help="Ruta a estado_conciliacion.json")
    parser.add_argument("--out", type=str, default="", help="Ruta para guardar el JSON resultante")

    args = parser.parse_args()

    payload = consolidar_csv_a_payload(
        csv_path=args.csv_file,
        tax_year=args.year,
        custom_uvt=args.uvt,
        nombre=args.nombre,
        nit=args.nit
    )

    if args.reconciliation and Path(args.reconciliation).exists():
        with open(args.reconciliation, "r", encoding="utf-8") as rf:
            payload["reconciliation"] = json.load(rf)

    json_str = json.dumps(payload, indent=2, ensure_ascii=False)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as out_f:
            out_f.write(json_str)
        print(f"[OK] Payload guardado exitosamente en: {args.out}")
    else:
        print(json_str)

