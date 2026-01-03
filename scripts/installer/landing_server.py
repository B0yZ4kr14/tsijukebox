#!/usr/bin/env python3
# =============================================================================
# TSiJUKEBOX Enterprise - Landing Server
# HTTP server for visual installation wizard
# =============================================================================

import http.server
import socketserver
import json
import threading
import webbrowser
import os
from pathlib import Path
from typing import Optional, Dict, Any, Callable
from urllib.parse import parse_qs, urlparse
from dataclasses import dataclass, asdict
import socket

from .utils.logger import Logger

@dataclass
class InstallProgress:
    """Installation progress state."""
    step: str
    progress: int
    message: str
    status: str  # pending, running, success, error
    details: Optional[str] = None

class LandingServer:
    """
    HTTP server for TSiJUKEBOX installation wizard.
    Provides a web-based interface for configuration and monitoring.
    """
    
    def __init__(
        self, 
        port: int = 8080,
        logger: Optional[Logger] = None
    ):
        self.port = port
        self.logger = logger or Logger()
        self.server: Optional[socketserver.TCPServer] = None
        self.progress = InstallProgress(
            step="init",
            progress=0,
            message="Initializing...",
            status="pending"
        )
        self._callbacks: Dict[str, Callable] = {}
        self._config: Dict[str, Any] = {}
    
    def _find_free_port(self, start: int = 8080, end: int = 9000) -> int:
        """Find a free port in range."""
        for port in range(start, end):
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(('', port))
                    return port
            except OSError:
                continue
        return start
    
    def register_callback(self, name: str, callback: Callable) -> None:
        """Register a callback for handling requests."""
        self._callbacks[name] = callback
    
    def update_progress(
        self,
        step: str,
        progress: int,
        message: str,
        status: str = "running",
        details: Optional[str] = None
    ) -> None:
        """Update installation progress."""
        self.progress = InstallProgress(
            step=step,
            progress=progress,
            message=message,
            status=status,
            details=details
        )
    
    def _generate_html(self) -> str:
        """Generate the landing page HTML."""
        return """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TSiJUKEBOX Enterprise - Instalador</title>
    <style>
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --bg: #0f0f0f;
            --bg-card: #1a1a1a;
            --text: #ffffff;
            --text-muted: #a0a0a0;
            --border: #2a2a2a;
            --success: #10b981;
            --error: #ef4444;
            --warning: #f59e0b;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        
        .container {
            max-width: 800px;
            width: 100%;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .logo {
            width: 120px;
            height: 120px;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--primary), #8b5cf6);
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            margin-left: auto;
            margin-right: auto;
        }
        
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            color: var(--text-muted);
            font-size: 1.1rem;
        }
        
        .card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 1.5rem;
        }
        
        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-muted);
            font-size: 0.9rem;
        }
        
        input, select {
            width: 100%;
            padding: 0.75rem 1rem;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text);
            font-size: 1rem;
            transition: border-color 0.2s;
        }
        
        input:focus, select:focus {
            outline: none;
            border-color: var(--primary);
        }
        
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: var(--bg);
            border-radius: 8px;
            cursor: pointer;
        }
        
        .checkbox-group input[type="checkbox"] {
            width: auto;
            accent-color: var(--primary);
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
            font-weight: 500;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .btn-primary {
            background: var(--primary);
            color: white;
        }
        
        .btn-primary:hover {
            background: var(--primary-dark);
        }
        
        .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .btn-block {
            width: 100%;
        }
        
        .progress-container {
            display: none;
        }
        
        .progress-container.active {
            display: block;
        }
        
        .progress-bar {
            height: 8px;
            background: var(--border);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 1rem;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), #8b5cf6);
            border-radius: 4px;
            transition: width 0.3s;
        }
        
        .progress-text {
            text-align: center;
            color: var(--text-muted);
        }
        
        .log-container {
            background: var(--bg);
            border-radius: 8px;
            padding: 1rem;
            max-height: 200px;
            overflow-y: auto;
            font-family: 'Fira Code', monospace;
            font-size: 0.85rem;
            margin-top: 1rem;
        }
        
        .log-line {
            padding: 0.25rem 0;
            border-bottom: 1px solid var(--border);
        }
        
        .log-line:last-child {
            border-bottom: none;
        }
        
        .status-icon {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 0.5rem;
        }
        
        .status-success { background: var(--success); }
        .status-error { background: var(--error); }
        .status-pending { background: var(--warning); }
        .status-running { 
            background: var(--primary);
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .footer {
            text-align: center;
            color: var(--text-muted);
            font-size: 0.85rem;
            margin-top: 2rem;
        }
        
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎵</div>
            <h1>TSiJUKEBOX</h1>
            <p class="subtitle">Enterprise Music System Installer</p>
        </div>
        
        <div id="config-form">
            <div class="card">
                <h2 class="card-title">⚙️ Configuração</h2>
                
                <div class="form-group">
                    <label>Usuário do Sistema</label>
                    <input type="text" id="username" value="tsi" placeholder="tsi">
                </div>
                
                <div class="form-group">
                    <label>Banco de Dados</label>
                    <select id="database">
                        <option value="sqlite">SQLite (Recomendado)</option>
                        <option value="mariadb">MariaDB</option>
                        <option value="postgresql">PostgreSQL</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Idioma</label>
                    <select id="language">
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                    </select>
                </div>
            </div>
            
            <div class="card">
                <h2 class="card-title">🔧 Componentes</h2>
                
                <div class="form-group">
                    <label class="checkbox-group">
                        <input type="checkbox" id="install-spotify" checked>
                        <span>Spotify + Spicetify</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-group">
                        <input type="checkbox" id="install-nginx" checked>
                        <span>Nginx (Servidor Web)</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-group">
                        <input type="checkbox" id="install-monitoring">
                        <span>Grafana + Prometheus (Monitoramento)</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-group">
                        <input type="checkbox" id="kiosk-mode" checked>
                        <span>Configurar Modo Kiosk</span>
                    </label>
                </div>
            </div>
            
            <button class="btn btn-primary btn-block" onclick="startInstall()">
                🚀 Iniciar Instalação
            </button>
        </div>
        
        <div id="progress-section" class="progress-container">
            <div class="card">
                <h2 class="card-title">
                    <span class="status-icon status-running" id="status-icon"></span>
                    <span id="current-step">Instalando...</span>
                </h2>
                
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                </div>
                
                <p class="progress-text" id="progress-text">Iniciando instalação...</p>
                
                <div class="log-container" id="log-container"></div>
            </div>
        </div>
        
        <div class="footer">
            <p>TSiJUKEBOX Enterprise v4.0.0 • Desenvolvido por B0.y_Z4kr14</p>
        </div>
    </div>
    
    <script>
        let eventSource = null;
        
        function startInstall() {
            const config = {
                username: document.getElementById('username').value,
                database: document.getElementById('database').value,
                language: document.getElementById('language').value,
                install_spotify: document.getElementById('install-spotify').checked,
                install_nginx: document.getElementById('install-nginx').checked,
                install_monitoring: document.getElementById('install-monitoring').checked,
                kiosk_mode: document.getElementById('kiosk-mode').checked
            };
            
            // Hide form, show progress
            document.getElementById('config-form').classList.add('hidden');
            document.getElementById('progress-section').classList.add('active');
            
            // Send configuration
            fetch('/api/install', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            
            // Start listening for progress
            eventSource = new EventSource('/api/progress');
            eventSource.onmessage = function(event) {
                const data = JSON.parse(event.data);
                updateProgress(data);
            };
        }
        
        function updateProgress(data) {
            document.getElementById('current-step').textContent = data.step;
            document.getElementById('progress-fill').style.width = data.progress + '%';
            document.getElementById('progress-text').textContent = data.message;
            
            // Update status icon
            const icon = document.getElementById('status-icon');
            icon.className = 'status-icon status-' + data.status;
            
            // Add log line
            if (data.details) {
                const log = document.getElementById('log-container');
                const line = document.createElement('div');
                line.className = 'log-line';
                line.textContent = data.details;
                log.appendChild(line);
                log.scrollTop = log.scrollHeight;
            }
            
            // Installation complete
            if (data.status === 'success' && data.progress === 100) {
                eventSource.close();
                setTimeout(() => {
                    window.location.href = 'http://localhost:5173';
                }, 2000);
            }
        }
    </script>
</body>
</html>"""
    
    def _create_handler(self) -> type:
        """Create HTTP request handler."""
        parent = self
        
        class Handler(http.server.SimpleHTTPRequestHandler):
            def log_message(self, format, *args):
                parent.logger.debug(f"HTTP: {args[0]}")
            
            def do_GET(self):
                parsed = urlparse(self.path)
                
                if parsed.path == "/":
                    self.send_response(200)
                    self.send_header("Content-type", "text/html")
                    self.end_headers()
                    self.wfile.write(parent._generate_html().encode())
                    
                elif parsed.path == "/api/progress":
                    self.send_response(200)
                    self.send_header("Content-type", "text/event-stream")
                    self.send_header("Cache-Control", "no-cache")
                    self.send_header("Connection", "keep-alive")
                    self.end_headers()
                    
                    data = json.dumps(asdict(parent.progress))
                    self.wfile.write(f"data: {data}\n\n".encode())
                    self.wfile.flush()
                    
                elif parsed.path == "/api/status":
                    self.send_response(200)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(asdict(parent.progress)).encode())
                    
                else:
                    self.send_error(404)
            
            def do_POST(self):
                if self.path == "/api/install":
                    content_length = int(self.headers.get("Content-Length", 0))
                    body = self.rfile.read(content_length)
                    
                    try:
                        config = json.loads(body.decode())
                        parent._config = config
                        
                        # Trigger install callback
                        if "install" in parent._callbacks:
                            threading.Thread(
                                target=parent._callbacks["install"],
                                args=(config,)
                            ).start()
                        
                        self.send_response(200)
                        self.send_header("Content-type", "application/json")
                        self.end_headers()
                        self.wfile.write(json.dumps({"status": "started"}).encode())
                        
                    except Exception as e:
                        self.send_response(500)
                        self.send_header("Content-type", "application/json")
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": str(e)}).encode())
                else:
                    self.send_error(404)
        
        return Handler
    
    def start(self, open_browser: bool = True) -> None:
        """Start the landing server."""
        self.port = self._find_free_port(self.port)
        
        Handler = self._create_handler()
        
        self.server = socketserver.TCPServer(("", self.port), Handler)
        
        self.logger.info(f"Landing server started at http://localhost:{self.port}")
        
        if open_browser:
            webbrowser.open(f"http://localhost:{self.port}")
        
        try:
            self.server.serve_forever()
        except KeyboardInterrupt:
            self.stop()
    
    def start_async(self, open_browser: bool = True) -> threading.Thread:
        """Start the landing server in a background thread."""
        thread = threading.Thread(
            target=self.start,
            args=(open_browser,),
            daemon=True
        )
        thread.start()
        return thread
    
    def stop(self) -> None:
        """Stop the landing server."""
        if self.server:
            self.server.shutdown()
            self.server = None
            self.logger.info("Landing server stopped")


def main():
    """Test landing server."""
    logger = Logger()
    server = LandingServer(logger=logger)
    
    def mock_install(config):
        """Mock installation for testing."""
        import time
        
        steps = [
            ("system", "Analisando sistema..."),
            ("packages", "Instalando pacotes..."),
            ("database", "Configurando banco de dados..."),
            ("user", "Criando usuário..."),
            ("app", "Instalando TSiJUKEBOX..."),
            ("complete", "Instalação concluída!")
        ]
        
        for i, (step, message) in enumerate(steps):
            progress = int((i + 1) / len(steps) * 100)
            status = "success" if i == len(steps) - 1 else "running"
            
            server.update_progress(
                step=step,
                progress=progress,
                message=message,
                status=status,
                details=f"[{step}] {message}"
            )
            time.sleep(2)
    
    server.register_callback("install", mock_install)
    server.start()


if __name__ == "__main__":
    main()
