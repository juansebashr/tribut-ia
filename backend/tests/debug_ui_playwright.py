import socket
import sys
import threading
import time
from pathlib import Path

import uvicorn
from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app


def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def run_debug():
    port = get_free_port()
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)
    t = threading.Thread(target=server.run, daemon=True)
    t.start()
    time.sleep(1)

    url = f"http://127.0.0.1:{port}"
    print(f"Server started at {url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1400, "height": 1000})

        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        page.goto(url, wait_until="networkidle")
        page.wait_for_timeout(1000)

        tabs = [
            ("beneficios", "#nav-item-beneficios", "#pane-beneficios"),
            ("presentacion", "#nav-item-presentacion", "#pane-presentacion"),
            ("art73", "#nav-item-art73", "#pane-art73"),
            ("inmuebles-afc", "#nav-item-inmuebles-afc", "#pane-inmuebles-afc"),
        ]

        for name, btn_sel, pane_sel in tabs:
            print(f"\n--- Checking tab {name} ({btn_sel}) ---")
            page.click(btn_sel)
            page.wait_for_timeout(800)

            # Check if active
            pane = page.locator(pane_sel)
            is_vis = pane.is_visible()
            print(f"Pane {pane_sel} visible: {is_vis}")

            if name == "inmuebles-afc":
                afc_res = page.locator("#afc-sim-result-box")
                print(f"AFC result box innerHTML: {afc_res.inner_html()}")
                print(f"AFC result box innerText: {afc_res.inner_text()}")

            if name == "presentacion":
                aud_res = page.locator("#sim-aud-result")
                print(f"Auditoria result box innerText: {aud_res.inner_text()}")
                sanc_res = page.locator("#sancion-calc-result-box")
                print(f"Sancion result box innerText: {sanc_res.inner_text()}")

            page.screenshot(
                path=f"/Users/juansebasher/.gemini/antigravity-cli/brain/9754ba10-c297-45c3-aac7-6e5e5be65aef/debug_tab_{name}.png"
            )

        browser.close()
    server.should_exit = True


if __name__ == "__main__":
    run_debug()
