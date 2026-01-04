#!/usr/bin/env python3
"""
TSiJUKEBOX Backend API
======================
Backend Python com FastAPI e SQLite

Acesso: https://midiaserver.local/jukebox/api
Login padrão: admin / admin

@author B0.y_Z4kr14
@license Public Domain
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import jwt
import bcrypt

from models.database import init_db, get_db, SessionLocal
from models.user import User
from models.settings import SystemSettings
from models.track import Track, Playlist
from api import auth, users, settings, tracks, playlists, system

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURAÇÃO
# ═══════════════════════════════════════════════════════════════════════════

# Configurações do ambiente
DATABASE_PATH = os.getenv("SQLITE_PATH", "/var/lib/tsijukebox/data.db")
SECRET_KEY = os.getenv("SECRET_KEY", "tsijukebox-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("tsijukebox")

# ═══════════════════════════════════════════════════════════════════════════
# LIFESPAN (STARTUP/SHUTDOWN)
# ═══════════════════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia ciclo de vida da aplicação"""
    # Startup
    logger.info("🎵 TSiJUKEBOX Backend iniciando...")
    logger.info(f"📁 Database: {DATABASE_PATH}")
    
    # Inicializa banco de dados
    init_db(DATABASE_PATH)
    
    # Cria usuário admin padrão se não existir
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            hashed_password = bcrypt.hashpw("admin".encode(), bcrypt.gensalt())
            admin = User(
                username="admin",
                email="admin@midiaserver.local",
                hashed_password=hashed_password.decode(),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            logger.info("👤 Usuário admin criado (admin/admin)")
    finally:
        db.close()
    
    logger.info("✅ TSiJUKEBOX Backend pronto!")
    logger.info("🌐 Acesso: https://midiaserver.local/jukebox/api")
    
    yield
    
    # Shutdown
    logger.info("🛑 TSiJUKEBOX Backend encerrando...")

# ═══════════════════════════════════════════════════════════════════════════
# APLICAÇÃO FASTAPI
# ═══════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="TSiJUKEBOX API",
    description="""
    🎵 **TSiJUKEBOX** - Sistema de Jukebox Inteligente
    
    Backend Python com FastAPI e SQLite para gerenciamento de:
    - 👤 Usuários e autenticação
    - 🎵 Músicas e playlists
    - ⚙️ Configurações do sistema
    - 📊 Métricas e monitoramento
    
    **Acesso**: https://midiaserver.local/jukebox
    
    **Login padrão**: admin / admin
    
    🐍 Don't Tread On Me
    """,
    version="6.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://midiaserver.local",
        "https://localhost",
        "http://localhost:5173",  # Dev
        "https://tsijukebox.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════════════════
# ROTAS
# ═══════════════════════════════════════════════════════════════════════════

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
app.include_router(users.router, prefix="/api/users", tags=["Usuários"])
app.include_router(settings.router, prefix="/api/settings", tags=["Configurações"])
app.include_router(tracks.router, prefix="/api/tracks", tags=["Músicas"])
app.include_router(playlists.router, prefix="/api/playlists", tags=["Playlists"])
app.include_router(system.router, prefix="/api/system", tags=["Sistema"])

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS RAIZ
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api")
async def root():
    """Endpoint raiz da API"""
    return {
        "name": "TSiJUKEBOX API",
        "version": "6.0.0",
        "status": "online",
        "database": "SQLite",
        "docs": "/api/docs",
        "access": "https://midiaserver.local/jukebox",
        "message": "🐍 Don't Tread On Me"
    }

@app.get("/api/health")
async def health_check():
    """Verificação de saúde da API"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected",
        "version": "6.0.0"
    }

# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
