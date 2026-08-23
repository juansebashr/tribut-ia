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
        "--port", type=int, default=8000, help="Puerto del backend FastAPI (por defecto 8000)"
    )
    parser.add_argument(
        "--frontend-port",
        type=int,
        default=5173,
        help="Puerto del frontend React/Vite (por defecto 5173)",
    )
    parser.add_argument(
        "--reload", action="store_true", help="Habilitar recarga automática en caliente"
    )
    parser.add_argument(
        "--no-kill",
        action="store_true",
        help="No matar automáticamente procesos en el puerto si está ocupado",
    )
    parser.add_argument(
        "--no-frontend",
        action="store_true",
        help="Ejecutar únicamente el backend FastAPI sin iniciar el frontend React",
    )
    args = parser.parse_args()

    project_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_root, "backend")
    frontend_dir = os.path.join(project_root, "frontend")

    root_venv_python = os.path.join(project_root, ".venv", "bin", "python")
    backend_venv_python = os.path.join(backend_dir, "venv", "bin", "python")

    if os.path.exists(root_venv_python):
        venv_python = root_venv_python
    elif os.path.exists(backend_venv_python):
        venv_python = backend_venv_python
    else:
        venv_python = sys.executable

    # Liberar puertos
    if not args.no_kill:
        if is_port_in_use(args.port):
            kill_process_on_port(args.port)
        if not args.no_frontend and is_port_in_use(args.frontend_port):
            kill_process_on_port(args.frontend_port)

    frontend_proc: subprocess.Popen | None = None

    # Iniciar frontend React si existe
    if (
        not args.no_frontend
        and os.path.exists(frontend_dir)
        and os.path.exists(os.path.join(frontend_dir, "package.json"))
    ):
        try:
            print("🚀 Iniciando servidor de desarrollo Frontend (React 18 + Vite)...")
            frontend_proc = subprocess.Popen(
                ["npm", "run", "dev", "--", "--port", str(args.frontend_port)],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )
        except Exception as e:
            print(
                f"⚠️  No se pudo iniciar frontend con npm ({e}). Se servirá interfaz desde backend."
            )

    print("=" * 65)
    print("🇨🇴 TributIA - Motor Tributario Colombiano Actualizado 2026")
    if frontend_proc:
        print(f"⚛️  Frontend React SPA:  http://localhost:{args.frontend_port}")
    print(f"🌐 Backend Web / API:    http://localhost:{args.port}")
    print(f"📖 Swagger API Docs:     http://localhost:{args.port}/docs")
    print("=" * 65)

    backend_cmd = [
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
        backend_cmd.append("--reload")

    env = os.environ.copy()
    env["PYTHONPATH"] = backend_dir

    backend_proc: subprocess.Popen | None = None
    try:
        backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir, env=env)
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\n🛑 Deteniendo servidores de TributIA...")
    finally:
        if backend_proc and backend_proc.poll() is None:
            backend_proc.terminate()
            try:
                backend_proc.wait(timeout=2)
            except subprocess.TimeoutExpired:
                backend_proc.kill()
        if frontend_proc and frontend_proc.poll() is None:
            frontend_proc.terminate()
            try:
                frontend_proc.wait(timeout=2)
            except subprocess.TimeoutExpired:
                frontend_proc.kill()
        print("✅ Servidores detenidos correctamente.")


if __name__ == "__main__":
    main()
