import argparse
import os
import socket
import subprocess
import sys
import time


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


def kill_process_on_port(port: int):
    try:
        out = (
            subprocess.check_output(["lsof", "-ti", f":{port}"], stderr=subprocess.DEVNULL)
            .decode()
            .strip()
        )
        if out:
            pids = out.split()
            print(f"⚠️  Liberando puerto {port} ocupado por PIDs: {', '.join(pids)}...")
            for pid in pids:
                try:
                    os.kill(int(pid), 9)
                except Exception:
                    pass
            time.sleep(0.5)
    except Exception:
        pass


def main():
    parser = argparse.ArgumentParser(description="TributIA - Lanzador de la Aplicación")
    parser.add_argument(
        "--host", default="0.0.0.0", help="Dirección host de escucha (por defecto 0.0.0.0)"
    )
    parser.add_argument(
        "--port", type=int, default=8000, help="Puerto de escucha (por defecto 8000)"
    )
    parser.add_argument(
        "--reload", action="store_true", help="Habilitar recarga automática en caliente"
    )
    parser.add_argument(
        "--no-kill",
        action="store_true",
        help="No matar automáticamente procesos en el puerto si está ocupado",
    )
    args = parser.parse_args()

    project_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_root, "backend")

    root_venv_python = os.path.join(project_root, ".venv", "bin", "python")
    backend_venv_python = os.path.join(backend_dir, "venv", "bin", "python")

    if os.path.exists(root_venv_python):
        venv_python = root_venv_python
    elif os.path.exists(backend_venv_python):
        venv_python = backend_venv_python
    else:
        venv_python = sys.executable

    if is_port_in_use(args.port):
        if not args.no_kill:
            kill_process_on_port(args.port)
        else:
            print(
                f"❌ Error: El puerto {args.port} ya está en uso. Usa un puerto diferente con --port <numero>."
            )
            sys.exit(1)

    print("=" * 65)
    print("🇨🇴 TributIA - Motor Tributario Colombiano Actualizado 2026")
    print(f"🌐 Interfaz Web: http://localhost:{args.port}")
    print(f"📖 Swagger API:  http://localhost:{args.port}/docs")
    print("=" * 65)

    cmd = [
        venv_python,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        args.host,
        "--port",
        str(args.port),
    ]
    if args.reload:
        cmd.append("--reload")

    env = os.environ.copy()
    env["PYTHONPATH"] = backend_dir

    try:
        subprocess.run(cmd, cwd=backend_dir, env=env)
    except KeyboardInterrupt:
        print("\n🛑 Servidor TributIA detenido correctamente.")


if __name__ == "__main__":
    main()
