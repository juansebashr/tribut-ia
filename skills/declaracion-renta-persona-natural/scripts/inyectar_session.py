#!/usr/bin/env python3
"""
inyectar_session.py / inyectar_fiscol.py / inyectar_tributia.py
Envía el estado consolidado de la liquidación a la API de Fiscol (REST & SSE).
"""

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

# Importar consolidación si se pasa CSV directamente
from consolidar_transacciones import consolidar_csv_a_payload


def inyectar_a_fiscol(
    payload: dict, api_url: str = "http://localhost:8000", session_id: str = "default"
):
    url = f"{api_url.rstrip('/')}/api/v1/session/state?source=api"
    data_bytes = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={"Content-Type": "application/json", "X-Session-ID": session_id},
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_json = json.loads(response.read().decode("utf-8"))
            return res_json
    except urllib.error.URLError as e:
        raise ConnectionError(f"No se pudo conectar a la API de Fiscol en {api_url}: {e}") from e


# Alias para retrocompatibilidad
inyectar_a_tributia = inyectar_a_fiscol


def format_cop(val: float) -> str:
    num = round(val)
    abs_str = str(abs(num))
    if len(abs_str) <= 3:
        formatted = abs_str
    else:
        rev = list(reversed(abs_str))
        parts = []
        for i in range(0, len(rev), 3):
            parts.append("".join(reversed(rev[i : i + 3])))
        formatted = parts[-1]
        for i in range(len(parts) - 2, -1, -1):
            sep = "'" if (i % 2 == 1) else "."
            formatted += sep + parts[i]
    return f"{'-' if num < 0 else ''}${formatted}"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inyecta liquidación a Fiscol API")
    parser.add_argument("input_file", help="Ruta a transacciones_depuradas.csv o payload.json")
    parser.add_argument("--api-url", default="http://localhost:8000", help="URL base de Fiscol")
    parser.add_argument(
        "--session-id", default="default", help="ID de la sesión (header X-Session-ID)"
    )
    parser.add_argument("--nombre", default="", help="Nombre del declarante")
    parser.add_argument("--nit", default="", help="NIT del declarante")

    args = parser.parse_args()

    input_path = Path(args.input_file)
    if not input_path.exists():
        print(f"[ERROR] No existe el archivo {args.input_file}")
        sys.exit(1)

    if input_path.suffix.lower() == ".csv":
        payload = consolidar_csv_a_payload(
            csv_path=str(input_path), nombre=args.nombre, nit=args.nit
        )
    else:
        with open(input_path, encoding="utf-8") as f:
            payload = json.load(f)

    try:
        resp = inyectar_a_fiscol(payload, api_url=args.api_url, session_id=args.session_id)
        print("\n=======================================================")
        print("  [OK] LIQUIDACIÓN INYECTADA EN FISCOL EN VIVO")
        print("=======================================================")
        res_calc = resp.get("state", {}).get("calculation_results", {}).get("persona_natural", {})
        if res_calc:
            renta_grav = res_calc.get("renta_liquida_gravable", 0)
            renta_uvt = res_calc.get("renta_liquida_gravable_uvt", 0)
            impuesto = res_calc.get("impuesto_bruto_renta", 0)
            tarifa_m = res_calc.get("tarifa_marginal_maxima", 0)
            saldo_pagar = res_calc.get("saldo_a_pagar", 0)
            saldo_favor = res_calc.get("saldo_a_favor", 0)

            print(f" Declarante:          {payload.get('metadata', {}).get('nombre')}")
            print(f" NIT:                 {payload.get('metadata', {}).get('nit')}")
            print(f" Renta Líquida Grav:  {format_cop(renta_grav)} ({renta_uvt:,.2f} UVT)")
            print(f" Tarifa Marginal:     {tarifa_m * 100:.0f}%")
            print(f" Impuesto de Renta:   {format_cop(impuesto)}")
            if saldo_pagar > 0:
                print(f" Saldo Neto a Pagar:  {format_cop(saldo_pagar)}")
            else:
                print(f" Saldo a Favor:       {format_cop(saldo_favor)}")
        print("-------------------------------------------------------")
        print(f" Interfaz Visual:     {args.api_url}")
        print("=======================================================\n")
    except Exception as err:
        print(f"[ERROR] {err}")
        sys.exit(1)
