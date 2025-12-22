"""
TSiJUKEBOX Installer - BackupManager Tests
==========================================
Tests for the BackupManager class.
"""

import json
from pathlib import Path
from unittest.mock import patch

import pytest

# Import from conftest
from conftest import (
    CommandRunner,
    Logger,
)
import conftest

# Get BackupManager from docker_install module
BackupManager = conftest.docker_install.BackupManager


# =============================================================================
# INITIALIZATION TESTS
# =============================================================================

@pytest.mark.unit
class TestBackupManagerInit:
    """Tests for BackupManager initialization."""
    
    def test_init_default_directories(self):
        """Test default directories are set correctly."""
        manager = BackupManager()
        
        assert manager.backup_dir is not None
        assert manager.compose_dir is not None
        assert manager.data_dir is not None
        assert manager.max_backups == 10


# =============================================================================
# CREATE BACKUP TESTS
# =============================================================================

@pytest.mark.unit
class TestBackupManagerCreateBackup:
    """Tests for create_backup method."""
    
    def test_create_backup_success(self, mock_command_runner, mock_logger, temp_dir: Path):
        """Test successful backup creation."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"
        
        # Create some config files
        manager.compose_dir.mkdir(parents=True)
        (manager.compose_dir / "docker-compose.yml").write_text("version: '3.9'")
        (manager.compose_dir / ".env").write_text("PORT=80")
        
        result = manager.create_backup(include_volumes=False)
        
        assert result is not None
        assert result.exists()
        assert (result / "metadata.json").exists()
    
    def test_create_backup_with_volumes(self, mock_command_runner, mock_logger, temp_dir: Path):
        """Test backup creation with volumes."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        
        manager.compose_dir.mkdir(parents=True)
        (manager.compose_dir / "docker-compose.yml").write_text("version: '3.9'")
        
        result = manager.create_backup(include_volumes=True)
        
        assert result is not None
    
    def test_create_backup_includes_metadata(self, mock_command_runner, mock_logger, temp_dir: Path):
        """Test backup includes metadata file."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.compose_dir.mkdir(parents=True)
        
        result = manager.create_backup(include_volumes=False)
        
        metadata_file = result / "metadata.json"
        assert metadata_file.exists()
        
        metadata = json.loads(metadata_file.read_text())
        assert "created_at" in metadata
        assert "version" in metadata
        assert "hostname" in metadata


# =============================================================================
# RESTORE BACKUP TESTS
# =============================================================================

@pytest.mark.unit
class TestBackupManagerRestoreBackup:
    """Tests for restore_backup method."""
    
    def test_restore_backup_success(self, mock_command_runner, mock_logger, temp_dir: Path):
        """Test successful backup restoration."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        
        # Create a backup directory with config
        backup_path = temp_dir / "backups" / "test_backup"
        config_backup = backup_path / "config"
        config_backup.mkdir(parents=True)
        (config_backup / "docker-compose.yml").write_text("version: '3.9'")
        (config_backup / ".env").write_text("PORT=8080")
        
        result = manager.restore_backup(backup_path)
        
        assert result is True
        assert (manager.compose_dir / "docker-compose.yml").exists()
    
    def test_restore_backup_not_found(self, mock_logger, temp_dir: Path):
        """Test restore fails when backup not found."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        
        result = manager.restore_backup(temp_dir / "nonexistent")
        
        assert result is False


# =============================================================================
# LIST BACKUPS TESTS
# =============================================================================

@pytest.mark.unit
class TestBackupManagerListBackups:
    """Tests for list_backups method."""
    
    def test_list_backups_with_backups(self, temp_dir: Path):
        """Test listing existing backups."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.backup_dir.mkdir(parents=True)
        
        # Create some backup directories
        for i in range(3):
            backup_path = manager.backup_dir / f"tsijukebox_backup_2024010{i}_120000"
            backup_path.mkdir()
            metadata = {"created_at": f"2024-01-0{i}T12:00:00", "version": "5.1.0"}
            (backup_path / "metadata.json").write_text(json.dumps(metadata))
        
        result = manager.list_backups()
        
        assert len(result) == 3
    
    def test_list_backups_empty(self, temp_dir: Path):
        """Test listing when no backups exist."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        
        result = manager.list_backups()
        
        assert result == []
    
    def test_list_backups_ignores_non_backup_dirs(self, temp_dir: Path):
        """Test that non-backup directories are ignored."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.backup_dir.mkdir(parents=True)
        
        # Create a non-backup directory
        (manager.backup_dir / "random_dir").mkdir()
        
        # Create a valid backup
        backup_path = manager.backup_dir / "tsijukebox_backup_20240101_120000"
        backup_path.mkdir()
        
        result = manager.list_backups()
        
        assert len(result) == 1


# =============================================================================
# DELETE BACKUP TESTS
# =============================================================================

@pytest.mark.unit
class TestBackupManagerDeleteBackup:
    """Tests for delete_backup method."""
    
    def test_delete_backup_success(self, mock_logger, temp_dir: Path):
        """Test successful backup deletion."""
        manager = BackupManager()
        
        # Create a backup directory
        backup_path = temp_dir / "test_backup"
        backup_path.mkdir()
        (backup_path / "file.txt").write_text("test")
        
        result = manager.delete_backup(backup_path)
        
        assert result is True
        assert not backup_path.exists()
    
    def test_delete_backup_not_found(self, mock_logger, temp_dir: Path):
        """Test delete fails when backup not found."""
        manager = BackupManager()
        
        result = manager.delete_backup(temp_dir / "nonexistent")
        
        assert result is False


# =============================================================================
# BACKUP CONFIG FILES TESTS
# =============================================================================

@pytest.mark.unit
class TestBackupManagerBackupConfigFiles:
    """Tests for backup_config_files method."""
    
    def test_backup_config_files_success(self, temp_dir: Path):
        """Test successful config files backup."""
        manager = BackupManager()
        manager.compose_dir = temp_dir / "docker"
        manager.compose_dir.mkdir(parents=True)
        
        # Create config files
        (manager.compose_dir / "docker-compose.yml").write_text("version: '3.9'")
        (manager.compose_dir / ".env").write_text("PORT=80")
        
        # Create nginx dir
        nginx_dir = manager.compose_dir / "nginx"
        nginx_dir.mkdir()
        (nginx_dir / "nginx.conf").write_text("events {}")
        
        backup_path = temp_dir / "backup"
        result = manager.backup_config_files(backup_path)
        
        assert result is True
        assert (backup_path / "config" / "docker-compose.yml").exists()
        assert (backup_path / "config" / ".env").exists()
        assert (backup_path / "config" / "nginx" / "nginx.conf").exists()
    
    def test_backup_config_files_missing_compose_dir(self, temp_dir: Path):
        """Test backup when compose dir doesn't exist."""
        manager = BackupManager()
        manager.compose_dir = temp_dir / "nonexistent"
        
        backup_path = temp_dir / "backup"
        result = manager.backup_config_files(backup_path)
        
        assert result is True  # Should still succeed, just nothing to backup


# =============================================================================
# BACKUP/RESTORE DOCKER VOLUMES TESTS
# =============================================================================

@pytest.mark.unit
class TestBackupManagerDockerVolumes:
    """Tests for Docker volume backup/restore methods."""
    
    def test_backup_docker_volumes_success(self, mock_command_runner, temp_dir: Path):
        """Test successful volume backup."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = BackupManager()
        backup_path = temp_dir / "backup"
        
        result = manager.backup_docker_volumes(backup_path)
        
        assert result is True
    
    def test_backup_docker_volumes_volume_not_found(self, mock_command_runner, temp_dir: Path):
        """Test volume backup when volume doesn't exist."""
        mock_command_runner.return_value = (1, "", "No such volume")
        
        manager = BackupManager()
        backup_path = temp_dir / "backup"
        
        result = manager.backup_docker_volumes(backup_path)
        
        # Should succeed but skip missing volumes
        assert result is True
    
    def test_restore_docker_volumes_success(self, mock_command_runner, temp_dir: Path):
        """Test successful volume restoration."""
        mock_command_runner.return_value = (0, "", "")
        
        manager = BackupManager()
        
        # Create backup with volume tar
        backup_path = temp_dir / "backup"
        volumes_backup = backup_path / "volumes"
        volumes_backup.mkdir(parents=True)
        (volumes_backup / "tsijukebox-data.tar").write_bytes(b"fake tar data")
        
        result = manager.restore_docker_volumes(backup_path)
        
        assert result is True
    
    def test_restore_docker_volumes_no_volumes_dir(self, mock_logger, temp_dir: Path):
        """Test restore when no volumes directory exists."""
        manager = BackupManager()
        
        backup_path = temp_dir / "backup"
        backup_path.mkdir()
        
        result = manager.restore_docker_volumes(backup_path)
        
        assert result is False


# =============================================================================
# GET BACKUP INFO TESTS
# =============================================================================

@pytest.mark.unit
class TestBackupManagerGetBackupInfo:
    """Tests for get_backup_info method."""
    
    def test_get_backup_info_with_metadata(self, temp_dir: Path):
        """Test getting backup info with metadata."""
        manager = BackupManager()
        
        backup_path = temp_dir / "backup"
        backup_path.mkdir()
        
        metadata = {
            "created_at": "2024-01-01T12:00:00",
            "version": "5.1.0",
            "include_volumes": True
        }
        (backup_path / "metadata.json").write_text(json.dumps(metadata))
        
        result = manager.get_backup_info(backup_path)
        
        assert result is not None
        assert result["version"] == "5.1.0"
        assert result["include_volumes"] is True
        assert "size_mb" in result
    
    def test_get_backup_info_without_metadata(self, temp_dir: Path):
        """Test getting backup info without metadata file."""
        manager = BackupManager()
        
        backup_path = temp_dir / "backup"
        backup_path.mkdir()
        
        result = manager.get_backup_info(backup_path)
        
        assert result is not None
        assert result["version"] == "unknown"
    
    def test_get_backup_info_invalid_json(self, temp_dir: Path):
        """Test getting backup info with invalid JSON."""
        manager = BackupManager()
        
        backup_path = temp_dir / "backup"
        backup_path.mkdir()
        (backup_path / "metadata.json").write_text("invalid json")
        
        result = manager.get_backup_info(backup_path)
        
        assert result is None


# =============================================================================
# CLEANUP OLD BACKUPS TESTS
# =============================================================================

@pytest.mark.unit
class TestBackupManagerCleanupOldBackups:
    """Tests for cleanup_old_backups method."""
    
    def test_cleanup_old_backups_removes_excess(self, mock_logger, temp_dir: Path):
        """Test cleanup removes old backups."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.backup_dir.mkdir(parents=True)
        
        # Create 7 backups
        for i in range(7):
            backup_path = manager.backup_dir / f"tsijukebox_backup_2024010{i}_120000"
            backup_path.mkdir()
            metadata = {"created_at": f"2024-01-0{i}T12:00:00", "version": "5.1.0"}
            (backup_path / "metadata.json").write_text(json.dumps(metadata))
        
        removed = manager.cleanup_old_backups(keep_count=3)
        
        assert removed == 4
        assert len(list(manager.backup_dir.iterdir())) == 3
    
    def test_cleanup_old_backups_keeps_all_when_under_limit(self, mock_logger, temp_dir: Path):
        """Test cleanup keeps all when under limit."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.backup_dir.mkdir(parents=True)
        
        # Create 2 backups
        for i in range(2):
            backup_path = manager.backup_dir / f"tsijukebox_backup_2024010{i}_120000"
            backup_path.mkdir()
            metadata = {"created_at": f"2024-01-0{i}T12:00:00", "version": "5.1.0"}
            (backup_path / "metadata.json").write_text(json.dumps(metadata))
        
        removed = manager.cleanup_old_backups(keep_count=5)
        
        assert removed == 0
        assert len(list(manager.backup_dir.iterdir())) == 2
