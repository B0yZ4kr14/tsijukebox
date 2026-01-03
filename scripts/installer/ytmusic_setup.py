#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - YouTube Music Bridge Setup
Configura integração com YouTube Music via python-ytmusicapi.
"""

import os
import subprocess
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, List

from .config import Colors, config


@dataclass
class YTMusicConfig:
    """Configuração do YouTube Music"""
    user: str = 'tsi'
    websocket_port: int = 9876
    oauth_enabled: bool = True
    auto_start: bool = True


class YTMusicSetup:
    """Gerencia a configuração do YouTube Music Bridge"""
    
    def __init__(self, ytmusic_config: Optional[YTMusicConfig] = None, analytics=None):
        self.config = ytmusic_config or YTMusicConfig()
        self.analytics = analytics
        self.user_home = Path(f'/home/{self.config.user}')
        self.ytmusic_dir = self.user_home / '.config' / 'ytmusic'
        self.install_dir = Path('/opt/jukebox/ytmusic-bridge')
    
    def _log(self, message: str, color: str = Colors.WHITE):
        """Log colorido"""
        print(f"{color}{message}{Colors.RESET}")
    
    def _run_command(self, cmd: List[str], check: bool = True, **kwargs) -> subprocess.CompletedProcess:
        """Executa comando shell"""
        try:
            result = subprocess.run(cmd, check=check, capture_output=True, text=True, **kwargs)
            return result
        except subprocess.CalledProcessError as e:
            self._log(f"Erro ao executar {' '.join(cmd)}: {e.stderr}", Colors.RED)
            raise
    
    def install_dependencies(self) -> bool:
        """Instala dependências do sistema e Python"""
        self._log("📦 Instalando dependências...", Colors.CYAN)
        
        # Pacotes do sistema
        system_packages = [
            'python',
            'python-pip',
            'python-websockets',
        ]
        
        try:
            self._run_command(['pacman', '-S', '--noconfirm', '--needed'] + system_packages)
        except Exception as e:
            self._log(f"⚠️ Erro ao instalar pacotes do sistema: {e}", Colors.YELLOW)
        
        # Instalar ytmusicapi via pip
        try:
            self._run_command(['pip', 'install', '--break-system-packages', 'ytmusicapi', 'websockets', 'aiohttp'])
            self._log("✅ ytmusicapi instalado", Colors.GREEN)
        except Exception as e:
            # Tentar sem --break-system-packages para versões antigas do pip
            try:
                self._run_command(['pip', 'install', 'ytmusicapi', 'websockets', 'aiohttp'])
                self._log("✅ ytmusicapi instalado", Colors.GREEN)
            except Exception as e2:
                self._log(f"❌ Erro ao instalar ytmusicapi: {e2}", Colors.RED)
                return False
        
        return True
    
    def create_bridge_script(self) -> bool:
        """Cria script Python do bridge WebSocket"""
        self._log("📝 Criando script do bridge...", Colors.CYAN)
        
        self.install_dir.mkdir(parents=True, exist_ok=True)
        
        bridge_script = f'''#!/usr/bin/env python3
"""
TSiJUKEBOX - YouTube Music WebSocket Bridge
Permite controle do YouTube Music via WebSocket.
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any

try:
    import websockets
    from ytmusicapi import YTMusic
except ImportError as e:
    print(f"Erro: dependência não instalada - {{e}}")
    print("Execute: pip install ytmusicapi websockets")
    exit(1)

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/var/log/jukebox/ytmusic-bridge.log')
    ]
)
logger = logging.getLogger(__name__)

# Configurações
WEBSOCKET_PORT = {self.config.websocket_port}
OAUTH_FILE = Path.home() / '.config' / 'ytmusic' / 'oauth.json'


class YTMusicBridge:
    """Bridge entre WebSocket e YouTube Music API"""
    
    def __init__(self):
        self.ytmusic: Optional[YTMusic] = None
        self.connected_clients: set = set()
        self.current_track: Optional[Dict] = None
        self.is_playing: bool = False
        self.queue: list = []
    
    async def initialize(self) -> bool:
        """Inicializa conexão com YouTube Music"""
        try:
            if OAUTH_FILE.exists():
                self.ytmusic = YTMusic(str(OAUTH_FILE))
                logger.info("YouTube Music autenticado via OAuth")
            else:
                self.ytmusic = YTMusic()
                logger.warning("YouTube Music em modo não autenticado (funcionalidade limitada)")
            return True
        except Exception as e:
            logger.error(f"Erro ao inicializar YTMusic: {{e}}")
            return False
    
    async def handle_command(self, command: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Processa comandos recebidos via WebSocket"""
        
        if not self.ytmusic:
            return {{"error": "YouTube Music não inicializado"}}
        
        try:
            if command == "search":
                query = params.get("query", "")
                filter_type = params.get("filter", "songs")
                results = self.ytmusic.search(query, filter=filter_type, limit=20)
                return {{"results": results}}
            
            elif command == "get_home":
                home = self.ytmusic.get_home(limit=10)
                return {{"home": home}}
            
            elif command == "get_library_playlists":
                playlists = self.ytmusic.get_library_playlists(limit=50)
                return {{"playlists": playlists}}
            
            elif command == "get_playlist":
                playlist_id = params.get("playlist_id")
                playlist = self.ytmusic.get_playlist(playlist_id, limit=100)
                return {{"playlist": playlist}}
            
            elif command == "get_song":
                video_id = params.get("video_id")
                song = self.ytmusic.get_song(video_id)
                return {{"song": song}}
            
            elif command == "get_watch_playlist":
                video_id = params.get("video_id")
                playlist = self.ytmusic.get_watch_playlist(video_id, limit=25)
                return {{"watch_playlist": playlist}}
            
            elif command == "get_lyrics":
                video_id = params.get("video_id")
                watch = self.ytmusic.get_watch_playlist(video_id)
                if watch.get("lyrics"):
                    lyrics = self.ytmusic.get_lyrics(watch["lyrics"])
                    return {{"lyrics": lyrics}}
                return {{"lyrics": None}}
            
            elif command == "add_to_queue":
                video_id = params.get("video_id")
                self.queue.append(video_id)
                return {{"success": True, "queue_length": len(self.queue)}}
            
            elif command == "get_queue":
                return {{"queue": self.queue}}
            
            elif command == "clear_queue":
                self.queue.clear()
                return {{"success": True}}
            
            elif command == "rate_song":
                video_id = params.get("video_id")
                rating = params.get("rating", "LIKE")  # LIKE, DISLIKE, INDIFFERENT
                self.ytmusic.rate_song(video_id, rating)
                return {{"success": True}}
            
            elif command == "get_library_songs":
                songs = self.ytmusic.get_library_songs(limit=100)
                return {{"songs": songs}}
            
            elif command == "get_liked_songs":
                playlist = self.ytmusic.get_liked_songs(limit=100)
                return {{"liked_songs": playlist}}
            
            elif command == "status":
                return {{
                    "authenticated": OAUTH_FILE.exists(),
                    "is_playing": self.is_playing,
                    "current_track": self.current_track,
                    "queue_length": len(self.queue),
                }}
            
            elif command == "ping":
                return {{"pong": True}}
            
            else:
                return {{"error": f"Comando desconhecido: {{command}}"}}
                
        except Exception as e:
            logger.error(f"Erro ao processar comando {{command}}: {{e}}")
            return {{"error": str(e)}}
    
    async def handle_client(self, websocket):
        """Gerencia conexão de um cliente WebSocket"""
        self.connected_clients.add(websocket)
        client_addr = websocket.remote_address
        logger.info(f"Cliente conectado: {{client_addr}}")
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    command = data.get("command", "")
                    params = data.get("params", {{}})
                    
                    logger.debug(f"Comando recebido: {{command}}")
                    
                    response = await self.handle_command(command, params)
                    await websocket.send(json.dumps(response))
                    
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({{"error": "JSON inválido"}}))
                except Exception as e:
                    logger.error(f"Erro ao processar mensagem: {{e}}")
                    await websocket.send(json.dumps({{"error": str(e)}}))
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Cliente desconectado: {{client_addr}}")
        finally:
            self.connected_clients.discard(websocket)
    
    async def broadcast(self, message: Dict):
        """Envia mensagem para todos os clientes conectados"""
        if self.connected_clients:
            await asyncio.gather(
                *[client.send(json.dumps(message)) for client in self.connected_clients]
            )
    
    async def run(self):
        """Inicia o servidor WebSocket"""
        if not await self.initialize():
            logger.error("Falha ao inicializar YouTube Music Bridge")
            return
        
        logger.info(f"Iniciando servidor WebSocket na porta {{WEBSOCKET_PORT}}...")
        
        async with websockets.serve(
            self.handle_client,
            "0.0.0.0",
            WEBSOCKET_PORT,
            ping_interval=30,
            ping_timeout=10
        ):
            logger.info(f"YouTube Music Bridge rodando em ws://0.0.0.0:{{WEBSOCKET_PORT}}")
            await asyncio.Future()  # Run forever


async def main():
    """Função principal"""
    bridge = YTMusicBridge()
    await bridge.run()


if __name__ == "__main__":
    asyncio.run(main())
'''
        
        bridge_path = self.install_dir / 'ytmusic_bridge.py'
        bridge_path.write_text(bridge_script)
        os.chmod(bridge_path, 0o755)
        
        self._log(f"✅ Bridge script criado em {bridge_path}", Colors.GREEN)
        return True
    
    def create_systemd_service(self) -> bool:
        """Cria serviço systemd para o bridge"""
        self._log("📝 Criando serviço systemd...", Colors.CYAN)
        
        service_content = f"""[Unit]
Description=TSiJUKEBOX YouTube Music Bridge
After=network.target
Wants=network-online.target

[Service]
Type=simple
User={self.config.user}
Group={self.config.user}
WorkingDirectory={self.install_dir}
ExecStart=/usr/bin/python3 {self.install_dir}/ytmusic_bridge.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment=PYTHONUNBUFFERED=1

# Limites de recursos
MemoryLimit=256M
CPUQuota=25%

[Install]
WantedBy=multi-user.target
"""
        
        service_path = Path('/etc/systemd/system/ytmusic-bridge.service')
        service_path.write_text(service_content)
        
        # Recarregar systemd
        self._run_command(['systemctl', 'daemon-reload'])
        
        if self.config.auto_start:
            self._run_command(['systemctl', 'enable', 'ytmusic-bridge'])
            self._log("✅ Serviço habilitado para iniciar com o sistema", Colors.GREEN)
        
        self._log(f"✅ Serviço criado em {service_path}", Colors.GREEN)
        return True
    
    def setup_oauth(self) -> bool:
        """Configura autenticação OAuth (instruções)"""
        if not self.config.oauth_enabled:
            return True
        
        self._log("🔐 Configurando OAuth do YouTube Music...", Colors.CYAN)
        
        self.ytmusic_dir.mkdir(parents=True, exist_ok=True)
        
        # Ajustar permissões
        self._run_command(['chown', '-R', f'{self.config.user}:{self.config.user}', str(self.ytmusic_dir)])
        
        # Criar script de setup OAuth
        oauth_setup_script = f"""#!/bin/bash
# TSiJUKEBOX - YouTube Music OAuth Setup
# Execute este script como o usuário '{self.config.user}'

echo "============================================"
echo "  YouTube Music OAuth Setup"
echo "============================================"
echo ""
echo "Este script irá configurar a autenticação com o YouTube Music."
echo "Você precisará de um navegador para completar o processo."
echo ""
echo "Pressione ENTER para continuar..."
read

# Executar setup OAuth
python3 -c "from ytmusicapi import YTMusic; YTMusic.setup(filepath='{self.ytmusic_dir}/oauth.json')"

if [ -f "{self.ytmusic_dir}/oauth.json" ]; then
    echo ""
    echo "✅ Autenticação configurada com sucesso!"
    echo "   Arquivo: {self.ytmusic_dir}/oauth.json"
    echo ""
    echo "Reinicie o serviço com:"
    echo "   sudo systemctl restart ytmusic-bridge"
else
    echo ""
    echo "❌ Falha na autenticação. Tente novamente."
fi
"""
        
        oauth_setup_path = self.install_dir / 'setup-oauth.sh'
        oauth_setup_path.write_text(oauth_setup_script)
        os.chmod(oauth_setup_path, 0o755)
        
        self._log(f"✅ Script de OAuth criado: {oauth_setup_path}", Colors.GREEN)
        self._log(f"   Para autenticar, execute como '{self.config.user}':", Colors.YELLOW)
        self._log(f"   {oauth_setup_path}", Colors.YELLOW)
        
        return True
    
    def create_log_directory(self) -> bool:
        """Cria diretório de logs"""
        log_dir = Path('/var/log/jukebox')
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Dar permissão de escrita ao usuário
        self._run_command(['chown', f'{self.config.user}:{self.config.user}', str(log_dir)])
        
        return True
    
    def configure_firewall(self) -> bool:
        """Configura firewall para a porta WebSocket"""
        self._log(f"🔥 Configurando firewall para porta {self.config.websocket_port}...", Colors.CYAN)
        
        try:
            self._run_command(['ufw', 'allow', str(self.config.websocket_port)], check=False)
            self._log(f"✅ Porta {self.config.websocket_port} liberada", Colors.GREEN)
        except FileNotFoundError:
            self._log("⚠️ UFW não instalado, pulando configuração de firewall", Colors.YELLOW)
        
        return True
    
    def setup_full(self) -> bool:
        """Executa configuração completa do YouTube Music Bridge"""
        self._log("🎵 Iniciando configuração do YouTube Music Bridge...", Colors.BOLD + Colors.CYAN)
        
        steps = [
            ('Instalando dependências', self.install_dependencies),
            ('Criando diretório de logs', self.create_log_directory),
            ('Criando script do bridge', self.create_bridge_script),
            ('Criando serviço systemd', self.create_systemd_service),
            ('Configurando OAuth', self.setup_oauth),
            ('Configurando firewall', self.configure_firewall),
        ]
        
        for step_name, step_func in steps:
            self._log(f"\n🔧 {step_name}...", Colors.YELLOW)
            
            if not step_func():
                self._log(f"❌ Falha em: {step_name}", Colors.RED)
                return False
        
        self._log("\n✅ YouTube Music Bridge configurado com sucesso!", Colors.BOLD + Colors.GREEN)
        self._log(f"   WebSocket: ws://localhost:{self.config.websocket_port}", Colors.GREEN)
        self._log(f"   Serviço: ytmusic-bridge.service", Colors.GREEN)
        self._log(f"\n   Para iniciar: sudo systemctl start ytmusic-bridge", Colors.CYAN)
        
        if self.analytics:
            self.analytics.track_event('ytmusic_setup_complete', {
                'websocket_port': self.config.websocket_port,
            })
        
        return True


def main():
    """Função principal para teste"""
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("=" * 60)
    print("  TSiJUKEBOX - YouTube Music Bridge Setup Module")
    print("=" * 60)
    print(f"{Colors.RESET}")
    
    setup = YTMusicSetup()
    
    if os.geteuid() != 0:
        print(f"{Colors.RED}Este script precisa ser executado como root!{Colors.RESET}")
        return False
    
    return setup.setup_full()


if __name__ == '__main__':
    main()
