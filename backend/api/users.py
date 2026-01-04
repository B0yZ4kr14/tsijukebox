"""
TSiJUKEBOX - Users Router
=========================
Gerenciamento de usuários, SSH Keys, GPG Keys e Tokens

@author B0.y_Z4kr14
@license Public Domain
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import os
import subprocess

from models.database import get_db, User, UserSettings
from api.auth import get_current_active_user, require_admin, get_password_hash

router = APIRouter()

# ═══════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class SSHKeyCreate(BaseModel):
    title: str
    public_key: str

class SSHKeyResponse(BaseModel):
    id: int
    title: str
    fingerprint: str
    created_at: datetime

class GPGKeyCreate(BaseModel):
    title: str
    public_key: str

class GPGKeyResponse(BaseModel):
    id: int
    title: str
    key_id: str
    email: str
    created_at: datetime

class GitHubTokenCreate(BaseModel):
    token: str
    scopes: List[str] = ["repo", "read:user"]

class GitHubTokenResponse(BaseModel):
    is_configured: bool
    username: Optional[str] = None
    scopes: List[str] = []
    created_at: Optional[datetime] = None

class APIKeyCreate(BaseModel):
    service: str  # openai, anthropic, gemini, cohere, perplexity, elevenlabs, heygen
    api_key: str

class APIKeyResponse(BaseModel):
    service: str
    is_configured: bool
    last_used: Optional[datetime] = None

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS - USUÁRIOS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Lista todos os usuários (apenas admin)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Obtém um usuário específico (apenas admin)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Atualiza um usuário (apenas admin)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if user_data.email:
        user.email = user_data.email
    if user_data.role:
        user.role = user_data.role
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Exclui um usuário (apenas admin)"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Não é possível excluir o próprio usuário")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    db.delete(user)
    db.commit()
    return {"message": "Usuário excluído com sucesso"}

@router.put("/{user_id}/role")
async def change_user_role(
    user_id: int,
    role: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Altera o role de um usuário (apenas admin)"""
    if role not in ["admin", "user", "newbie"]:
        raise HTTPException(status_code=400, detail="Role inválido. Use: admin, user ou newbie")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user.role = role
    db.commit()
    return {"message": f"Role alterado para {role}", "user_id": user_id}

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS - SSH KEYS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/me/ssh-keys", response_model=List[SSHKeyResponse])
async def list_ssh_keys(current_user: User = Depends(get_current_active_user)):
    """Lista SSH Keys do usuário"""
    ssh_dir = os.path.expanduser("~/.ssh")
    keys = []
    
    if os.path.exists(ssh_dir):
        for filename in os.listdir(ssh_dir):
            if filename.endswith(".pub"):
                filepath = os.path.join(ssh_dir, filename)
                try:
                    # Obter fingerprint
                    result = subprocess.run(
                        ["ssh-keygen", "-lf", filepath],
                        capture_output=True, text=True
                    )
                    if result.returncode == 0:
                        parts = result.stdout.strip().split()
                        fingerprint = parts[1] if len(parts) > 1 else "unknown"
                        keys.append({
                            "id": hash(filename) % 10000,
                            "title": filename.replace(".pub", ""),
                            "fingerprint": fingerprint,
                            "created_at": datetime.fromtimestamp(os.path.getctime(filepath))
                        })
                except Exception:
                    pass
    
    return keys

@router.post("/me/ssh-keys", response_model=SSHKeyResponse)
async def add_ssh_key(
    key_data: SSHKeyCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Adiciona uma nova SSH Key"""
    ssh_dir = os.path.expanduser("~/.ssh")
    os.makedirs(ssh_dir, exist_ok=True)
    os.chmod(ssh_dir, 0o700)
    
    # Sanitizar título
    safe_title = "".join(c for c in key_data.title if c.isalnum() or c in "-_")
    filepath = os.path.join(ssh_dir, f"{safe_title}.pub")
    
    # Validar chave pública
    if not key_data.public_key.startswith(("ssh-rsa", "ssh-ed25519", "ecdsa-sha2")):
        raise HTTPException(status_code=400, detail="Formato de chave SSH inválido")
    
    # Salvar chave
    with open(filepath, "w") as f:
        f.write(key_data.public_key.strip() + "\n")
    os.chmod(filepath, 0o644)
    
    # Adicionar ao authorized_keys
    auth_keys_path = os.path.join(ssh_dir, "authorized_keys")
    with open(auth_keys_path, "a") as f:
        f.write(key_data.public_key.strip() + "\n")
    os.chmod(auth_keys_path, 0o600)
    
    # Obter fingerprint
    result = subprocess.run(
        ["ssh-keygen", "-lf", filepath],
        capture_output=True, text=True
    )
    fingerprint = result.stdout.strip().split()[1] if result.returncode == 0 else "unknown"
    
    return {
        "id": hash(safe_title) % 10000,
        "title": safe_title,
        "fingerprint": fingerprint,
        "created_at": datetime.now()
    }

@router.delete("/me/ssh-keys/{key_title}")
async def delete_ssh_key(
    key_title: str,
    current_user: User = Depends(get_current_active_user)
):
    """Remove uma SSH Key"""
    ssh_dir = os.path.expanduser("~/.ssh")
    filepath = os.path.join(ssh_dir, f"{key_title}.pub")
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="SSH Key não encontrada")
    
    os.remove(filepath)
    return {"message": f"SSH Key '{key_title}' removida com sucesso"}

@router.post("/me/ssh-keys/generate")
async def generate_ssh_key(
    key_type: str = "ed25519",
    comment: str = "tsijukebox@midiaserver.local",
    current_user: User = Depends(get_current_active_user)
):
    """Gera um novo par de chaves SSH"""
    ssh_dir = os.path.expanduser("~/.ssh")
    os.makedirs(ssh_dir, exist_ok=True)
    
    key_name = f"id_{key_type}_tsijukebox"
    key_path = os.path.join(ssh_dir, key_name)
    
    if os.path.exists(key_path):
        raise HTTPException(status_code=400, detail="Chave já existe. Remova antes de gerar nova.")
    
    # Gerar chave
    result = subprocess.run(
        ["ssh-keygen", "-t", key_type, "-C", comment, "-f", key_path, "-N", ""],
        capture_output=True, text=True
    )
    
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar chave: {result.stderr}")
    
    # Ler chave pública
    with open(f"{key_path}.pub", "r") as f:
        public_key = f.read().strip()
    
    return {
        "message": "Chave SSH gerada com sucesso",
        "type": key_type,
        "public_key": public_key,
        "path": f"{key_path}.pub"
    }

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS - GPG KEYS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/me/gpg-keys", response_model=List[GPGKeyResponse])
async def list_gpg_keys(current_user: User = Depends(get_current_active_user)):
    """Lista GPG Keys do usuário"""
    result = subprocess.run(
        ["gpg", "--list-keys", "--keyid-format", "long"],
        capture_output=True, text=True
    )
    
    keys = []
    if result.returncode == 0:
        lines = result.stdout.strip().split("\n")
        current_key = {}
        for line in lines:
            if line.startswith("pub"):
                parts = line.split()
                if len(parts) >= 2:
                    key_info = parts[1].split("/")
                    current_key = {
                        "id": hash(key_info[-1]) % 10000,
                        "key_id": key_info[-1] if len(key_info) > 1 else parts[1],
                        "created_at": datetime.now()
                    }
            elif line.startswith("uid") and current_key:
                # Extrair email
                import re
                email_match = re.search(r'<(.+?)>', line)
                current_key["email"] = email_match.group(1) if email_match else ""
                current_key["title"] = line.replace("uid", "").strip().split("<")[0].strip()
                keys.append(current_key)
                current_key = {}
    
    return keys

@router.post("/me/gpg-keys", response_model=GPGKeyResponse)
async def add_gpg_key(
    key_data: GPGKeyCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Importa uma GPG Key"""
    # Salvar chave temporariamente
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.asc', delete=False) as f:
        f.write(key_data.public_key)
        temp_path = f.name
    
    try:
        # Importar chave
        result = subprocess.run(
            ["gpg", "--import", temp_path],
            capture_output=True, text=True
        )
        
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=f"Erro ao importar GPG Key: {result.stderr}")
        
        # Extrair key_id do output
        import re
        key_id_match = re.search(r'key ([A-F0-9]+):', result.stderr)
        key_id = key_id_match.group(1) if key_id_match else "unknown"
        
        return {
            "id": hash(key_id) % 10000,
            "title": key_data.title,
            "key_id": key_id,
            "email": current_user.email,
            "created_at": datetime.now()
        }
    finally:
        os.unlink(temp_path)

@router.delete("/me/gpg-keys/{key_id}")
async def delete_gpg_key(
    key_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Remove uma GPG Key"""
    result = subprocess.run(
        ["gpg", "--batch", "--yes", "--delete-key", key_id],
        capture_output=True, text=True
    )
    
    if result.returncode != 0:
        raise HTTPException(status_code=400, detail=f"Erro ao remover GPG Key: {result.stderr}")
    
    return {"message": f"GPG Key '{key_id}' removida com sucesso"}

@router.post("/me/gpg-keys/generate")
async def generate_gpg_key(
    name: str,
    email: str,
    passphrase: str = "",
    current_user: User = Depends(get_current_active_user)
):
    """Gera um novo par de chaves GPG"""
    # Criar arquivo de configuração para geração batch
    gpg_config = f"""
%no-protection
Key-Type: RSA
Key-Length: 4096
Subkey-Type: RSA
Subkey-Length: 4096
Name-Real: {name}
Name-Email: {email}
Expire-Date: 0
%commit
"""
    
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.conf', delete=False) as f:
        f.write(gpg_config)
        config_path = f.name
    
    try:
        result = subprocess.run(
            ["gpg", "--batch", "--gen-key", config_path],
            capture_output=True, text=True
        )
        
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Erro ao gerar GPG Key: {result.stderr}")
        
        # Obter a chave pública gerada
        export_result = subprocess.run(
            ["gpg", "--armor", "--export", email],
            capture_output=True, text=True
        )
        
        return {
            "message": "GPG Key gerada com sucesso",
            "name": name,
            "email": email,
            "public_key": export_result.stdout if export_result.returncode == 0 else None
        }
    finally:
        os.unlink(config_path)

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS - GITHUB TOKEN
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/me/github-token", response_model=GitHubTokenResponse)
async def get_github_token_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Verifica status do token GitHub"""
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings or not settings.github_token:
        return {"is_configured": False, "scopes": []}
    
    # Verificar token com a API do GitHub
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"token {settings.github_token}"}
            )
            
            if response.status_code == 200:
                user_data = response.json()
                # Obter scopes do header
                scopes = response.headers.get("X-OAuth-Scopes", "").split(", ")
                return {
                    "is_configured": True,
                    "username": user_data.get("login"),
                    "scopes": [s for s in scopes if s],
                    "created_at": settings.updated_at
                }
    except Exception:
        pass
    
    return {"is_configured": False, "scopes": []}

@router.post("/me/github-token")
async def set_github_token(
    token_data: GitHubTokenCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Configura token GitHub"""
    # Validar token
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"token {token_data.token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Token GitHub inválido")
            
            user_data = response.json()
    except httpx.RequestError:
        raise HTTPException(status_code=500, detail="Erro ao validar token com GitHub")
    
    # Salvar token
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    
    settings.github_token = token_data.token
    db.commit()
    
    # Configurar git global
    subprocess.run(["git", "config", "--global", "user.name", user_data.get("name", user_data["login"])])
    subprocess.run(["git", "config", "--global", "user.email", user_data.get("email", f"{user_data['login']}@users.noreply.github.com")])
    
    return {
        "message": "Token GitHub configurado com sucesso",
        "username": user_data["login"],
        "scopes": token_data.scopes
    }

@router.delete("/me/github-token")
async def delete_github_token(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove token GitHub"""
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if settings:
        settings.github_token = None
        db.commit()
    
    return {"message": "Token GitHub removido com sucesso"}

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS - API KEYS (IA e outros serviços)
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/me/api-keys", response_model=List[APIKeyResponse])
async def list_api_keys(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista status das API Keys configuradas"""
    services = [
        "openai", "anthropic", "gemini", "cohere", "perplexity",
        "elevenlabs", "heygen", "spotify", "youtube"
    ]
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    result = []
    for service in services:
        # Verificar se existe variável de ambiente ou configuração
        env_key = f"{service.upper()}_API_KEY"
        is_configured = bool(os.getenv(env_key))
        
        result.append({
            "service": service,
            "is_configured": is_configured,
            "last_used": None
        })
    
    return result

@router.post("/me/api-keys")
async def set_api_key(
    key_data: APIKeyCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Configura uma API Key"""
    valid_services = [
        "openai", "anthropic", "gemini", "cohere", "perplexity",
        "elevenlabs", "heygen", "spotify", "youtube"
    ]
    
    if key_data.service not in valid_services:
        raise HTTPException(status_code=400, detail=f"Serviço inválido. Use: {', '.join(valid_services)}")
    
    # Salvar em arquivo .env
    env_file = "/var/lib/tsijukebox/.env"
    env_key = f"{key_data.service.upper()}_API_KEY"
    
    # Ler arquivo existente
    env_vars = {}
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            for line in f:
                if "=" in line:
                    k, v = line.strip().split("=", 1)
                    env_vars[k] = v
    
    # Atualizar/adicionar chave
    env_vars[env_key] = key_data.api_key
    
    # Salvar arquivo
    os.makedirs(os.path.dirname(env_file), exist_ok=True)
    with open(env_file, "w") as f:
        for k, v in env_vars.items():
            f.write(f"{k}={v}\n")
    
    # Definir variável de ambiente para sessão atual
    os.environ[env_key] = key_data.api_key
    
    return {"message": f"API Key para {key_data.service} configurada com sucesso"}

@router.delete("/me/api-keys/{service}")
async def delete_api_key(
    service: str,
    current_user: User = Depends(get_current_active_user)
):
    """Remove uma API Key"""
    env_file = "/var/lib/tsijukebox/.env"
    env_key = f"{service.upper()}_API_KEY"
    
    if os.path.exists(env_file):
        env_vars = {}
        with open(env_file, "r") as f:
            for line in f:
                if "=" in line:
                    k, v = line.strip().split("=", 1)
                    if k != env_key:
                        env_vars[k] = v
        
        with open(env_file, "w") as f:
            for k, v in env_vars.items():
                f.write(f"{k}={v}\n")
    
    # Remover da sessão atual
    if env_key in os.environ:
        del os.environ[env_key]
    
    return {"message": f"API Key para {service} removida com sucesso"}
