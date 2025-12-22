#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - BackupManager Integration Tests
=======================================================
Integration tests that perform real backup/restore operations.
Requires Docker for volume tests.

Run integration tests:
    pytest tests/ -m "integration" -v

Run Docker-specific tests:
    pytest tests/ -m "docker" -v
"""

import json
import subprocess
from pathlib import Path
from unittest.mock import patch

import pytest

from conftest import BackupManager


# ============================================
# Integration Tests: Config Backup/Restore
# ============================================


@pytest.mark.integration
class TestBackupManagerIntegrationConfigs:
    """Integration tests for config backup/restore with real files."""

    def test_create_backup_real_configs(self, temp_dir: Path):
        """Test creating real backup with config files."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"

        # Create real config structure
        manager.compose_dir.mkdir(parents=True)
        manager.data_dir.mkdir(parents=True)

        # Create docker-compose.yml
        (manager.compose_dir / "docker-compose.yml").write_text(
            """version: '3.9'
services:
  app:
    image: nginx:alpine
    ports:
      - "80:80"
    environment:
      - ENV=production
"""
        )

        # Create .env file
        (manager.compose_dir / ".env").write_text(
            """PORT=80
DOMAIN=localhost
SECRET_KEY=test123
"""
        )

        # Create nginx config directory
        nginx_dir = manager.compose_dir / "nginx"
        nginx_dir.mkdir()
        (nginx_dir / "nginx.conf").write_text(
            """events { worker_connections 1024; }
http {
    server {
        listen 80;
        location / { return 200 'OK'; }
    }
}
"""
        )

        # Execute backup without volumes
        with patch.object(manager, "_get_docker_volumes", return_value=[]):
            result = manager.create_backup(include_volumes=False)

        # Verify backup was created
        assert result is not None
        assert result.exists()

        # Verify metadata
        metadata_file = result / "metadata.json"
        assert metadata_file.exists()
        metadata = json.loads(metadata_file.read_text())
        assert metadata["include_volumes"] is False
        assert "created_at" in metadata

        # Verify config files were backed up
        config_dir = result / "config"
        assert config_dir.exists()
        assert (config_dir / "docker-compose.yml").exists()
        assert (config_dir / ".env").exists()
        assert (config_dir / "nginx" / "nginx.conf").exists()

        # Verify content integrity
        compose_content = (config_dir / "docker-compose.yml").read_text()
        assert "nginx:alpine" in compose_content

    def test_restore_backup_real_configs(self, temp_dir: Path):
        """Test restoring real backup to filesystem."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"

        # Create initial config
        manager.compose_dir.mkdir(parents=True)
        original_content = "version: '3.9'\nservices:\n  web:\n    image: nginx\n"
        (manager.compose_dir / "docker-compose.yml").write_text(original_content)
        (manager.compose_dir / ".env").write_text("KEY=value")

        # Create backup
        with patch.object(manager, "_get_docker_volumes", return_value=[]):
            backup_path = manager.create_backup(include_volumes=False)

        # Modify original files
        (manager.compose_dir / "docker-compose.yml").write_text("MODIFIED CONTENT")
        (manager.compose_dir / ".env").write_text("MODIFIED=true")

        # Restore backup
        result = manager.restore_backup(backup_path)

        # Verify restoration
        assert result is True
        assert (manager.compose_dir / "docker-compose.yml").read_text() == original_content
        assert (manager.compose_dir / ".env").read_text() == "KEY=value"

    def test_full_backup_restore_cycle(self, temp_dir: Path):
        """Test complete backup -> modify -> restore cycle."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"

        # Setup
        manager.compose_dir.mkdir(parents=True)
        manager.data_dir.mkdir(parents=True)

        # Create complex config structure
        configs = {
            "docker-compose.yml": "version: '3.9'\nservices:\n  app:\n    image: app:v1",
            ".env": "VERSION=1.0.0\nDEBUG=false",
            "config/app.json": '{"name": "tsijukebox", "version": "1.0"}',
        }

        for path, content in configs.items():
            file_path = manager.compose_dir / path
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(content)

        # Create backup
        with patch.object(manager, "_get_docker_volumes", return_value=[]):
            backup1 = manager.create_backup(include_volumes=False)

        assert backup1 is not None

        # Modify files (simulating updates)
        (manager.compose_dir / "docker-compose.yml").write_text(
            "version: '3.9'\nservices:\n  app:\n    image: app:v2"
        )
        (manager.compose_dir / ".env").write_text("VERSION=2.0.0\nDEBUG=true")

        # Create second backup
        with patch.object(manager, "_get_docker_volumes", return_value=[]):
            backup2 = manager.create_backup(include_volumes=False)

        # List backups
        backups = manager.list_backups()
        assert len(backups) == 2

        # Restore to first backup
        result = manager.restore_backup(backup1)
        assert result is True

        # Verify v1 content restored
        assert "app:v1" in (manager.compose_dir / "docker-compose.yml").read_text()
        assert "VERSION=1.0.0" in (manager.compose_dir / ".env").read_text()

    def test_cleanup_old_backups_real(self, temp_dir: Path):
        """Test cleanup removes oldest backups with real files."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"

        # Setup
        manager.compose_dir.mkdir(parents=True)
        (manager.compose_dir / "docker-compose.yml").write_text("version: '3.9'")

        # Create multiple backups
        import time

        backup_paths = []
        for i in range(5):
            with patch.object(manager, "_get_docker_volumes", return_value=[]):
                backup = manager.create_backup(include_volumes=False)
                backup_paths.append(backup)
            time.sleep(0.1)  # Ensure different timestamps

        # Verify 5 backups exist
        assert len(manager.list_backups()) == 5

        # Cleanup, keeping only 2
        removed = manager.cleanup_old_backups(keep_count=2)

        # Verify 3 were removed
        assert removed == 3
        assert len(manager.list_backups()) == 2

        # Verify newest backups kept
        remaining = manager.list_backups()
        remaining_paths = [Path(b["path"]) for b in remaining]
        assert backup_paths[-1] in remaining_paths
        assert backup_paths[-2] in remaining_paths


# ============================================
# Integration Tests: Docker Volumes
# ============================================


@pytest.mark.integration
@pytest.mark.docker
class TestBackupManagerIntegrationDocker:
    """Integration tests requiring Docker."""

    @pytest.fixture(autouse=True)
    def check_docker(self):
        """Skip if Docker is not available."""
        try:
            result = subprocess.run(
                ["docker", "info"],
                capture_output=True,
                timeout=10,
            )
            if result.returncode != 0:
                pytest.skip("Docker not available")
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pytest.skip("Docker not available")

    def test_backup_docker_volumes_real(self, temp_dir: Path):
        """Test real Docker volume backup."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"
        manager.backup_dir.mkdir(parents=True)

        volume_name = "tsijukebox_test_backup_volume"

        # Cleanup any existing test volume
        subprocess.run(
            ["docker", "volume", "rm", "-f", volume_name],
            capture_output=True,
        )

        try:
            # Create volume
            subprocess.run(["docker", "volume", "create", volume_name], check=True)

            # Add test data to volume
            subprocess.run(
                [
                    "docker",
                    "run",
                    "--rm",
                    "-v",
                    f"{volume_name}:/data",
                    "alpine",
                    "sh",
                    "-c",
                    "echo 'test backup data' > /data/test.txt && echo 'more data' > /data/info.txt",
                ],
                check=True,
            )

            # Create backup path
            backup_path = temp_dir / "test_volume_backup"
            backup_path.mkdir(parents=True)

            # Backup volume using manager method
            with patch.object(manager, "_get_docker_volumes", return_value=[volume_name]):
                result = manager.backup_docker_volumes(backup_path)

            assert result is True

            # Verify backup file exists
            volume_backup = backup_path / "volumes" / f"{volume_name}.tar"
            assert volume_backup.exists()
            assert volume_backup.stat().st_size > 0

        finally:
            # Cleanup
            subprocess.run(
                ["docker", "volume", "rm", "-f", volume_name],
                capture_output=True,
            )

    def test_restore_docker_volumes_real(self, temp_dir: Path):
        """Test real Docker volume restore."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"

        volume_name = "tsijukebox_test_restore_volume"

        # Cleanup
        subprocess.run(
            ["docker", "volume", "rm", "-f", volume_name],
            capture_output=True,
        )

        try:
            # Create volume with data
            subprocess.run(["docker", "volume", "create", volume_name], check=True)
            subprocess.run(
                [
                    "docker",
                    "run",
                    "--rm",
                    "-v",
                    f"{volume_name}:/data",
                    "alpine",
                    "sh",
                    "-c",
                    "echo 'original data' > /data/original.txt",
                ],
                check=True,
            )

            # Backup
            backup_path = temp_dir / "restore_test_backup"
            backup_path.mkdir(parents=True)
            with patch.object(manager, "_get_docker_volumes", return_value=[volume_name]):
                manager.backup_docker_volumes(backup_path)

            # Modify volume data
            subprocess.run(
                [
                    "docker",
                    "run",
                    "--rm",
                    "-v",
                    f"{volume_name}:/data",
                    "alpine",
                    "sh",
                    "-c",
                    "rm /data/original.txt && echo 'modified' > /data/new.txt",
                ],
                check=True,
            )

            # Restore
            with patch.object(manager, "_get_docker_volumes", return_value=[volume_name]):
                result = manager.restore_docker_volumes(backup_path)

            assert result is True

            # Verify original data restored
            verify_result = subprocess.run(
                [
                    "docker",
                    "run",
                    "--rm",
                    "-v",
                    f"{volume_name}:/data",
                    "alpine",
                    "cat",
                    "/data/original.txt",
                ],
                capture_output=True,
                text=True,
            )
            assert "original data" in verify_result.stdout

        finally:
            subprocess.run(
                ["docker", "volume", "rm", "-f", volume_name],
                capture_output=True,
            )

    def test_full_backup_restore_with_volumes(self, temp_dir: Path):
        """Test complete backup/restore cycle including Docker volumes."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"

        volume_name = "tsijukebox_test_full_cycle_volume"

        # Setup directories
        manager.compose_dir.mkdir(parents=True)
        manager.data_dir.mkdir(parents=True)

        # Cleanup
        subprocess.run(
            ["docker", "volume", "rm", "-f", volume_name],
            capture_output=True,
        )

        try:
            # Create config files
            (manager.compose_dir / "docker-compose.yml").write_text(
                f"""version: '3.9'
services:
  db:
    image: postgres:15
    volumes:
      - {volume_name}:/var/lib/postgresql/data
volumes:
  {volume_name}:
"""
            )

            # Create volume with data
            subprocess.run(["docker", "volume", "create", volume_name], check=True)
            subprocess.run(
                [
                    "docker",
                    "run",
                    "--rm",
                    "-v",
                    f"{volume_name}:/data",
                    "alpine",
                    "sh",
                    "-c",
                    "echo 'database simulation' > /data/db.dat",
                ],
                check=True,
            )

            # Create full backup
            with patch.object(manager, "_get_docker_volumes", return_value=[volume_name]):
                backup_path = manager.create_backup(include_volumes=True)

            assert backup_path is not None
            assert backup_path.exists()

            # Verify backup contents
            assert (backup_path / "metadata.json").exists()
            assert (backup_path / "config" / "docker-compose.yml").exists()
            assert (backup_path / "volumes" / f"{volume_name}.tar").exists()

            # Modify everything
            (manager.compose_dir / "docker-compose.yml").write_text("MODIFIED")
            subprocess.run(
                [
                    "docker",
                    "run",
                    "--rm",
                    "-v",
                    f"{volume_name}:/data",
                    "alpine",
                    "sh",
                    "-c",
                    "rm /data/db.dat && echo 'corrupted' > /data/bad.txt",
                ],
                check=True,
            )

            # Restore everything
            with patch.object(manager, "_get_docker_volumes", return_value=[volume_name]):
                result = manager.restore_backup(backup_path)

            assert result is True

            # Verify configs restored
            compose = (manager.compose_dir / "docker-compose.yml").read_text()
            assert "postgres:15" in compose

            # Verify volume data restored
            verify = subprocess.run(
                [
                    "docker",
                    "run",
                    "--rm",
                    "-v",
                    f"{volume_name}:/data",
                    "alpine",
                    "cat",
                    "/data/db.dat",
                ],
                capture_output=True,
                text=True,
            )
            assert "database simulation" in verify.stdout

        finally:
            subprocess.run(
                ["docker", "volume", "rm", "-f", volume_name],
                capture_output=True,
            )


# ============================================
# Integration Tests: Edge Cases
# ============================================


@pytest.mark.integration
class TestBackupManagerIntegrationEdgeCases:
    """Integration tests for edge cases and error handling."""

    def test_backup_empty_directory(self, temp_dir: Path):
        """Test backup of empty config directory."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"

        manager.compose_dir.mkdir(parents=True)
        # Empty directory, no files

        with patch.object(manager, "_get_docker_volumes", return_value=[]):
            result = manager.create_backup(include_volumes=False)

        # Should still create backup with metadata
        assert result is not None
        assert (result / "metadata.json").exists()

    def test_backup_with_symlinks(self, temp_dir: Path):
        """Test backup handles symlinks correctly."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"

        manager.compose_dir.mkdir(parents=True)

        # Create real file and symlink
        real_file = manager.compose_dir / "real.conf"
        real_file.write_text("real config")

        link_file = manager.compose_dir / "link.conf"
        link_file.symlink_to(real_file)

        with patch.object(manager, "_get_docker_volumes", return_value=[]):
            result = manager.create_backup(include_volumes=False)

        assert result is not None
        # Real file should be backed up
        assert (result / "config" / "real.conf").exists()

    def test_restore_nonexistent_backup(self, temp_dir: Path):
        """Test restore fails gracefully for non-existent backup."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"

        fake_backup = temp_dir / "nonexistent_backup"

        result = manager.restore_backup(fake_backup)
        assert result is False

    def test_list_backups_with_corrupted_metadata(self, temp_dir: Path):
        """Test list_backups handles corrupted metadata."""
        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"

        # Create valid backup
        manager.compose_dir.mkdir(parents=True)
        (manager.compose_dir / "docker-compose.yml").write_text("version: '3.9'")

        with patch.object(manager, "_get_docker_volumes", return_value=[]):
            valid_backup = manager.create_backup(include_volumes=False)

        # Create corrupted backup manually
        corrupted = manager.backup_dir / "backup_corrupted"
        corrupted.mkdir(parents=True)
        (corrupted / "metadata.json").write_text("not valid json {{{")

        # Should list valid backup, handle corrupted gracefully
        backups = manager.list_backups()

        # At least the valid backup should be listed
        assert len(backups) >= 1
        valid_paths = [b["path"] for b in backups if "error" not in b.get("name", "")]
        assert str(valid_backup) in valid_paths

    def test_concurrent_backup_creation(self, temp_dir: Path):
        """Test creating multiple backups in quick succession."""
        import threading
        import time

        manager = BackupManager()
        manager.backup_dir = temp_dir / "backups"
        manager.compose_dir = temp_dir / "docker"
        manager.data_dir = temp_dir / "data"

        manager.compose_dir.mkdir(parents=True)
        (manager.compose_dir / "docker-compose.yml").write_text("version: '3.9'")

        results = []
        errors = []

        def create_backup():
            try:
                time.sleep(0.01)  # Small delay to ensure unique timestamps
                with patch.object(manager, "_get_docker_volumes", return_value=[]):
                    result = manager.create_backup(include_volumes=False)
                results.append(result)
            except Exception as e:
                errors.append(e)

        threads = [threading.Thread(target=create_backup) for _ in range(3)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # All should succeed
        assert len(errors) == 0
        assert len(results) == 3
        assert all(r is not None for r in results)

        # All should be unique
        assert len(set(str(r) for r in results)) == 3
