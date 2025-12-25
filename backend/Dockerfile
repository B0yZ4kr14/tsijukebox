# ═══════════════════════════════════════════════════════════════════════════
# TSiJUKEBOX Backend - Dockerfile
# ═══════════════════════════════════════════════════════════════════════════
# Backend Python com FastAPI e SQLite
# Acesso: https://midiaserver.local/jukebox/api
# 
# @author B0.y_Z4kr14
# @license Public Domain
# ═══════════════════════════════════════════════════════════════════════════

FROM python:3.11-slim-bookworm

# Metadados
LABEL maintainer="B0.y_Z4kr14"
LABEL description="TSiJUKEBOX Backend API"
LABEL version="6.0.0"

# Variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    SQLITE_PATH=/var/lib/tsijukebox/data.db \
    MEDIA_PATH=/var/lib/tsijukebox/media \
    BACKUP_PATH=/var/lib/tsijukebox/backups \
    SECRET_KEY=tsijukebox-secret-key-change-in-production \
    TZ=America/Sao_Paulo

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    # SQLite
    sqlite3 \
    libsqlite3-dev \
    # PostgreSQL client
    postgresql-client \
    libpq-dev \
    # MariaDB client
    mariadb-client \
    libmariadb-dev \
    # Firebird client
    firebird3.0-utils \
    libfbclient2 \
    # Ferramentas
    curl \
    git \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Criar diretórios
RUN mkdir -p /var/lib/tsijukebox/{data,media,backups,logs} \
    && chmod -R 755 /var/lib/tsijukebox

# Diretório de trabalho
WORKDIR /app

# Copiar requirements primeiro (cache de camadas)
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copiar código fonte
COPY . .

# Criar usuário não-root
RUN useradd -m -u 1000 tsijukebox \
    && chown -R tsijukebox:tsijukebox /app /var/lib/tsijukebox

# Trocar para usuário não-root
USER tsijukebox

# Expor porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Comando de inicialização
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
