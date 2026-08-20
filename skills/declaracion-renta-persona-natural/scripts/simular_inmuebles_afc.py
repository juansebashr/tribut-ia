#!/usr/bin/env python3
"""simular_inmuebles_afc.py — Herramienta CLI para simular la exención en venta de vivienda

de habitación y depósito en Cuentas AFC según los Artículos 311-1 y 126-4 del Estatuto Tributario.
"""

import argparse
import sys
from pathlib import Path

# Añadir backend al path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "backend"))

from app.services.beneficios import (  # noqa: E402
    SimulacionInmuebleAfcRequest,
    calcular_exencion_inmueble_afc,
)


def format_cop(val: float | None) -> str:
    if val is None:
        return "N/A"
    return f"${val:,.0f} COP"


def main():
    parser = argparse.ArgumentParser(
        description="Simulador de Beneficios Inmobiliarios & Cuentas AFC (Art. 311-1 y 126-4 E.T.)"
    )
    parser.add_argument(
        "--precio-venta",
        type=float,
        required=True,
        help="Precio total de venta de la casa o apartamento de habitación en COP",
    )
    parser.add_argument(
        "--costo-fiscal",
        type=float,
        required=True,
        help="Costo fiscal del inmueble (adquisición, mejoras o reajuste Art. 73) en COP",
    )
    parser.add_argument(
        "--monto-afc",
        type=float,
        required=True,
        help="Monto de los dineros de la venta depositados en Cuenta AFC o destinados a nueva vivienda en COP",
    )
    parser.add_argument(
        "--es-vivienda",
        action="store_true",
        default=True,
        help="Confirma que el inmueble vendido constituía la casa o apartamento de habitación del contribuyente",
    )
    parser.add_argument(
        "--posesion-2anos",
        action="store_true",
        default=True,
        help="Confirma que el inmueble fue poseído por 2 o más años (Ganancia Ocasional)",
    )
    parser.add_argument(
        "--year",
        type=int,
        default=2026,
        help="Año gravable fiscal (default: 2026)",
    )
    parser.add_argument(
        "--uvt",
        type=float,
        default=None,
        help="Valor personalizado de la UVT en COP",
    )

    args = parser.parse_args()

    req = SimulacionInmuebleAfcRequest(
        precio_venta_cop=args.precio_venta,
        costo_fiscal_inmueble_cop=args.costo_fiscal,
        es_vivienda_habitacion=args.es_vivienda,
        posesion_mas_2_anos=args.posesion_2anos,
        monto_depositado_afc_o_vivienda_cop=args.monto_afc,
        tax_year=args.year,
        custom_uvt=args.uvt,
    )

    res = calcular_exencion_inmueble_afc(req)

    print("\n" + "=" * 78)
    print("🏛️  SIMULADOR TRIBUTIA: VENTA DE VIVIENDA & CUENTAS AFC (Art. 311-1 E.T.)")
    print("=" * 78)
    print(f"Año Gravable:               {res.tax_year} (UVT = {format_cop(res.uvt_value)})")
    print(f"Precio de Venta:            {format_cop(res.precio_venta_cop)}")
    print(f"Costo Fiscal:               {format_cop(res.costo_fiscal_cop)}")
    print(f"Monto Depositado en AFC:    {format_cop(res.monto_depositado_afc_cop)}")
    print("-" * 78)
    print(f"Ganancia Ocasional Bruta:   {format_cop(res.ganancia_ocasional_bruta_cop)}")
    print(f"Tope Legal 5.000 UVT:       {format_cop(res.tope_maximo_exencion_cop)}")
    print(f"Utilidad Exenta AFC:        {format_cop(res.ganancia_ocasional_exenta_cop)}")
    print(f"Utilidad Gravada Residual:  {format_cop(res.ganancia_ocasional_gravada_final_cop)}")
    print("-" * 78)
    print(f"Impuesto GO sin Beneficio:  {format_cop(res.impuesto_go_sin_afc_cop)}")
    print(f"Impuesto GO con Cuenta AFC: {format_cop(res.impuesto_go_con_afc_cop)}")
    print(f"⚡ AHORRO FISCAL ESTIMADO:   {format_cop(res.ahorro_impuesto_afc_cop)} (Tarifa GO 15%)")
    print("=" * 78)
    print("📋 DESGLOSE PASO A PASO & FUNDAMENTO LEGAL:")
    for paso in res.explicacion_paso_a_paso:
        print(f"  • {paso}")
    print("=" * 78 + "\n")


if __name__ == "__main__":
    main()
