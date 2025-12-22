#!/usr/bin/env python3
"""
Testes unitários para cloud_backup_setup.py
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent / 'installer'))

from cloud_backup_setup import CloudBackupSetup, CloudBackupConfig, CloudProvider


class TestCloudBackupConfig:
    """Testes para CloudBackupConfig."""
    
    def test_default_config(self):
        """Testa configuração padrão."""
        config = CloudBackupConfig()
        
        assert CloudProvider.RCLONE in config.providers
        assert config.backup_dir == Path("/var/backups/tsijukebox")
        assert config.schedule_enabled is True
        assert config.schedule_cron == "0 3 * * *"
    
    def test_custom_providers(self):
        """Testa configuração com múltiplos providers."""
        config = CloudBackupConfig(
            providers=[CloudProvider.RCLONE, CloudProvider.STORJ, CloudProvider.AWS_S3]
        )
        
        assert len(config.providers) == 3
        assert CloudProvider.STORJ in config.providers


class TestCloudBackupSetup:
    """Testes para CloudBackupSetup."""
    
    @pytest.fixture
    def setup(self):
        """Fixture que cria CloudBackupSetup em modo dry-run."""
        return CloudBackupSetup(dry_run=True)
    
    def test_init_default(self, setup):
        """Testa inicialização padrão."""
        assert setup.dry_run is True
        assert CloudProvider.RCLONE in setup.config.providers
    
    @patch('cloud_backup_setup.shutil.which')
    def test_install_rclone_already_installed(self, mock_which, setup):
        """Testa detecção de rclone já instalado."""
        mock_which.return_value = "/usr/bin/rclone"
        
        setup.dry_run = False
        result = setup.install_rclone()
        
        assert result is True
    
    def test_install_rclone_dry_run(self, setup):
        """Testa instalação de rclone em dry-run."""
        result = setup.install_rclone()
        assert result is True
    
    def test_install_storj_uplink_dry_run(self, setup):
        """Testa instalação de Storj Uplink em dry-run."""
        result = setup.install_storj_uplink()
        assert result is True
    
    def test_install_aws_cli_dry_run(self, setup):
        """Testa instalação de AWS CLI em dry-run."""
        result = setup.install_aws_cli()
        assert result is True
    
    def test_install_mega_dry_run(self, setup):
        """Testa instalação de MEGA tools em dry-run."""
        result = setup.install_mega()
        assert result is True
    
    def test_create_rclone_backup_script_dry_run(self, setup):
        """Testa criação de script de backup em dry-run."""
        result = setup.create_rclone_backup_script()
        assert result is True
    
    def test_setup_cron_backup_dry_run(self, setup):
        """Testa configuração de backup agendado em dry-run."""
        result = setup.setup_cron_backup()
        assert result is True
    
    def test_full_setup_dry_run(self, setup):
        """Testa setup completo em dry-run."""
        result = setup.full_setup()
        assert result is True
    
    @patch('cloud_backup_setup.subprocess.run')
    @patch('cloud_backup_setup.shutil.which')
    def test_get_status(self, mock_which, mock_run, setup):
        """Testa obtenção de status."""
        mock_which.side_effect = lambda x: f"/usr/bin/{x}" if x in ['rclone', 'aws'] else None
        mock_run.return_value = MagicMock(returncode=0, stdout="inactive", stderr="")
        
        setup.dry_run = False
        status = setup.get_status()
        
        assert 'rclone' in status
        assert 'storj' in status
        assert 'aws' in status
        assert 'mega' in status


class TestCloudProviderEnum:
    """Testes para CloudProvider enum."""
    
    def test_enum_values(self):
        """Testa valores do enum."""
        assert CloudProvider.RCLONE.value == "rclone"
        assert CloudProvider.STORJ.value == "storj"
        assert CloudProvider.AWS_S3.value == "aws_s3"
        assert CloudProvider.MEGA.value == "mega"
    
    def test_all_providers(self):
        """Testa que todos os providers esperados existem."""
        providers = [p.value for p in CloudProvider]
        
        assert "rclone" in providers
        assert "storj" in providers
        assert "aws_s3" in providers
        assert "mega" in providers
        assert "google_drive" in providers
        assert "dropbox" in providers


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
