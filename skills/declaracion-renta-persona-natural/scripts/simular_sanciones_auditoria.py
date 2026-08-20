#!/usr/bin/env python3
"""simular_sanciones_auditoria.py — Herramienta CLI para simular el Beneficio de Auditoría

(Art. 689-3 E.T.) y calcular sanciones tributarias con principio de favorabilidad (Art. 640, 641, 644, 639).
"""

import argparse
import sys
from pathlib import Path

# Añadir backend al path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "backend"))

from app.services.beneficios import (  # noqa: E402
    BeneficioAuditoriaRequest,
    LiquidacionSancionRequest,
    calcular_beneficio_auditoria,
    calcular_sancion_tributaria,
)


def format_cop(val: float | None) -> str:
    if val is None:
        return "N/A"
    return f"${val:,.0f} COP"


def main():
    parser = argparse.ArgumentParser(
        description="Simulador Didáctico de Beneficio de Auditoría & Calculadora de Sanciones"
    )
    subparsers = parser.add_subparsers(dest="subcommand", help="Comando a ejecutar")

    # Subcomando: auditoria
    parser_aud = subparsers.add_parser(
        "auditoria", help="Simular Beneficio de Auditoría (Art. 689-3 E.T.)"
    )
    parser_aud.add_argument(
        "--impuesto-ant",
        type=float,
        required=True,
        help="Impuesto neto de renta liquidado en el año gravable anterior en COP",
    )
    parser_aud.add_argument(
        "--year",
        type=int,
        default=2026,
        help="Año gravable actual a declarar (default: 2026)",
    )
    parser_aud.add_argument(
        "--uvt",
        type=float,
        default=None,
        help="Valor personalizado de la UVT en COP",
    )

    # Subcomando: sancion
    parser_sancion = subparsers.add_parser(
        "sancion", help="Calcular Sanciones Tributarias (Art. 640, 641, 644, 639)"
    )
    parser_sancion.add_argument(
        "--tipo",
        type=str,
        default="correccion",
        choices=["correccion", "extemporaneidad"],
        help="Tipo de sanción a liquidar",
    )
    parser_sancion.add_argument(
        "--monto-base",
        type=float,
        required=True,
        help="Mayor valor a pagar (corrección) o Impuesto a cargo liquidado (extemporaneidad) en COP",
    )
    parser_sancion.add_argument(
        "--meses",
        type=int,
        default=1,
        help="Meses o fracción de mes de retraso (solo para extemporaneidad)",
    )
    parser_sancion.add_argument(
        "--emplazado",
        action="store_true",
        default=False,
        help="Indica si la liquidación es posterior a emplazamiento o auto de inspección DIAN",
    )
    parser_sancion.add_argument(
        "--sin-sanciones-2anos",
        action="store_true",
        default=False,
        help="Cumple con no haber sido sancionado en los últimos 2 años (descuento 50% Art. 640)",
    )
    parser_sancion.add_argument(
        "--sin-sanciones-1ano",
        action="store_true",
        default=False,
        help="Cumple con no haber sido sancionado en el último 1 año (descuento 25% Art. 640)",
    )
    parser_sancion.add_argument(
        "--year",
        type=int,
        default=2026,
        help="Año gravable fiscal (default: 2026)",
    )
    parser_sancion.add_argument(
        "--uvt",
        type=float,
        default=None,
        help="Valor personalizado de la UVT en COP",
    )

    args = parser.parse_args()

    if args.subcommand == "auditoria":
        req = BeneficioAuditoriaRequest(
            tax_year=args.year,
            impuesto_neto_ano_anterior=args.impuesto_ant,
            custom_uvt=args.uvt,
        )
        res = calcular_beneficio_auditoria(req)

        print("\n" + "=" * 78)
        print("🏛️  TRIBUTIA: BENEFICIO DE AUDITORÍA & FIRMEZA LEGAL (Art. 689-3 E.T.)")
        print("=" * 78)
        print(f"Año Gravable:               {res.tax_year} (UVT = {format_cop(res.uvt_value)})")
        print(f"Impuesto Año Anterior:      {format_cop(res.impuesto_neto_ano_anterior)}")
        print(
            f"Impuesto Mínimo Requerido:  {format_cop(res.impuesto_minimo_requerido_cop)} (71 UVT)"
        )
        print(f"Apto para Beneficio:        {'SÍ' if res.cumple_impuesto_minimo else 'NO'}")
        print("-" * 78)
        if res.cumple_impuesto_minimo:
            print("⚡ METAS DE FIRMEZA TRIBUTARIA:")
            print(
                f"  • Firmeza en 6 Meses (+35%):  Objetivo {format_cop(res.impuesto_objetivo_6_meses_cop)} (Incremento: +{format_cop(res.incremento_requerido_6_meses_cop)})"
            )
            print(
                f"  • Firmeza en 12 Meses (+25%): Objetivo {format_cop(res.impuesto_objetivo_12_meses_cop)} (Incremento: +{format_cop(res.incremento_requerido_12_meses_cop)})"
            )
        print("-" * 78)
        print(f"💡 Recomendación: {res.recomendacion}")
        print("=" * 78 + "\n")

    elif args.subcommand == "sancion":
        # Si marcó 2 años, implícitamente cumple 1 año
        sin_2 = args.sin_sanciones_2anos
        sin_1 = args.sin_sanciones_1ano or sin_2

        req_sancion = LiquidacionSancionRequest(
            tipo_sancion=args.tipo,
            monto_base_cop=args.monto_base,
            meses_fraccion_retraso=args.meses,
            es_voluntario_sin_emplazamiento=not args.emplazado,
            sin_sanciones_ultimos_2_anos=sin_2,
            sin_sanciones_ultimo_1_ano=sin_1,
            tax_year=args.year,
            custom_uvt=args.uvt,
        )
        res_sancion = calcular_sancion_tributaria(req_sancion)

        print("\n" + "=" * 78)
        print("🏛️  TRIBUTIA: LIQUIDACIÓN INTEGRAL DE SANCIONES TRIBUTARIAS")
        print("=" * 78)
        print(f"Tipo de Sanción:            {res_sancion.tipo_sancion.upper()}")
        print(f"Monto Base:                 {format_cop(res_sancion.monto_base_cop)}")
        print(
            f"Modalidad:                  {'Voluntaria (Sin Emplazamiento)' if res_sancion.es_voluntario else 'Coactiva (Tras Emplazamiento DIAN)'}"
        )
        print(f"Tarifa Base Aplicada:       {res_sancion.tarifa_base_pct:.1f}%")
        print("-" * 78)
        print(
            f"Sanción Plena (100%):       {format_cop(res_sancion.sancion_plena_sin_reduccion_cop)}"
        )
        print(
            f"Descuento Art. 640:         {res_sancion.porcentaje_reduccion_art640_pct:.0f}% de rebaja"
        )
        print(
            f"Sanción Mínima Legal DIAN:  {format_cop(res_sancion.sancion_minima_dian_cop)} (10 UVT Art. 639)"
        )
        print(f"💰 SANCIÓN FINAL A PAGAR:   {format_cop(res_sancion.sancion_final_a_pagar_cop)}")
        print("-" * 78)
        print(
            f"Ahorro por Favorabilidad:   {format_cop(res_sancion.ahorro_favorabilidad_art640_cop)}"
        )
        print(
            f"Ahorro vs Emplazamiento:    {format_cop(res_sancion.ahorro_por_corregir_antes_de_dian_cop)}"
        )
        print("=" * 78)
        print("📋 DESGLOSE PASO A PASO & ARTÍCULOS APLICADOS:")
        for paso in res_sancion.pasos_calculo:
            print(f"  • {paso}")
        print("=" * 78 + "\n")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
