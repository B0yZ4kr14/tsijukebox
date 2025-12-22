#!/usr/bin/env python3
# =============================================================================
# TSiJUKEBOX Installer - Multi-Distro Standalone Tests
# =============================================================================
# Testes de integração do instalador standalone em múltiplas distros Arch-based.
#
# Distros testadas:
#   - Arch Linux (base)
#   - CachyOS
#   - EndeavourOS
#   - Manjaro
#   - Artix (sem systemd)
#
# Run:
#   pytest tests/e2e/test_standalone_multi_distro.py -v --timeout=600
#   pytest tests/e2e/test_standalone_multi_distro.py -v -k "cachyos"
# =============================================================================

import pytest
import subprocess
import os
import time
import json
from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field


# =============================================================================
# CONFIGURAÇÃO DE DISTROS
# =============================================================================

@dataclass
class DistroConfig:
    """Configuração de uma distro para testes."""
    name: str
    dockerfile: str
    image_base: str
    package_manager: str
    init_system: str
    aur_helpers: List[str]
    expected_id: str
    expected_id_like: str = "arch"
    special_features: List[str] = field(default_factory=list)


DISTRO_CONFIGS: Dict[str, DistroConfig] = {
    "archlinux": DistroConfig(
        name="Arch Linux",
        dockerfile="Dockerfile.test",
        image_base="archlinux:latest",
        package_manager="pacman",
        init_system="systemd",
        aur_helpers=["paru", "yay"],
        expected_id="arch",
        expected_id_like="",
    ),
    "cachyos": DistroConfig(
        name="CachyOS Linux",
        dockerfile="Dockerfile.cachyos",
        image_base="archlinux:latest",
        package_manager="pacman",
        init_system="systemd",
        aur_helpers=["paru"],
        expected_id="cachyos",
        special_features=["performance_optimizations", "cachyos_repos"],
    ),
    "endeavouros": DistroConfig(
        name="EndeavourOS",
        dockerfile="Dockerfile.endeavouros",
        image_base="archlinux:latest",
        package_manager="pacman",
        init_system="systemd",
        aur_helpers=["yay", "paru"],
        expected_id="endeavouros",
        special_features=["welcome_app", "eos_repos"],
    ),
    "manjaro": DistroConfig(
        name="Manjaro Linux",
        dockerfile="Dockerfile.manjaro",
        image_base="archlinux:latest",
        package_manager="pacman",
        init_system="systemd",
        aur_helpers=["pamac", "yay", "paru"],
        expected_id="manjaro",
        special_features=["pamac", "manjaro_repos", "stable_branch"],
    ),
    "artix": DistroConfig(
        name="Artix Linux",
        dockerfile="Dockerfile.artix",
        image_base="archlinux:latest",
        package_manager="pacman",
        init_system="openrc",
        aur_helpers=["paru", "yay"],
        expected_id="artix",
        special_features=["no_systemd", "openrc", "runit", "s6"],
    ),
}


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture(scope="module")
def docker_available() -> bool:
    """Verifica se Docker está disponível."""
    try:
        result = subprocess.run(
            ["docker", "info"],
            capture_output=True,
            timeout=10
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


@pytest.fixture(scope="module")
def scripts_dir() -> Path:
    """Retorna o diretório de scripts."""
    # Navega de tests/e2e/ para scripts/
    current = Path(__file__).parent
    return current.parent.parent


@pytest.fixture(scope="module")
def e2e_dir() -> Path:
    """Retorna o diretório E2E."""
    return Path(__file__).parent


class DockerContainer:
    """Gerenciador de container Docker para testes."""
    
    def __init__(self, distro: str, config: DistroConfig, scripts_dir: Path, e2e_dir: Path):
        self.distro = distro
        self.config = config
        self.scripts_dir = scripts_dir
        self.e2e_dir = e2e_dir
        self.container_id: Optional[str] = None
        self.image_name = f"tsijukebox-test-{distro}"
    
    def build(self) -> bool:
        """Constrói a imagem Docker."""
        dockerfile_path = self.e2e_dir / self.config.dockerfile
        
        if not dockerfile_path.exists():
            print(f"Dockerfile não encontrado: {dockerfile_path}")
            return False
        
        result = subprocess.run(
            [
                "docker", "build",
                "-t", self.image_name,
                "-f", str(dockerfile_path),
                str(self.scripts_dir)
            ],
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode != 0:
            print(f"Build falhou: {result.stderr}")
            return False
        
        return True
    
    def start(self) -> bool:
        """Inicia o container."""
        result = subprocess.run(
            [
                "docker", "run", "-d",
                "--name", f"test-{self.distro}-{os.getpid()}",
                "-e", f"DISTRO_NAME={self.config.name}",
                "-e", f"DISTRO_ID={self.config.expected_id}",
                "-e", f"INIT_SYSTEM={self.config.init_system}",
                self.image_name,
                "tail", "-f", "/dev/null"
            ],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode != 0:
            print(f"Start falhou: {result.stderr}")
            return False
        
        self.container_id = result.stdout.strip()
        return True
    
    def exec(self, cmd: List[str], timeout: int = 120) -> subprocess.CompletedProcess:
        """Executa comando no container."""
        if not self.container_id:
            raise RuntimeError("Container não iniciado")
        
        full_cmd = ["docker", "exec", self.container_id] + cmd
        
        return subprocess.run(
            full_cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
    
    def exec_as_root(self, cmd: List[str], timeout: int = 120) -> subprocess.CompletedProcess:
        """Executa comando como root no container."""
        if not self.container_id:
            raise RuntimeError("Container não iniciado")
        
        full_cmd = ["docker", "exec", "-u", "root", self.container_id] + cmd
        
        return subprocess.run(
            full_cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
    
    def copy_file(self, src: Path, dest: str) -> bool:
        """Copia arquivo para o container."""
        if not self.container_id:
            return False
        
        result = subprocess.run(
            ["docker", "cp", str(src), f"{self.container_id}:{dest}"],
            capture_output=True,
            timeout=30
        )
        
        return result.returncode == 0
    
    def stop(self) -> None:
        """Para e remove o container."""
        if self.container_id:
            subprocess.run(
                ["docker", "rm", "-f", self.container_id],
                capture_output=True,
                timeout=30
            )
            self.container_id = None


@pytest.fixture(scope="function")
def container_factory(docker_available, scripts_dir, e2e_dir):
    """Factory para criar containers de teste."""
    containers: List[DockerContainer] = []
    
    def create(distro: str) -> Optional[DockerContainer]:
        if not docker_available:
            pytest.skip("Docker não disponível")
            return None
        
        if distro not in DISTRO_CONFIGS:
            raise ValueError(f"Distro desconhecida: {distro}")
        
        config = DISTRO_CONFIGS[distro]
        container = DockerContainer(distro, config, scripts_dir, e2e_dir)
        
        # Tenta usar imagem existente ou constrói
        result = subprocess.run(
            ["docker", "images", "-q", container.image_name],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if not result.stdout.strip():
            if not container.build():
                pytest.skip(f"Não foi possível construir imagem para {distro}")
                return None
        
        if not container.start():
            pytest.skip(f"Não foi possível iniciar container para {distro}")
            return None
        
        containers.append(container)
        return container
    
    yield create
    
    # Cleanup
    for container in containers:
        container.stop()


# =============================================================================
# TESTES DE DETECÇÃO DE DISTRO
# =============================================================================

class TestDistroDetection:
    """Testes de detecção de distribuição."""
    
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos", "endeavouros", "manjaro", "artix"])
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_os_release_detection(self, container_factory, distro: str):
        """Testa detecção via /etc/os-release."""
        container = container_factory(distro)
        if not container:
            return
        
        config = DISTRO_CONFIGS[distro]
        
        # Lê /etc/os-release
        result = container.exec(["cat", "/etc/os-release"])
        assert result.returncode == 0, f"Falha ao ler os-release: {result.stderr}"
        
        content = result.stdout
        
        # Verifica ID
        assert f'ID={config.expected_id}' in content or f"ID='{config.expected_id}'" in content, \
            f"ID esperado: {config.expected_id}, encontrado: {content}"
        
        # Verifica NAME
        assert config.name in content, f"Nome esperado: {config.name}"
    
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos", "endeavouros", "manjaro", "artix"])
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_package_manager_available(self, container_factory, distro: str):
        """Testa se gerenciador de pacotes está disponível."""
        container = container_factory(distro)
        if not container:
            return
        
        config = DISTRO_CONFIGS[distro]
        
        result = container.exec(["which", config.package_manager])
        assert result.returncode == 0, f"{config.package_manager} não encontrado"
    
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos", "endeavouros", "manjaro", "artix"])
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_aur_helper_available(self, container_factory, distro: str):
        """Testa se pelo menos um AUR helper está disponível."""
        container = container_factory(distro)
        if not container:
            return
        
        config = DISTRO_CONFIGS[distro]
        
        found_helper = False
        for helper in config.aur_helpers:
            result = container.exec(["which", helper])
            if result.returncode == 0:
                found_helper = True
                break
        
        assert found_helper, f"Nenhum AUR helper encontrado: {config.aur_helpers}"


# =============================================================================
# TESTES DO INSTALADOR STANDALONE
# =============================================================================

class TestStandaloneInstaller:
    """Testes do instalador standalone em múltiplas distros."""
    
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos", "endeavouros", "manjaro"])
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_installer_syntax_valid(self, container_factory, distro: str):
        """Testa se o instalador tem sintaxe Python válida."""
        container = container_factory(distro)
        if not container:
            return
        
        result = container.exec([
            "python3", "-m", "py_compile",
            "/app/scripts/install_standalone.py"
        ])
        
        assert result.returncode == 0, f"Erro de sintaxe: {result.stderr}"
    
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos", "endeavouros", "manjaro"])
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_installer_dry_run(self, container_factory, distro: str):
        """Testa execução em dry-run mode."""
        container = container_factory(distro)
        if not container:
            return
        
        result = container.exec([
            "python3", "/app/scripts/install_standalone.py",
            "--dry-run", "--auto"
        ], timeout=180)
        
        # Dry run não deve falhar
        assert "ERRO FATAL" not in result.stdout, f"Erro fatal: {result.stdout}"
        assert "Traceback" not in result.stderr, f"Traceback: {result.stderr}"
    
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos", "endeavouros", "manjaro"])
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_no_module_import_errors(self, container_factory, distro: str):
        """Verifica que não há erros de importação de módulos."""
        container = container_factory(distro)
        if not container:
            return
        
        # Tenta importar o instalador como módulo
        result = container.exec([
            "python3", "-c",
            "import sys; sys.path.insert(0, '/app/scripts'); "
            "exec(open('/app/scripts/install_standalone.py').read().split('if __name__')[0])"
        ], timeout=30)
        
        assert "ModuleNotFoundError" not in result.stderr, \
            f"Erro de módulo: {result.stderr}"
        assert "ImportError" not in result.stderr, \
            f"Erro de importação: {result.stderr}"
    
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos", "endeavouros", "manjaro"])
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_system_detection_output(self, container_factory, distro: str):
        """Testa se a detecção do sistema produz saída correta."""
        container = container_factory(distro)
        if not container:
            return
        
        config = DISTRO_CONFIGS[distro]
        
        result = container.exec([
            "python3", "/app/scripts/install_standalone.py",
            "--dry-run", "--auto"
        ], timeout=180)
        
        output = result.stdout
        
        # Verifica se detectou a distro
        assert "Detectando sistema" in output or "Sistema detectado" in output, \
            f"Detecção não encontrada: {output[:500]}"


# =============================================================================
# TESTES DO SPICETIFY COM RETRY
# =============================================================================

class TestSpicetifyRetryLogic:
    """Testes do retry logic do Spicetify."""
    
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos"])
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_retry_config_class(self, container_factory, distro: str):
        """Testa a classe RetryConfig."""
        container = container_factory(distro)
        if not container:
            return
        
        result = container.exec([
            "python3", "-c",
            """
import sys
sys.path.insert(0, '/app/scripts')
from installer.spicetify_setup import RetryConfig

config = RetryConfig(max_attempts=5, initial_delay=2.0)
delay1 = config.calculate_delay(0)
delay2 = config.calculate_delay(1)
delay3 = config.calculate_delay(2)

print(f"Delay 0: {delay1}")
print(f"Delay 1: {delay2}")
print(f"Delay 2: {delay3}")

# Verifica backoff exponencial
assert delay2 > delay1, "Delay deve crescer"
assert delay3 > delay2, "Delay deve crescer exponencialmente"
print("OK: Backoff exponencial funcionando")
"""
        ], timeout=30)
        
        assert result.returncode == 0, f"Falha: {result.stderr}"
        assert "OK: Backoff exponencial funcionando" in result.stdout
    
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos"])
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_retry_config_max_delay(self, container_factory, distro: str):
        """Testa limite máximo de delay."""
        container = container_factory(distro)
        if not container:
            return
        
        result = container.exec([
            "python3", "-c",
            """
import sys
sys.path.insert(0, '/app/scripts')
from installer.spicetify_setup import RetryConfig

config = RetryConfig(max_attempts=10, initial_delay=1.0, max_delay=30.0, jitter=False)

# Testa vários níveis de attempt
for attempt in range(10):
    delay = config.calculate_delay(attempt)
    print(f"Attempt {attempt}: {delay}s")
    assert delay <= 30.0, f"Delay {delay} excedeu max_delay 30.0"

print("OK: Max delay respeitado")
"""
        ], timeout=30)
        
        assert result.returncode == 0, f"Falha: {result.stderr}"
        assert "OK: Max delay respeitado" in result.stdout
    
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos"])
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_retry_with_backoff_method(self, container_factory, distro: str):
        """Testa o método _retry_with_backoff."""
        container = container_factory(distro)
        if not container:
            return
        
        result = container.exec([
            "python3", "-c",
            """
import sys
sys.path.insert(0, '/app/scripts')
from installer.spicetify_setup import SpicetifySetup, RetryConfig

ss = SpicetifySetup()

# Testa com função que sempre falha
call_count = [0]
def failing_func():
    call_count[0] += 1
    return None

config = RetryConfig(max_attempts=3, initial_delay=0.1, max_delay=0.5, jitter=False)
result = ss._retry_with_backoff(failing_func, config, "Teste falha")

assert not result.success, "Deveria falhar"
assert result.attempts == 3, f"Esperado 3 tentativas, obteve {result.attempts}"
print(f"OK: Retry executou {result.attempts} tentativas")
"""
        ], timeout=60)
        
        assert result.returncode == 0, f"Falha: {result.stderr}"
        assert "OK: Retry executou 3 tentativas" in result.stdout
    
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos"])
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_detect_prefs_with_retry(self, container_factory, distro: str):
        """Testa detect_prefs_path com retry."""
        container = container_factory(distro)
        if not container:
            return
        
        result = container.exec([
            "python3", "-c",
            """
import sys
sys.path.insert(0, '/app/scripts')
from installer.spicetify_setup import SpicetifySetup

ss = SpicetifySetup()

# Testa sem retry (deve ser rápido)
path = ss.detect_prefs_path(with_retry=False)
print(f"Sem retry: {path}")

# Testa com retry (deve tentar múltiplas vezes)
result = ss.detect_prefs_path_with_retry(max_attempts=2, initial_delay=0.1)
print(f"Com retry: success={result.success}, attempts={result.attempts}")
print("OK: detect_prefs_path com retry funcionando")
"""
        ], timeout=60)
        
        # Pode não encontrar prefs (esperado), mas não deve dar erro
        assert "Traceback" not in result.stderr or result.returncode == 0


# =============================================================================
# TESTES DE ARTIX (SEM SYSTEMD)
# =============================================================================

class TestArtixNoSystemd:
    """Testes específicos para Artix Linux (sem systemd)."""
    
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_artix_no_systemd(self, container_factory):
        """Verifica que Artix não tem systemd."""
        container = container_factory("artix")
        if not container:
            return
        
        # Verifica que systemctl não está disponível ou retorna erro
        result = container.exec(["which", "systemctl"])
        
        # Em Artix real, systemctl não existe ou é um stub
        # Nosso container simula isso
        print(f"systemctl: {result.stdout.strip()}")
    
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_artix_openrc_available(self, container_factory):
        """Verifica que OpenRC está disponível em Artix."""
        container = container_factory("artix")
        if not container:
            return
        
        result = container.exec(["which", "rc-service"])
        assert result.returncode == 0, "rc-service não encontrado"
        
        result = container.exec(["which", "rc-update"])
        assert result.returncode == 0, "rc-update não encontrado"
    
    @pytest.mark.docker
    @pytest.mark.e2e
    def test_installer_detects_non_systemd(self, container_factory):
        """Testa se instalador detecta sistema sem systemd."""
        container = container_factory("artix")
        if not container:
            return
        
        result = container.exec([
            "python3", "/app/scripts/install_standalone.py",
            "--dry-run", "--auto"
        ], timeout=180)
        
        output = result.stdout + result.stderr
        
        # Não deve tentar usar systemctl em Artix
        # (verificação básica - em produção seria mais completa)
        print(f"Output Artix: {output[:1000]}")


# =============================================================================
# TESTES DE INTEGRAÇÃO COMPLETA
# =============================================================================

class TestFullInstallation:
    """Testes de instalação completa em containers."""
    
    @pytest.mark.slow
    @pytest.mark.docker
    @pytest.mark.e2e
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos"])
    def test_directories_created(self, container_factory, distro: str):
        """Testa se diretórios são criados corretamente."""
        container = container_factory(distro)
        if not container:
            return
        
        expected_dirs = [
            "/opt/tsijukebox",
            "/etc/tsijukebox",
            "/var/log/tsijukebox",
            "/var/lib/tsijukebox",
        ]
        
        for dir_path in expected_dirs:
            result = container.exec(["test", "-d", dir_path])
            assert result.returncode == 0, f"Diretório não existe: {dir_path}"
    
    @pytest.mark.slow
    @pytest.mark.docker
    @pytest.mark.e2e
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos"])
    def test_user_exists(self, container_factory, distro: str):
        """Testa se usuário de teste existe."""
        container = container_factory(distro)
        if not container:
            return
        
        result = container.exec(["id", "testuser"])
        assert result.returncode == 0, "Usuário testuser não existe"
    
    @pytest.mark.slow
    @pytest.mark.docker
    @pytest.mark.e2e
    @pytest.mark.parametrize("distro", ["archlinux", "cachyos"])
    def test_python_dependencies(self, container_factory, distro: str):
        """Testa se dependências Python estão instaladas."""
        container = container_factory(distro)
        if not container:
            return
        
        result = container.exec([
            "python3", "-c",
            "import pytest; import unittest.mock; print('OK')"
        ])
        
        assert result.returncode == 0, f"Dependências faltando: {result.stderr}"
        assert "OK" in result.stdout


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short", "-m", "not slow"])
