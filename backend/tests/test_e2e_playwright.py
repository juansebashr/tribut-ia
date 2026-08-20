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
        assert len(errors) == 0, f"Errores en Calendario Tributario: {errors}"


class TestResponsiveAndMobileMode:
    """Suite de pruebas E2E especializadas para Modo Mobile y Responsive Design."""

    @pytest.mark.parametrize(
        ("width", "height", "device_name"),
        [
            (375, 667, "iPhone SE"),
            (390, 844, "iPhone 14"),
            (768, 1024, "iPad Mini / Tablet"),
        ],
    )
    def test_mobile_drawer_navigation_and_backdrop(
        self,
        page_with_error_tracking: tuple[Page, list[str]],
        live_server_url: str,
        width: int,
        height: int,
        device_name: str,
    ):
        """Verifica que el drawer móvil (off-canvas), botón hamburguesa y backdrop funcionen."""
        page, errors = page_with_error_tracking
        page.set_viewport_size({"width": width, "height": height})
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(600)

        # 1. El botón de menú hamburguesa debe ser visible en pantallas móviles
        mobile_btn = page.locator("#btn-mobile-menu")
        assert mobile_btn.is_visible(), f"Botón hamburguesa no visible en {device_name}"

        # 2. El sidebar debe estar inicialmente cerrado/fuera de pantalla
        sidebar = page.locator("#app-sidebar")
        assert "mobile-open" not in (sidebar.get_attribute("class") or "")

        # 3. Abrir el drawer con el botón hamburguesa
        mobile_btn.click()
        page.wait_for_timeout(300)
        assert "mobile-open" in (sidebar.get_attribute("class") or "")
        backdrop = page.locator("#sidebar-backdrop")
        assert "active" in (backdrop.get_attribute("class") or "")

        # 4. Cerrar tocando el backdrop
        backdrop.click(force=True)
        page.wait_for_timeout(300)
        assert "mobile-open" not in (sidebar.get_attribute("class") or "")

        # 5. Abrir nuevamente y navegar a otro módulo (debe autocerrar el drawer)
        mobile_btn.click()
        page.wait_for_timeout(300)
        page.click("#nav-item-presentacion")
        page.wait_for_timeout(400)
        assert "mobile-open" not in (sidebar.get_attribute("class") or "")
        assert page.locator("#pane-presentacion").is_visible()

        assert len(errors) == 0, f"Errores en drawer móvil en {device_name}: {errors}"

    @pytest.mark.parametrize(
        ("width", "height", "device_name"),
        [
            (375, 667, "iPhone SE"),
            (390, 844, "iPhone 14"),
            (412, 915, "Samsung Galaxy / Pixel"),
        ],
    )
    def test_mobile_viewport_no_horizontal_body_overflow(
        self,
        page_with_error_tracking: tuple[Page, list[str]],
        live_server_url: str,
        width: int,
        height: int,
        device_name: str,
    ):
        """Verifica que el body/viewport no sufra desbordamiento horizontal en móviles."""
        page, errors = page_with_error_tracking
        page.set_viewport_size({"width": width, "height": height})
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(600)

        modulos = [
            ("pn", "calc", "#pane-pn-calc"),
            ("pn", "marginal", "#pane-pn-marginal"),
            ("art73", "main", "#pane-art73"),
            ("presentacion", "main", "#pane-presentacion"),
            ("inmuebles-afc", "main", "#pane-inmuebles-afc"),
            ("calendario", "main", "#pane-calendario"),
        ]

        for mod, sub, selector in modulos:
            page.evaluate(f"navigateTo('{mod}', '{sub}')")
            page.wait_for_timeout(400)
            assert page.locator(selector).is_visible()

            # Verificar que el ancho de scroll del documento sea igual al ancho de la ventana
            scroll_width = page.evaluate("document.documentElement.scrollWidth")
            inner_width = page.evaluate("window.innerWidth")
            assert scroll_width <= inner_width + 1, (
                f"Desbordamiento horizontal detectado en {device_name} "
                f"en módulo {mod}/{sub}: scrollWidth={scroll_width}, innerWidth={inner_width}"
            )

        assert len(errors) == 0, f"Errores en verificación de overflow en {device_name}: {errors}"

    def test_table_horizontal_scroll_containers_on_mobile(
        self, page_with_error_tracking: tuple[Page, list[str]], live_server_url: str
    ):
        """Verifica que las tablas complejas tengan contenedor con scroll horizontal interno."""
        page, errors = page_with_error_tracking
        page.set_viewport_size({"width": 375, "height": 667})
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(600)

        # 1. Verificar Formulario 210
        page.evaluate("navigateTo('pn', 'f210')")
        page.wait_for_timeout(400)
        f210_container = page.locator("#pane-pn-f210 .table-responsive")
        assert f210_container.is_visible()
        # El contenedor interno debe tener scrollWidth > clientWidth permitiendo swipe
        has_horizontal_scroll = page.evaluate(
            "document.querySelector('#pane-pn-f210 .table-responsive').scrollWidth > "
            "document.querySelector('#pane-pn-f210 .table-responsive').clientWidth"
        )
        assert has_horizontal_scroll, "El Formulario 210 no tiene scroll horizontal en móvil"

        # 2. Verificar Tabla DANE Art. 73
        page.evaluate("navigateTo('art73', 'main')")
        page.wait_for_timeout(400)
        art73_container = page.locator("#pane-art73 .table-responsive")
        assert art73_container.is_visible()
        art73_scroll = page.evaluate(
            "document.querySelector('#pane-art73 .table-responsive').scrollWidth > "
            "document.querySelector('#pane-art73 .table-responsive').clientWidth"
        )
        assert art73_scroll, "La Tabla Art. 73 no tiene scroll horizontal en móvil"

        assert len(errors) == 0, f"Errores en prueba de tablas móviles: {errors}"

    @pytest.mark.parametrize(
        ("width", "height", "screen_desc"),
        [
            (1024, 768, "Laptop 1024x768"),
            (1200, 800, "Pantalla Reducida 1200x800"),
            (1366, 768, "HD Laptop 1366x768"),
        ],
    )
    def test_reduced_desktop_and_laptop_screen_adaptation(
        self,
        page_with_error_tracking: tuple[Page, list[str]],
        live_server_url: str,
        width: int,
        height: int,
        screen_desc: str,
    ):
        """Verifica la adaptación de layout en pantallas reducidas de escritorio y laptops."""
        page, errors = page_with_error_tracking
        page.set_viewport_size({"width": width, "height": height})
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(500)

        # 1. En escritorio/laptop el botón hamburguesa está oculto y el sidebar visible
        sidebar = page.locator("#app-sidebar")
        assert sidebar.is_visible()
        mobile_btn = page.locator("#btn-mobile-menu")
        assert not mobile_btn.is_visible(), f"El botón hamburguesa no debe verse en {screen_desc}"

        # 2. Probar colapsar y expandir el sidebar en pantalla reducida
        toggle_btn = page.locator("#btn-toggle-sidebar")
        assert toggle_btn.is_visible()
        toggle_btn.click()
        page.wait_for_timeout(300)
        assert "collapsed" in (sidebar.get_attribute("class") or "")
        toggle_btn.click()
        page.wait_for_timeout(300)
        assert "collapsed" not in (sidebar.get_attribute("class") or "")

        # 3. Comprobar ausencia de desbordamiento horizontal en pantalla reducida
        scroll_width = page.evaluate("document.documentElement.scrollWidth")
        assert scroll_width <= width + 1, (
            f"Desbordamiento horizontal en {screen_desc}: scrollWidth={scroll_width} vs innerWidth={width}"
        )

        assert len(errors) == 0, f"Errores en pantalla reducida {screen_desc}: {errors}"

    def test_mobile_casilla_popover_bottom_sheet(
        self, page_with_error_tracking: tuple[Page, list[str]], live_server_url: str
    ):
        """Verifica que los modales y popovers se adapten como bottom-sheets en mobile sin desbordar."""
        page, errors = page_with_error_tracking
        page.set_viewport_size({"width": 375, "height": 667})
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(600)

        # Navegar al F210 y abrir un popover de casilla
        page.evaluate("navigateTo('pn', 'f210')")
        page.wait_for_timeout(400)

        # Disparar popover de casilla
        page.evaluate("showCasillaPopover(29, document.body)")
        page.wait_for_timeout(300)

        popover = page.locator("#casilla-popover")
        assert popover.is_visible()

        # Validar que el popover esté dentro del ancho de la pantalla móvil (width <= 94vw)
        popover_rect = page.evaluate(
            "() => { const r = document.getElementById('casilla-popover').getBoundingClientRect(); "
            "return { left: r.left, right: r.right, width: r.width, bottom: r.bottom }; }"
        )
        assert popover_rect["left"] >= 0, "El popover se sale por la izquierda"
        assert popover_rect["right"] <= 376, "El popover se sale por la derecha"

        # Ocultar popover
        page.evaluate("hideCasillaPopover()")
        page.wait_for_timeout(200)
        assert not popover.is_visible()

        assert len(errors) == 0, f"Errores en popover móvil: {errors}"

    @pytest.mark.parametrize("screen_width", [1024, 1150, 1280])
    def test_reconciliation_spreadsheet_extended_sidebar_scrolling(
        self,
        page_with_error_tracking: tuple[Page, list[str]],
        live_server_url: str,
        screen_width: int,
    ):
        """Verifica que el spreadsheet de conciliación tenga scroll horizontal interno y no se corte con el menú extendido."""
        page, errors = page_with_error_tracking
        page.set_viewport_size({"width": screen_width, "height": 768})
        page.goto(live_server_url, wait_until="domcontentloaded")
        page.wait_for_timeout(500)

        # 1. Asegurar que el sidebar está extendido (no colapsado)
        sidebar = page.locator("#app-sidebar")
        assert "collapsed" not in (sidebar.get_attribute("class") or "")

        # 2. Navegar al módulo de Conciliación Exógena
        page.evaluate("navigateTo('pn', 'conciliacion')")
        page.wait_for_timeout(400)

        # 3. Cargar datos de demostración
        page.evaluate("loadReconciliationDemo()")
        page.wait_for_timeout(400)

        # 4. Validar que el contenedor del spreadsheet tenga scroll horizontal interno disponible
        container_scrolls = page.evaluate(
            "() => { const el = document.querySelector('.spreadsheet-table-container'); "
            "return el ? (el.scrollWidth > el.clientWidth) : false; }"
        )
        assert container_scrolls, (
            f"El contenedor del spreadsheet debe permitir scroll horizontal en ancho {screen_width}px con sidebar extendido"
        )

        # 5. Validar que el documento global NO sufra desbordamiento horizontal
        scroll_width = page.evaluate("document.documentElement.scrollWidth")
        assert scroll_width <= screen_width + 1, (
            f"Desbordamiento global detectado: scrollWidth={scroll_width} vs windowWidth={screen_width}"
        )

        assert len(errors) == 0, f"Errores en prueba de spreadsheet con sidebar extendido: {errors}"
