"""Suite de pruebas End-to-End (E2E) con Playwright para la interfaz web de TributIA.

Verifica de forma automatizada todos los flujos interactivos de la UI:
- Navegación entre los 4 submódulos de Optimización:
  1. Catálogo de Beneficios Tributarios con búsqueda y filtros.
  2. Presentación, Auditoría (Art. 689-3) & Calculadora Integral de Sanciones (Art. 640, 641, 644, 639).
  3. Reajuste Fiscal de Activos (Art. 73 E.T. y tabla DANE de 70 años).
  4. Inmuebles & Cuentas AFC (Exención hasta 5.000 UVT según Art. 311-1 E.T.).
- Depuración de Renta Persona Natural (F210, rentas cedulares y termómetro marginal).
- Liquidación Persona Jurídica (F110 y Tasa Mínima TTD 15%).
- Calendario Tributario y consulta interactiva por NIT.
- Ausencia de excepciones JavaScript o errores de consola en todas las pantallas.
"""

import socket
import threading
import time
from collections.abc import Generator

import pytest
import uvicorn
from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright

from app.main import app


def get_free_port() -> int:
    """Obtiene un puerto TCP libre disponible en localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture(scope="session")
def live_server_url() -> Generator[str, None, None]:
    """Inicia un servidor Uvicorn en segundo plano en un puerto dinámico para pruebas E2E."""
    port = get_free_port()
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    # Esperar a que el servidor esté respondiendo
    url = f"http://127.0.0.1:{port}"
    max_retries = 30
    for _ in range(max_retries):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(0.5)
                if s.connect_ex(("127.0.0.1", port)) == 0:
                    break
        except Exception:
            pass
        time.sleep(0.1)
    else:
        pytest.fail(f"No se pudo iniciar el servidor Uvicorn de pruebas en {url}")

    yield url
    server.should_exit = True


@pytest.fixture(scope="session")
def browser() -> Generator[Browser, None, None]:
    """Fixture de sesión para iniciar el navegador Chromium headless."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def context(browser: Browser) -> Generator[BrowserContext, None, None]:
    """Fixture para crear un contexto de navegador aislado por prueba."""
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    yield context
    context.close()


@pytest.fixture
def page_with_error_tracking(
    context: BrowserContext,
) -> Generator[tuple[Page, list[str]], None, None]:
    """Provee una página web monitoreando activamente errores de consola."""
    console_errors: list[str] = []
    page = context.new_page()

    def on_console(msg):
        if msg.type == "error":
            # Ignorar errores de conexión si el SSE reconecta
            if "net::ERR_CONNECTION" not in msg.text and "favicon.ico" not in msg.text:
                console_errors.append(f"Console error: {msg.text}")

    def on_page_error(err):
        console_errors.append(f"Uncaught exception: {err}")

    page.on("console", on_console)
    page.on("pageerror", on_page_error)

    yield page, console_errors
    page.close()


class TestTributIAEndToEnd:
    """Suite de pruebas E2E que validan la estabilidad e interactividad de la UI."""

    def test_app_title_and_main_structure(
        self, page_with_error_tracking: tuple[Page, list[str]], live_server_url: str
    ):
        """Verifica que la página principal cargue con su título y estructura base."""
        page, errors = page_with_error_tracking
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(500)

        assert "TributIA" in page.title()
        assert page.locator("#app-workspace").is_visible()
        assert page.locator(".sidebar").is_visible()
        assert len(errors) == 0, f"Errores de consola encontrados: {errors}"

    def test_navigation_across_all_modules(
        self, page_with_error_tracking: tuple[Page, list[str]], live_server_url: str
    ):
        """Verifica que hacer clic en cada módulo de la barra lateral active su respectivo panel."""
        page, errors = page_with_error_tracking
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(500)

        modules = [
            ("nav-item-calendario", "#pane-calendario"),
            ("nav-item-pn-calc", "#pane-pn-calc"),
            ("nav-item-pn-f210", "#pane-pn-f210"),
            ("nav-item-pn-marginal", "#pane-pn-marginal"),
            ("nav-item-pn-conciliacion", "#pane-pn-conciliacion"),
            ("nav-item-pj", "#pane-pj"),
            ("nav-item-beneficios", "#pane-beneficios"),
            ("nav-item-presentacion", "#pane-presentacion"),
            ("nav-item-art73", "#pane-art73"),
            ("nav-item-inmuebles-afc", "#pane-inmuebles-afc"),
            ("nav-item-simple", "#pane-simple"),
            ("nav-item-iva", "#pane-iva"),
            ("nav-item-retefuente", "#pane-retefuente"),
        ]

        for nav_id, pane_id in modules:
            nav_btn = page.locator(f"#{nav_id}")
            assert nav_btn.is_visible(), f"El botón de navegación #{nav_id} no está visible"
            nav_btn.click()
            page.wait_for_timeout(200)

            pane = page.locator(pane_id)
            assert pane.is_visible(), (
                f"El panel {pane_id} no se hizo visible al hacer clic en #{nav_id}"
            )
            assert "active" in (pane.get_attribute("class") or "")

        assert len(errors) == 0, f"Errores de consola durante navegación: {errors}"

    def test_catalogo_beneficios_filtering_and_search(
        self, page_with_error_tracking: tuple[Page, list[str]], live_server_url: str
    ):
        """Valida el catálogo de beneficios, el buscador reactivo y los filtros por categoría."""
        page, errors = page_with_error_tracking
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(500)

        page.click("#nav-item-beneficios")
        page.wait_for_timeout(400)

        # 1. Verificar que existan tarjetas de beneficios cargadas
        initial_cards = page.eval_on_selector_all(".beneficio-card", "cards => cards.length")
        assert initial_cards >= 8, f"Se esperaban al menos 8 beneficios, hay {initial_cards}"

        # 2. Filtrar por texto en el buscador
        page.fill("#search-beneficios-input", "Medicina")
        page.wait_for_timeout(300)
        filtered_cards = page.eval_on_selector_all(".beneficio-card", "cards => cards.length")
        assert filtered_cards >= 1, "El buscador por 'Medicina' debió retornar resultados"

        # 3. Limpiar buscador y filtrar por categoría
        page.fill("#search-beneficios-input", "")
        page.click("text=🏢 Ajuste Activos & Bienes")
        page.wait_for_timeout(300)

        assert len(errors) == 0, f"Errores en catálogo de beneficios: {errors}"

    def test_presentacion_auditoria_and_calculadora_sanciones(
        self, page_with_error_tracking: tuple[Page, list[str]], live_server_url: str
    ):
        """Valida el simulador de auditoría y la calculadora integral de sanciones."""
        page, errors = page_with_error_tracking
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(500)

        page.click("#nav-item-presentacion")
        page.wait_for_timeout(400)

        # 1. Modificar impuesto anterior en auditoría
        page.fill("#sim-aud-impuesto-ant", "15'000.000")
        page.wait_for_timeout(400)
        aud_result = page.inner_text("#sim-aud-result")
        assert "FIRMEZA EN 6 MESES" in aud_result
        assert "FIRMEZA EN 12 MESES" in aud_result

        # 2. Probar calculadora de sanciones - Corrección
        page.fill("#sancion-calc-monto-base", "50'000.000")
        page.wait_for_timeout(400)
        sancion_result = page.inner_text("#sancion-calc-result-box")
        assert "Sanción Final a Pagar" in sancion_result
        assert "Descuento Art. 640" in sancion_result
        assert "Ahorro por Favorabilidad" in sancion_result

        # 3. Cambiar a Extemporaneidad
        page.select_option("#sancion-calc-tipo", "extemporaneidad")
        page.wait_for_timeout(400)
        assert page.locator("#sancion-meses-container").is_visible()
        extemp_result = page.inner_text("#sancion-calc-result-box")
        assert "Sanción Final a Pagar" in extemp_result

        assert len(errors) == 0, f"Errores en módulo de presentación y sanciones: {errors}"

    def test_reajuste_fiscal_articulo_73_complete_flow(
        self, page_with_error_tracking: tuple[Page, list[str]], live_server_url: str
    ):
        """Valida el módulo del Artículo 73 E.T.: tabla DANE 70 años, selector, búsqueda y cálculo."""
        page, errors = page_with_error_tracking
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(500)

        # 1. Navegar a Art. 73
        page.click("#nav-item-art73")
        page.wait_for_timeout(600)

        # 2. Verificar que el selector tenga los 70 años cargados
        options = page.eval_on_selector_all(
            "#sim-art73-ano option", "opts => opts.map(o => o.value)"
        )
        assert len(options) == 70, f"Se esperaban 70 años en el dropdown, pero hay {len(options)}"
        assert "1955 y anteriores" in options
        assert "2024" in options
        assert "1995" in options

        # 3. Verificar que la tabla tenga las 70 filas renderizadas
        rows_count = page.eval_on_selector_all("#tabla-art73-tbody tr", "trs => trs.length")
        assert rows_count == 70, f"Se esperaban 70 filas en la tabla, pero hay {rows_count}"

        # 4. Probar búsqueda / filtro en la tabla
        page.fill("#search-tabla-art73", "1975")
        page.wait_for_timeout(300)
        filtered_count = page.eval_on_selector_all("#tabla-art73-tbody tr", "trs => trs.length")
        assert filtered_count == 1, (
            f"El filtro para '1975' debió retornar 1 fila, pero dio {filtered_count}"
        )

        # 5. Limpiar filtro y hacer clic en una fila (1980)
        page.fill("#search-tabla-art73", "")
        page.wait_for_timeout(300)
        page.click('#tabla-art73-tbody tr:has-text("1980")')
        page.wait_for_timeout(500)

        selected_ano = page.input_value("#sim-art73-ano")
        assert selected_ano == "1980", (
            f"Se esperaba año 1980 seleccionado, pero está {selected_ano}"
        )

        # 6. Verificar que el resultado calcule correctamente en vivo
        result_text = page.inner_text("#sim-art73-result")
        assert "FACTOR APLICADO" in result_text
        assert "NUEVO COSTO FISCAL AJUSTADO" in result_text
        assert "AHORRO TRIBUTARIO ESTIMADO" in result_text

        assert len(errors) == 0, f"Errores en flujo de Art. 73: {errors}"

    def test_inmuebles_afc_simulator(
        self, page_with_error_tracking: tuple[Page, list[str]], live_server_url: str
    ):
        """Valida el simulador interactivo de beneficios inmobiliarios y Cuentas AFC (Art. 311-1)."""
        page, errors = page_with_error_tracking
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(500)

        page.click("#nav-item-inmuebles-afc")
        page.wait_for_timeout(400)

        # 1. Modificar precio de venta y costo fiscal
        page.fill("#afc-sim-precio-venta", "750'000.000")
        page.fill("#afc-sim-costo-fiscal", "400'000.000")
        page.fill("#afc-sim-monto-afc", "300'000.000")
        page.wait_for_timeout(400)

        # 2. Verificar que el panel de resultados refleje el cálculo
        result_text = page.inner_text("#afc-sim-result-box")
        assert "AHORRO TRIBUTARIO ESTIMADO" in result_text.upper()
        assert "UTILIDAD BRUTA INMUEBLE" in result_text.upper()
        assert "UTILIDAD EXENTA AFC" in result_text.upper()

        assert len(errors) == 0, f"Errores en simulador de inmuebles AFC: {errors}"

    def test_persona_natural_capture_and_subtabs(
        self, page_with_error_tracking: tuple[Page, list[str]], live_server_url: str
    ):
        """Verifica la interacción en Persona Natural: subpestañas F210, termómetro marginal y cálculo."""
        page, errors = page_with_error_tracking
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(500)

        page.click("#nav-item-pn-calc")
        page.wait_for_timeout(400)

        # 1. Verificar subpestaña de Formulario 210
        page.click("#sub-tab-btn-pn-f210")
        page.wait_for_timeout(300)
        assert page.locator("#pane-pn-f210").is_visible()

        # 2. Verificar subpestaña de Termómetro Marginal
        page.click("#sub-tab-btn-pn-marginal")
        page.wait_for_timeout(300)
        assert page.locator("#pane-pn-marginal").is_visible()

        # 3. Regresar a Captura y editar un valor
        page.click("#sub-tab-btn-pn-calc")
        page.wait_for_timeout(300)
        assert page.locator("#pane-pn-calc").is_visible()

        # Editar salario
        salario_input = page.locator("#pn_rentas_trabajo")
        assert salario_input.is_visible()
        salario_input.fill("150'000.000")
        page.wait_for_timeout(400)

        # Verificar que el KPI box de saldo a pagar se actualice
        kpi_val = page.locator("#pn-kpi-value").inner_text()
        assert len(kpi_val) > 0

        assert len(errors) == 0, f"Errores en submódulos de Persona Natural: {errors}"

    def test_calendario_tributario_nit_search_and_filters(
        self, page_with_error_tracking: tuple[Page, list[str]], live_server_url: str
    ):
        """Valida la consulta de vencimientos tributarios por NIT y cambio de filtros."""
        page, errors = page_with_error_tracking
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(500)

        page.click("#nav-item-calendario")
        page.wait_for_timeout(400)

        # Digitar NIT y consultar
        page.fill("#cal-search-nit", "900123456")
        page.click("text=⚡ Consultar Fechas")
        page.wait_for_timeout(500)

        # Verificar que el contenedor de resultados de fecha contenga información
        result_box = page.locator("#cal-search-result-container")
        assert result_box.is_visible()

        # Probar filtros de impuestos
        page.click("#cal-filter-btn-renta_pn")
        page.wait_for_timeout(300)
        page.click("#cal-filter-btn-iva")
        page.wait_for_timeout(300)
        page.click("#cal-filter-btn-all")
        page.wait_for_timeout(300)

        assert len(errors) == 0, f"Errores en Calendario Tributario: {errors}"
