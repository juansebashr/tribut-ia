#!/usr/bin/env python3
"""Script CLI para inyectar o sincronizar los parámetros regularizados de

Comparación Patrimonial en la API y sesión web de Fiscol.
"""

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


def inyectar_sesion_fiscol(
    api_url: str,
    session_id: str,
    payload: dict[str, Any],
) -> dict[str, Any]:
    """Envía los parámetros de comparación patrimonial a la API de Fiscol."""
    endpoint = f"{api_url.rstrip('/')}/api/v1/session/sync"
    req_body = {
        "active_module": "pn",
        "pn_subtab": "comparacion_patrimonial",
        "tax_year": payload.get("tax_year", 2026),
        "comparacion_patrimonial_data": payload,
    }

    data_bytes = json.dumps(req_body).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "X-Session-ID": session_id,
        "User-Agent": "Fiscol-Patrimonial-Skill/1.0",
    }

    req = urllib.request.Request(endpoint, data=data_bytes, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = resp.read().decode("utf-8")
            return json.loads(resp_data)
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        raise RuntimeError(f"Error HTTP {e.code} al inyectar sesión: {err_content}") from e
    except Exception as e:
        raise RuntimeError(f"Fallo de conexión con la API de Fiscol: {e}") from e


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Inyectar datos regularizados de Comparación Patrimonial en Fiscol"
    )
    parser.add_argument("payload_json", help="Ruta al archivo JSON con los datos regularizados")
    parser.add_argument(
        "--api-url",
        default="http://localhost:8000",
        help="URL base del backend de Fiscol",
    )
    parser.add_argument(
        "--session-id",
        default="default",
        help="ID de la sesión de usuario activa (ej. ses_12345)",
    )

    args = parser.parse_args()

    payload_path = Path(args.payload_json)
    if not payload_path.exists():
        print(f"❌ Error: El archivo {args.payload_json} no existe.", file=sys.stderr)
        sys.exit(1)

    try:
        with open(payload_path, encoding="utf-8") as f:
            payload = json.load(f)

        res = inyectar_sesion_fiscol(args.api_url, args.session_id, payload)
        print(f"✅ Datos sincronizados exitosamente con la sesión: {args.session_id}")
        print(f"📡 Estado sincronizado: {json.dumps(res, indent=2, ensure_ascii=False)}")

    except Exception as e:
        print(f"❌ Error al inyectar en la sesión: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
