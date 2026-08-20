#!/usr/bin/env python3
"""simular_articulo_73.py — Herramienta CLI para calcular el ajuste fiscal de activos fijos

(Bienes Raíces y Acciones) según el Artículo 73 del Estatuto Tributario.
"""

import argparse
import sys
from pathlib import Path

# Añadir backend al path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "backend"))

from app.services.beneficios import (  # noqa: E402
    SimulacionAjusteArticulo73Request,
    calcular_ajuste_articulo_73,
    get_tabla_articulo_73,
)


def format_cop(val: float | None) -> str:
    if val is None:
        return "N/A"
    return f"${val:,.0f} COP"


def main():
    parser = argparse.ArgumentParser(
        description="Simulador Didáctico de Ajuste Fiscal de Activos Fijos (Art. 73 E.T.)"
    )
    parser.add_argument(
        "--ano",
        type=str,
        default="1995",
        help="Año de adquisición del bien (ej. 1995, 2010, '1955 y anteriores')",
    )
    parser.add_argument(
        "--tipo",
        type=str,
        default="bienes_raices_urbanos",
        choices=[
            "acciones_aportes",
            "bienes_raices_urbanos",
            "bienes_raices_rurales_agro",
            "bienes_raices_rurales",
        ],
        help="Categoría del activo fijo",
    )
    parser.add_argument(
        "--costo",
        type=float,
        required=True,
        help="Costo histórico comprobado de adquisición en COP",
    )
    parser.add_argument(
        "--venta",
        type=float,
        default=None,
        help="Precio de venta o enajenación estimado en COP",
    )
    parser.add_argument(
        "--ano-gravable",
        type=int,
        default=2025,
        help="Año gravable de enajenación (por defecto: 2025)",
    )
    parser.add_argument(
        "--listar-tabla",
        action="store_true",
        help="Imprime la tabla completa de factores oficiales",
    )

    args = parser.parse_args()

    if args.listar_tabla:
        tabla = get_tabla_articulo_73()
        print("\n" + "=" * 90)
        print("TABLA OFICIAL DE FACTORES DE AJUSTE FISCAL (ART. 73 E.T. - DUR 1.2.1.17.21)")
        print("=" * 90)
        print(
            f"{'Año Adquisición':<22} | {'Acciones/Aportes':<16} | {'Inmueble Urbano':<16} | {'Rural Agropecuario':<18} | {'Rural General':<14}"
        )
        print("-" * 90)
        for r in tabla:
            print(
                f"{r.ano_adquisicion:<22} | {r.acciones_aportes:<16.2f} | {r.bienes_raices_urbanos:<16.2f} | {r.bienes_raices_rurales_agro:<18.2f} | {r.bienes_raices_rurales:<14.2f}"
            )
        print("=" * 90 + "\n")
        return

    req = SimulacionAjusteArticulo73Request(
        ano_adquisicion=args.ano,
        tipo_activo=args.tipo,
        costo_adquisicion_historico_cop=args.costo,
        precio_venta_estimado_cop=args.venta,
        ano_gravable_enajenacion=args.ano_gravable,
    )

    res = calcular_ajuste_articulo_73(req)

    print("\n" + "=" * 80)
    print("🎯 RESULTADO DE LA SIMULACIÓN DE AJUSTE FISCAL — ART. 73 E.T.")
    print("=" * 80)
    print(f"Tipo de Activo:                 {res.tipo_activo_label}")
    print(f"Año de Adquisición:             {res.ano_adquisicion}")
    print(f"Factor Multiplicador Oficial:   {res.factor_multiplicador:,.2f}x")
    print(f"Costo Histórico de Compra:      {format_cop(res.costo_adquisicion_historico_cop)}")
    print(
        f"Costo Fiscal Ajustado (Art 73): {format_cop(res.costo_fiscal_ajustado_art73_cop)} (Multiplicado)"
    )
    print(f"Incremento de Costo Fiscal:     +{format_cop(res.incremento_costo_fiscal_cop)}")
    print("-" * 80)

    if res.precio_venta_cop:
        print(f"Precio de Venta Estimado:       {format_cop(res.precio_venta_cop)}")
        print(f"Ganancia Gravable SIN Ajuste:   {format_cop(res.ganancia_sin_ajuste_cop)}")
        print(f"Ganancia Gravable CON Ajuste:   {format_cop(res.ganancia_con_ajuste_cop)}")
        print(f"Ahorro en Base Gravable:        {format_cop(res.ahorro_base_gravable_cop)}")
        print(
            f"Régimen Aplicable:              {'Ganancia Ocasional (15%)' if res.es_ganancia_ocasional else 'Renta Ordinaria (35%)'}"
        )
        print(f"Impuesto SIN Ajuste:            {format_cop(res.impuesto_estimado_sin_ajuste_cop)}")
        print(f"Impuesto CON Ajuste:            {format_cop(res.impuesto_estimado_con_ajuste_cop)}")
        print(
            f"💰 AHORRO FISCAL ESTIMADO:      {format_cop(res.ahorro_impuesto_estimado_cop)} en impuestos netos"
        )
        print("-" * 80)

    print("\n📖 EXPLICACIÓN DIDÁCTICA Y PASOS LEGALES:")
    for paso in res.pasos_calculo:
        print(f"   {paso}")
    print("\n" + "=" * 80 + "\n")


if __name__ == "__main__":
    main()
