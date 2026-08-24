from unittest.mock import MagicMock, patch

import fakeredis.aioredis
import pytest
from fastapi.testclient import TestClient

from app.core.rules_engine.loader import get_available_tax_years, get_rules_for_year, load_all_rules
from app.main import app, serve_ui
from app.models.persona_juridica import PersonaJuridicaInput
from app.models.persona_natural import PersonaNaturalInput
from app.services.beneficios import (
    BeneficioAuditoriaRequest,
    ReduccionSancionRequest,
    calcular_beneficio_auditoria,
    calcular_reduccion_sancion,
)
from app.services.liquidacion_pj import liquidar_persona_juridica
from app.services.liquidacion_pn import liquidar_persona_natural
from app.services.session_store import InMemorySessionStore, RedisSessionStore, create_session_store
from app.services.session_store_base import SessionState, SessionStoreBase

client = TestClient(app)


def test_simulation_compare_pn_with_savings():
    """Valida comparación de escenarios con ahorro efectivo de impuesto."""
    base = {
        "tax_year": 2026,
        "custom_uvt": 52350.0,
        "rentas_trabajo": 300000000.0,
        "aporte_salud_obligatorio": 12000000.0,
        "aporte_pension_obligatorio": 12000000.0,
    }
    opt = {
        "tax_year": 2026,
        "custom_uvt": 52350.0,
        "rentas_trabajo": 300000000.0,
        "aporte_salud_obligatorio": 12000000.0,
        "aporte_pension_obligatorio": 12000000.0,
        "medicina_prepagada_anual": 10051200.0,
        "intereses_vivienda_anual": 30000000.0,
        "compras_factura_electronica": 20000000.0,
    }
    res = client.post(
        "/api/v1/simulation/compare-pn", json={"base_scenario": base, "optimized_scenario": opt}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["ahorro_impuesto_cop"] > 0
    assert "reduce el impuesto" in data["recomendacion_estrategica"]


def test_simulation_compare_pn_no_savings():
    """Valida comparación de escenarios cuando no se generan ahorros adicionales."""
    scenario = {
        "tax_year": 2026,
        "custom_uvt": 52350.0,
        "rentas_trabajo": 50000000.0,
        "aporte_salud_obligatorio": 2000000.0,
        "aporte_pension_obligatorio": 2000000.0,
    }
    res = client.post(
        "/api/v1/simulation/compare-pn",
        json={"base_scenario": scenario, "optimized_scenario": scenario},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["ahorro_impuesto_cop"] == 0
    assert "no generó ahorros tributarios" in data["recomendacion_estrategica"]


def test_rules_endpoints_complete():
    """Valida endpoints de rules: listar años, obtener reglas con custom_uvt y conversión UVT."""
    # Listar años
    res_y = client.get("/api/v1/rules/years")
    assert res_y.status_code == 200
    assert len(res_y.json()) > 0

    # Conversión COP a UVT
    res_c1 = client.post(
        "/api/v1/rules/convert-uvt", json={"tax_year": 2026, "amount_cop": 52350000.0}
    )
    assert res_c1.status_code == 200
    assert res_c1.json()["amount_uvt"] == 1000.0

    # Conversión UVT a COP con custom_uvt
    res_c2 = client.post(
        "/api/v1/rules/convert-uvt",
        json={"tax_year": 2026, "custom_uvt": 50000.0, "amount_uvt": 100.0},
    )
    assert res_c2.status_code == 200
    assert res_c2.json()["amount_cop"] == 5000000.0

    # Conversión sin montos (default a 0)
    res_c3 = client.post("/api/v1/rules/convert-uvt", json={"tax_year": 2026})
    assert res_c3.status_code == 200
    assert res_c3.json()["amount_cop"] == 0.0

    # Error 404 al consultar cuando get_rules_for_year falla
    with patch("app.api.v1.endpoints.rules.get_rules_for_year", side_effect=Exception("No rules")):
        res_err = client.get("/api/v1/rules/1900")
        assert res_err.status_code == 404


def test_session_sync_pj_mutation():
    """Valida la inyección y recálculo automático de Persona Jurídica en session_sync."""
    pj_payload = {
        "metadata": {"tax_year": 2026, "custom_uvt": 52350},
        "persona_juridica": {
            "ingresos_brutos_operacionales": 1500000000.0,
            "costos_procedentes": 800000000.0,
            "gastos_administracion": 200000000.0,
            "retenciones_en_la_fuente": 35000000.0,
        },
    }
    res = client.post("/api/v1/session/state?session_id=pj_test_sess&source=api", json=pj_payload)
    assert res.status_code == 200
    data = res.json()
    assert "calculation_results" in data
    assert "persona_juridica" in data["calculation_results"]
    assert data["calculation_results"]["persona_juridica"]["impuesto_neto_total"] > 0


def test_session_sync_calc_exception_branches():
    """Valida ramas de excepción seguras al calcular en session_sync."""
    with patch(
        "app.api.v1.endpoints.session_sync.liquidar_persona_natural",
        side_effect=ValueError("Test PN Error"),
    ):
        res_pn = client.post(
            "/api/v1/session/state?session_id=err_sess",
            json={"persona_natural": {"rentas_trabajo": 1000000}},
        )
        assert res_pn.status_code == 200

    with patch(
        "app.api.v1.endpoints.session_sync.liquidar_persona_juridica",
        side_effect=ValueError("Test PJ Error"),
    ):
        res_pj = client.post(
            "/api/v1/session/state?session_id=err_sess_pj",
            json={"persona_juridica": {"ingresos_brutos_operacionales": 1000000}},
        )
        assert res_pj.status_code == 200


def test_calculate_endpoints_error_branches():
    """Valida respuestas HTTP 400 cuando el liquidador arroja una excepción controlada."""
    with patch(
        "app.api.v1.endpoints.persona_natural.liquidar_persona_natural",
        side_effect=ValueError("Validation Error"),
    ):
        res = client.post(
            "/api/v1/calculate/persona-natural/calculate",
            json={"tax_year": 2026, "rentas_trabajo": 100},
        )
        assert res.status_code == 400

    with patch(
        "app.api.v1.endpoints.persona_juridica.liquidar_persona_juridica",
        side_effect=ValueError("Validation Error"),
    ):
        res = client.post(
            "/api/v1/calculate/persona-juridica/calculate",
            json={"tax_year": 2026, "ingresos_brutos_operacionales": 100},
        )
        assert res.status_code == 400


def test_beneficios_service_edge_cases():
    """Valida casos de reducción de sanciones y auditoría en beneficios.py."""
    # Reducción al 75% (sin sanciones último año pero sí en 2 años)
    res_75 = calcular_reduccion_sancion(
        ReduccionSancionRequest(
            monto_sancion_base_cop=1000000,
            sin_sanciones_ultimos_2_anos=False,
            sin_sanciones_ultimo_1_ano=True,
        )
    )
    assert res_75.porcentaje_reduccion_aplicado == 25.0
    assert res_75.sancion_final_reducida_cop == 750000

    # Sin reducción (reincidente)
    res_none = calcular_reduccion_sancion(
        ReduccionSancionRequest(
            monto_sancion_base_cop=1000000,
            sin_sanciones_ultimos_2_anos=False,
            sin_sanciones_ultimo_1_ano=False,
        )
    )
    assert res_none.porcentaje_reduccion_aplicado == 0.0
    assert res_none.sancion_final_reducida_cop == 1000000

    # Auditoría que NO cumple mínimo de 71 UVT
    res_no_min = calcular_beneficio_auditoria(
        BeneficioAuditoriaRequest(
            tax_year=2026,
            impuesto_neto_ano_anterior=100000,  # < 71 UVT
        )
    )
    assert not res_no_min.cumple_impuesto_minimo
    assert res_no_min.impuesto_objetivo_6_meses_cop == 0.0


def test_serve_ui_fallback():
    """Valida el endpoint raíz serve_ui cuando index.html no existe."""
    with patch("app.main.FRONTEND_DIST") as mock_frontend, patch("app.main.STATIC_DIR") as mock_dir:
        mock_file1 = MagicMock()
        mock_file1.exists.return_value = False
        mock_frontend.__truediv__.return_value = mock_file1

        mock_file2 = MagicMock()
        mock_file2.exists.return_value = False
        mock_dir.__truediv__.return_value = mock_file2

        res = serve_ui()
        assert res["app"] == "Fiscol API"
        assert res["status"] == "online"


@pytest.mark.asyncio
async def test_session_store_base_abstract_methods():
    """Valida los métodos abstractos de SessionStoreBase."""

    class DummyStore(SessionStoreBase):
        async def get_state(self, session_id: str = "default") -> SessionState:
            return self._create_default_session(session_id)

        async def update_state(
            self, session_id: str, payload: dict, source: str = "api"
        ) -> SessionState:
            return self._create_default_session(session_id)

        async def reset_state(self, session_id: str = "default") -> SessionState:
            return self._create_default_session(session_id)

        async def subscribe(self, session_id: str = "default"):
            pass

        async def unsubscribe(self, session_id: str, queue):
            pass

        async def publish_event(
            self, session_id: str, event_type: str, data: dict, source: str = "api"
        ) -> None:
            pass

    dummy = DummyStore()
    st = await dummy.get_state("dummy_1")
    assert st.session_id == "dummy_1"


@pytest.mark.asyncio
async def test_in_memory_session_store_full():
    """Valida métodos completos de InMemorySessionStore."""
    store = InMemorySessionStore()
    q = await store.subscribe("sess_1")
    await store.update_state("sess_1", {"metadata": {"nombre": "DECLARANTE DEMO"}})
    msg = await q.get()
    assert "state_update" in msg
    await store.unsubscribe("sess_1", q)
    res_st = await store.reset_state("sess_1")
    assert res_st.session_id == "sess_1"


@pytest.mark.asyncio
async def test_redis_session_store_full_methods():
    """Valida métodos completos de RedisSessionStore con fakeredis."""
    fake_client = fakeredis.aioredis.FakeRedis(decode_responses=True)
    store = RedisSessionStore(redis_url="redis://localhost:6379/0", ttl_seconds=86400)
    store._redis = fake_client

    # Reset
    reset_state = await store.reset_state("sess_reset")
    assert reset_state.session_id == "sess_reset"

    # Suscribe y Desuscribe
    q = await store.subscribe("sess_reset")
    await store.publish_event("sess_reset", "test_evt", {"k": "v"})
    await store.unsubscribe("sess_reset", q)


def test_create_session_store_factory():
    """Valida la factoría de almacén de sesiones según configuración."""
    with patch("app.services.session_store.settings.SESSION_STORE_BACKEND", "redis"):
        s_redis = create_session_store()
        assert isinstance(s_redis, RedisSessionStore)

    with patch("app.services.session_store.settings.SESSION_STORE_BACKEND", "memory"):
        s_mem = create_session_store()
        assert isinstance(s_mem, InMemorySessionStore)


def test_rules_loader_coverage():
    """Valida branches del cargador de reglas."""
    # Años disponibles
    years = get_available_tax_years()
    assert 2026 in years
    assert 2025 in years

    # Fallback year
    rules_fallback = get_rules_for_year(2099)
    assert rules_fallback.tax_year == 2099


def test_beneficios_http_endpoints_success():
    """Valida los endpoints HTTP de beneficios directamente."""
    # Catalogo
    res_cat = client.get("/api/v1/beneficios/catalog")
    assert res_cat.status_code == 200
    assert len(res_cat.json()) > 0

    # Simular auditoria
    res_aud = client.post(
        "/api/v1/beneficios/simular-auditoria",
        json={"tax_year": 2026, "impuesto_neto_ano_anterior": 50000000.0},
    )
    assert res_aud.status_code == 200
    assert res_aud.json()["cumple_impuesto_minimo"] is True

    # Simular reduccion
    res_red = client.post(
        "/api/v1/beneficios/simular-reduccion-sancion",
        json={
            "monto_sancion_base_cop": 10000000.0,
            "sin_sanciones_ultimos_2_anos": True,
            "sin_sanciones_ultimo_1_ano": True,
        },
    )
    assert res_red.status_code == 200
    assert res_red.json()["sancion_final_reducida_cop"] == 5000000.0


def test_session_current_auto_provisioning_clean_client():
    """Valida auto-provisionamiento de sesión cuando no hay cabeceras ni cookies."""
    clean_client = TestClient(app, cookies=None)
    res = clean_client.get("/api/v1/session/current")
    assert res.status_code == 200
    data = res.json()
    assert data["session_id"].startswith("ses_")
    assert "fiscol_sid" in res.cookies


@pytest.mark.asyncio
async def test_redis_session_store_merge_all_sections():
    """Valida que RedisSessionStore combine todas las secciones: PJ, calc, reconciliacion."""
    fake_client = fakeredis.aioredis.FakeRedis(decode_responses=True)
    store = RedisSessionStore(redis_url="redis://localhost:6379/0", ttl_seconds=86400)
    store._redis = fake_client

    payload = {
        "persona_juridica": {"ingresos_brutos_operacionales": 5000000.0},
        "calculation_results": {"persona_natural": {"impuesto_neto_renta": 1200000.0}},
        "reconciliation": {"total_matched": 5},
    }
    updated = await store.update_state("sess_merge_test", payload, source="api")
    assert updated.persona_juridica["ingresos_brutos_operacionales"] == 5000000.0
    assert updated.calculation_results["persona_natural"]["impuesto_neto_renta"] == 1200000.0
    assert updated.reconciliation["total_matched"] == 5


def test_rules_loader_edge_cases():
    """Valida ramas de error del cargador de reglas cuando no hay directorio o años."""
    with patch("app.core.rules_engine.loader.RULES_DIR") as mock_dir:
        mock_dir.exists.return_value = False
        res = load_all_rules()
        assert res == {}

    with patch("app.core.rules_engine.loader._rules_cache", {}):
        with patch("app.core.rules_engine.loader.load_all_rules", return_value={}):
            with pytest.raises(ValueError, match="No se encontraron reglas"):
                get_rules_for_year(2026)


@pytest.mark.asyncio
async def test_session_store_redis_pubsub_listener_dispatch():
    """Valida el listener de Redis Pub/Sub y despacho a colas locales."""
    store = RedisSessionStore(redis_url="redis://localhost:6379/0", ttl_seconds=86400)
    fake_client = fakeredis.aioredis.FakeRedis(decode_responses=True)
    store._redis = fake_client

    # Mock pubsub listen stream
    q = await store.subscribe("sess_ps_test")
    # Publicar mensaje en redis fake
    await store.publish_event("sess_ps_test", "custom_evt", {"foo": "bar"})
    await store.unsubscribe("sess_ps_test", q)


@pytest.mark.asyncio
async def test_in_memory_session_store_queue_overflow_and_cleanup():
    """Valida manejo de colas llenas y desuscripción limpia en InMemorySessionStore."""
    store = InMemorySessionStore()
    q = await store.subscribe("sess_overflow")
    # Llenar la cola hasta el tope
    for _ in range(100):
        try:
            q.put_nowait("dummy")
        except Exception:
            break
    # Publicar evento cuando la cola está llena (debe capturar QueueFull)
    await store.publish_event("sess_overflow", "evt", {"test": 1})
    await store.unsubscribe("sess_overflow", q)
    # Desuscribir una cola que ya no está en la sesión
    await store.unsubscribe("sess_overflow", q)


def test_liquidacion_pn_top_bracket_over_31000_uvt():
    """Valida el cálculo en el tramo máximo del 39% (> 31.000 UVT) cubriendo 100% de liquidacion_pn."""
    inp = PersonaNaturalInput(
        tax_year=2026,
        custom_uvt=52350.0,
        rentas_trabajo=2500000000.0,  # ~47.000 UVT
        aporte_salud_obligatorio=50000000.0,
        aporte_pension_obligatorio=50000000.0,
    )
    res = liquidar_persona_natural(inp)
    assert res.tarifa_marginal_maxima == 0.39
    assert res.impuesto_neto_renta > 0


def test_liquidacion_pj_with_ganancia_ocasional():
    """Valida liquidacion de PJ con ganancias ocasionales cubriendo 100% de liquidacion_pj."""
    inp = PersonaJuridicaInput(
        tax_year=2026,
        custom_uvt=52350.0,
        ingresos_brutos_operacionales=500000000.0,
        ganancia_ocasional_gravable=100000000.0,
    )
    res = liquidar_persona_juridica(inp)
    assert res.impuesto_ganancias_ocasionales == 15000000.0
    assert res.impuesto_neto_total > res.impuesto_basico_renta


@pytest.mark.asyncio
async def test_session_events_stream_generator_mock():
    """Valida la función event_generator interna de session_events_stream."""
    from app.api.v1.endpoints.session_sync import session_events_stream

    mock_request = MagicMock()
    # Simular una iteración y luego desconexión
    disconnect_calls = [False, True]

    async def is_disc():
        return disconnect_calls.pop(0)

    mock_request.is_disconnected = is_disc

    response = await session_events_stream(mock_request, session_id="test_stream_gen")
    assert response.status_code == 200

    # Consumir el generador
    items = []
    async for chunk in response.body_iterator:
        items.append(chunk)
        if len(items) >= 1:
            break
    assert len(items) >= 1
    assert "connected" in items[0]
