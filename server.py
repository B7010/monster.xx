import http.server
import socketserver
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    port = PORT
    for attempt in range(5):
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                print(f"\n=======================================================")
                print(f"🚀 MyMonitorXX College Timetable & Monitoring App is LIVE!")
                print(f"👉 Local URL: http://localhost:{port}")
                print(f"=======================================================\n")
                httpd.serve_forever()
        except OSError:
            print(f"Port {port} is in use, trying port {port + 1}...")
            port += 1

if __name__ == "__main__":
    run()
