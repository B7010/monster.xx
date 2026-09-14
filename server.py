import http.server
import socketserver
import os
import sys
import json
import socket
import urllib.parse
from socketserver import ThreadingMixIn

# Import AI Timetable Engine
try:
    from scheduler import TimetableScheduler, get_sample_scad_schedule
    from renderer import TimetableRenderer
    from html_exporter import HTMLExporter
except ImportError as e:
    print(f"Warning: Timetable engine module import error: {e}")

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
SAMPLE_DATA_FILE = os.path.join(DIRECTORY, "sample_data.json")
OUTPUT_IMAGE = os.path.join(DIRECTORY, "timetable.png")
OUTPUT_HTML = os.path.join(DIRECTORY, "timetable.html")

CURRENT_CONFIG = None
CURRENT_GRID = None


def get_local_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        try:
            ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def load_initial_state():
    global CURRENT_CONFIG, CURRENT_GRID
    if os.path.exists(SAMPLE_DATA_FILE):
        try:
            with open(SAMPLE_DATA_FILE, "r", encoding="utf-8") as f:
                CURRENT_CONFIG = json.load(f)
        except Exception as e:
            print(f"Error reading sample_data.json: {e}")

    try:
        CURRENT_GRID = get_sample_scad_schedule()
        if not os.path.exists(OUTPUT_IMAGE) and CURRENT_CONFIG and CURRENT_GRID:
            renderer = TimetableRenderer(output_path=OUTPUT_IMAGE)
            renderer.render(CURRENT_CONFIG, CURRENT_GRID)
        if not os.path.exists(OUTPUT_HTML) and CURRENT_CONFIG and CURRENT_GRID:
            HTMLExporter.export(CURRENT_CONFIG, CURRENT_GRID, OUTPUT_HTML)
    except Exception as e:
        print(f"Initial render warning: {e}")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        sys.stdout.write(f"[{self.log_date_time_string()}] {format % args}\n")
        sys.stdout.flush()

    def send_json(self, data: dict, status: int = 200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_HEAD(self):
        super().do_HEAD()

    def do_GET(self):
        global CURRENT_CONFIG, CURRENT_GRID
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == "/api/config":
            if CURRENT_CONFIG is None:
                load_initial_state()
            self.send_json({
                "config": CURRENT_CONFIG,
                "has_grid": CURRENT_GRID is not None,
                "local_ip": get_local_ip()
            })
            return

        elif path == "/api/sample":
            if CURRENT_CONFIG is None:
                load_initial_state()
            self.send_json({
                "config": CURRENT_CONFIG,
                "sample_grid": get_sample_scad_schedule()
            })
            return

        elif path == "/api/image":
            if os.path.exists(OUTPUT_IMAGE):
                with open(OUTPUT_IMAGE, "rb") as f:
                    img_bytes = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "image/png")
                self.send_header("Content-Length", str(len(img_bytes)))
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Disposition", 'inline; filename="timetable.png"')
                self.end_headers()
                self.wfile.write(img_bytes)
            else:
                self.send_error(404, "No timetable document image generated yet.")
            return

        elif path in ("/api/html", "/timetable.html"):
            if os.path.exists(OUTPUT_HTML):
                with open(OUTPUT_HTML, "rb") as f:
                    html_bytes = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(html_bytes)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                self.end_headers()
                self.wfile.write(html_bytes)
            else:
                self.send_error(404, "Timetable HTML not generated yet.")
            return

        elif path == "/api/network":
            self.send_json({
                "ip": get_local_ip(),
                "port": self.server.server_address[1]
            })
            return

        return super().do_GET()

    def do_POST(self):
        global CURRENT_CONFIG, CURRENT_GRID
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len)

        try:
            payload = json.loads(post_body.decode("utf-8")) if post_body else {}
        except Exception as e:
            self.send_json({"error": f"Invalid JSON: {str(e)}"}, status=400)
            return

        if path == "/api/generate":
            try:
                config = payload.get("config") or CURRENT_CONFIG
                if not config or not config.get("subjects"):
                    self.send_json({"error": "No subjects provided to schedule."}, status=400)
                    return

                CURRENT_CONFIG = config
                scheduler = TimetableScheduler(config)
                grid = scheduler.schedule()
                CURRENT_GRID = grid

                renderer = TimetableRenderer(output_path=OUTPUT_IMAGE)
                renderer.render(config, grid)
                HTMLExporter.export(config, grid, OUTPUT_HTML)

                self.send_json({
                    "success": True,
                    "grid": grid,
                    "image_url": f"/api/image?v={os.path.getmtime(OUTPUT_IMAGE)}",
                    "html_url": "/api/html"
                })
            except Exception as e:
                self.send_json({"error": f"Scheduling error: {str(e)}"}, status=500)
            return

        elif path == "/api/rerender":
            try:
                config = payload.get("config") or CURRENT_CONFIG
                grid = payload.get("grid") or CURRENT_GRID

                if not config or not grid:
                    self.send_json({"error": "Config and grid are required."}, status=400)
                    return

                CURRENT_CONFIG = config
                CURRENT_GRID = grid

                renderer = TimetableRenderer(output_path=OUTPUT_IMAGE)
                renderer.render(config, grid)
                HTMLExporter.export(config, grid, OUTPUT_HTML)

                self.send_json({
                    "success": True,
                    "grid": grid,
                    "image_url": f"/api/image?v={os.path.getmtime(OUTPUT_IMAGE)}",
                    "html_url": "/api/html"
                })
            except Exception as e:
                self.send_json({"error": f"Render error: {str(e)}"}, status=500)
            return

        elif path == "/api/load_sample_replica":
            try:
                load_initial_state()
                grid = get_sample_scad_schedule()
                CURRENT_GRID = grid

                renderer = TimetableRenderer(output_path=OUTPUT_IMAGE)
                renderer.render(CURRENT_CONFIG, grid)
                HTMLExporter.export(CURRENT_CONFIG, grid, OUTPUT_HTML)

                self.send_json({
                    "success": True,
                    "config": CURRENT_CONFIG,
                    "grid": grid,
                    "image_url": f"/api/image?v={os.path.getmtime(OUTPUT_IMAGE)}",
                    "html_url": "/api/html"
                })
            except Exception as e:
                self.send_json({"error": f"Sample load error: {str(e)}"}, status=500)
            return

        self.send_error(404, "Endpoint not found.")


class ThreadedTCPServer(ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True


def run():
    load_initial_state()
    port = PORT
    for attempt in range(5):
        try:
            with ThreadedTCPServer(("", port), Handler) as httpd:
                local_ip = get_local_ip()
                print("\n=======================================================")
                print(f"[LIVE] FOLIO Campus Timetable & Live Monitoring Portal")
                print(f"       With Integrated AI Timetable Agent & Document Studio")
                print(f"Local URL:        http://localhost:{port}")
                print(f"Mobile / Wi-Fi:   http://{local_ip}:{port}")
                print(f"Dedicated Studio: http://localhost:{port}/ai_timetable_studio.html")
                print("=======================================================\n")
                httpd.serve_forever()
        except OSError:
            print(f"Port {port} is in use, trying port {port + 1}...")
            port += 1


if __name__ == "__main__":
    run()
