#!/usr/bin/env python3
# =============================================================================
# TSiJUKEBOX Enterprise - Spicetify Setup
# Handles Spotify customization via Spicetify CLI
# =============================================================================

import subprocess
import os
import shutil
import json
import time
import random
from pathlib import Path
from typing import Optional, Dict, Any, List, Callable, TypeVar
from dataclasses import dataclass, field

from .config import Config
from .utils.logger import Logger

# Type variable for generic retry function
T = TypeVar('T')


@dataclass
class RetryConfig:
    """
    Configuração para retry com backoff exponencial.
    
    Attributes:
        max_attempts: Número máximo de tentativas
        initial_delay: Delay inicial em segundos
        max_delay: Delay máximo em segundos
        exponential_base: Base para cálculo exponencial
        jitter: Adicionar variação aleatória ao delay
        jitter_factor: Fator de jitter (0.0 a 1.0)
    """
    max_attempts: int = 5
    initial_delay: float = 2.0
    max_delay: float = 60.0
    exponential_base: float = 2.0
    jitter: bool = True
    jitter_factor: float = 0.1
    
    def calculate_delay(self, attempt: int) -> float:
        """Calcula o delay para uma tentativa específica."""
        delay = min(
            self.initial_delay * (self.exponential_base ** attempt),
            self.max_delay
        )
        
        if self.jitter:
            jitter_range = delay * self.jitter_factor
            delay += random.uniform(-jitter_range, jitter_range)
        
        return max(0.1, delay)  # Mínimo de 100ms


@dataclass
class RetryResult:
    """Resultado de uma operação com retry."""
    success: bool
    value: Any = None
    attempts: int = 0
    total_time: float = 0.0
    last_error: Optional[str] = None
    attempt_details: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class SpicetifyStatus:
    """Spicetify installation status."""
    installed: bool
    version: str
    spotify_path: Path
    config_path: Path
    themes: List[str]
    extensions: List[str]
    applied: bool

class SpicetifySetup:
    """
    Manages Spicetify CLI installation and configuration.
    Provides Spotify theming and extension capabilities.
    """
    
    SPICETIFY_PATH = Path.home() / ".spicetify"
    CONFIG_PATH = Path.home() / ".config" / "spicetify"
    THEMES_PATH = Path.home() / ".config" / "spicetify" / "Themes"
    EXTENSIONS_PATH = Path.home() / ".config" / "spicetify" / "Extensions"
    
    # Caminhos conhecidos do Spotify para diferentes instalações
    SPOTIFY_PATHS = {
        "spotify-launcher": Path.home() / ".local/share/spotify-launcher/install/usr/share/spotify",
        "aur-spotify": Path("/opt/spotify"),
        "aur-spotify-dev": Path("/opt/spotify-dev"),
        "flatpak": Path.home() / ".var/app/com.spotify.Client/config/spotify",
        "snap": Path("/snap/spotify/current/usr/share/spotify"),
        "system": Path("/usr/share/spotify"),
    }
    
    # Caminhos conhecidos do arquivo prefs
    PREFS_PATHS = {
        "spotify-launcher": Path.home() / ".config/spotify/prefs",
        "aur-spotify": Path.home() / ".config/spotify/prefs",
        "flatpak": Path.home() / ".var/app/com.spotify.Client/config/spotify/prefs",
        "snap": Path.home() / "snap/spotify/current/.config/spotify/prefs",
        "legacy": Path.home() / ".spotify/prefs",
    }
    
    # Default extensions for TSiJUKEBOX
    DEFAULT_EXTENSIONS = [
        "autoSkipVideo.js",
        "bookmark.js",
        "fullAppDisplay.js",
        "keyboardShortcut.js",
        "loopyLoop.js",
        "popupLyrics.js",
        "shuffle+.js",
        "trashbin.js"
    ]
    
    # Recommended themes
    RECOMMENDED_THEMES = [
        "Dribbblish",
        "Sleek",
        "Ziro",
        "Turntable",
        "Bloom"
    ]
    
    def __init__(self, logger: Optional[Logger] = None, user: Optional[str] = None):
        self.logger = logger or Logger()
        self.config = Config()
        self.user = user or os.environ.get('SUDO_USER') or os.environ.get('USER')
        self._user_home: Optional[Path] = None
    
    def _get_user_home(self) -> Path:
        """Retorna o diretório home do usuário alvo."""
        if self._user_home:
            return self._user_home
        
        if self.user:
            try:
                import pwd
                self._user_home = Path(pwd.getpwnam(self.user).pw_dir)
            except KeyError:
                self._user_home = Path.home()
        else:
            self._user_home = Path.home()
        
        return self._user_home
    
    def _run_command(
        self, 
        cmd: List[str],
        capture: bool = True,
        env: Optional[Dict[str, str]] = None
    ) -> tuple[int, str, str]:
        """Run a shell command."""
        self.logger.debug(f"Running: {' '.join(cmd)}")
        
        full_env = os.environ.copy()
        if env:
            full_env.update(env)
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                env=full_env,
                timeout=300
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            self.logger.error(f"Command failed: {e}")
            return 1, "", str(e)
    
    def is_spotify_installed(self) -> bool:
        """Check if Spotify is installed."""
        # Verificar caminhos conhecidos
        for path in self.SPOTIFY_PATHS.values():
            if path.exists() and (path / "Apps").exists():
                return True
        
        return shutil.which("spotify") is not None
    
    def detect_spotify_path(self) -> Optional[Path]:
        """
        Auto-detecta o caminho de instalação do Spotify.
        
        Returns:
            Path para o diretório do Spotify ou None se não encontrado
        """
        user_home = self._get_user_home()
        
        # Caminhos ajustados para o usuário atual
        search_paths = {
            "spotify-launcher": user_home / ".local/share/spotify-launcher/install/usr/share/spotify",
            "aur-spotify": Path("/opt/spotify"),
            "aur-spotify-dev": Path("/opt/spotify-dev"),
            "flatpak": user_home / ".var/app/com.spotify.Client/config/spotify",
            "snap": Path("/snap/spotify/current/usr/share/spotify"),
            "system": Path("/usr/share/spotify"),
        }
        
        for name, path in search_paths.items():
            if path.exists() and (path / "Apps").exists():
                self.logger.info(f"Spotify detectado: {name} em {path}")
                return path
        
        # Fallback: procurar via which e resolver symlinks
        spotify_bin = shutil.which("spotify")
        if spotify_bin:
            spotify_path = Path(spotify_bin).resolve()
            # Tentar encontrar o diretório de instalação
            for parent in spotify_path.parents:
                apps_dir = parent / "Apps"
                if apps_dir.exists():
                    self.logger.info(f"Spotify detectado via which: {parent}")
                    return parent
        
        self.logger.warning("Não foi possível detectar instalação do Spotify")
        return None
    
    def _retry_with_backoff(
        self,
        func: Callable[[], Optional[T]],
        config: RetryConfig,
        description: str
    ) -> RetryResult:
        """
        Executa função com retry e backoff exponencial.
        
        Args:
            func: Função a ser executada (deve retornar None em caso de falha)
            config: Configuração de retry
            description: Descrição da operação para logs
            
        Returns:
            RetryResult com resultado da operação
        """
        start_time = time.time()
        attempt_details = []
        last_error = None
        
        for attempt in range(config.max_attempts):
            attempt_start = time.time()
            
            try:
                result = func()
                
                if result is not None:
                    elapsed = time.time() - start_time
                    attempt_details.append({
                        "attempt": attempt + 1,
                        "success": True,
                        "duration": time.time() - attempt_start
                    })
                    
                    self.logger.info(
                        f"{description}: sucesso na tentativa {attempt + 1}/{config.max_attempts} "
                        f"({elapsed:.1f}s total)"
                    )
                    
                    return RetryResult(
                        success=True,
                        value=result,
                        attempts=attempt + 1,
                        total_time=elapsed,
                        attempt_details=attempt_details
                    )
                
                last_error = "Resultado None"
                
            except Exception as e:
                last_error = str(e)
                self.logger.debug(f"{description}: erro na tentativa {attempt + 1}: {e}")
            
            attempt_details.append({
                "attempt": attempt + 1,
                "success": False,
                "duration": time.time() - attempt_start,
                "error": last_error
            })
            
            # Não espera após a última tentativa
            if attempt < config.max_attempts - 1:
                delay = config.calculate_delay(attempt)
                
                self.logger.info(
                    f"{description}: tentativa {attempt + 1}/{config.max_attempts} falhou. "
                    f"Aguardando {delay:.1f}s antes da próxima tentativa..."
                )
                
                time.sleep(delay)
        
        elapsed = time.time() - start_time
        self.logger.warning(
            f"{description}: todas as {config.max_attempts} tentativas falharam ({elapsed:.1f}s total)"
        )
        
        return RetryResult(
            success=False,
            value=None,
            attempts=config.max_attempts,
            total_time=elapsed,
            last_error=last_error,
            attempt_details=attempt_details
        )
    
    def _detect_prefs_path_once(self) -> Optional[Path]:
        """
        Tenta detectar o arquivo prefs uma única vez.
        
        Returns:
            Path para o arquivo prefs ou None se não encontrado
        """
        user_home = self._get_user_home()
        
        # Caminhos conhecidos ajustados para o usuário atual
        search_paths = {
            "config-spotify": user_home / ".config/spotify/prefs",
            "flatpak": user_home / ".var/app/com.spotify.Client/config/spotify/prefs",
            "snap": user_home / "snap/spotify/current/.config/spotify/prefs",
            "legacy": user_home / ".spotify/prefs",
        }
        
        for name, path in search_paths.items():
            if path.exists():
                self.logger.debug(f"Prefs detectado: {name} em {path}")
                return path
        
        # Fallback: procurar recursivamente em locais comuns
        search_dirs = [
            user_home / ".config",
            user_home / ".var",
            user_home / ".local",
        ]
        
        for base in search_dirs:
            if base.exists():
                try:
                    for prefs in base.rglob("prefs"):
                        if "spotify" in str(prefs).lower():
                            self.logger.debug(f"Prefs encontrado via busca: {prefs}")
                            return prefs
                except PermissionError:
                    continue
        
        return None
    
    def detect_prefs_path(self, with_retry: bool = False) -> Optional[Path]:
        """
        Auto-detecta o arquivo de preferências do Spotify.
        
        Args:
            with_retry: Se True, usa retry com backoff exponencial
            
        Returns:
            Path para o arquivo prefs ou None se não encontrado
        """
        # Tenta detecção simples primeiro
        result = self._detect_prefs_path_once()
        
        if result is not None:
            self.logger.info(f"Prefs detectado: {result}")
            return result
        
        if not with_retry:
            self.logger.warning("Não foi possível detectar arquivo prefs do Spotify")
            return None
        
        # Se não encontrou e retry está habilitado, tenta com backoff
        return self.detect_prefs_path_with_retry().value
    
    def detect_prefs_path_with_retry(
        self,
        max_attempts: int = 6,
        initial_delay: float = 2.0,
        max_delay: float = 60.0
    ) -> RetryResult:
        """
        Detecta prefs_path com retry e backoff exponencial.
        
        Útil quando o Spotify foi recém-iniciado e o arquivo prefs
        ainda não foi criado.
        
        Args:
            max_attempts: Número máximo de tentativas
            initial_delay: Delay inicial em segundos
            max_delay: Delay máximo em segundos
            
        Returns:
            RetryResult com o caminho encontrado ou None
        """
        config = RetryConfig(
            max_attempts=max_attempts,
            initial_delay=initial_delay,
            max_delay=max_delay,
            exponential_base=2.0,
            jitter=True
        )
        
        result = self._retry_with_backoff(
            self._detect_prefs_path_once,
            config,
            "Detecção de prefs_path"
        )
        
        if not result.success:
            # Tenta criar arquivo prefs vazio como último recurso
            self.logger.info("Tentando criar arquivo prefs vazio...")
            prefs_path = self._create_empty_prefs()
            
            if prefs_path:
                return RetryResult(
                    success=True,
                    value=prefs_path,
                    attempts=result.attempts + 1,
                    total_time=result.total_time,
                    last_error=None,
                    attempt_details=result.attempt_details
                )
        
        return result
    
    def _create_empty_prefs(self) -> Optional[Path]:
        """
        Cria arquivo prefs vazio se não existir.
        
        Returns:
            Path para o arquivo criado ou None se falhar
        """
        user_home = self._get_user_home()
        prefs_path = user_home / ".config/spotify/prefs"
        
        try:
            prefs_path.parent.mkdir(parents=True, exist_ok=True)
            prefs_path.touch()
            
            self.logger.info(f"Arquivo prefs criado: {prefs_path}")
            return prefs_path
            
        except Exception as e:
            self.logger.error(f"Falha ao criar arquivo prefs: {e}")
            return None
    
    def _fix_spotify_permissions(self, spotify_path: Path) -> bool:
        """
        Corrige permissões para permitir modificação pelo Spicetify.
        
        Args:
            spotify_path: Caminho para o diretório do Spotify
            
        Returns:
            True se permissões corrigidas com sucesso
        """
        apps_dir = spotify_path / "Apps"
        
        if not apps_dir.exists():
            self.logger.warning(f"Diretório Apps não encontrado: {apps_dir}")
            return False
        
        try:
            import stat
            
            # Dar permissões de escrita ao diretório principal
            for item in [spotify_path, apps_dir]:
                current_mode = item.stat().st_mode
                item.chmod(current_mode | stat.S_IWUSR | stat.S_IWGRP | stat.S_IWOTH)
            
            # Dar permissões de escrita aos arquivos dentro de Apps
            for child in apps_dir.iterdir():
                if child.is_file():
                    current_mode = child.stat().st_mode
                    child.chmod(current_mode | stat.S_IWUSR | stat.S_IWGRP | stat.S_IWOTH)
            
            self.logger.success("Permissões do Spotify corrigidas")
            return True
            
        except PermissionError:
            self.logger.warning("Necessário sudo para corrigir permissões, tentando...")
            
            # Tentar via sudo
            code1, _, _ = self._run_command(
                ["sudo", "chmod", "a+wr", str(spotify_path)],
                capture=True
            )
            code2, _, _ = self._run_command(
                ["sudo", "chmod", "-R", "a+wr", str(apps_dir)],
                capture=True
            )
            
            if code1 == 0 and code2 == 0:
                self.logger.success("Permissões corrigidas via sudo")
                return True
            else:
                self.logger.error("Falha ao corrigir permissões")
                return False
    
    def auto_configure(self, user: Optional[str] = None) -> bool:
        """
        Configura automaticamente o Spicetify baseado no usuário atual.
        
        Este método:
        1. Detecta o caminho do Spotify instalado
        2. Detecta o arquivo prefs do Spotify
        3. Configura spotify_path e prefs_path no Spicetify
        4. Define permissões corretas nos diretórios
        5. Faz backup do Spotify
        6. Aplica customizações básicas
        
        Args:
            user: Nome do usuário (opcional, usa atual se não fornecido)
            
        Returns:
            True se configuração bem-sucedida
        """
        if user:
            self.user = user
            self._user_home = None  # Reset para recalcular
        
        self.logger.info(f"Auto-configurando Spicetify para usuário: {self.user}")
        
        # 1. Verificar se Spicetify está instalado
        if not self.is_spicetify_installed():
            self.logger.error("Spicetify não está instalado")
            return False
        
        # 2. Detectar spotify_path
        spotify_path = self.detect_spotify_path()
        if not spotify_path:
            self.logger.error("Não foi possível detectar instalação do Spotify")
            self.logger.info("Verifique se o Spotify está instalado corretamente")
            return False
        
        # 3. Detectar prefs_path
        prefs_path = self.detect_prefs_path()
        if not prefs_path:
            self.logger.warning("Arquivo prefs não encontrado")
            self.logger.info("Tentando iniciar Spotify para criar arquivo de configuração...")
            
            # Tentar iniciar Spotify brevemente
            if self._start_spotify_briefly():
                prefs_path = self.detect_prefs_path()
            
            if not prefs_path:
                self.logger.error("Não foi possível detectar arquivo prefs do Spotify")
                self.logger.info("Inicie o Spotify manualmente uma vez e tente novamente")
                return False
        
        # 4. Configurar spotify_path no Spicetify
        self.logger.info(f"Configurando spotify_path: {spotify_path}")
        code, _, err = self._run_command([
            "spicetify", "config", "spotify_path", str(spotify_path)
        ])
        if code != 0:
            self.logger.error(f"Falha ao configurar spotify_path: {err}")
            return False
        
        # 5. Configurar prefs_path no Spicetify
        self.logger.info(f"Configurando prefs_path: {prefs_path}")
        code, _, err = self._run_command([
            "spicetify", "config", "prefs_path", str(prefs_path)
        ])
        if code != 0:
            self.logger.error(f"Falha ao configurar prefs_path: {err}")
            return False
        
        # 6. Corrigir permissões
        if not self._fix_spotify_permissions(spotify_path):
            self.logger.warning("Falha ao corrigir permissões, continuando mesmo assim...")
        
        # 7. Criar backup
        self.logger.info("Criando backup do Spotify...")
        if not self.backup_spotify():
            self.logger.warning("Backup falhou, tentando apply mesmo assim...")
        
        # 8. Aplicar configurações
        if self.apply_customizations():
            self.logger.success("Spicetify configurado automaticamente com sucesso!")
            return True
        else:
            self.logger.error("Falha ao aplicar customizações do Spicetify")
            return False
    
    def _start_spotify_briefly(self) -> bool:
        """Inicia o Spotify brevemente para criar arquivos de configuração."""
        try:
            import time
            
            self.logger.info("Iniciando Spotify temporariamente...")
            
            # Iniciar Spotify em background
            if self.user and os.geteuid() == 0:
                proc = subprocess.Popen(
                    ['sudo', '-u', self.user, 'spotify', '--no-zygote'],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True
                )
            else:
                proc = subprocess.Popen(
                    ['spotify', '--no-zygote'],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True
                )
            
            # Aguardar criação do arquivo prefs
            time.sleep(5)
            
            # Encerrar Spotify
            self._run_command(['pkill', '-f', 'spotify'], capture=True)
            
            time.sleep(1)
            return True
            
        except Exception as e:
            self.logger.warning(f"Falha ao iniciar Spotify: {e}")
            return False
    
    def is_spicetify_installed(self) -> bool:
        """Check if Spicetify is installed."""
        return shutil.which("spicetify") is not None
    
    def get_status(self) -> SpicetifyStatus:
        """Get Spicetify installation status."""
        installed = self.is_spicetify_installed()
        version = "unknown"
        spotify_path = Path("/opt/spotify")
        themes = []
        extensions = []
        applied = False
        
        if installed:
            # Get version
            code, out, _ = self._run_command(["spicetify", "--version"])
            if code == 0:
                version = out.strip()
            
            # Get Spotify path
            code, out, _ = self._run_command(["spicetify", "config", "spotify_path"])
            if code == 0 and out.strip():
                spotify_path = Path(out.strip())
            
            # List themes
            if self.THEMES_PATH.exists():
                themes = [d.name for d in self.THEMES_PATH.iterdir() if d.is_dir()]
            
            # List extensions
            if self.EXTENSIONS_PATH.exists():
                extensions = [f.name for f in self.EXTENSIONS_PATH.iterdir() if f.suffix == ".js"]
            
            # Check if applied
            backup_path = self.CONFIG_PATH / "Backup"
            applied = backup_path.exists() and any(backup_path.iterdir())
        
        return SpicetifyStatus(
            installed=installed,
            version=version,
            spotify_path=spotify_path,
            config_path=self.CONFIG_PATH,
            themes=themes,
            extensions=extensions,
            applied=applied
        )
    
    def install_spicetify(self) -> bool:
        """Install Spicetify CLI."""
        if self.is_spicetify_installed():
            self.logger.info("Spicetify already installed")
            return True
        
        if not self.is_spotify_installed():
            self.logger.error("Spotify must be installed first")
            return False
        
        self.logger.info("Installing Spicetify...")
        
        # Install via curl (official method)
        install_cmd = "curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh"
        
        code, out, err = self._run_command(
            ["bash", "-c", install_cmd],
            capture=True
        )
        
        if code == 0:
            self.logger.success("Spicetify installed successfully")
            
            # Add to PATH if needed
            self._add_to_path()
            
            return True
        else:
            self.logger.error(f"Spicetify installation failed: {err}")
            
            # Try AUR method with dynamic helper (paru preferred)
            self.logger.info("Trying AUR installation...")
            aur_helper = self._detect_aur_helper()
            if aur_helper:
                code, _, err = self._run_command(
                    [aur_helper, "-S", "--noconfirm", "spicetify-cli"],
                    capture=True
                )
                return code == 0
            return False
    
    def _detect_aur_helper(self) -> str:
        """Detect available AUR helper (paru preferred)."""
        import shutil
        for helper in ["paru", "yay"]:
            if shutil.which(helper):
                return helper
        return ""
    
    def _add_to_path(self) -> None:
        """Add Spicetify to PATH."""
        spicetify_bin = self.SPICETIFY_PATH
        
        # Add to .bashrc
        bashrc = Path.home() / ".bashrc"
        path_line = f'\nexport PATH="$PATH:{spicetify_bin}"\n'
        
        if bashrc.exists():
            content = bashrc.read_text()
            if str(spicetify_bin) not in content:
                bashrc.write_text(content + path_line)
        
        # Also add to current session
        os.environ["PATH"] = f"{os.environ.get('PATH', '')}:{spicetify_bin}"
    
    def backup_spotify(self) -> bool:
        """Create backup of Spotify installation."""
        self.logger.info("Creating Spotify backup...")
        
        code, _, err = self._run_command(["spicetify", "backup"])
        
        if code == 0:
            self.logger.success("Spotify backup created")
            return True
        else:
            self.logger.error(f"Backup failed: {err}")
            return False
    
    def apply_customizations(self) -> bool:
        """Apply Spicetify customizations to Spotify."""
        self.logger.info("Applying Spicetify customizations...")
        
        code, _, err = self._run_command(["spicetify", "apply"])
        
        if code == 0:
            self.logger.success("Customizations applied")
            return True
        else:
            self.logger.error(f"Apply failed: {err}")
            return False
    
    def restore_spotify(self) -> bool:
        """Restore Spotify to original state."""
        self.logger.info("Restoring Spotify...")
        
        code, _, err = self._run_command(["spicetify", "restore"])
        
        if code == 0:
            self.logger.success("Spotify restored")
            return True
        else:
            self.logger.error(f"Restore failed: {err}")
            return False
    
    def install_marketplace(self) -> bool:
        """Install Spicetify Marketplace for easy extension/theme management."""
        self.logger.info("Installing Spicetify Marketplace...")
        
        # Official marketplace installation
        install_cmd = "curl -fsSL https://raw.githubusercontent.com/spicetify/marketplace/main/resources/install.sh | sh"
        
        code, _, err = self._run_command(
            ["bash", "-c", install_cmd],
            capture=True
        )
        
        if code == 0:
            self.logger.success("Marketplace installed")
            
            # Apply to enable marketplace
            self.apply_customizations()
            return True
        else:
            self.logger.error(f"Marketplace installation failed: {err}")
            return False
    
    def install_theme(self, theme_name: str) -> bool:
        """Install a Spicetify theme."""
        self.logger.info(f"Installing theme: {theme_name}")
        
        # Clone theme from spicetify-themes repo
        themes_repo = "https://github.com/spicetify/spicetify-themes.git"
        temp_dir = Path("/tmp/spicetify-themes")
        
        try:
            # Clone if not exists
            if not temp_dir.exists():
                code, _, err = self._run_command(
                    ["git", "clone", "--depth=1", themes_repo, str(temp_dir)],
                    capture=True
                )
                
                if code != 0:
                    self.logger.error(f"Failed to clone themes: {err}")
                    return False
            
            # Find theme
            theme_src = temp_dir / theme_name
            if not theme_src.exists():
                self.logger.error(f"Theme not found: {theme_name}")
                return False
            
            # Copy to themes directory
            self.THEMES_PATH.mkdir(parents=True, exist_ok=True)
            theme_dest = self.THEMES_PATH / theme_name
            
            if theme_dest.exists():
                shutil.rmtree(theme_dest)
            
            shutil.copytree(theme_src, theme_dest)
            
            self.logger.success(f"Theme installed: {theme_name}")
            return True
            
        except Exception as e:
            self.logger.error(f"Theme installation failed: {e}")
            return False
    
    def set_theme(self, theme_name: str, color_scheme: str = "") -> bool:
        """Set the current Spicetify theme."""
        self.logger.info(f"Setting theme: {theme_name}")
        
        code, _, err = self._run_command(
            ["spicetify", "config", "current_theme", theme_name]
        )
        
        if code != 0:
            self.logger.error(f"Failed to set theme: {err}")
            return False
        
        if color_scheme:
            self._run_command(
                ["spicetify", "config", "color_scheme", color_scheme]
            )
        
        # Apply changes
        return self.apply_customizations()
    
    def install_extension(self, extension_url: str) -> bool:
        """Install a Spicetify extension from URL."""
        self.logger.info(f"Installing extension from: {extension_url}")
        
        self.EXTENSIONS_PATH.mkdir(parents=True, exist_ok=True)
        
        # Download extension
        filename = extension_url.split("/")[-1]
        ext_path = self.EXTENSIONS_PATH / filename
        
        code, _, err = self._run_command(
            ["curl", "-sL", "-o", str(ext_path), extension_url],
            capture=True
        )
        
        if code != 0:
            self.logger.error(f"Failed to download extension: {err}")
            return False
        
        # Enable extension
        code, _, err = self._run_command(
            ["spicetify", "config", "extensions", filename]
        )
        
        if code == 0:
            self.logger.success(f"Extension installed: {filename}")
            return True
        else:
            self.logger.error(f"Failed to enable extension: {err}")
            return False
    
    def enable_extension(self, extension_name: str) -> bool:
        """Enable a Spicetify extension."""
        self.logger.info(f"Enabling extension: {extension_name}")
        
        code, _, err = self._run_command(
            ["spicetify", "config", "extensions", extension_name]
        )
        
        return code == 0
    
    def disable_extension(self, extension_name: str) -> bool:
        """Disable a Spicetify extension."""
        self.logger.info(f"Disabling extension: {extension_name}")
        
        code, _, err = self._run_command(
            ["spicetify", "config", "extensions", f"-{extension_name}"]
        )
        
        return code == 0
    
    def setup_for_tsijukebox(self) -> bool:
        """
        Complete Spicetify setup optimized for TSiJUKEBOX.
        Installs marketplace, recommended theme, and extensions.
        """
        self.logger.info("Setting up Spicetify for TSiJUKEBOX...")
        
        # Install Spicetify if needed
        if not self.install_spicetify():
            return False
        
        # Create backup
        if not self.backup_spotify():
            return False
        
        # Install marketplace
        self.install_marketplace()
        
        # Install and set theme
        if self.install_theme("Dribbblish"):
            self.set_theme("Dribbblish", "purple")
        
        # Enable default extensions
        for ext in self.DEFAULT_EXTENSIONS:
            self.enable_extension(ext)
        
        # Apply all changes
        if self.apply_customizations():
            self.logger.success("TSiJUKEBOX Spicetify setup complete!")
            return True
        
        return False
    
    def update_spicetify(self) -> bool:
        """Update Spicetify to latest version."""
        self.logger.info("Updating Spicetify...")
        
        code, _, err = self._run_command(["spicetify", "upgrade"])
        
        if code == 0:
            self.logger.success("Spicetify updated")
            return True
        else:
            self.logger.error(f"Update failed: {err}")
            return False
    
    def get_config(self) -> Dict[str, Any]:
        """Get current Spicetify configuration."""
        config = {}
        
        config_file = self.CONFIG_PATH / "config-xpui.ini"
        if config_file.exists():
            content = config_file.read_text()
            
            for line in content.split("\n"):
                if "=" in line and not line.strip().startswith("["):
                    key, value = line.split("=", 1)
                    config[key.strip()] = value.strip()
        
        return config


def main():
    """Test Spicetify setup functionality."""
    ss = SpicetifySetup()
    
    print("=== Spicetify Setup Test ===\n")
    
    # Check Spotify
    spotify_installed = ss.is_spotify_installed()
    print(f"Spotify installed: {'✓' if spotify_installed else '✗'}")
    
    if not spotify_installed:
        print("\nSpotify must be installed first.")
        print("Install with: yay -S spotify")
        return
    
    # Check Spicetify status
    status = ss.get_status()
    
    print(f"Spicetify installed: {'✓' if status.installed else '✗'}")
    
    if status.installed:
        print(f"  Version: {status.version}")
        print(f"  Spotify path: {status.spotify_path}")
        print(f"  Applied: {'✓' if status.applied else '✗'}")
        print(f"  Themes: {', '.join(status.themes) if status.themes else 'none'}")
        print(f"  Extensions: {len(status.extensions)} installed")
    else:
        print("\nRun with --install to set up Spicetify")


if __name__ == "__main__":
    main()
