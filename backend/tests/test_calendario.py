from app.core.rules_engine.loader import get_rules_for_year

def test_calendario_rules():
    rule_2026 = get_rules_for_year(2026)
    assert rule_2026.tax_year == 2026
    assert rule_2026.uvt_value == 52350
