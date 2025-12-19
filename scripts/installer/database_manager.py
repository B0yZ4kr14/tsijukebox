#!/usr/bin/env python3
# =============================================================================
# TSiJUKEBOX Enterprise - Database Manager
# Handles SQLite, MariaDB, and PostgreSQL setup
# =============================================================================

import subprocess
import os
import shutil
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from enum import Enum

from config import DatabaseConfig, Config
from utils.logger import Logger

class DatabaseType(Enum):
    """Supported database types."""
    SQLITE = "sqlite"
    MARIADB = "mariadb"
    POSTGRESQL = "postgresql"

@dataclass
class DatabaseStatus:
    """Database service status."""
    db_type: DatabaseType
    installed: bool
    running: bool
    version: str
    port: int
    data_dir: Path

class DatabaseManager:
    """
    Manages database installation and configuration.
    Supports SQLite, MariaDB, and PostgreSQL.
    """
    
    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger or Logger()
        self.config = Config()
    
    def _run_command(
        self, 
        cmd: List[str], 
        sudo: bool = False,
        capture: bool = True
    ) -> tuple[int, str, str]:
        """Run a shell command."""
        if sudo and os.geteuid() != 0:
            cmd = ["sudo"] + cmd
        
        self.logger.debug(f"Running: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                timeout=120
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            self.logger.error(f"Command failed: {e}")
            return 1, "", str(e)
    
    def detect_installed(self) -> Dict[DatabaseType, bool]:
        """Detect which databases are installed."""
        installed = {}
        
        # SQLite - always available
        installed[DatabaseType.SQLITE] = shutil.which("sqlite3") is not None
        
        # MariaDB
        installed[DatabaseType.MARIADB] = (
            shutil.which("mariadb") is not None or
            shutil.which("mysql") is not None
        )
        
        # PostgreSQL
        installed[DatabaseType.POSTGRESQL] = shutil.which("psql") is not None
        
        return installed
    
    def get_status(self, db_type: DatabaseType) -> DatabaseStatus:
        """Get status of a database."""
        installed = self.detect_installed().get(db_type, False)
        running = False
        version = "unknown"
        port = 0
        data_dir = Path("/var/lib")
        
        if db_type == DatabaseType.SQLITE:
            # SQLite doesn't run as a service
            if installed:
                code, out, _ = self._run_command(["sqlite3", "--version"])
                if code == 0:
                    version = out.split()[0]
            data_dir = Path.home() / ".local" / "share" / "tsijukebox"
            
        elif db_type == DatabaseType.MARIADB:
            port = 3306
            data_dir = Path("/var/lib/mysql")
            
            if installed:
                # Check version
                code, out, _ = self._run_command(["mariadb", "--version"])
                if code == 0:
                    version = out.split()[4].rstrip(",") if len(out.split()) > 4 else "unknown"
                
                # Check if running
                code, _, _ = self._run_command(
                    ["systemctl", "is-active", "mariadb"],
                    capture=True
                )
                running = code == 0
                
        elif db_type == DatabaseType.POSTGRESQL:
            port = 5432
            data_dir = Path("/var/lib/postgres/data")
            
            if installed:
                # Check version
                code, out, _ = self._run_command(["psql", "--version"])
                if code == 0:
                    parts = out.split()
                    version = parts[-1] if parts else "unknown"
                
                # Check if running
                code, _, _ = self._run_command(
                    ["systemctl", "is-active", "postgresql"],
                    capture=True
                )
                running = code == 0
        
        return DatabaseStatus(
            db_type=db_type,
            installed=installed,
            running=running,
            version=version,
            port=port,
            data_dir=data_dir
        )
    
    def install(self, db_type: DatabaseType) -> bool:
        """Install a database."""
        self.logger.info(f"Installing {db_type.value}...")
        
        packages = self.config.DATABASE_PACKAGES.get(db_type.value, [])
        
        if not packages:
            self.logger.error(f"Unknown database type: {db_type.value}")
            return False
        
        cmd = ["pacman", "-S", "--noconfirm", "--needed"] + packages
        code, _, err = self._run_command(cmd, sudo=True)
        
        if code == 0:
            self.logger.success(f"{db_type.value} installed successfully")
            return True
        else:
            self.logger.error(f"Installation failed: {err}")
            return False
    
    def start_service(self, db_type: DatabaseType) -> bool:
        """Start database service."""
        if db_type == DatabaseType.SQLITE:
            return True  # No service needed
        
        service_name = {
            DatabaseType.MARIADB: "mariadb",
            DatabaseType.POSTGRESQL: "postgresql"
        }.get(db_type)
        
        if not service_name:
            return False
        
        self.logger.info(f"Starting {service_name} service...")
        
        code, _, err = self._run_command(
            ["systemctl", "start", service_name],
            sudo=True
        )
        
        if code == 0:
            self.logger.success(f"{service_name} started")
            return True
        else:
            self.logger.error(f"Failed to start {service_name}: {err}")
            return False
    
    def enable_service(self, db_type: DatabaseType) -> bool:
        """Enable database service at boot."""
        if db_type == DatabaseType.SQLITE:
            return True
        
        service_name = {
            DatabaseType.MARIADB: "mariadb",
            DatabaseType.POSTGRESQL: "postgresql"
        }.get(db_type)
        
        if not service_name:
            return False
        
        self.logger.info(f"Enabling {service_name} at boot...")
        
        code, _, _ = self._run_command(
            ["systemctl", "enable", service_name],
            sudo=True
        )
        
        return code == 0
    
    def stop_service(self, db_type: DatabaseType) -> bool:
        """Stop database service."""
        if db_type == DatabaseType.SQLITE:
            return True
        
        service_name = {
            DatabaseType.MARIADB: "mariadb",
            DatabaseType.POSTGRESQL: "postgresql"
        }.get(db_type)
        
        if not service_name:
            return False
        
        self.logger.info(f"Stopping {service_name} service...")
        
        code, _, _ = self._run_command(
            ["systemctl", "stop", service_name],
            sudo=True
        )
        
        return code == 0
    
    def initialize_mariadb(self, root_password: Optional[str] = None) -> bool:
        """Initialize MariaDB with secure installation."""
        self.logger.info("Initializing MariaDB...")
        
        # Initialize data directory
        code, _, err = self._run_command(
            ["mariadb-install-db", "--user=mysql", "--basedir=/usr", "--datadir=/var/lib/mysql"],
            sudo=True
        )
        
        if code != 0:
            self.logger.warning(f"MariaDB init warning: {err}")
        
        # Start service
        if not self.start_service(DatabaseType.MARIADB):
            return False
        
        # Secure installation
        if root_password:
            self._secure_mariadb(root_password)
        
        return True
    
    def _secure_mariadb(self, root_password: str) -> bool:
        """Secure MariaDB installation."""
        self.logger.info("Securing MariaDB installation...")
        
        sql_commands = f"""
ALTER USER 'root'@'localhost' IDENTIFIED BY '{root_password}';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
"""
        
        try:
            proc = subprocess.Popen(
                ["sudo", "mariadb"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            _, err = proc.communicate(input=sql_commands.encode())
            
            if proc.returncode == 0:
                self.logger.success("MariaDB secured")
                return True
            else:
                self.logger.warning(f"MariaDB security: {err.decode()}")
                return False
        except Exception as e:
            self.logger.error(f"Failed to secure MariaDB: {e}")
            return False
    
    def initialize_postgresql(self) -> bool:
        """Initialize PostgreSQL."""
        self.logger.info("Initializing PostgreSQL...")
        
        data_dir = Path("/var/lib/postgres/data")
        
        # Check if already initialized
        if data_dir.exists() and any(data_dir.iterdir()):
            self.logger.info("PostgreSQL already initialized")
            return self.start_service(DatabaseType.POSTGRESQL)
        
        # Initialize cluster
        code, _, err = self._run_command(
            ["sudo", "-u", "postgres", "initdb", "-D", str(data_dir)],
            sudo=False
        )
        
        if code != 0:
            self.logger.error(f"PostgreSQL init failed: {err}")
            return False
        
        # Start service
        return self.start_service(DatabaseType.POSTGRESQL)
    
    def create_database(
        self,
        db_type: DatabaseType,
        db_name: str,
        db_user: str,
        db_password: str
    ) -> bool:
        """Create a database and user."""
        self.logger.info(f"Creating database: {db_name}")
        
        if db_type == DatabaseType.SQLITE:
            return self._create_sqlite_database(db_name)
        elif db_type == DatabaseType.MARIADB:
            return self._create_mariadb_database(db_name, db_user, db_password)
        elif db_type == DatabaseType.POSTGRESQL:
            return self._create_postgresql_database(db_name, db_user, db_password)
        
        return False
    
    def _create_sqlite_database(self, db_name: str) -> bool:
        """Create SQLite database file."""
        db_dir = Path.home() / ".local" / "share" / "tsijukebox"
        db_dir.mkdir(parents=True, exist_ok=True)
        
        db_path = db_dir / f"{db_name}.db"
        
        # Create empty database
        code, _, err = self._run_command(
            ["sqlite3", str(db_path), ".databases"],
            capture=True
        )
        
        if code == 0:
            self.logger.success(f"SQLite database created: {db_path}")
            return True
        else:
            self.logger.error(f"Failed to create SQLite database: {err}")
            return False
    
    def _create_mariadb_database(
        self, 
        db_name: str, 
        db_user: str, 
        db_password: str
    ) -> bool:
        """Create MariaDB database and user."""
        sql = f"""
CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '{db_user}'@'localhost' IDENTIFIED BY '{db_password}';
GRANT ALL PRIVILEGES ON `{db_name}`.* TO '{db_user}'@'localhost';
FLUSH PRIVILEGES;
"""
        
        try:
            proc = subprocess.Popen(
                ["sudo", "mariadb"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            _, err = proc.communicate(input=sql.encode())
            
            if proc.returncode == 0:
                self.logger.success(f"MariaDB database '{db_name}' created")
                return True
            else:
                self.logger.error(f"MariaDB error: {err.decode()}")
                return False
        except Exception as e:
            self.logger.error(f"Failed to create MariaDB database: {e}")
            return False
    
    def _create_postgresql_database(
        self, 
        db_name: str, 
        db_user: str, 
        db_password: str
    ) -> bool:
        """Create PostgreSQL database and user."""
        commands = [
            f"CREATE USER {db_user} WITH PASSWORD '{db_password}';",
            f"CREATE DATABASE {db_name} OWNER {db_user};",
            f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};"
        ]
        
        for sql in commands:
            code, _, err = self._run_command(
                ["sudo", "-u", "postgres", "psql", "-c", sql],
                sudo=False
            )
            
            if code != 0 and "already exists" not in err:
                self.logger.error(f"PostgreSQL error: {err}")
                return False
        
        self.logger.success(f"PostgreSQL database '{db_name}' created")
        return True
    
    def backup_database(
        self,
        db_type: DatabaseType,
        db_name: str,
        backup_path: Path
    ) -> bool:
        """Create a database backup."""
        self.logger.info(f"Backing up database: {db_name}")
        
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        
        if db_type == DatabaseType.SQLITE:
            db_path = Path.home() / ".local" / "share" / "tsijukebox" / f"{db_name}.db"
            if db_path.exists():
                shutil.copy2(db_path, backup_path)
                return True
            return False
            
        elif db_type == DatabaseType.MARIADB:
            code, out, err = self._run_command(
                ["mysqldump", "--single-transaction", db_name],
                capture=True
            )
            if code == 0:
                backup_path.write_text(out)
                return True
            return False
            
        elif db_type == DatabaseType.POSTGRESQL:
            code, out, err = self._run_command(
                ["sudo", "-u", "postgres", "pg_dump", db_name],
                sudo=False,
                capture=True
            )
            if code == 0:
                backup_path.write_text(out)
                return True
            return False
        
        return False
    
    def get_recommended_database(self, ram_gb: float) -> DatabaseType:
        """Get recommended database based on system RAM."""
        if ram_gb < self.config.RAM_THRESHOLD_LOW:
            return DatabaseType.SQLITE
        elif ram_gb < self.config.RAM_THRESHOLD_MEDIUM:
            return DatabaseType.MARIADB
        else:
            return DatabaseType.POSTGRESQL


def main():
    """Test database manager functionality."""
    dm = DatabaseManager()
    
    print("=== Database Manager Test ===\n")
    
    # Check installed databases
    print("Installed databases:")
    for db_type, installed in dm.detect_installed().items():
        status_icon = "✓" if installed else "✗"
        print(f"  {status_icon} {db_type.value}")
        
        if installed:
            status = dm.get_status(db_type)
            print(f"      Version: {status.version}")
            if db_type != DatabaseType.SQLITE:
                running = "running" if status.running else "stopped"
                print(f"      Status: {running}")
                print(f"      Port: {status.port}")
    
    print()
    
    # Get recommendation
    try:
        import psutil
        ram_gb = psutil.virtual_memory().total / (1024**3)
        recommended = dm.get_recommended_database(ram_gb)
        print(f"Recommended for {ram_gb:.1f}GB RAM: {recommended.value}")
    except ImportError:
        print("Install psutil for RAM-based recommendations")


if __name__ == "__main__":
    main()
