from app.core.rules_engine.loader import get_available_tax_years, get_rules_for_year


def test_rules_loader():
    years = get_available_tax_years()
    assert 2022 in years
    assert 2024 in years
    assert 2025 in years
    assert 2026 in years


def test_custom_uvt_override():
    rule_2026 = get_rules_for_year(2026, custom_uvt=60000)
    assert rule_2026.uvt_value == 60000
    assert rule_2026.tax_year == 2026
