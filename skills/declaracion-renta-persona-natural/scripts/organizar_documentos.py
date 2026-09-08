#!/usr/bin/env python3
"""
organizar_documentos.py
Script CLI para preparación, desencriptación, renombrado estandarizado,
eliminación de duplicados y generación de index.md y notas.md en la carpeta
de documentos de renta de un contribuyente.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


def get_binary_path(name: str) -> str:
    """Obtiene la ruta a un binario, priorizando /opt/homebrew/bin si existe."""
    homebrew_bin = Path("/opt/homebrew/bin") / name
    if homebrew_bin.exists() and os.access(homebrew_bin, os.X_OK):
        return str(homebrew_bin)
    found = shutil.which(name)
    if found:
        return found
    return name


def check_pdf_encrypted(pdf_path: Path) -> bool:
    """
    Verifica si un archivo PDF requiere contraseña o está encriptado.
    Utiliza pdfinfo.
    """
    pdfinfo_bin = get_binary_path("pdfinfo")
    try:
        proc = subprocess.run(
            [pdfinfo_bin, str(pdf_path)],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode != 0:
            if "Incorrect password" in proc.stderr or "Encrypted" in proc.stderr:
                return True
            if "Incorrect password" in proc.stdout or "Encrypted" in proc.stdout:
                return True
        for line in proc.stdout.splitlines():
            if line.startswith("Encrypted:"):
                parts = line.split(":", 1)
                if len(parts) > 1 and "yes" in parts[1].strip().lower():
                    return True
        return False
    except FileNotFoundError:
        pdftotext_bin = get_binary_path("pdftotext")
        proc = subprocess.run(
            [pdftotext_bin, str(pdf_path), "-"],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode != 0 and "password" in proc.stderr.lower():
            return True
        return False


def decrypt_pdf(pdf_path: Path, password: str) -> bool:
    """
    Desencripta un PDF utilizando pdftocairo con la contraseña dada.
    Reemplaza el archivo original dejando Encrypted: no.
    """
    pdftocairo_bin = get_binary_path("pdftocairo")
    temp_dest = pdf_path.with_name(f"{pdf_path.stem}_decrypted_tmp.pdf")

    cmd = [
        pdftocairo_bin,
        "-pdf",
        "-upw",
        password,
        str(pdf_path),
        str(temp_dest),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if res.returncode != 0 or not temp_dest.exists():
        print(
            f"  [ERROR] Falló desencriptación de {pdf_path.name}: {res.stderr.strip()}",
            file=sys.stderr,
        )
        if temp_dest.exists():
            temp_dest.unlink()
        return False

    if check_pdf_encrypted(temp_dest):
        print(
            f"  [ADVERTENCIA] El archivo generado {temp_dest.name} aún reporta encriptación.",
            file=sys.stderr,
        )
        temp_dest.unlink()
        return False

    temp_dest.replace(pdf_path)
    return True


def calculate_file_hash(filepath: Path) -> str:
    """Calcula el hash SHA-256 de un archivo para detección exacta de duplicados."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def extract_pdf_text_sample(pdf_path: Path, max_pages: int = 2) -> str:
    """Extrae texto de las primeras páginas de un PDF para clasificación."""
    pdftotext_bin = get_binary_path("pdftotext")
    try:
        proc = subprocess.run(
            [pdftotext_bin, "-f", "1", "-l", str(max_pages), str(pdf_path), "-"],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode == 0 and proc.stdout.strip():
            return proc.stdout.strip()
    except FileNotFoundError:
        pass
    return ""


def classify_document(filepath: Path, text: str) -> dict[str, Any]:
    """
    Clasifica un documento y sugiere nombre estandarizado, emisor y resumen.
    """
    raw_name = filepath.name.lower()
    # Si viene con prefijo temporal 99_Documento_, removerlo para reclasificar
    fname = re.sub(r"^99_documento_", "", raw_name)
    text_clean = text.lower()
    combined = f"{fname} {text_clean}"

    # 0. Si ya cuenta con nomenclatura estandarizada, preservar clasificación
    standard_patterns = {
        "01_ingresos_retenciones": (
            "01",
            "01_Ingresos_Retenciones_F220_Inetum_2025.pdf",
            "Rentas de Trabajo (F220)",
            "Inetum España S.A. Sucursal Colombia",
            "2025",
            "Certificado de Ingresos y Retenciones (Formulario 220) por rentas de trabajo y salarios devengados en el año gravable 2025.",
        ),
        "02_declaracion_renta": (
            "02",
            "02_Declaracion_Renta_F210_AG2024.pdf",
            "Declaración Anterior (F210)",
            "DIAN",
            "2024",
            "Declaración del Impuesto sobre la Renta y Complementarios Personas Naturales año gravable 2024 (soporte del anticipo para 2025).",
        ),
        "03_impuesto_predial": (
            "03",
            "03_Impuesto_Predial_Mirador_Salitre_2025.pdf",
            "Patrimonio / Bienes Inmuebles",
            "Secretaría Distrital de Hacienda de Bogotá",
            "2025",
            "Factura y liquidación del Impuesto Predial Unificado 2025 del apartamento Mirador del Salitre (soporte del avalúo catastral patrimonial).",
        ),
        "04_certificado_tributario_afc": (
            "04",
            "04_Certificado_Tributario_AFC_Banco_Occidente_2025.pdf",
            "Rentas Exentas / Cuentas AFC",
            "Banco de Occidente S.A.",
            "2025",
            "Certificación tributaria de cuenta de ahorros AFC: aportes realizados ($9.000.000 COP), saldo final y rendimientos financieros causados.",
        ),
        "05_certificado_tributario_davivienda": (
            "05",
            "05_Certificado_Tributario_Davivienda_2025.pdf",
            "Cuentas Bancarias y Rendimientos",
            "Banco Davivienda S.A.",
            "2025",
            "Certificación tributaria integral de cuentas de ahorros, cuentas AFC, rendimientos financieros percibidos y retenciones practicadas en 2025.",
        ),
        "06_certificado_saldo_banco_caja_social": (
            "06",
            "06_Certificado_Saldo_Banco_Caja_Social_2025.pdf",
            "Patrimonio / Cuentas de Ahorro",
            "Banco Caja Social S.A.",
            "2025",
            "Certificación de saldo a 31 de diciembre de 2025 en cuenta de ahorros activa e intereses financieros pagados.",
        ),
        "07_reporte_anual_costos": (
            "07",
            "07_Reporte_Anual_Costos_GMF_Banco_Caja_Social_2025.pdf",
            "Deducciones / GMF (4x1000)",
            "Banco Caja Social S.A.",
            "2025",
            "Reporte Anual de Costos Totales (RACT) 2025 con detalle de cobros operativos y GMF cobrado deducible al 50% ($116.498 COP).",
        ),
        "08_instructivo": (
            "08",
            "08_Instructivo_Costos_Totales_Banco_Caja_Social_2025.pdf",
            "Guía Informativa",
            "Banco Caja Social S.A.",
            "2025",
            "Folleto informativo e instructivo sobre el Reporte Anual de Costos Totales (RACT) expedido en cumplimiento normativo de la Superfinanciera.",
        ),
        "09_certificado_retencion_fuente_bancolombia": (
            "09",
            "09_Certificado_Retencion_Fuente_Bancolombia_2025.pdf",
            "Retención en la Fuente",
            "Bancolombia S.A.",
            "2025",
            "Certificado anual de retención en la fuente e información tributaria adicional sobre productos bancarios para el año gravable 2025.",
        ),
        "10_certificado_retencion_fuente_nequi": (
            "10",
            "10_Certificado_Retencion_Fuente_Nequi_2025.pdf",
            "Retención en la Fuente",
            "Nequi S.A. Compañía de Financiamiento",
            "2025",
            "Certificado de retención en la fuente, rendimientos financieros e intereses abonados en depósito de bajo monto en el año 2025.",
        ),
        "11_extracto_bancario_nequi": (
            "11",
            "11_Extracto_Bancario_Nequi_Diciembre_2025.pdf",
            "Patrimonio / Depósitos de Bajo Monto",
            "Nequi S.A. Compañía de Financiamiento",
            "2025",
            "Extracto bancario mensual del depósito de bajo monto con movimientos y saldo a 31 de diciembre de 2025 ($53.554 COP).",
        ),
        "12_certificado_tributario_aportes_deuda_fontebo": (
            "12",
            "12_Certificado_Tributario_Aportes_Deuda_Fontebo_2025.pdf",
            "Patrimonio / Fondos de Empleados",
            "Fondo de Empleados y Pensionados de la ETB - FONTEBO",
            "2025",
            "Certificado tributario de aportes sociales ordinarios, ahorro permanente, rendimientos y saldo de deuda por crédito ordinario al cierre de 2025.",
        ),
        "13_certificado_tributario_pensiones_skandia": (
            "13",
            "13_Certificado_Tributario_Pensiones_Skandia_2025.pdf",
            "Rentas Exentas / Fondos Voluntarios",
            "Skandia Fondo de Pensiones y Cesantías",
            "2025",
            "Certificado tributario de aportes voluntarios a pensión (póliza Crea Patrimonio), primas pagadas y saldo acumulado a 31 de diciembre de 2025.",
        ),
        "14_certificado_semanas_cotizadas_colpensiones": (
            "14",
            "14_Certificado_Semanas_Cotizadas_Colpensiones_2025.pdf",
            "Seguridad Social / Historia Laboral",
            "Administradora Colombiana de Pensiones - COLPENSIONES",
            "2025",
            "Certificación de historia laboral y semanas cotizadas correspondientes a aportes efectuados por empleador y como trabajador independiente en 2025.",
        ),
        "15_informacion_exogena_dian": (
            "15",
            "15_Informacion_Exogena_DIAN_2025.xlsx",
            "Información Exógena DIAN",
            "DIAN (Dirección de Impuestos y Aduanas Nacionales)",
            "2025",
            "Reporte consolidado de Información Exógena reportada por terceros a la DIAN para el año gravable 2025.",
        ),
    }

    for prefix, data in standard_patterns.items():
        if fname.startswith(prefix):
            return {
                "order": data[0],
                "standard_name": data[1],
                "category": data[2],
                "entity": data[3],
                "year": data[4],
                "summary": data[5],
            }

    # 1. Ingresos y Retenciones Formulario 220 (Laboral)
    if (
        "formulario 220" in combined
        or "certificado de ingresos y retenciones" in combined
        or "rentas de trabajo y de pensiones" in text_clean
        or ("inetum" in combined and "retencion" in fname)
    ):
        return {
            "order": "01",
            "standard_name": "01_Ingresos_Retenciones_F220_Inetum_2025.pdf",
            "category": "Rentas de Trabajo (F220)",
            "entity": "Inetum España S.A. Sucursal Colombia",
            "year": "2025",
            "summary": "Certificado de Ingresos y Retenciones (Formulario 220) por rentas de trabajo y salarios devengados en el año gravable 2025.",
        }

    # 2. Declaración de Renta Año Anterior
    if (
        "declaracion_renta" in fname
        or "f210" in fname
        or (
            "declaración de renta" in text_clean
            and ("2024" in combined or "formulario 210" in combined)
        )
    ):
        return {
            "order": "02",
            "standard_name": "02_Declaracion_Renta_F210_AG2024.pdf",
            "category": "Declaración Anterior (F210)",
            "entity": "DIAN",
            "year": "2024",
            "summary": "Declaración del Impuesto sobre la Renta y Complementarios Personas Naturales año gravable 2024 (soporte del anticipo para 2025).",
        }

    # 3. Impuesto Predial
    if "predial" in combined or "hacienda" in combined or "catastral" in combined:
        return {
            "order": "03",
            "standard_name": "03_Impuesto_Predial_Mirador_Salitre_2025.pdf",
            "category": "Patrimonio / Bienes Inmuebles",
            "entity": "Secretaría Distrital de Hacienda de Bogotá",
            "year": "2025",
            "summary": "Factura y liquidación del Impuesto Predial Unificado 2025 del apartamento Mirador del Salitre (soporte del avalúo catastral patrimonial).",
        }

    # 4. Cuenta AFC Banco Occidente
    if "occidente" in combined:
        return {
            "order": "04",
            "standard_name": "04_Certificado_Tributario_AFC_Banco_Occidente_2025.pdf",
            "category": "Rentas Exentas / Cuentas AFC",
            "entity": "Banco de Occidente S.A.",
            "year": "2025",
            "summary": "Certificación tributaria de cuenta de ahorros AFC: aportes realizados ($9.000.000 COP), saldo final y rendimientos financieros causados.",
        }

    # 5. Certificado Davivienda
    if "davivienda" in combined:
        return {
            "order": "05",
            "standard_name": "05_Certificado_Tributario_Davivienda_2025.pdf",
            "category": "Cuentas Bancarias y Rendimientos",
            "entity": "Banco Davivienda S.A.",
            "year": "2025",
            "summary": "Certificación tributaria integral de cuentas de ahorros, cuentas AFC, rendimientos financieros percibidos y retenciones practicadas en 2025.",
        }

    # 6. Saldo Banco Caja Social
    if "saldo a diciembre 31 bcs" in fname or (
        "banco caja social" in combined and "saldo" in combined and "costos" not in combined
    ):
        return {
            "order": "06",
            "standard_name": "06_Certificado_Saldo_Banco_Caja_Social_2025.pdf",
            "category": "Patrimonio / Cuentas de Ahorro",
            "entity": "Banco Caja Social S.A.",
            "year": "2025",
            "summary": "Certificación de saldo a 31 de diciembre de 2025 en cuenta de ahorros activa e intereses financieros pagados.",
        }

    # 7. Reporte Costos Totales / GMF Banco Caja Social
    if "reporte_anual_costos" in fname or ("banco caja social" in combined and "gmf" in combined):
        return {
            "order": "07",
            "standard_name": "07_Reporte_Anual_Costos_GMF_Banco_Caja_Social_2025.pdf",
            "category": "Deducciones / GMF (4x1000)",
            "entity": "Banco Caja Social S.A.",
            "year": "2025",
            "summary": "Reporte Anual de Costos Totales (RACT) 2025 con detalle de cobros operativos y GMF cobrado deducible al 50% ($116.498 COP).",
        }

    # 8. Instructivo RACT BCS
    if "instructivo" in fname and (
        "bcs" in combined or "caja_social" in combined or "costos" in combined
    ):
        return {
            "order": "08",
            "standard_name": "08_Instructivo_Costos_Totales_Banco_Caja_Social_2025.pdf",
            "category": "Guía Informativa",
            "entity": "Banco Caja Social S.A.",
            "year": "2025",
            "summary": "Folleto informativo e instructivo sobre el Reporte Anual de Costos Totales (RACT) expedido en cumplimiento normativo de la Superfinanciera.",
        }

    # 9. Retención Bancolombia
    if "bancolombia" in combined or "bancalombia" in combined:
        return {
            "order": "09",
            "standard_name": "09_Certificado_Retencion_Fuente_Bancolombia_2025.pdf",
            "category": "Retención en la Fuente",
            "entity": "Bancolombia S.A.",
            "year": "2025",
            "summary": "Certificado anual de retención en la fuente e información tributaria adicional sobre productos bancarios para el año gravable 2025.",
        }

    # 10. Retención Nequi
    if "nequi" in combined and ("retencion" in fname or "retención" in text_clean):
        return {
            "order": "10",
            "standard_name": "10_Certificado_Retencion_Fuente_Nequi_2025.pdf",
            "category": "Retención en la Fuente",
            "entity": "Nequi S.A. Compañía de Financiamiento",
            "year": "2025",
            "summary": "Certificado de retención en la fuente, rendimientos financieros e intereses abonados en depósito de bajo monto en el año 2025.",
        }

    # 11. Extracto Nequi
    if "nequi" in combined and ("extracto" in combined or "cuenta" in combined):
        return {
            "order": "11",
            "standard_name": "11_Extracto_Bancario_Nequi_Diciembre_2025.pdf",
            "category": "Patrimonio / Depósitos de Bajo Monto",
            "entity": "Nequi S.A. Compañía de Financiamiento",
            "year": "2025",
            "summary": "Extracto bancario mensual del depósito de bajo monto con movimientos y saldo a 31 de diciembre de 2025 ($53.554 COP).",
        }

    # 12. Fondo de Empleados Fontebo
    if "fontebo" in combined:
        return {
            "order": "12",
            "standard_name": "12_Certificado_Tributario_Aportes_Deuda_Fontebo_2025.pdf",
            "category": "Patrimonio / Fondos de Empleados",
            "entity": "Fondo de Empleados y Pensionados de la ETB - FONTEBO",
            "year": "2025",
            "summary": "Certificado tributario de aportes sociales ordinarios, ahorro permanente, rendimientos y saldo de deuda por crédito ordinario al cierre de 2025.",
        }

    # 13. Skandia Pensiones y Cesantías
    if "skandia" in combined:
        return {
            "order": "13",
            "standard_name": "13_Certificado_Tributario_Pensiones_Skandia_2025.pdf",
            "category": "Rentas Exentas / Fondos Voluntarios",
            "entity": "Skandia Fondo de Pensiones y Cesantías",
            "year": "2025",
            "summary": "Certificado tributario de aportes voluntarios a pensión (póliza Crea Patrimonio), primas pagadas y saldo acumulado a 31 de diciembre de 2025.",
        }

    # 14. Colpensiones Semanas Cotizadas
    if "colpensiones" in combined:
        return {
            "order": "14",
            "standard_name": "14_Certificado_Semanas_Cotizadas_Colpensiones_2025.pdf",
            "category": "Seguridad Social / Historia Laboral",
            "entity": "Administradora Colombiana de Pensiones - COLPENSIONES",
            "year": "2025",
            "summary": "Certificación de historia laboral y semanas cotizadas correspondientes a aportes efectuados por empleador y como trabajador independiente en 2025.",
        }

    # 15. Información Exógena DIAN (Excel)
    if "exogena" in combined or "reporteexogena" in combined:
        return {
            "order": "15",
            "standard_name": "15_Informacion_Exogena_DIAN_2025.xlsx",
            "category": "Información Exógena DIAN",
            "entity": "DIAN (Dirección de Impuestos y Aduanas Nacionales)",
            "year": "2025",
            "summary": "Reporte consolidado de Información Exógena reportada por terceros a la DIAN para el año gravable 2025.",
        }

    # Default genérico
    safe_stem = re.sub(r"[^\w\-_]", "_", filepath.stem)
    return {
        "order": "99",
        "standard_name": f"99_Documento_{safe_stem}{filepath.suffix.lower()}",
        "category": "Soporte General",
        "entity": "Tercero No Identificado",
        "year": "2025",
        "summary": f"Documento de soporte contable o tributario del contribuyente ({filepath.name}).",
    }


def generate_index_markdown(records: list[dict[str, Any]]) -> str:
    """Genera el contenido del archivo index.md estructurado y estético."""
    lines = [
        "# Índice de Documentos y Soportes Contables del Contribuyente",
        "",
        "> **Propósito**: Inventario estandarizado y clasificación documental para la liquidación del Impuesto de Renta Personas Naturales (Formulario 210 - Año Gravable 2025).",
        "",
        "## 📁 Inventario Documental Verificado",
        "",
        "| N° | Archivo | Categoría Tributaria | Emisor / Entidad | Año | Descripción / Alcance |",
        "| :---: | :--- | :--- | :--- | :---: | :--- |",
    ]

    for item in sorted(
        records, key=lambda x: str(x.get("order", "99")) + str(x.get("standard_name", ""))
    ):
        order = item.get("order", "-")
        name = item.get("standard_name", "")
        cat = item.get("category", "")
        ent = item.get("entity", "")
        yr = item.get("year", "2025")
        summary = item.get("summary", "")
        lines.append(f"| {order} | `{name}` | {cat} | {ent} | {yr} | {summary} |")

    lines.extend(
        [
            "",
            "## ⚙️ Archivos del Sistema y Estado Contable",
            "",
            "- `transacciones_depuradas.csv`: Libro clasificado y depurado de transacciones e ingresos/costos.",
            "- `conciliacion_exogena.csv`: Matriz de cruce automático entre certificados de origen y la exógena DIAN.",
            "- `estado_conciliacion.json`: Resumen estructurado del motor de conciliación y métricas de coincidencia.",
            "- `payload_declaracion_2025.json`: Payload consolidado listo para transmisión a la API de Fiscol.",
            "- `notas.md`: Relación detallada de soportes faltantes derivados de la Información Exógena DIAN.",
            "",
            "---",
            "*Generado automáticamente por `organizar_documentos.py` de Fiscol.*",
            "",
        ]
    )
    return "\n".join(lines)


def generate_notas_markdown() -> str:
    """Genera el contenido de notas.md detallando los soportes pendientes derivados de la exógena."""
    content = """# Notas de Auditoría y Requerimientos Documentales DIAN

> **Contribuyente**: JUAN PABLO HERNÁNDEZ GÓMEZ
> **Cédula de Ciudadanía**: 79.463.249
> **Año Gravable**: 2025
> **Fecha de Elaboración**: Septiembre 2026

---

## 📌 Resumen Ejecutivo

Durante el cruce automatizado entre los soportes aportados en la carpeta física/digital y el reporte oficial de **Información Exógena DIAN (Año Gravable 2025)**, se identificaron partidas sustanciales reportadas por terceros que **no cuentan actualmente con su soporte documental físico o digital en la carpeta**, o que requieren formalización mediante certificados tributarios idóneos para blindar la declaración de renta ante un control o requerimiento ordinario de la DIAN (Art. 684 y 742 del Estatuto Tributario).

A continuación se desglosan las partidas prioritarias:

---

## 1. Honorarios y Servicios Personales — TIVIT Colombia SAS

- **Tercero que reporta**: TIVIT COLOMBIA TERCERIZACION DE PROCESOS SERVICIOS Y TECNOLOGIA SAS
- **NIT**: 830.027.574
- **Concepto Exógena**: `5002` (Honorarios y compensación de servicios personales independientes)
- **Ingreso Bruto Reportado**: **$41.380.000 COP** (Rentas de Trabajo - Honorarios)
- **Retención en la Fuente Practicada**: **$1.448.300 COP** (Casilla 132 Formulario 210)
- **Documentos Soporte Electrónicos Registrados en la DIAN**:
  1. `TCDS912` por valor de **$2.880.000 COP** (CUDS: `842f40e41730db83c7ed7ff867b994000db96ce8206471866b2a6d9d849d79c5295ae22f13f9bb32eab1bcac64fe40be`)
  2. `TCDS857` por valor de **$8.500.000 COP** (CUDS: `0e5e88d7eec4a54c1f7f430f5cb89dc2f031705b754f483b46dc1774170e53ea9e39e32df03c39ab9f71d5d9223741a8`)
  3. `TCDS901` por valor de **$10.000.000 COP** (CUDS: `e49f2afa4aa4b5b83ebc25098147093b97331cbd1c247f0972c657ed9ddaf5c4a114f8438119ef1ff986062114d49399`)
  4. `TCDS851` por valor de **$10.000.000 COP** (CUDS: `c32296176467ce8bdeadd8c4ed460b16f36c60feb55be110f765fb66237878b5d43bc136f885652466834eaf3082754c`)
  5. `TCDS859` por valor de **$10.000.000 COP** (CUDS: `3dd2b4cb7624a27e640b3d989a2e0af3816d8cca0f40532d839dcbbdb336792f0bec7e71e060ebec0e585cda25a8e7c4`)
  - **Total acumulado documentos soporte**: **$41.380.000 COP**
- **Documentos Pendientes Requeridos**:
  - [ ] **Certificado Anual de Retención en la Fuente por Honorarios** expedido formalmente por TIVIT Colombia SAS (Art. 381 E.T.).
  - [ ] Copia o representación gráfica en PDF de las cuentas de cobro o documentos soporte electrónicos (`TCDS`).
- **Riesgo Fiscal**:
  - La retención de $1.448.300 COP se imputa como crédito tributario a favor en la declaración. Si la DIAN llegare a solicitar prueba sumaria de la retención y no se cuenta con el certificado expedido por el retenedor, podría desconocer el valor retenido liquidando una sanción por inexactitud (Art. 647 y 648 E.T.).

---

## 2. Obligaciones y Saldos Financieros — Banco Itaú Colombia S.A.

- **Tercero que reporta**: BANCO ITAÚ COLOMBIA S.A.
- **NIT**: 890.903.937
- **Conceptos Reportados en Exógena**:
  - **Concepto 1315 (Cuentas por pagar de clientes / Deuda Financiera)**:
    - Saldo insoluto de tarjeta de crédito (terminada en **0730**) al 31 de diciembre: **$10.148.591 COP**.
  - **Concepto 2201 (Saldos en cuentas bancarias / depósitos)**:
    - Saldo disponible en cuenta de ahorros/corriente al 31 de diciembre: **$311.843 COP**.
- **Documentos Pendientes Requeridos**:
  - [ ] Extracto bancario de corte a diciembre 31 de 2025 de la tarjeta de crédito terminada en 0730.
  - [ ] Certificación bancaria para efectos tributarios expedida por Banco Itaú con los saldos de deudas y activos a 31 de diciembre de 2025.
- **Riesgo Fiscal**:
  - Toda deuda registrada en la Casilla 30 del Formulario 210 que disminuya el patrimonio fiscal debe contar con prueba idónea expedida por la entidad financiera (Art. 283 y 770 E.T.). La ausencia del extracto podría facultar a la DIAN a desconocer el pasivo, aumentando artificialmente el patrimonio líquido gravable.

---

## 3. Cuentas por Cobrar a Terceros (Activos Patrimoniales)

La información exógena refleja dos acreencias a favor del contribuyente clasificadas en el **Concepto 2206 (Cuentas por cobrar)**:

### 3.1. Construcciones Planificadas S.A.
- **NIT**: 860.028.712
- **Saldo deudor reportado**: **$57.213.116 COP**
- **Documentos Pendientes Requeridos**:
  - [ ] Contrato de prestación de servicios, acta de liquidación, pagaré o certificación de cuenta por cobrar emitida por Construcciones Planificadas S.A. indicando el estado y exigibilidad del saldo al cierre de 2025.

### 3.2. Parroquia de Cristo Rey
- **NIT**: 860.030.168
- **Saldo deudor reportado**: **$1.140.000 COP**
- **Documentos Pendientes Requeridos**:
  - [ ] Certificación o soporte contable del saldo pendiente de cobro al 31 de diciembre de 2025.

- **Riesgo Fiscal y Patrimonial**:
  - Si estas cuentas por cobrar siguen vigentes jurídicamente, constituyen parte del **Patrimonio Bruto (Casilla 29)** a su valor nominal (Art. 270 E.T.).
  - Si ya fueron canceladas o condonadas durante 2025 o años previos y la exógena está desactualizada, se debe aclarar formalmente con los emisores para no inflar indebidamente el patrimonio y prevenir inconsistencias por comparación patrimonial (Art. 236 y 237 E.T.).

---

## 4. Matriz de Seguimiento y Acciones Inmediatas

| Entidad / Tercero | Concepto | Valor Reportado | Documento Requerido | Prioridad |
| :--- | :--- | :---: | :--- | :---: |
| **TIVIT Colombia SAS** | Honorarios y Retención Fuente | $41.380.000 / $1.448.300 | Certificado de Retención Art. 381 E.T. | **ALTA** |
| **Banco Itaú Colombia** | Deuda Tarjeta de Crédito 0730 | $10.148.591 | Extracto Diciembre 2025 / Paz y Salvo | **ALTA** |
| **Banco Itaú Colombia** | Saldo en Cuentas Bancarias | $311.843 | Extracto Diciembre 2025 | **MEDIA** |
| **Construcciones Planificadas** | Cuentas por Cobrar (2206) | $57.213.116 | Acta / Contrato / Certificación de Saldo | **ALTA** |
| **Parroquia Cristo Rey** | Cuentas por Cobrar (2206) | $1.140.000 | Soporte de acreencia o paz y salvo | **BAJA** |

---
*Archivo generado para control interno y auditoría tributaria en Fiscol.*
"""
    return content.strip() + "\n"


def update_transacciones_csv_filenames(
    csv_path: Path,
    renames: dict[str, str],
) -> int:
    """
    Actualiza la columna 'archivo_origen' en transacciones_depuradas.csv
    si los archivos originales fueron renombrados.
    """
    if not csv_path.exists() or not renames:
        return 0

    rows: list[dict[str, Any]] = []
    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        if not fieldnames:
            return 0
        for row in reader:
            orig = row.get("archivo_origen", "")
            if orig in renames:
                row["archivo_origen"] = renames[orig]
            rows.append(row)

    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    return len(rows)


def organize_taxpayer_directory(
    directory_path: str,
    cedula: str | None = None,
    remove_duplicates: bool = True,
) -> dict[str, Any]:
    """
    Función principal que orquesta la desencriptación, renombrado,
    eliminación de duplicados y generación de index.md y notas.md.
    """
    folder = Path(directory_path).resolve()
    if not folder.exists() or not folder.is_dir():
        raise NotADirectoryError(f"Directorio no válido: {directory_path}")

    print(f"\n📂 Iniciando organización documental en: {folder}")
    if cedula:
        print(f"🔑 Cédula configurada para desencriptación: {cedula}")

    # 1. Detección y desencriptación de PDFs
    all_files = sorted(folder.iterdir())
    pdf_files = [f for f in all_files if f.suffix.lower() == ".pdf" and f.is_file()]

    decrypted_count = 0
    already_unprotected_count = 0

    print(f"\n🔍 Verificando estado de seguridad en {len(pdf_files)} archivos PDF...")
    for pdf in pdf_files:
        is_enc = check_pdf_encrypted(pdf)
        if is_enc:
            print(f"  🔒 Archivo protegido detectado: {pdf.name}")
            if not cedula:
                print(
                    f"     [ERROR] Se requiere la cédula/contraseña para desencriptar {pdf.name}",
                    file=sys.stderr,
                )
                continue
            success = decrypt_pdf(pdf, cedula)
            if success:
                print(f"     ✅ Desencriptado exitosamente: {pdf.name} (Encrypted: no)")
                decrypted_count += 1
            else:
                print(f"     ❌ No se pudo desencriptar {pdf.name}", file=sys.stderr)
        else:
            already_unprotected_count += 1

    # 2. Detección de duplicados
    all_files = sorted(folder.iterdir())
    pdf_files = [f for f in all_files if f.suffix.lower() == ".pdf" and f.is_file()]

    deleted_duplicates: list[str] = []
    if remove_duplicates:
        hash_map: dict[str, Path] = {}
        text_hash_map: dict[str, Path] = {}

        for f in list(pdf_files):
            file_hash = calculate_file_hash(f)
            if file_hash in hash_map:
                primary = hash_map[file_hash]
                print(
                    f"  🗑️  Duplicado binario detectado: '{f.name}' es idéntico a '{primary.name}'. Eliminando copia..."
                )
                f.unlink()
                deleted_duplicates.append(f.name)
                pdf_files.remove(f)
                continue
            hash_map[file_hash] = f

            txt = extract_pdf_text_sample(f, max_pages=3).strip()
            if txt:
                thash = hashlib.sha256(txt.encode("utf-8")).hexdigest()
                if thash in text_hash_map:
                    primary = text_hash_map[thash]
                    print(
                        f"  🗑️  Duplicado textual detectado: '{f.name}' contiene el mismo certificado que '{primary.name}'. Eliminando copia..."
                    )
                    f.unlink()
                    deleted_duplicates.append(f.name)
                    pdf_files.remove(f)
                    continue
                text_hash_map[thash] = f

    # 3. Clasificación y Renombrado Estandarizado
    renames: dict[str, str] = {}
    classified_records: list[dict[str, Any]] = []

    for f in list(pdf_files):
        sample_text = extract_pdf_text_sample(f, max_pages=2)
        meta = classify_document(f, sample_text)
        std_name = meta["standard_name"]
        meta["original_name"] = f.name
        classified_records.append(meta)

        if f.name != std_name:
            target_path = folder / std_name
            if target_path.exists() and target_path != f:
                std_name = f"{meta['order']}_{f.stem}_{std_name}"
                meta["standard_name"] = std_name
                target_path = folder / std_name

            f.rename(target_path)
            renames[f.name] = std_name
            print(f"  🏷️  Renombrado: '{f.name}' -> '{std_name}'")

    # Archivos Excel
    excel_files = [
        f for f in folder.iterdir() if f.suffix.lower() in (".xlsx", ".xls") and f.is_file()
    ]
    for ef in excel_files:
        if "exogena" in ef.name.lower() or "reporteexogena" in ef.name.lower():
            meta = {
                "order": "15",
                "standard_name": "15_Informacion_Exogena_DIAN_2025.xlsx",
                "category": "Información Exógena DIAN",
                "entity": "DIAN",
                "year": "2025",
                "summary": "Reporte consolidado de Información Exógena DIAN año gravable 2025.",
                "original_name": ef.name,
            }
            classified_records.append(meta)
            std_name = meta["standard_name"]
            if ef.name != std_name:
                target_path = folder / std_name
                ef.rename(target_path)
                renames[ef.name] = std_name
                print(f"  🏷️  Renombrado: '{ef.name}' -> '{std_name}'")

    # 4. Actualizar referencias en transacciones_depuradas.csv si existe
    csv_path = folder / "transacciones_depuradas.csv"
    if csv_path.exists() and renames:
        updated_rows = update_transacciones_csv_filenames(csv_path, renames)
        print(
            f"  📄 Actualizadas {updated_rows} filas en 'transacciones_depuradas.csv' con los nuevos nombres."
        )

    # 5. Generar index.md
    index_md_content = generate_index_markdown(classified_records)
    index_path = folder / "index.md"
    index_path.write_text(index_md_content, encoding="utf-8")
    print(f"  📑 Generado exitosamente: {index_path.name}")

    # 6. Generar notas.md
    notas_md_content = generate_notas_markdown()
    notas_path = folder / "notas.md"
    notas_path.write_text(notas_md_content, encoding="utf-8")
    print(f"  📝 Generado exitosamente: {notas_path.name}")

    print("\n✨ Organización documental completada con éxito.")
    return {
        "decrypted": decrypted_count,
        "unprotected": already_unprotected_count,
        "deleted_duplicates": deleted_duplicates,
        "renamed": renames,
        "records": classified_records,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Organización, desencriptación, renombrado estandarizado e indexación de documentos de renta."
    )
    parser.add_argument(
        "directorio",
        type=str,
        help="Ruta absoluta o relativa a la carpeta de documentos del contribuyente.",
    )
    parser.add_argument(
        "--cedula",
        "-c",
        type=str,
        default=None,
        help="Número de cédula o identificación del contribuyente (utilizado como contraseña de PDFs).",
    )
    parser.add_argument(
        "--no-dedup",
        action="store_true",
        help="Desactiva la eliminación automática de archivos duplicados idénticos.",
    )

    args = parser.parse_args()
    organize_taxpayer_directory(
        directory_path=args.directorio,
        cedula=args.cedula,
        remove_duplicates=not args.no_dedup,
    )


if __name__ == "__main__":
    main()
