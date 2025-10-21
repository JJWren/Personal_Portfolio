#!/usr/bin/env python3
"""
Simple development server that loads .env variables and injects them into the client
Usage: python dev-server.py
Then open http://localhost:8000
"""

import http.server
import socketserver
import os
import re
from urllib.parse import urlparse

# Load .env file if it exists
def load_env():
    env_vars = {}
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value
    return env_vars

class DevHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # If requesting index.html, inject configuration
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            with open('index.html', 'r') as f:
                html = f.read()
            
            # Load environment variables
            env_vars = load_env()
            
            # Create config injection script
            config_script = f"""
    <script>
      window.EMAIL_CONFIG = {{
        EMAILJS_SERVICE_ID: '{env_vars.get("EMAILJS_SERVICE_ID", "")}',
        EMAILJS_TEMPLATE_ID: '{env_vars.get("EMAILJS_TEMPLATE_ID", "")}',
        EMAILJS_PUBLIC_KEY: '{env_vars.get("EMAILJS_PUBLIC_KEY", "")}'
      }};
    </script>"""
            
            # Insert before EmailJS script
            html = html.replace(
                '<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>',
                config_script + '\n    <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>'
            )
            
            self.wfile.write(html.encode())
        else:
            # Serve other files normally
            super().do_GET()

if __name__ == "__main__":
    PORT = 8000
    print(f"Starting development server on http://localhost:{PORT}")
    print("Make sure you have a .env file with your EmailJS credentials")
    
    with socketserver.TCPServer(("", PORT), DevHandler) as httpd:
        httpd.serve_forever()