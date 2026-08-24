#!/usr/bin/env python3
"""Script CLI para generar el Plan de Optimización y Regularización

Patrimonial (Markdown) basado en el diagnóstico y las respuestas/soportes
recopilados del contribuyente.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def generar_reporte_markdown(
    diagnostic: dict[str, Any],
    respuestas_usuario: dict[str, Any] | None = None,
    estrategias_seleccionadas: list[str] | None = None,
) -> str:
    """Genera un documento Markdown con el Plan de Regularización Tributaria."""
    contribuyente = diagnostic.get("contribuyente", "CONTRIBUYENTE DECLARANTE")
    nit = diagnostic.get("nit", "00000000-0")
    tax_year = diagnostic.get("tax_year", 2026)
    uvt = diagnostic.get("uvt_value", 52350.0)

    pl_anterior = diagnostic.get("patrimonio_liquido_ano_anterior", 0.0)
    pl_actual = diagnostic.get("patrimonio_liquido_ano_actual", 0.0)
    var_patrimonial = diagnostic.get("incremento_patrimonial_a_justificar", 0.0)
    capacidad_neta = diagnostic.get("capacidad_justificacion_neta", 0.0)
    diferencia = diagnostic.get("diferencia_no_justificada", 0.0)
    impuesto_riesgo = diagnostic.get("impuesto_estimado_comparacion_patrimonial_cop", 0.0)
    sancion_inexactitud_estimada = impuesto_riesgo * 1.0  # 100% Art. 648 E.T.

    es_justificado = not diagnostic.get("existe_renta_por_comparacion_patrimonial", False)

    respuestas = respuestas_usuario or {}
    estrategias = estrategias_seleccionadas or [
        "Incorporación de Pasivos Formales con Terceros (Art. 283 E.T.)",
        "Acreditación de Desahorro de Activos del Periodo Anterior",
        "Aplicación del Reajuste Fiscal Oficial DANE (Art. 73 E.T.)",
        "Estructuración de Copropiedad y Mutuo Conyugal (Art. 8 E.T.)",
        "Evaluación del Beneficio de Auditoría para Firmeza Acelerada (Art. 689-3 E.T.)",
    ]

    soportes_anexados = respuestas.get("documentos_soportes_anexados", [])

    md = f"""# 🛡️ Plan de Regularización y Control por Comparación Patrimonial
**Contribuyente:** {contribuyente} | **NIT:** {nit}
**Año Gravable:** {tax_year} | **UVT Aplicada:** ${uvt:,.0f} COP
**Fecha de Emisión:** 2026-08-24 | **Plataforma:** Fiscol AI Suite

---

## 1. Resumen Ejecutivo del Diagnóstico Inicial (Art. 236 E.T.)

| Concepto Fiscal | Valor en Pesos ($ COP) | Valor en UVT |
| :--- | :--- | :--- |
| **Patrimonio Líquido Año Anterior (Casilla 32)** | ${pl_anterior:,.0f} COP | {pl_anterior / uvt:,.2f} UVT |
| **Patrimonio Líquido Año Actual (Casilla 31)** | ${pl_actual:,.0f} COP | {pl_actual / uvt:,.2f} UVT |
| **Incremento Patrimonial Neto a Justificar** | **${var_patrimonial:,.0f} COP** | **{var_patrimonial / uvt:,.2f} UVT** |
| **Capacidad Neta de Justificación (Rentas - Consumos)** | **${capacidad_neta:,.0f} COP** | **{capacidad_neta / uvt:,.2f} UVT** |
| **Diferencia Patrimonial No Justificada** | **${diferencia:,.0f} COP** | **{diferencia / uvt:,.2f} UVT** |
| **Impuesto Estimado en Riesgo (Tarifas Art. 241)** | **${impuesto_riesgo:,.0f} COP** | - |
| **Riesgo por Sanción de Inexactitud (100% Art. 648 E.T.)** | **${sancion_inexactitud_estimada:,.0f} COP** | - |

> **Estado del Diagnóstico:** {"🟢 **PATRIMONIO JUSTIFICADO CORRECTAMENTE**" if es_justificado else "🔴 **ALERTA CRÍTICA: RENTA POR COMPARACIÓN PATRIMONIAL DETECTADA**"}

---

## 2. Causas Identificadas del Desajuste & Respuestas del Contribuyente

"""

    if es_justificado:
        md += """El incremento en el patrimonio líquido se encuentra plenamente sustentado por los ingresos netos declarados y las fuentes justificativas del periodo. No se requiere la adición de renta líquida gravable por comparación patrimonial.
"""
    else:
        md += f"""El incremento del patrimonio líquido (${var_patrimonial:,.0f} COP) supera la capacidad de absorción generada por las rentas netas y consumos del año (${capacidad_neta:,.0f} COP), arrojando un faltante de **${diferencia:,.0f} COP**.

### 📝 Hallazgos y Aclaraciones Recopiladas:
"""
        if respuestas.get("hallazgos"):
            for h in respuestas["hallazgos"]:
                md += f"- **{h.get('titulo', 'Hallazgo')}:** {h.get('detalle', '')}\n"
        else:
            md += """- **Adquisición de Activos Fijos:** Se identificó la compra de bienes en el periodo sin el correspondiente registro de pasivos financieros o desahorro previo.
- **Flujo de Fondos No Vinculado:** Fondos provenientes de ahorros anteriores, créditos familiares o aportes conyugales que no habían sido incorporados formalmente en el borrador del Formulario 210.
"""

    md += """
---

## 3. Plan de Regularización & Acciones Correctivas Recomendadas

### 🎯 Ruta de Optimización y Mitigación de Riesgos:

"""
    for i, est in enumerate(estrategias, 1):
        md += f"#### {i}. {est}\n"
        if "Pasivos" in est:
            md += "Incorporar en la **Casilla 30 (Deudas)** los saldos de créditos hipotecarios o préstamos personales soportados con certificados bancarios o contratos de mutuo con fecha cierta ante notaría (Art. 283 E.T.).\n\n"
        elif "Desahorro" in est:
            md += "Acreditar el retiro de saldos bancarios y liquidación de CDTs/inversiones que ya constaban en el Patrimonio Bruto (Casilla 29) a 31 de diciembre del año anterior, evitando tributar dos veces sobre el mismo capital.\n\n"
        elif "Reajuste Fiscal" in est:
            md += "Aplicar el reajuste del Art. 73 E.T. (Tabla oficial DANE) sobre inmuebles o acciones poseídos de años anteriores para elevar el costo fiscal sin que compute como incremento patrimonial que requiera ingresos del periodo.\n\n"
        elif "Copropiedad" in est:
            md += "Estructurar los activos adquiridos en pareja bajo copropiedad proindiviso 50/50 o contrato de mutuo conyugal, distribuyendo el costo fiscal y eliminando el riesgo de donación involuntaria (Art. 302 E.T.).\n\n"
        elif "Beneficio de Auditoría" in est:
            md += "Si tras las justificaciones persiste una diferencia y se opta por liquidarla como renta gravable, incrementar el impuesto neto de renta en $\\ge 35\\%$ frente al año anterior para obtener **firmeza de la declaración en 6 meses** (Art. 689-3 E.T.), extinguiendo la potestad de revisión ordinaria de 3 años de la DIAN (Art. 714 E.T.).\n\n"

    md += """---

## 4. Matriz de Documentos y Evidencias para el Archivo Tributario

Para blindar la declaración de renta ante un eventual Requerimiento Especial de la DIAN, el contribuyente debe conservar:

| Documento Requerido | Norma Legal | Estado de Recolección |
| :--- | :--- | :--- |
| **Escrituras públicas de compraventa con registro** | Arts. 70, 72, 236 E.T. | Anexar copia auténtica |
| **Certificados de deuda bancaria a dic 31** | Art. 283 E.T. | Descargar de portales bancarios |
| **Contratos de mutuo privado con FECHA CIERTA** | Arts. 283, 767 E.T. | Requiere autenticación notarial |
| **Extractos bancarios comparativos a dic 31** | Art. 236 E.T. | Conservar extractos de origen |
| **Certificado de retiro de cesantías para vivienda** | Art. 56-1 E.T. | Emitido por fondo de cesantías |
| **Cédula de liquidación de reajuste Art. 73 DANE** | Art. 73 E.T. | Generada por Fiscol |

"""

    if soportes_anexados:
        md += "### 📎 Soportes Documentales Ya Anexados:\n"
        for s in soportes_anexados:
            md += f"- ✅ {s}\n"

    md += """
---

## 5. Dictamen Final del Asistente Tributario Fiscol

> **Conclusión Profesional:** La implementación de las acciones correctivas planteadas permite erradicar la contingencia por renta presuntiva de comparación patrimonial, protegiendo al contribuyente de una sanción de inexactitud del 100% y garantizando la plena consistencia matemática y jurídica del Formulario 210.
"""

    return md


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generar informe Markdown del Plan de Optimización por Comparación Patrimonial"
    )
    parser.add_argument(
        "diagnostic_json",
        help="Ruta al archivo JSON con el diagnóstico de analizar_comparacion.py",
    )
    parser.add_argument(
        "--answers",
        help="Ruta al archivo JSON con las respuestas y soportes del usuario (opcional)",
    )
    parser.add_argument(
        "--out-md",
        default="plan_optimizacion_patrimonial.md",
        help="Ruta de salida del archivo Markdown",
    )

    args = parser.parse_args()

    diag_path = Path(args.diagnostic_json)
    if not diag_path.exists():
        print(
            f"❌ Error: El archivo de diagnóstico {args.diagnostic_json} no existe.",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        with open(diag_path, encoding="utf-8") as f:
            diagnostic = json.load(f)

        respuestas = {}
        if args.answers:
            ans_path = Path(args.answers)
            if ans_path.exists():
                with open(ans_path, encoding="utf-8") as f:
                    respuestas = json.load(f)

        report_md = generar_reporte_markdown(diagnostic, respuestas)

        out_path = Path(args.out_md)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(report_md)

        print(f"✅ Plan de Optimización Patrimonial generado exitosamente en: {out_path}")

    except Exception as e:
        print(f"❌ Error generando plan de optimización: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
