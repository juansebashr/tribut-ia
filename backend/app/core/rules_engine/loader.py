import os
import yaml
from pathlib import Path
from typing import Dict, List, Optional
from app.core.rules_engine.schema import TaxYearRules

RULES_DIR = Path(__file__).parent.parent.parent / "rules"

_rules_cache: Dict[int, TaxYearRules] = {}


def load_all_rules() -> Dict[int, TaxYearRules]:
    """Carga y valida todos los archivos de reglas YAML disponibles."""
    global _rules_cache
    if not RULES_DIR.exists():
        return {}

    rules_map: Dict[int, TaxYearRules] = {}
    for file in RULES_DIR.glob("*.yaml"):
        with open(file, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            if data and "tax_year" in data:
                rule_obj = TaxYearRules(**data)
                rules_map[rule_obj.tax_year] = rule_obj

    _rules_cache = rules_map
    return _rules_cache


def get_rules_for_year(year: int, custom_uvt: Optional[float] = None) -> TaxYearRules:
    """Obtiene las reglas para un año fiscal específico, opcionalmente sobreescribiendo el UVT."""
    global _rules_cache
    if not _rules_cache:
        load_all_rules()

    if year not in _rules_cache:
        # Fallback al año más reciente disponible si no existe el año exacto
        available_years = sorted(_rules_cache.keys())
        if not available_years:
            raise ValueError("No se encontraron reglas tributarias configuradas.")
        fallback_year = available_years[-1]
        rules = _rules_cache[fallback_year].model_copy(deep=True)
        rules.tax_year = year
    else:
        rules = _rules_cache[year].model_copy(deep=True)

    if custom_uvt is not None and custom_uvt > 0:
        rules.uvt_value = custom_uvt

    return rules


def get_available_tax_years() -> List[int]:
    """Retorna la lista ordenada de años gravables disponibles."""
    global _rules_cache
    if not _rules_cache:
        load_all_rules()
    return sorted(_rules_cache.keys())
