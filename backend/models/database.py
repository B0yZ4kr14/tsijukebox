"""
TSiJUKEBOX - Database Models
============================
Configuração do SQLAlchemy com SQLite

@author B0.y_Z4kr14
@license Public Domain
"""

import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Base para os modelos
Base = declarative_base()

# Variáveis globais
engine = None
SessionLocal = None

def init_db(database_path: str = "/var/lib/tsijukebox/data.db"):
    """Inicializa o banco de dados SQLite"""
    global engine, SessionLocal
    
    # Cria diretório se não existir
    os.makedirs(os.path.dirname(database_path), exist_ok=True)
    
    # Cria engine
    database_url = f"sqlite:///{database_path}"
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
        echo=False
    )
    
    # Cria sessão
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Cria tabelas
    Base.metadata.create_all(bind=engine)
    
    return engine

def get_db():
    """Dependency para obter sessão do banco"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ═══════════════════════════════════════════════════════════════════════════
# MODELOS
# ═══════════════════════════════════════════════════════════════════════════

class User(Base):
    """Modelo de usuário"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # admin, user, newbie
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    playlists = relationship("Playlist", back_populates="owner")
    settings = relationship("UserSettings", back_populates="user", uselist=False)

class Track(Base):
    """Modelo de música"""
    __tablename__ = "tracks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    artist = Column(String(255))
    album = Column(String(255))
    duration = Column(Integer)  # segundos
    file_path = Column(String(500))
    source = Column(String(50))  # local, spotify, youtube
    source_id = Column(String(255))  # ID externo
    cover_url = Column(String(500))
    lyrics = Column(Text)
    play_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    playlist_tracks = relationship("PlaylistTrack", back_populates="track")

class Playlist(Base):
    """Modelo de playlist"""
    __tablename__ = "playlists"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    cover_url = Column(String(500))
    is_public = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    owner = relationship("User", back_populates="playlists")
    tracks = relationship("PlaylistTrack", back_populates="playlist")

class PlaylistTrack(Base):
    """Associação playlist-track"""
    __tablename__ = "playlist_tracks"
    
    id = Column(Integer, primary_key=True, index=True)
    playlist_id = Column(Integer, ForeignKey("playlists.id"))
    track_id = Column(Integer, ForeignKey("tracks.id"))
    position = Column(Integer)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    playlist = relationship("Playlist", back_populates="tracks")
    track = relationship("Track", back_populates="playlist_tracks")

class UserSettings(Base):
    """Configurações do usuário"""
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    theme = Column(String(50), default="stage-neon-metallic")
    language = Column(String(10), default="pt-BR")
    volume = Column(Float, default=0.8)
    equalizer_preset = Column(String(50), default="flat")
    spotify_token = Column(Text)
    youtube_token = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User", back_populates="settings")

class SystemSettings(Base):
    """Configurações do sistema"""
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text)
    description = Column(String(255))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Backup(Base):
    """Registro de backups"""
    __tablename__ = "backups"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    size_bytes = Column(Integer)
    backup_type = Column(String(50))  # auto, manual, migration
    status = Column(String(20), default="completed")  # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

class Migration(Base):
    """Registro de migrações de banco"""
    __tablename__ = "migrations"
    
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(50), nullable=False)
    description = Column(String(255))
    source_engine = Column(String(50))  # sqlite, postgresql, mariadb, firebird
    target_engine = Column(String(50))
    status = Column(String(20), default="completed")
    executed_at = Column(DateTime, default=datetime.utcnow)

class MediaLibrary(Base):
    """Biblioteca de mídia local"""
    __tablename__ = "media_library"
    
    id = Column(Integer, primary_key=True, index=True)
    directory_path = Column(String(500), nullable=False)
    name = Column(String(255))
    total_files = Column(Integer, default=0)
    total_size_bytes = Column(Integer, default=0)
    last_scan = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SSHKey(Base):
    """Chaves SSH dos usuários"""
    __tablename__ = "ssh_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100), nullable=False)
    key_type = Column(String(20), nullable=False)  # ed25519, rsa, ecdsa
    public_key = Column(Text, nullable=False)
    fingerprint = Column(String(100), nullable=False)
    github_key_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime)

class GPGKey(Base):
    """Chaves GPG dos usuários"""
    __tablename__ = "gpg_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    key_id = Column(String(50), nullable=False)
    fingerprint = Column(String(100), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    public_key = Column(Text, nullable=False)
    github_key_id = Column(Integer)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class APIToken(Base):
    """Tokens de API (GitHub, etc)"""
    __tablename__ = "api_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100), nullable=False)
    service = Column(String(50), nullable=False)  # github, spotify, youtube
    token_encrypted = Column(Text, nullable=False)
    scopes = Column(Text)  # JSON array
    expires_at = Column(DateTime)
    last_used_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class BackupConfig(Base):
    """Configurações de backup"""
    __tablename__ = "backup_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(20), nullable=False)  # local, aws_s3, google_drive, dropbox, onedrive, mega, storj, github
    name = Column(String(100), nullable=False)
    config_encrypted = Column(Text, nullable=False)
    enabled = Column(Boolean, default=True)
    schedule_cron = Column(String(100))
    retention_days = Column(Integer, default=30)
    max_backups = Column(Integer, default=10)
    compression = Column(Boolean, default=True)
    encryption = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class IntegrationConfig(Base):
    """Configurações de integrações (Spotify, YouTube, etc)"""
    __tablename__ = "integration_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    service = Column(String(50), unique=True, nullable=False)  # spotify, youtube, youtube_music, github
    credentials_encrypted = Column(Text)
    enabled = Column(Boolean, default=False)
    connected = Column(Boolean, default=False)
    last_connected_at = Column(DateTime)
    account_info = Column(Text)  # JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Theme(Base):
    """Temas personalizados"""
    __tablename__ = "themes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text)
    colors = Column(Text, nullable=False)  # JSON
    fonts = Column(Text)  # JSON
    border_radius = Column(String(20), default="8px")
    shadows = Column(Text)  # JSON
    author = Column(String(100))
    version = Column(String(20), default="1.0.0")
    is_builtin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    """Log de auditoria"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(50), nullable=False)  # login, logout, create, update, delete
    resource_type = Column(String(50))  # user, playlist, track, backup
    resource_id = Column(Integer)
    details = Column(Text)  # JSON
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
