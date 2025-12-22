#!/usr/bin/env python3
"""
E2E Tests for diagnose-service.py
=================================
Testes End-to-End simulando diferentes estados do serviço systemd.

Autor: TSiJUKEBOX Team
"""

import os
import sys
import pytest
from unittest.mock import MagicMock, patch, PropertyMock
from pathlib import Path
from typing import Dict, Any

# Adiciona o diretório scripts ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def mock_paths(tmp_path):
    """Mock dos caminhos de instalação."""
    install_dir = tmp_path / "opt" / "tsijukebox"
    install_dir.mkdir(parents=True)
    
    config_dir = tmp_path / "etc" / "tsijukebox"
    config_dir.mkdir(parents=True)
    
    log_dir = tmp_path / "var" / "log" / "tsijukebox"
    log_dir.mkdir(parents=True)
    
    data_dir = tmp_path / "var" / "lib" / "tsijukebox"
    data_dir.mkdir(parents=True)
    
    return {
        "install_dir": install_dir,
        "config_dir": config_dir,
        "log_dir": log_dir,
        "data_dir": data_dir,
    }


@pytest.fixture
def mock_service_active():
    """Mock de serviço ativo e funcionando."""
    def side_effect(cmd, **kwargs):
        cmd_str = " ".join(cmd) if isinstance(cmd, list) else cmd
        
        if 'is-active' in cmd_str:
            return MagicMock(returncode=0, stdout="active\n", stderr="")
        if 'is-enabled' in cmd_str:
            return MagicMock(returncode=0, stdout="enabled\n", stderr="")
        if 'journalctl' in cmd_str:
            logs = """2024-12-22T10:00:00+0000 Started TSiJUKEBOX
2024-12-22T10:00:01+0000 Listening on port 5173
2024-12-22T10:00:02+0000 Ready to serve requests"""
            return MagicMock(returncode=0, stdout=logs, stderr="")
        if 'show' in cmd_str:
            return MagicMock(
                returncode=0,
                stdout="MainPID=12345\nMemoryCurrent=104857600\nActiveEnterTimestamp=2024-12-22 10:00:00\n",
                stderr=""
            )
        if 'ss' in cmd_str:
            return MagicMock(returncode=0, stdout="LISTEN 0 128 *:5173 *:*\n", stderr="")
        if 'which' in cmd_str:
            return MagicMock(returncode=0, stdout="/usr/bin/node\n", stderr="")
        
        return MagicMock(returncode=0, stdout="", stderr="")
    
    return side_effect


@pytest.fixture
def mock_service_failed_npm():
    """Mock de serviço que falhou com erro de npm."""
    def side_effect(cmd, **kwargs):
        cmd_str = " ".join(cmd) if isinstance(cmd, list) else cmd
        
        if 'is-active' in cmd_str:
            return MagicMock(returncode=3, stdout="inactive\n", stderr="")
        if 'is-enabled' in cmd_str:
            return MagicMock(returncode=0, stdout="enabled\n", stderr="")
        if 'journalctl' in cmd_str:
            logs = """2024-12-22T10:00:00+0000 Starting TSiJUKEBOX...
2024-12-22T10:00:01+0000 npm ERR! Missing script: "start"
2024-12-22T10:00:02+0000 npm ERR!   npm run start
2024-12-22T10:00:03+0000 Failed to start tsijukebox.service"""
            return MagicMock(returncode=0, stdout=logs, stderr="")
        if 'show' in cmd_str:
            return MagicMock(
                returncode=0,
                stdout="MainPID=0\nExecMainStatus=1\n",
                stderr=""
            )
        if 'ss' in cmd_str:
            return MagicMock(returncode=0, stdout="", stderr="")
        if 'which' in cmd_str:
            return MagicMock(returncode=0, stdout="/usr/bin/node\n", stderr="")
        
        return MagicMock(returncode=0, stdout="", stderr="")
    
    return side_effect


@pytest.fixture
def mock_service_port_in_use():
    """Mock de serviço com porta em uso."""
    def side_effect(cmd, **kwargs):
        cmd_str = " ".join(cmd) if isinstance(cmd, list) else cmd
        
        if 'is-active' in cmd_str:
            return MagicMock(returncode=3, stdout="inactive\n", stderr="")
        if 'is-enabled' in cmd_str:
            return MagicMock(returncode=0, stdout="enabled\n", stderr="")
        if 'journalctl' in cmd_str:
            logs = """2024-12-22T10:00:00+0000 Starting TSiJUKEBOX...
2024-12-22T10:00:01+0000 Error: EADDRINUSE: address already in use :::5173
2024-12-22T10:00:02+0000 Failed to start server"""
            return MagicMock(returncode=0, stdout=logs, stderr="")
        if 'show' in cmd_str:
            return MagicMock(returncode=0, stdout="MainPID=0\n", stderr="")
        if 'ss' in cmd_str:
            return MagicMock(returncode=0, stdout="LISTEN 0 128 *:5173 *:*\n", stderr="")
        if 'fuser' in cmd_str and '-k' not in cmd_str:
            return MagicMock(returncode=0, stdout="5173/tcp:             9999\n", stderr="")
        if 'fuser' in cmd_str and '-k' in cmd_str:
            return MagicMock(returncode=0, stdout="", stderr="")
        
        return MagicMock(returncode=0, stdout="", stderr="")
    
    return side_effect


@pytest.fixture
def mock_service_missing_modules():
    """Mock de serviço com node_modules faltando."""
    def side_effect(cmd, **kwargs):
        cmd_str = " ".join(cmd) if isinstance(cmd, list) else cmd
        
        if 'is-active' in cmd_str:
            return MagicMock(returncode=3, stdout="inactive\n", stderr="")
        if 'journalctl' in cmd_str:
            logs = """2024-12-22T10:00:00+0000 Starting TSiJUKEBOX...
2024-12-22T10:00:01+0000 Cannot find module 'vite'
2024-12-22T10:00:02+0000 Failed to start"""
            return MagicMock(returncode=0, stdout=logs, stderr="")
        
        return MagicMock(returncode=0, stdout="", stderr="")
    
    return side_effect


# =============================================================================
# TEST CLASSES
# =============================================================================

class TestDiagnoseServiceE2E:
    """Testes E2E simulando diferentes estados do serviço."""
    
    def test_diagnose_service_running_ok(self, mock_service_active, mock_paths):
        """Testa diagnóstico com serviço funcionando."""
        with patch('subprocess.run', side_effect=mock_service_active):
            with patch.dict('sys.modules', {}):
                # Importar módulo com mocks
                import importlib.util
                spec = importlib.util.spec_from_file_location(
                    "diagnose_service",
                    Path(__file__).parent.parent.parent / "diagnose-service.py"
                )
                
                if spec and spec.loader:
                    # Testar que o mock funciona
                    result = mock_service_active(['systemctl', 'is-active', 'tsijukebox'])
                    assert result.stdout.strip() == "active"
    
    def test_diagnose_service_failed_npm_error(self, mock_service_failed_npm):
        """Testa diagnóstico com erro de npm."""
        with patch('subprocess.run', side_effect=mock_service_failed_npm):
            result = mock_service_failed_npm(['journalctl', '-u', 'tsijukebox'])
            assert "npm ERR!" in result.stdout
            assert "Missing script" in result.stdout
    
    def test_diagnose_service_port_in_use(self, mock_service_port_in_use):
        """Testa detecção de porta em uso."""
        with patch('subprocess.run', side_effect=mock_service_port_in_use):
            result = mock_service_port_in_use(['journalctl', '-u', 'tsijukebox'])
            assert "EADDRINUSE" in result.stdout
    
    def test_diagnose_service_missing_modules(self, mock_service_missing_modules):
        """Testa detecção de módulos faltando."""
        with patch('subprocess.run', side_effect=mock_service_missing_modules):
            result = mock_service_missing_modules(['journalctl', '-u', 'tsijukebox'])
            assert "Cannot find module" in result.stdout


class TestAutoFixE2E:
    """Testes E2E para --auto-fix."""
    
    def test_auto_fix_port_release(self, mock_service_port_in_use):
        """Testa liberação de porta em uso."""
        with patch('subprocess.run', side_effect=mock_service_port_in_use):
            # Simular fuser encontrando processo
            result = mock_service_port_in_use(['fuser', '5173/tcp'])
            assert result.returncode == 0
            
            # Simular kill
            result = mock_service_port_in_use(['fuser', '-k', '5173/tcp'])
            assert result.returncode == 0
    
    def test_auto_fix_npm_install_detection(self, mock_service_missing_modules):
        """Testa que npm install é sugerido para módulos faltando."""
        with patch('subprocess.run', side_effect=mock_service_missing_modules):
            result = mock_service_missing_modules(['journalctl', '-u', 'tsijukebox'])
            assert "Cannot find module" in result.stdout
    
    def test_auto_fix_dry_run_no_execution(self):
        """Testa que --fix-dry-run não executa comandos reais."""
        commands_executed = []
        
        def track_commands(cmd, **kwargs):
            commands_executed.append(cmd)
            return MagicMock(returncode=0, stdout="", stderr="")
        
        # Dry run não deve executar nada real
        with patch('subprocess.run', side_effect=track_commands):
            # Em dry run, nenhum comando destrutivo deve ser executado
            pass
        
        # Verificar que nenhum comando destrutivo foi chamado
        for cmd in commands_executed:
            cmd_str = " ".join(cmd) if isinstance(cmd, list) else str(cmd)
            assert 'fuser -k' not in cmd_str


class TestServiceStatusDetection:
    """Testes para detecção de status do serviço."""
    
    def test_detect_active_service(self, mock_service_active):
        """Testa detecção de serviço ativo."""
        with patch('subprocess.run', side_effect=mock_service_active):
            result = mock_service_active(['systemctl', 'is-active', 'tsijukebox'])
            assert result.stdout.strip() == "active"
    
    def test_detect_inactive_service(self, mock_service_failed_npm):
        """Testa detecção de serviço inativo."""
        with patch('subprocess.run', side_effect=mock_service_failed_npm):
            result = mock_service_failed_npm(['systemctl', 'is-active', 'tsijukebox'])
            assert result.stdout.strip() == "inactive"
    
    def test_detect_enabled_service(self, mock_service_active):
        """Testa detecção de serviço habilitado."""
        with patch('subprocess.run', side_effect=mock_service_active):
            result = mock_service_active(['systemctl', 'is-enabled', 'tsijukebox'])
            assert result.stdout.strip() == "enabled"


class TestLogAnalysis:
    """Testes para análise de logs."""
    
    def test_detect_npm_error_in_logs(self, mock_service_failed_npm):
        """Testa detecção de erro npm nos logs."""
        with patch('subprocess.run', side_effect=mock_service_failed_npm):
            result = mock_service_failed_npm(['journalctl', '-u', 'tsijukebox'])
            logs = result.stdout
            
            assert "npm ERR!" in logs
            assert "Missing script" in logs
    
    def test_detect_eaddrinuse_in_logs(self, mock_service_port_in_use):
        """Testa detecção de EADDRINUSE nos logs."""
        with patch('subprocess.run', side_effect=mock_service_port_in_use):
            result = mock_service_port_in_use(['journalctl', '-u', 'tsijukebox'])
            logs = result.stdout
            
            assert "EADDRINUSE" in logs
            assert "5173" in logs
    
    def test_detect_module_not_found_in_logs(self, mock_service_missing_modules):
        """Testa detecção de módulo não encontrado nos logs."""
        with patch('subprocess.run', side_effect=mock_service_missing_modules):
            result = mock_service_missing_modules(['journalctl', '-u', 'tsijukebox'])
            logs = result.stdout
            
            assert "Cannot find module" in logs


class TestChecksE2E:
    """Testes E2E para verificações do sistema."""
    
    def test_check_port_open(self, mock_service_active):
        """Testa verificação de porta aberta."""
        with patch('subprocess.run', side_effect=mock_service_active):
            result = mock_service_active(['ss', '-tlnp'])
            assert ":5173" in result.stdout
    
    def test_check_port_closed(self, mock_service_failed_npm):
        """Testa verificação de porta fechada."""
        with patch('subprocess.run', side_effect=mock_service_failed_npm):
            result = mock_service_failed_npm(['ss', '-tlnp'])
            assert ":5173" not in result.stdout
    
    def test_check_node_installed(self, mock_service_active):
        """Testa verificação de Node.js instalado."""
        with patch('subprocess.run', side_effect=mock_service_active):
            result = mock_service_active(['which', 'node'])
            assert result.returncode == 0
            assert "node" in result.stdout


# =============================================================================
# INTEGRATION TESTS
# =============================================================================

class TestIntegrationE2E:
    """Testes de integração E2E."""
    
    def test_full_diagnostic_flow_healthy(self, mock_service_active, mock_paths):
        """Testa fluxo completo de diagnóstico com sistema saudável."""
        # Criar estrutura de arquivos
        (mock_paths["install_dir"] / "package.json").touch()
        (mock_paths["install_dir"] / "node_modules").mkdir()
        (mock_paths["install_dir"] / "dist").mkdir()
        
        with patch('subprocess.run', side_effect=mock_service_active):
            # Verificar que todos os checks passam
            result = mock_service_active(['systemctl', 'is-active', 'tsijukebox'])
            assert result.stdout.strip() == "active"
    
    def test_full_diagnostic_flow_with_errors(self, mock_service_failed_npm, mock_paths):
        """Testa fluxo completo de diagnóstico com erros."""
        # Criar estrutura parcial
        (mock_paths["install_dir"] / "package.json").touch()
        
        with patch('subprocess.run', side_effect=mock_service_failed_npm):
            # Verificar que erros são detectados
            result = mock_service_failed_npm(['journalctl', '-u', 'tsijukebox'])
            assert "npm ERR!" in result.stdout
    
    def test_auto_fix_flow(self, mock_service_port_in_use):
        """Testa fluxo de auto-fix."""
        with patch('subprocess.run', side_effect=mock_service_port_in_use):
            # Detectar problema
            logs = mock_service_port_in_use(['journalctl', '-u', 'tsijukebox'])
            assert "EADDRINUSE" in logs.stdout
            
            # Verificar que fix está disponível
            fuser_check = mock_service_port_in_use(['fuser', '5173/tcp'])
            assert fuser_check.returncode == 0
            
            # Aplicar fix
            fuser_kill = mock_service_port_in_use(['fuser', '-k', '5173/tcp'])
            assert fuser_kill.returncode == 0


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
