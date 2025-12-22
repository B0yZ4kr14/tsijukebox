#!/usr/bin/env python3
"""
TSiJUKEBOX - Database Setup Module
===================================
Configura bancos de dados: SQLite, MariaDB, PostgreSQL.

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import shutil
import subprocess
import secrets
import string
from pathlib import Path
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass
from enum import Enum


class DatabaseType(Enum):
    """Tipos de banco de dados suportados."""
    SQLITE = "sqlite"
    MARIADB = "mariadb"
    POSTGRESQL = "postgresql"


@dataclass
class DatabaseConfig:
    """Configuração do banco de dados."""
    db_type: DatabaseType = DatabaseType.SQLITE
    db_name: str = "tsijukebox"
    db_user: str = "tsijukebox"
    db_password: Optional[str] = None
    db_host: str = "localhost"
    db_port: int = 0  # 0 = usar porta padrão
    data_dir: Path = Path("/var/lib/tsijukebox/db")
    
    # Opções
    create_backup_user: bool = True
    enable_remote: bool = False
    
    def __post_init__(self):
        if self.db_port == 0:
            self.db_port = {
                DatabaseType.SQLITE: 0,
                DatabaseType.MARIADB: 3306,
                DatabaseType.POSTGRESQL: 5432,
            }.get(self.db_type, 0)
        
        if not self.db_password:
            self.db_password = self._generate_password()
    
    def _generate_password(self, length: int = 24) -> str:
        chars = string.ascii_letters + string.digits
        return ''.join(secrets.choice(chars) for _ in range(length))


class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'


class DatabaseSetup:
    """Configura banco de dados para TSiJUKEBOX."""
    
    SQLITE_PACKAGES = ['sqlite']
    MARIADB_PACKAGES = ['mariadb', 'mariadb-clients']
    POSTGRESQL_PACKAGES = ['postgresql', 'postgresql-libs']
    
    def __init__(
        self,
        config: Optional[DatabaseConfig] = None,
        logger: Any = None,
        dry_run: bool = False
    ):
        self.config = config or DatabaseConfig()
        self.logger = logger
        self.dry_run = dry_run
    
    def _log(self, message: str, level: str = "info"):
        if self.logger:
            getattr(self.logger, level, self.logger.info)(message)
        else:
            color = {
                'info': Colors.BLUE,
                'success': Colors.GREEN,
                'warning': Colors.YELLOW,
                'error': Colors.RED,
            }.get(level, Colors.BLUE)
            print(f"{color}[DATABASE]{Colors.RESET} {message}")
    
    def _run(self, cmd: List[str], check: bool = False, input_data: str = None) -> Tuple[int, str, str]:
        if self.dry_run:
            self._log(f"[DRY-RUN] {' '.join(cmd)}", "info")
            return 0, "", ""
        
        try:
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True,
                input=input_data
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return 1, "", str(e)
    
    def _ensure_directories(self):
        """Cria diretórios necessários."""
        if not self.dry_run:
            self.config.data_dir.mkdir(parents=True, exist_ok=True)
    
    def get_recommended_type(self, ram_gb: float) -> DatabaseType:
        """Recomenda tipo de banco baseado na RAM disponível."""
        if ram_gb < 2:
            return DatabaseType.SQLITE
        elif ram_gb < 8:
            return DatabaseType.MARIADB
        else:
            return DatabaseType.POSTGRESQL
    
    # =========================================================================
    # SQLITE
    # =========================================================================
    
    def install_sqlite(self) -> bool:
        """Instala SQLite."""
        self._log("Instalando SQLite...", "info")
        
        if shutil.which('sqlite3'):
            self._log("SQLite já instalado", "info")
            return True
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm'] + self.SQLITE_PACKAGES)
        
        if code != 0:
            self._log(f"Falha ao instalar SQLite: {err}", "error")
            return False
        
        self._log("SQLite instalado", "success")
        return True
    
    def create_sqlite_database(self) -> bool:
        """Cria banco de dados SQLite."""
        self._log(f"Criando banco SQLite: {self.config.db_name}", "info")
        
        db_path = self.config.data_dir / f"{self.config.db_name}.db"
        
        if not self.dry_run:
            self.config.data_dir.mkdir(parents=True, exist_ok=True)
            
            # Criar esquema básico
            schema = """
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS playback_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                track_id TEXT NOT NULL,
                track_name TEXT NOT NULL,
                artist_name TEXT,
                played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                duration_ms INTEGER
            );
            
            CREATE TABLE IF NOT EXISTS backups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                size_bytes INTEGER,
                provider TEXT,
                status TEXT DEFAULT 'pending'
            );
            
            CREATE INDEX IF NOT EXISTS idx_playback_played_at ON playback_history(played_at);
            """
            
            code, _, err = self._run(['sqlite3', str(db_path)], input_data=schema)
            
            if code != 0:
                self._log(f"Falha ao criar esquema: {err}", "error")
                return False
        
        self._log(f"Banco SQLite criado: {db_path}", "success")
        return True
    
    # =========================================================================
    # MARIADB
    # =========================================================================
    
    def install_mariadb(self) -> bool:
        """Instala MariaDB."""
        self._log("Instalando MariaDB...", "info")
        
        if shutil.which('mariadb'):
            self._log("MariaDB já instalado", "info")
            return True
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm'] + self.MARIADB_PACKAGES)
        
        if code != 0:
            self._log(f"Falha ao instalar MariaDB: {err}", "error")
            return False
        
        self._log("MariaDB instalado", "success")
        return True
    
    def initialize_mariadb(self) -> bool:
        """Inicializa MariaDB."""
        self._log("Inicializando MariaDB...", "info")
        
        # Verificar se já inicializado
        mysql_data = Path("/var/lib/mysql")
        if mysql_data.exists() and any(mysql_data.iterdir()):
            self._log("MariaDB já inicializado", "info")
        else:
            # Inicializar diretório de dados
            self._run(['mariadb-install-db', '--user=mysql', '--basedir=/usr', '--datadir=/var/lib/mysql'])
        
        # Iniciar e habilitar serviço
        self._run(['systemctl', 'enable', 'mariadb'])
        self._run(['systemctl', 'start', 'mariadb'])
        
        return True
    
    def secure_mariadb(self, root_password: str) -> bool:
        """Aplica configurações de segurança ao MariaDB."""
        self._log("Aplicando segurança MariaDB...", "info")
        
        # mysql_secure_installation equivalente
        sql_commands = f"""
        -- Definir senha do root
        ALTER USER 'root'@'localhost' IDENTIFIED BY '{root_password}';
        
        -- Remover usuários anônimos
        DELETE FROM mysql.user WHERE User='';
        
        -- Desabilitar login remoto do root
        DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
        
        -- Remover banco de teste
        DROP DATABASE IF EXISTS test;
        DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
        
        -- Aplicar mudanças
        FLUSH PRIVILEGES;
        """
        
        if not self.dry_run:
            self._run(['mariadb', '-u', 'root'], input_data=sql_commands)
        
        self._log("MariaDB seguro", "success")
        return True
    
    def create_mariadb_database(self) -> bool:
        """Cria banco e usuário MariaDB."""
        self._log(f"Criando banco MariaDB: {self.config.db_name}", "info")
        
        sql_commands = f"""
        CREATE DATABASE IF NOT EXISTS {self.config.db_name}
            CHARACTER SET utf8mb4
            COLLATE utf8mb4_unicode_ci;
        
        CREATE USER IF NOT EXISTS '{self.config.db_user}'@'localhost' 
            IDENTIFIED BY '{self.config.db_password}';
        
        GRANT ALL PRIVILEGES ON {self.config.db_name}.* 
            TO '{self.config.db_user}'@'localhost';
        
        FLUSH PRIVILEGES;
        
        USE {self.config.db_name};
        
        CREATE TABLE IF NOT EXISTS settings (
            `key` VARCHAR(255) PRIMARY KEY,
            `value` TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS playback_history (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            track_id VARCHAR(255) NOT NULL,
            track_name VARCHAR(500) NOT NULL,
            artist_name VARCHAR(500),
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            duration_ms INT,
            INDEX idx_played_at (played_at)
        );
        """
        
        if not self.dry_run:
            code, _, err = self._run(['mariadb', '-u', 'root'], input_data=sql_commands)
            
            if code != 0:
                self._log(f"Falha ao criar banco: {err}", "error")
                return False
        
        self._log(f"Banco MariaDB criado: {self.config.db_name}", "success")
        return True
    
    # =========================================================================
    # POSTGRESQL
    # =========================================================================
    
    def install_postgresql(self) -> bool:
        """Instala PostgreSQL."""
        self._log("Instalando PostgreSQL...", "info")
        
        if shutil.which('psql'):
            self._log("PostgreSQL já instalado", "info")
            return True
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm'] + self.POSTGRESQL_PACKAGES)
        
        if code != 0:
            self._log(f"Falha ao instalar PostgreSQL: {err}", "error")
            return False
        
        self._log("PostgreSQL instalado", "success")
        return True
    
    def initialize_postgresql(self) -> bool:
        """Inicializa cluster PostgreSQL."""
        self._log("Inicializando PostgreSQL...", "info")
        
        pg_data = Path("/var/lib/postgres/data")
        
        if pg_data.exists() and any(pg_data.iterdir()):
            self._log("PostgreSQL já inicializado", "info")
        else:
            # Inicializar cluster como usuário postgres
            self._run([
                'sudo', '-u', 'postgres', 'initdb', 
                '--locale=C.UTF-8', 
                '-E', 'UTF8', 
                '-D', str(pg_data)
            ])
        
        # Iniciar e habilitar serviço
        self._run(['systemctl', 'enable', 'postgresql'])
        self._run(['systemctl', 'start', 'postgresql'])
        
        return True
    
    def create_postgresql_database(self) -> bool:
        """Cria banco e usuário PostgreSQL."""
        self._log(f"Criando banco PostgreSQL: {self.config.db_name}", "info")
        
        # Criar usuário
        self._run([
            'sudo', '-u', 'postgres', 'psql', '-c',
            f"CREATE USER {self.config.db_user} WITH PASSWORD '{self.config.db_password}';"
        ])
        
        # Criar banco
        self._run([
            'sudo', '-u', 'postgres', 'psql', '-c',
            f"CREATE DATABASE {self.config.db_name} OWNER {self.config.db_user};"
        ])
        
        # Criar tabelas
        sql_schema = """
        CREATE TABLE IF NOT EXISTS settings (
            key VARCHAR(255) PRIMARY KEY,
            value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS playback_history (
            id BIGSERIAL PRIMARY KEY,
            track_id VARCHAR(255) NOT NULL,
            track_name VARCHAR(500) NOT NULL,
            artist_name VARCHAR(500),
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            duration_ms INTEGER
        );
        
        CREATE INDEX IF NOT EXISTS idx_playback_played_at ON playback_history(played_at);
        """
        
        if not self.dry_run:
            self._run([
                'sudo', '-u', 'postgres', 'psql', '-d', self.config.db_name, '-c', sql_schema
            ])
        
        self._log(f"Banco PostgreSQL criado: {self.config.db_name}", "success")
        return True
    
    # =========================================================================
    # UTILITÁRIOS
    # =========================================================================
    
    def save_credentials(self) -> bool:
        """Salva credenciais em arquivo seguro."""
        creds_file = Path("/etc/tsijukebox/db-credentials.json")
        
        if not self.dry_run:
            creds_file.parent.mkdir(parents=True, exist_ok=True)
            
            import json
            creds = {
                'type': self.config.db_type.value,
                'name': self.config.db_name,
                'user': self.config.db_user,
                'password': self.config.db_password,
                'host': self.config.db_host,
                'port': self.config.db_port,
            }
            
            creds_file.write_text(json.dumps(creds, indent=2))
            creds_file.chmod(0o600)
        
        self._log(f"Credenciais salvas em {creds_file}", "success")
        return True
    
    def create_env_file(self) -> bool:
        """Cria arquivo .env com configuração do banco."""
        env_file = Path("/etc/tsijukebox/.env.database")
        
        if self.config.db_type == DatabaseType.SQLITE:
            db_url = f"sqlite:///{self.config.data_dir}/{self.config.db_name}.db"
        elif self.config.db_type == DatabaseType.MARIADB:
            db_url = f"mysql://{self.config.db_user}:{self.config.db_password}@{self.config.db_host}:{self.config.db_port}/{self.config.db_name}"
        else:
            db_url = f"postgresql://{self.config.db_user}:{self.config.db_password}@{self.config.db_host}:{self.config.db_port}/{self.config.db_name}"
        
        if not self.dry_run:
            env_file.parent.mkdir(parents=True, exist_ok=True)
            
            env_content = f"""# TSiJUKEBOX Database Configuration
DATABASE_TYPE={self.config.db_type.value}
DATABASE_URL={db_url}
DATABASE_NAME={self.config.db_name}
DATABASE_USER={self.config.db_user}
DATABASE_HOST={self.config.db_host}
DATABASE_PORT={self.config.db_port}
"""
            
            env_file.write_text(env_content)
            env_file.chmod(0o600)
        
        self._log(f"Arquivo .env criado: {env_file}", "success")
        return True
    
    # =========================================================================
    # SETUP COMPLETO
    # =========================================================================
    
    def full_setup(self) -> bool:
        """Executa instalação completa do banco de dados."""
        self._log(f"Iniciando configuração de banco: {self.config.db_type.value}", "info")
        
        self._ensure_directories()
        
        if self.config.db_type == DatabaseType.SQLITE:
            if not self.install_sqlite():
                return False
            if not self.create_sqlite_database():
                return False
        
        elif self.config.db_type == DatabaseType.MARIADB:
            if not self.install_mariadb():
                return False
            if not self.initialize_mariadb():
                return False
            if not self.create_mariadb_database():
                return False
        
        elif self.config.db_type == DatabaseType.POSTGRESQL:
            if not self.install_postgresql():
                return False
            if not self.initialize_postgresql():
                return False
            if not self.create_postgresql_database():
                return False
        
        # Salvar credenciais e criar .env
        self.save_credentials()
        self.create_env_file()
        
        self._log("Configuração de banco de dados concluída!", "success")
        return True
    
    def get_status(self) -> Dict[str, Any]:
        """Retorna status do banco de dados."""
        status = {
            'type': self.config.db_type.value,
            'installed': False,
            'running': False,
            'database_exists': False,
        }
        
        if self.config.db_type == DatabaseType.SQLITE:
            status['installed'] = shutil.which('sqlite3') is not None
            db_path = self.config.data_dir / f"{self.config.db_name}.db"
            status['database_exists'] = db_path.exists()
            status['running'] = True  # SQLite é sempre "running"
        
        elif self.config.db_type == DatabaseType.MARIADB:
            status['installed'] = shutil.which('mariadb') is not None
            code, out, _ = self._run(['systemctl', 'is-active', 'mariadb'])
            status['running'] = 'active' in out
        
        elif self.config.db_type == DatabaseType.POSTGRESQL:
            status['installed'] = shutil.which('psql') is not None
            code, out, _ = self._run(['systemctl', 'is-active', 'postgresql'])
            status['running'] = 'active' in out
        
        return status


def main():
    """Ponto de entrada para execução standalone."""
    import argparse
    
    parser = argparse.ArgumentParser(description='TSiJUKEBOX Database Setup')
    parser.add_argument('--type', choices=['sqlite', 'mariadb', 'postgresql'],
                       default='sqlite', help='Tipo de banco de dados')
    parser.add_argument('--name', default='tsijukebox', help='Nome do banco')
    parser.add_argument('--user', default='tsijukebox', help='Usuário do banco')
    parser.add_argument('--password', help='Senha do banco (gerada automaticamente se não fornecida)')
    parser.add_argument('--dry-run', action='store_true', help='Simular sem executar')
    parser.add_argument('--status', action='store_true', help='Mostrar status')
    
    args = parser.parse_args()
    
    config = DatabaseConfig(
        db_type=DatabaseType(args.type),
        db_name=args.name,
        db_user=args.user,
        db_password=args.password,
    )
    
    setup = DatabaseSetup(config=config, dry_run=args.dry_run)
    
    if args.status:
        import json
        status = setup.get_status()
        print(json.dumps(status, indent=2))
        return
    
    success = setup.full_setup()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()
