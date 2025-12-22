#!/usr/bin/env python3
"""
Testes unitários para database_setup.py
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent / 'installer'))

from database_setup import DatabaseSetup, DatabaseConfig, DatabaseType


class TestDatabaseConfig:
    """Testes para DatabaseConfig."""
    
    def test_default_config(self):
        """Testa configuração padrão."""
        config = DatabaseConfig()
        
        assert config.db_type == DatabaseType.SQLITE
        assert config.db_name == "tsijukebox"
        assert config.db_user == "tsijukebox"
        assert config.db_host == "localhost"
    
    def test_auto_password_generation(self):
        """Testa geração automática de senha."""
        config = DatabaseConfig()
        
        assert config.db_password is not None
        assert len(config.db_password) == 24
    
    def test_custom_password(self):
        """Testa senha customizada."""
        config = DatabaseConfig(db_password="my_secret_password")
        
        assert config.db_password == "my_secret_password"
    
    def test_auto_port_sqlite(self):
        """Testa porta automática para SQLite."""
        config = DatabaseConfig(db_type=DatabaseType.SQLITE)
        
        assert config.db_port == 0
    
    def test_auto_port_mariadb(self):
        """Testa porta automática para MariaDB."""
        config = DatabaseConfig(db_type=DatabaseType.MARIADB)
        
        assert config.db_port == 3306
    
    def test_auto_port_postgresql(self):
        """Testa porta automática para PostgreSQL."""
        config = DatabaseConfig(db_type=DatabaseType.POSTGRESQL)
        
        assert config.db_port == 5432


class TestDatabaseSetup:
    """Testes para DatabaseSetup."""
    
    @pytest.fixture
    def setup_sqlite(self):
        """Fixture para SQLite em dry-run."""
        config = DatabaseConfig(db_type=DatabaseType.SQLITE)
        return DatabaseSetup(config=config, dry_run=True)
    
    @pytest.fixture
    def setup_mariadb(self):
        """Fixture para MariaDB em dry-run."""
        config = DatabaseConfig(db_type=DatabaseType.MARIADB)
        return DatabaseSetup(config=config, dry_run=True)
    
    @pytest.fixture
    def setup_postgresql(self):
        """Fixture para PostgreSQL em dry-run."""
        config = DatabaseConfig(db_type=DatabaseType.POSTGRESQL)
        return DatabaseSetup(config=config, dry_run=True)
    
    def test_init_sqlite(self, setup_sqlite):
        """Testa inicialização com SQLite."""
        assert setup_sqlite.config.db_type == DatabaseType.SQLITE
        assert setup_sqlite.dry_run is True
    
    def test_get_recommended_type_low_ram(self, setup_sqlite):
        """Testa recomendação para pouca RAM."""
        recommended = setup_sqlite.get_recommended_type(1.5)
        assert recommended == DatabaseType.SQLITE
    
    def test_get_recommended_type_medium_ram(self, setup_sqlite):
        """Testa recomendação para RAM média."""
        recommended = setup_sqlite.get_recommended_type(4.0)
        assert recommended == DatabaseType.MARIADB
    
    def test_get_recommended_type_high_ram(self, setup_sqlite):
        """Testa recomendação para muita RAM."""
        recommended = setup_sqlite.get_recommended_type(16.0)
        assert recommended == DatabaseType.POSTGRESQL
    
    def test_install_sqlite_dry_run(self, setup_sqlite):
        """Testa instalação de SQLite em dry-run."""
        result = setup_sqlite.install_sqlite()
        assert result is True
    
    def test_create_sqlite_database_dry_run(self, setup_sqlite):
        """Testa criação de banco SQLite em dry-run."""
        result = setup_sqlite.create_sqlite_database()
        assert result is True
    
    def test_install_mariadb_dry_run(self, setup_mariadb):
        """Testa instalação de MariaDB em dry-run."""
        result = setup_mariadb.install_mariadb()
        assert result is True
    
    def test_install_postgresql_dry_run(self, setup_postgresql):
        """Testa instalação de PostgreSQL em dry-run."""
        result = setup_postgresql.install_postgresql()
        assert result is True
    
    def test_save_credentials_dry_run(self, setup_sqlite):
        """Testa salvamento de credenciais em dry-run."""
        result = setup_sqlite.save_credentials()
        assert result is True
    
    def test_create_env_file_dry_run(self, setup_sqlite):
        """Testa criação de arquivo .env em dry-run."""
        result = setup_sqlite.create_env_file()
        assert result is True
    
    def test_full_setup_sqlite_dry_run(self, setup_sqlite):
        """Testa setup completo SQLite em dry-run."""
        result = setup_sqlite.full_setup()
        assert result is True
    
    @patch('database_setup.subprocess.run')
    @patch('database_setup.shutil.which')
    def test_get_status_sqlite(self, mock_which, mock_run, setup_sqlite):
        """Testa obtenção de status para SQLite."""
        mock_which.return_value = "/usr/bin/sqlite3"
        
        setup_sqlite.dry_run = False
        status = setup_sqlite.get_status()
        
        assert status['type'] == 'sqlite'
        assert status['installed'] is True


class TestDatabaseTypeEnum:
    """Testes para DatabaseType enum."""
    
    def test_enum_values(self):
        """Testa valores do enum."""
        assert DatabaseType.SQLITE.value == "sqlite"
        assert DatabaseType.MARIADB.value == "mariadb"
        assert DatabaseType.POSTGRESQL.value == "postgresql"
    
    def test_enum_from_string(self):
        """Testa criação de enum a partir de string."""
        db_type = DatabaseType("postgresql")
        assert db_type == DatabaseType.POSTGRESQL


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
