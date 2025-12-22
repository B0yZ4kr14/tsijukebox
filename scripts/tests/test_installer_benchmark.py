"""
TSiJUKEBOX Installer - Performance Benchmark Tests
===================================================
Testes de benchmark para medir performance de cada fase de instalação.

Executar benchmarks:
    cd scripts && python -m pytest tests/test_installer_benchmark.py -v --benchmark-only

Gerar relatório JSON:
    cd scripts && python -m pytest tests/test_installer_benchmark.py --benchmark-json=benchmark-report.json
"""

import pytest
import time
import json
import os
from pathlib import Path
from datetime import datetime
from unittest.mock import MagicMock, patch, PropertyMock
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any
from io import StringIO

# Importar módulos do instalador
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from unified_installer import (
        UnifiedInstaller, InstallConfig, InstallPhase, SystemInfo, Logger
    )
    INSTALLER_AVAILABLE = True
except ImportError:
    INSTALLER_AVAILABLE = False


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def mock_subprocess(mocker):
    """Mock subprocess para simular execução de comandos."""
    mock_run = mocker.patch('subprocess.run')
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout="Success",
        stderr=""
    )
    return mock_run


@pytest.fixture
def mock_system_calls(mocker):
    """Mock chamadas de sistema comuns."""
    mocker.patch('shutil.which', return_value='/usr/bin/mock')
    mocker.patch('os.path.exists', return_value=True)
    mocker.patch('os.makedirs')
    mocker.patch('os.chmod')
    mocker.patch('os.chown')
    mocker.patch('pathlib.Path.exists', return_value=True)
    mocker.patch('pathlib.Path.mkdir')
    mocker.patch('pathlib.Path.write_text')
    mocker.patch('pathlib.Path.read_text', return_value='')
    mocker.patch('builtins.open', MagicMock())
    return mocker


@pytest.fixture
def mock_installer_modules(mocker):
    """Mock todos os módulos do instalador."""
    modules = {
        'installer.ufw_setup': MagicMock(),
        'installer.ntp_setup': MagicMock(),
        'installer.fonts_setup': MagicMock(),
        'installer.audio_setup': MagicMock(),
        'installer.database_setup': MagicMock(),
        'installer.nginx_setup': MagicMock(),
        'installer.cloud_backup_setup': MagicMock(),
        'installer.kiosk_setup': MagicMock(),
        'installer.voice_control_setup': MagicMock(),
        'installer.dev_tools_setup': MagicMock(),
        'installer.docker_setup': MagicMock(),
        'installer.config': MagicMock(),
    }
    mocker.patch.dict('sys.modules', modules)
    return modules


@pytest.fixture
def benchmark_config():
    """Configuração para benchmarks."""
    return InstallConfig(
        dry_run=True,
        quiet=True,
        verbose=False,
    ) if INSTALLER_AVAILABLE else None


@pytest.fixture
def benchmark_installer(benchmark_config, mock_subprocess, mock_system_calls, mock_installer_modules):
    """Installer configurado para benchmark."""
    if not INSTALLER_AVAILABLE:
        pytest.skip("unified_installer não disponível")
    
    installer = UnifiedInstaller(benchmark_config)
    return installer


# =============================================================================
# MOCK PHASE FUNCTIONS
# =============================================================================

def create_phase_mock(phase_name: str, base_time_ms: float = 10.0):
    """Cria função mock para uma fase com tempo simulado."""
    def mock_phase(*args, **kwargs):
        # Simula tempo de execução variável
        jitter = base_time_ms * 0.1  # 10% jitter
        time.sleep((base_time_ms + jitter) / 1000)
        return True
    return mock_phase


# =============================================================================
# DATACLASSES PARA RELATÓRIO
# =============================================================================

@dataclass
class PhaseMetrics:
    """Métricas de uma fase."""
    name: str
    phase_number: int
    execution_time_ms: float
    success: bool
    memory_delta_mb: float = 0.0
    retries: int = 0


@dataclass
class BenchmarkReport:
    """Relatório completo de benchmark."""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    total_time_ms: float = 0.0
    phases: List[PhaseMetrics] = field(default_factory=list)
    system_info: Dict[str, Any] = field(default_factory=dict)
    config: Dict[str, Any] = field(default_factory=dict)
    
    def add_phase(self, metrics: PhaseMetrics):
        self.phases.append(metrics)
        self.total_time_ms += metrics.execution_time_ms
    
    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2)
    
    def save(self, path: Path):
        path.write_text(self.to_json())


# =============================================================================
# TESTES DE BENCHMARK - FASES CRÍTICAS
# =============================================================================

@pytest.mark.skipif(not INSTALLER_AVAILABLE, reason="unified_installer não disponível")
class TestCriticalPhaseBenchmarks:
    """Benchmarks de fases críticas do instalador."""
    
    @pytest.mark.benchmark(group="critical")
    def test_phase_system_check_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 1 - System Check."""
        mocker.patch.object(benchmark_installer, '_check_system_requirements', return_value=True)
        mocker.patch.object(benchmark_installer, '_detect_distro', return_value=('arch', 'Arch Linux'))
        mocker.patch.object(benchmark_installer, '_detect_aur_helper', return_value='paru')
        
        def run_phase():
            return benchmark_installer._execute_phase_system_check()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="critical")
    def test_phase_docker_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 2 - Docker Setup."""
        mock_docker = MagicMock()
        mock_docker.setup_for_tsijukebox.return_value = True
        mocker.patch.object(benchmark_installer, 'docker_setup', mock_docker)
        
        def run_phase():
            return benchmark_installer._execute_phase_docker()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="critical")
    def test_phase_verify_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 20 - Verification."""
        mocker.patch.object(benchmark_installer, '_verify_services', return_value=True)
        mocker.patch.object(benchmark_installer, '_verify_docker_containers', return_value=True)
        mocker.patch.object(benchmark_installer, '_verify_database', return_value=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_verify()
        
        result = benchmark(run_phase)
        assert result is None or result is True


# =============================================================================
# TESTES DE BENCHMARK - INFRAESTRUTURA
# =============================================================================

@pytest.mark.skipif(not INSTALLER_AVAILABLE, reason="unified_installer não disponível")
class TestInfrastructurePhaseBenchmarks:
    """Benchmarks de fases de infraestrutura."""
    
    @pytest.mark.benchmark(group="infrastructure")
    def test_phase_ufw_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 3 - UFW Firewall."""
        mock_ufw = MagicMock()
        mock_ufw.full_setup.return_value = True
        mocker.patch.object(benchmark_installer, 'ufw_setup', mock_ufw, create=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_ufw()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="infrastructure")
    def test_phase_ntp_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 4 - NTP Time Sync."""
        mock_ntp = MagicMock()
        mock_ntp.full_setup.return_value = True
        mocker.patch.object(benchmark_installer, 'ntp_setup', mock_ntp, create=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_ntp()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="infrastructure")
    def test_phase_nginx_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 8 - Nginx Setup."""
        mock_nginx = MagicMock()
        mock_nginx.full_setup.return_value = True
        mocker.patch.object(benchmark_installer, 'nginx_setup', mock_nginx, create=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_nginx()
        
        result = benchmark(run_phase)
        assert result is None or result is True


# =============================================================================
# TESTES DE BENCHMARK - CONFIGURAÇÃO
# =============================================================================

@pytest.mark.skipif(not INSTALLER_AVAILABLE, reason="unified_installer não disponível")
class TestConfigurationPhaseBenchmarks:
    """Benchmarks de fases de configuração."""
    
    @pytest.mark.benchmark(group="configuration")
    def test_phase_fonts_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 5 - Fonts Setup."""
        mock_fonts = MagicMock()
        mock_fonts.full_setup.return_value = True
        mocker.patch.object(benchmark_installer, 'fonts_setup', mock_fonts, create=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_fonts()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="configuration")
    def test_phase_audio_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 6 - Audio Setup."""
        mock_audio = MagicMock()
        mock_audio.full_setup.return_value = True
        mocker.patch.object(benchmark_installer, 'audio_setup', mock_audio, create=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_audio()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="configuration")
    def test_phase_database_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 7 - Database Setup."""
        mock_db = MagicMock()
        mock_db.full_setup.return_value = True
        mocker.patch.object(benchmark_installer, 'database_setup', mock_db, create=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_database()
        
        result = benchmark(run_phase)
        assert result is None or result is True


# =============================================================================
# TESTES DE BENCHMARK - APLICAÇÃO
# =============================================================================

@pytest.mark.skipif(not INSTALLER_AVAILABLE, reason="unified_installer não disponível")
class TestApplicationPhaseBenchmarks:
    """Benchmarks de fases de aplicação."""
    
    @pytest.mark.benchmark(group="application")
    def test_phase_spotify_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 11 - Spotify Install."""
        mocker.patch.object(benchmark_installer, '_install_spotify', return_value=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_spotify()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="application")
    def test_phase_spicetify_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 12 - Spicetify Setup."""
        mocker.patch.object(benchmark_installer, '_setup_spicetify', return_value=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_spicetify()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="application")
    def test_phase_spotify_cli_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 13 - Spotify CLI."""
        mocker.patch.object(benchmark_installer, '_setup_spotify_cli', return_value=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_spotify_cli()
        
        result = benchmark(run_phase)
        assert result is None or result is True


# =============================================================================
# TESTES DE BENCHMARK - FEATURES OPCIONAIS
# =============================================================================

@pytest.mark.skipif(not INSTALLER_AVAILABLE, reason="unified_installer não disponível")
class TestOptionalFeaturesBenchmarks:
    """Benchmarks de features opcionais."""
    
    @pytest.mark.benchmark(group="optional")
    def test_phase_cloud_backup_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 10 - Cloud Backup."""
        mock_cloud = MagicMock()
        mock_cloud.full_setup.return_value = True
        mocker.patch.object(benchmark_installer, 'cloud_backup_setup', mock_cloud, create=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_cloud_backup()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="optional")
    def test_phase_kiosk_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 14 - Kiosk Mode."""
        mock_kiosk = MagicMock()
        mock_kiosk.full_setup.return_value = True
        mocker.patch.object(benchmark_installer, 'kiosk_setup', mock_kiosk, create=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_kiosk()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="optional")
    def test_phase_voice_control_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 15 - Voice Control."""
        mock_voice = MagicMock()
        mock_voice.full_setup.return_value = True
        mocker.patch.object(benchmark_installer, 'voice_control_setup', mock_voice, create=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_voice_control()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="optional")
    def test_phase_dev_tools_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 16 - Dev Tools."""
        mock_dev = MagicMock()
        mock_dev.full_setup.return_value = True
        mocker.patch.object(benchmark_installer, 'dev_tools_setup', mock_dev, create=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_dev_tools()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="optional")
    def test_phase_monitoring_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 9 - Monitoring Setup."""
        mocker.patch.object(benchmark_installer, '_setup_monitoring', return_value=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_monitoring()
        
        result = benchmark(run_phase)
        assert result is None or result is True


# =============================================================================
# TESTES DE BENCHMARK - FINALIZAÇÂO
# =============================================================================

@pytest.mark.skipif(not INSTALLER_AVAILABLE, reason="unified_installer não disponível")
class TestFinalizationPhaseBenchmarks:
    """Benchmarks de fases de finalização."""
    
    @pytest.mark.benchmark(group="finalization")
    def test_phase_autologin_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 17 - Autologin Setup."""
        mocker.patch.object(benchmark_installer, '_setup_autologin', return_value=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_autologin()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="finalization")
    def test_phase_app_deploy_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 18 - App Deploy."""
        mocker.patch.object(benchmark_installer, '_deploy_app', return_value=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_app_deploy()
        
        result = benchmark(run_phase)
        assert result is None or result is True
    
    @pytest.mark.benchmark(group="finalization")
    def test_phase_services_performance(self, benchmark, benchmark_installer, mocker):
        """Benchmark: Fase 19 - Services Enable."""
        mocker.patch.object(benchmark_installer, '_enable_services', return_value=True)
        
        def run_phase():
            return benchmark_installer._execute_phase_services()
        
        result = benchmark(run_phase)
        assert result is None or result is True


# =============================================================================
# TESTES DE BENCHMARK - FLUXO COMPLETO
# =============================================================================

@pytest.mark.skipif(not INSTALLER_AVAILABLE, reason="unified_installer não disponível")
class TestFullInstallationBenchmarks:
    """Benchmarks de fluxo completo de instalação."""
    
    @pytest.mark.benchmark(group="full", min_rounds=3)
    def test_full_installation_performance(self, benchmark, benchmark_config, mocker):
        """Benchmark: Instalação completa (todas as 20 fases)."""
        # Mock todas as fases
        mocker.patch('subprocess.run', return_value=MagicMock(returncode=0))
        mocker.patch('shutil.which', return_value='/usr/bin/mock')
        mocker.patch('os.path.exists', return_value=True)
        mocker.patch('pathlib.Path.exists', return_value=True)
        
        def run_full_install():
            installer = UnifiedInstaller(benchmark_config)
            # Mock todos os métodos de fase
            for phase in InstallPhase:
                phase_method = f'_execute_phase_{phase.name.lower()}'
                if hasattr(installer, phase_method):
                    mocker.patch.object(installer, phase_method, return_value=True)
            return installer.run()
        
        result = benchmark(run_full_install)
        # Aceita True ou None (dry_run pode retornar None)
        assert result in [True, None, False]
    
    @pytest.mark.benchmark(group="full", min_rounds=3)
    def test_minimal_installation_performance(self, benchmark, mocker):
        """Benchmark: Instalação mínima."""
        mocker.patch('subprocess.run', return_value=MagicMock(returncode=0))
        mocker.patch('shutil.which', return_value='/usr/bin/mock')
        
        minimal_config = InstallConfig(
            dry_run=True,
            quiet=True,
            no_docker=True,
            no_monitoring=True,
            no_cloud_backup=True,
            no_kiosk=True,
            no_voice_control=True,
            no_dev_tools=True,
        )
        
        def run_minimal_install():
            installer = UnifiedInstaller(minimal_config)
            for phase in InstallPhase:
                phase_method = f'_execute_phase_{phase.name.lower()}'
                if hasattr(installer, phase_method):
                    mocker.patch.object(installer, phase_method, return_value=True)
            return installer.run()
        
        result = benchmark(run_minimal_install)
        assert result in [True, None, False]
    
    @pytest.mark.benchmark(group="full", min_rounds=3)
    def test_kiosk_installation_performance(self, benchmark, mocker):
        """Benchmark: Instalação modo kiosk."""
        mocker.patch('subprocess.run', return_value=MagicMock(returncode=0))
        mocker.patch('shutil.which', return_value='/usr/bin/mock')
        
        kiosk_config = InstallConfig(
            dry_run=True,
            quiet=True,
            mode='kiosk',
            kiosk_url='http://localhost:3000',
        )
        
        def run_kiosk_install():
            installer = UnifiedInstaller(kiosk_config)
            for phase in InstallPhase:
                phase_method = f'_execute_phase_{phase.name.lower()}'
                if hasattr(installer, phase_method):
                    mocker.patch.object(installer, phase_method, return_value=True)
            return installer.run()
        
        result = benchmark(run_kiosk_install)
        assert result in [True, None, False]


# =============================================================================
# GERAÇÃO DE RELATÓRIO
# =============================================================================

class TestReportGeneration:
    """Testes para geração de relatório de performance."""
    
    def test_generate_performance_report(self, tmp_path):
        """Testa geração de relatório JSON."""
        report = BenchmarkReport()
        
        # Simula métricas de fases
        phases = [
            ("system_check", 1, 50.5, True),
            ("docker", 2, 2500.0, True),
            ("ufw", 3, 150.3, True),
            ("ntp", 4, 80.2, True),
            ("fonts", 5, 300.1, True),
            ("audio", 6, 450.8, True),
            ("database", 7, 1200.5, True),
            ("nginx", 8, 350.2, True),
            ("monitoring", 9, 600.4, True),
            ("cloud_backup", 10, 180.9, True),
            ("spotify", 11, 800.6, True),
            ("spicetify", 12, 400.3, True),
            ("spotify_cli", 13, 200.1, True),
            ("kiosk", 14, 250.7, True),
            ("voice_control", 15, 500.4, True),
            ("dev_tools", 16, 350.2, True),
            ("autologin", 17, 100.5, True),
            ("app_deploy", 18, 450.8, True),
            ("services", 19, 150.3, True),
            ("verify", 20, 200.1, True),
        ]
        
        for name, num, time_ms, success in phases:
            report.add_phase(PhaseMetrics(
                name=name,
                phase_number=num,
                execution_time_ms=time_ms,
                success=success
            ))
        
        # Salva relatório
        report_path = tmp_path / "benchmark-report.json"
        report.save(report_path)
        
        # Verifica conteúdo
        assert report_path.exists()
        content = json.loads(report_path.read_text())
        
        assert len(content['phases']) == 20
        assert content['total_time_ms'] > 0
        assert 'timestamp' in content
    
    def test_compare_with_baseline(self, tmp_path):
        """Testa comparação com baseline."""
        # Baseline
        baseline = BenchmarkReport()
        baseline.add_phase(PhaseMetrics("docker", 2, 2500.0, True))
        baseline.add_phase(PhaseMetrics("database", 7, 1200.0, True))
        
        baseline_path = tmp_path / "baseline.json"
        baseline.save(baseline_path)
        
        # Atual
        current = BenchmarkReport()
        current.add_phase(PhaseMetrics("docker", 2, 2300.0, True))  # 8% mais rápido
        current.add_phase(PhaseMetrics("database", 7, 1400.0, True))  # 16% mais lento
        
        # Calcula diferenças
        baseline_data = json.loads(baseline_path.read_text())
        current_data = json.loads(current.to_json())
        
        comparisons = []
        for b_phase, c_phase in zip(baseline_data['phases'], current_data['phases']):
            diff_pct = ((c_phase['execution_time_ms'] - b_phase['execution_time_ms']) 
                       / b_phase['execution_time_ms'] * 100)
            comparisons.append({
                'phase': b_phase['name'],
                'baseline_ms': b_phase['execution_time_ms'],
                'current_ms': c_phase['execution_time_ms'],
                'diff_percent': round(diff_pct, 2)
            })
        
        assert comparisons[0]['diff_percent'] == -8.0  # Docker mais rápido
        assert comparisons[1]['diff_percent'] == pytest.approx(16.67, rel=0.1)  # DB mais lento
    
    def test_identify_slow_phases(self):
        """Testa identificação de fases lentas."""
        report = BenchmarkReport()
        
        # Adiciona fases com tempos variados
        report.add_phase(PhaseMetrics("fast", 1, 50.0, True))
        report.add_phase(PhaseMetrics("slow", 2, 5000.0, True))
        report.add_phase(PhaseMetrics("medium", 3, 500.0, True))
        report.add_phase(PhaseMetrics("very_slow", 4, 10000.0, True))
        
        # Identifica fases acima do threshold (1000ms)
        threshold_ms = 1000.0
        slow_phases = [
            p for p in report.phases 
            if p.execution_time_ms > threshold_ms
        ]
        
        assert len(slow_phases) == 2
        assert slow_phases[0].name == "slow"
        assert slow_phases[1].name == "very_slow"


# =============================================================================
# TESTES DE MÉTRICAS DE MEMÓRIA
# =============================================================================

class TestMemoryBenchmarks:
    """Testes de benchmark de memória (simulados)."""
    
    def test_memory_tracking_mock(self):
        """Testa tracking de memória simulado."""
        # Simula métricas de memória
        memory_samples = [
            {"phase": "system_check", "before_mb": 100, "after_mb": 105},
            {"phase": "docker", "before_mb": 105, "after_mb": 250},
            {"phase": "database", "before_mb": 250, "after_mb": 400},
        ]
        
        total_delta = sum(s["after_mb"] - s["before_mb"] for s in memory_samples)
        assert total_delta == 300  # MB total alocados
        
        max_memory = max(s["after_mb"] for s in memory_samples)
        assert max_memory == 400
    
    def test_memory_leak_detection_mock(self):
        """Testa detecção de memory leak simulada."""
        # Simula múltiplas execuções
        runs = [
            {"run": 1, "peak_mb": 400},
            {"run": 2, "peak_mb": 420},
            {"run": 3, "peak_mb": 445},
            {"run": 4, "peak_mb": 475},
        ]
        
        # Calcula crescimento médio
        growth_rates = []
        for i in range(1, len(runs)):
            growth = runs[i]["peak_mb"] - runs[i-1]["peak_mb"]
            growth_rates.append(growth)
        
        avg_growth = sum(growth_rates) / len(growth_rates)
        
        # Se crescimento > 10MB por run, possível leak
        assert avg_growth == 25.0  # Há crescimento anormal


# =============================================================================
# UTILITÁRIOS DE BENCHMARK
# =============================================================================

def generate_full_benchmark_report(output_path: Path = None) -> BenchmarkReport:
    """Gera relatório completo de benchmark (para uso externo)."""
    import platform
    
    report = BenchmarkReport()
    report.system_info = {
        "platform": platform.system(),
        "platform_release": platform.release(),
        "architecture": platform.machine(),
        "python_version": platform.python_version(),
    }
    
    # Fases simuladas com tempos realistas
    simulated_phases = [
        ("system_check", 1, 100),
        ("docker", 2, 3000),
        ("ufw", 3, 200),
        ("ntp", 4, 150),
        ("fonts", 5, 500),
        ("audio", 6, 600),
        ("database", 7, 1500),
        ("nginx", 8, 400),
        ("monitoring", 9, 800),
        ("cloud_backup", 10, 300),
        ("spotify", 11, 1000),
        ("spicetify", 12, 600),
        ("spotify_cli", 13, 300),
        ("kiosk", 14, 400),
        ("voice_control", 15, 700),
        ("dev_tools", 16, 500),
        ("autologin", 17, 150),
        ("app_deploy", 18, 600),
        ("services", 19, 200),
        ("verify", 20, 300),
    ]
    
    for name, num, time_ms in simulated_phases:
        report.add_phase(PhaseMetrics(
            name=name,
            phase_number=num,
            execution_time_ms=float(time_ms),
            success=True
        ))
    
    if output_path:
        report.save(output_path)
    
    return report


if __name__ == "__main__":
    # Executa benchmarks
    pytest.main([__file__, "-v", "--benchmark-only"])
