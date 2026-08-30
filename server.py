#!/usr/bin/env python3
"""
Coffee & Water Tracker - Backend Server
Serves static frontend files and manages server-side persistent storage for coffee and water records.
"""

import sys
import os
import json
import mimetypes
import threading
from urllib.parse import urlparse, unquote
from http.server import HTTPServer, BaseHTTPRequestHandler

# Base configuration
DEFAULT_PORT = int(os.environ.get("PORT", 8088))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DATA_FILE = os.path.join(DATA_DIR, "data.json")
BACKUP_FILE = os.path.join(DATA_DIR, "data.json.bak")

# Thread lock for atomic file I/O operations
data_lock = threading.Lock()

def ensure_data_file():
    """Ensure data directory and data.json file exist with valid structure."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    
    if not os.path.exists(DATA_FILE):
        initial_data = {"coffees": [], "waters": []}
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_data, f, indent=2, ensure_ascii=False)
        print(f"[Server] Criado ficheiro de base de dados: {DATA_FILE}")

def read_db():
    """Thread-safe read of database."""
    with data_lock:
        ensure_data_file()
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if not isinstance(data, dict):
                    data = {"coffees": [], "waters": []}
                if "coffees" not in data or not isinstance(data["coffees"], list):
                    data["coffees"] = []
                if "waters" not in data or not isinstance(data["waters"], list):
                    data["waters"] = []
                return data
        except Exception as e:
            print(f"[Server Error] Erro ao ler base de dados: {e}")
            # Try to restore from backup if main file is corrupted
            if os.path.exists(BACKUP_FILE):
                try:
                    with open(BACKUP_FILE, "r", encoding="utf-8") as f:
                        return json.load(f)
                except Exception:
                    pass
            return {"coffees": [], "waters": []}

def write_db(data):
    """Thread-safe atomic write to database with backup."""
    with data_lock:
        ensure_data_file()
        try:
            # First backup existing data
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, "r", encoding="utf-8") as src, open(BACKUP_FILE, "w", encoding="utf-8") as dst:
                        dst.write(src.read())
                except Exception as bkp_err:
                    print(f"[Server Warning] Backup falhou: {bkp_err}")

            # Atomic write via temp file
            temp_file = DATA_FILE + ".tmp"
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.flush()
                os.fsync(f.fileno())

            os.replace(temp_file, DATA_FILE)
            return True
        except Exception as e:
            print(f"[Server Error] Erro ao gravar base de dados: {e}")
            return False

class CoffeeTrackerHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler for Coffee & Water Tracker."""

    def send_json(self, data, status_code=200):
        """Helper to send JSON responses."""
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.end_headers()
        self.wfile.write(payload)

    def send_error_json(self, message, status_code=400):
        """Helper to send error JSON."""
        self.send_json({"error": True, "message": message}, status_code=status_code)

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def get_parsed_path(self):
        """Parse URL path."""
        parsed = urlparse(self.path)
        return unquote(parsed.path)

    def get_request_body_json(self):
        """Read and parse JSON from request body."""
        try:
            content_len = int(self.headers.get("Content-Length", 0))
            if content_len <= 0:
                return {}
            body = self.rfile.read(content_len).decode("utf-8")
            return json.loads(body)
        except Exception as e:
            print(f"[Server] Erro ao descodificar JSON do corpo do pedido: {e}")
            return None

    # ==================== HEAD HANDLER ====================
    def do_HEAD(self):
        """Handle HEAD requests (headers only, no body)."""
        path = self.get_parsed_path()
        if path in ("/api/status", "/api/health", "/api/data", "/api/coffees", "/api/waters", "/api/export"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            return
        
        # Static file head
        if path in ("/", ""):
            path = "/index.html"
        clean_path = os.path.normpath(path.lstrip("/"))
        file_path = os.path.join(BASE_DIR, clean_path)
        if os.path.isfile(file_path) and os.path.abspath(file_path).startswith(BASE_DIR):
            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                if file_path.endswith(".svg"):
                    content_type = "image/svg+xml"
                elif file_path.endswith(".ico"):
                    content_type = "image/x-icon"
                else:
                    content_type = "application/octet-stream"
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(os.path.getsize(file_path)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    # ==================== GET HANDLER ====================
    def do_GET(self):
        path = self.get_parsed_path()

        # API: Status / Health check
        if path in ("/api/status", "/api/health"):
            db = read_db()
            return self.send_json({
                "status": "online",
                "storage": "server",
                "counts": {
                    "coffees": len(db.get("coffees", [])),
                    "waters": len(db.get("waters", []))
                },
                "server_time": os.path.basename(DATA_FILE)
            })

        # API: Get all data
        if path == "/api/data":
            db = read_db()
            return self.send_json(db)

        # API: Get coffees only
        if path == "/api/coffees":
            db = read_db()
            return self.send_json(db.get("coffees", []))

        # API: Get waters only
        if path == "/api/waters":
            db = read_db()
            return self.send_json(db.get("waters", []))

        # API: Export data
        if path == "/api/export":
            db = read_db()
            return self.send_json(db)

        # Static file serving
        self.serve_static_file(path)

    # ==================== POST HANDLER ====================
    def do_POST(self):
        path = self.get_parsed_path()
        body = self.get_request_body_json()

        if body is None:
            return self.send_error_json("JSON inválido no corpo do pedido.", 400)

        # API: Add new Coffee
        if path == "/api/coffees":
            db = read_db()
            if not isinstance(body, dict):
                return self.send_error_json("Dados de café inválidos.", 400)
            
            # Ensure unique ID
            if not body.get("id"):
                import time
                body["id"] = f"c_{int(time.time() * 1000)}"
            
            # Insert at beginning
            db["coffees"].insert(0, body)
            write_db(db)
            return self.send_json({"success": True, "coffee": body}, status_code=201)

        # API: Add new Water
        if path == "/api/waters":
            db = read_db()
            if not isinstance(body, dict):
                return self.send_error_json("Dados de água inválidos.", 400)
            
            if not body.get("id"):
                import time
                body["id"] = f"w_{int(time.time() * 1000)}"
            
            db["waters"].insert(0, body)
            write_db(db)
            return self.send_json({"success": True, "water": body}, status_code=201)

        # API: Bulk sync / Replace all data (e.g. initial migration or mass save)
        if path in ("/api/sync", "/api/data"):
            if not isinstance(body, dict):
                return self.send_error_json("Objeto de sincronização inválido.", 400)
            
            new_coffees = body.get("coffees")
            new_waters = body.get("waters")
            
            if new_coffees is None and new_waters is None:
                return self.send_error_json("O payload deve conter 'coffees' e/ou 'waters'.", 400)
            
            db = read_db()
            if new_coffees is not None and isinstance(new_coffees, list):
                db["coffees"] = new_coffees
            if new_waters is not None and isinstance(new_waters, list):
                db["waters"] = new_waters
                
            write_db(db)
            return self.send_json({
                "success": True,
                "message": "Dados guardados com sucesso no servidor.",
                "counts": {"coffees": len(db["coffees"]), "waters": len(db["waters"])}
            })

        # API: Import full JSON backup
        if path == "/api/import":
            if isinstance(body, dict) and ("coffees" in body or "waters" in body):
                db = {
                    "coffees": body.get("coffees", []),
                    "waters": body.get("waters", [])
                }
            elif isinstance(body, list):
                db = {"coffees": body, "waters": []}
            else:
                return self.send_error_json("Formato de importação não reconhecido.", 400)

            write_db(db)
            return self.send_json({
                "success": True,
                "message": "Importação concluída com sucesso no servidor.",
                "coffees": db["coffees"],
                "waters": db["waters"]
            })

        self.send_error_json("Rota POST não encontrada.", 404)

    # ==================== PUT HANDLER ====================
    def do_PUT(self):
        path = self.get_parsed_path()
        body = self.get_request_body_json()

        if body is None:
            return self.send_error_json("JSON inválido.", 400)

        # Update specific coffee: /api/coffees/<id>
        if path.startswith("/api/coffees/"):
            target_id = path[len("/api/coffees/"):]
            db = read_db()
            found = False
            for idx, c in enumerate(db["coffees"]):
                if str(c.get("id")) == target_id:
                    # Update fields
                    db["coffees"][idx] = {**c, **body, "id": target_id}
                    found = True
                    break
            
            if found:
                write_db(db)
                return self.send_json({"success": True, "coffee": db["coffees"][idx]})
            else:
                return self.send_error_json(f"Café com ID '{target_id}' não encontrado.", 404)

        # Update specific water: /api/waters/<id>
        if path.startswith("/api/waters/"):
            target_id = path[len("/api/waters/"):]
            db = read_db()
            found = False
            for idx, w in enumerate(db["waters"]):
                if str(w.get("id")) == target_id:
                    db["waters"][idx] = {**w, **body, "id": target_id}
                    found = True
                    break
            
            if found:
                write_db(db)
                return self.send_json({"success": True, "water": db["waters"][idx]})
            else:
                return self.send_error_json(f"Registo de água com ID '{target_id}' não encontrado.", 404)

        self.send_error_json("Rota PUT não encontrada.", 404)

    # ==================== DELETE HANDLER ====================
    def do_DELETE(self):
        path = self.get_parsed_path()

        # Delete specific coffee: /api/coffees/<id>
        if path.startswith("/api/coffees/"):
            target_id = path[len("/api/coffees/"):]
            db = read_db()
            initial_len = len(db["coffees"])
            db["coffees"] = [c for c in db["coffees"] if str(c.get("id")) != target_id]
            
            if len(db["coffees"]) < initial_len:
                write_db(db)
                return self.send_json({"success": True, "deletedId": target_id})
            else:
                return self.send_error_json(f"Café com ID '{target_id}' não encontrado.", 404)

        # Delete specific water: /api/waters/<id>
        if path.startswith("/api/waters/"):
            target_id = path[len("/api/waters/"):]
            db = read_db()
            initial_len = len(db["waters"])
            db["waters"] = [w for w in db["waters"] if str(w.get("id")) != target_id]
            
            if len(db["waters"]) < initial_len:
                write_db(db)
                return self.send_json({"success": True, "deletedId": target_id})
            else:
                return self.send_error_json(f"Registo de água com ID '{target_id}' não encontrado.", 404)

        self.send_error_json("Rota DELETE não encontrada.", 404)

    # ==================== STATIC FILE SERVING ====================
    def serve_static_file(self, req_path):
        """Serve static assets from BASE_DIR."""
        if req_path in ("/", ""):
            req_path = "/index.html"

        # Prevent directory traversal attacks
        clean_path = os.path.normpath(req_path.lstrip("/"))
        file_path = os.path.join(BASE_DIR, clean_path)

        if not os.path.abspath(file_path).startswith(BASE_DIR):
            self.send_error_json("Acesso negado.", 403)
            return

        if not os.path.isfile(file_path):
            # Fallback for root index or 404
            self.send_error_json("Ficheiro não encontrado.", 404)
            return

        # Determine MIME type
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            if file_path.endswith(".svg"):
                content_type = "image/svg+xml"
            elif file_path.endswith(".ico"):
                content_type = "image/x-icon"
            elif file_path.endswith(".json"):
                content_type = "application/json"
            else:
                content_type = "application/octet-stream"

        if content_type.startswith("text/") or content_type in ("application/javascript", "image/svg+xml", "application/json"):
            content_type += "; charset=utf-8"

        try:
            with open(file_path, "rb") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Access-Control-Allow-Origin", "*")
            # Cache static assets slightly except index.html
            if clean_path == "index.html":
                self.send_header("Cache-Control", "no-cache")
            else:
                self.send_header("Cache-Control", "public, max-age=3600")
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error_json(f"Erro ao ler ficheiro: {e}", 500)

    def log_message(self, format, *args):
        """Custom concise logging format."""
        sys.stdout.write(f"[{self.log_date_time_string()}] {args[0]} {args[1]} -> {args[2]}\n")
        sys.stdout.flush()

def run_server(port=DEFAULT_PORT):
    """Start the Coffee & Water Tracker HTTP server."""
    ensure_data_file()
    server_address = ("", port)
    httpd = HTTPServer(server_address, CoffeeTrackerHandler)
    print("=" * 65)
    print(f"☕💧 Servidor Coffee & Water Tracker ativo!")
    print(f"🌐 Aceder localmente: http://localhost:{port}")
    print(f"📁 Ficheiro de dados no servidor: {DATA_FILE}")
    print("=" * 65)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Server] A encerrar servidor...")
        httpd.server_close()
        print("[Server] Servidor encerrado.")

if __name__ == "__main__":
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"[Aviso] Porta inválida fornecida '{sys.argv[1]}'. A usar padrão {DEFAULT_PORT}.")
    run_server(port)
