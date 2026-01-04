"""
TSiJUKEBOX - Router de Integração GitHub
Gerenciamento de SSH Keys, GPG Keys, Tokens e Sincronização
Endereço: https://midiaserver.local/jukebox
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum
import os
import subprocess
import asyncio

router = APIRouter(prefix="/api/github", tags=["GitHub Integration"])

# ═══════════════════════════════════════════════════════════════════════════════
# 📋 SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════════

class SSHKeyType(str, Enum):
    ED25519 = "ed25519"
    RSA = "rsa"
    ECDSA = "ecdsa"

class GPGKeyType(str, Enum):
    RSA = "rsa"
    DSA = "dsa"
    ECDSA = "ecdsa"
    EDDSA = "eddsa"

class SSHKeyCreate(BaseModel):
    """Criar nova SSH Key"""
    key_type: SSHKeyType = SSHKeyType.ED25519
    comment: str = "tsijukebox@midiaserver.local"
    passphrase: Optional[str] = None
    bits: int = 4096  # Para RSA

class SSHKey(BaseModel):
    """SSH Key"""
    id: str
    key_type: SSHKeyType
    public_key: str
    fingerprint: str
    comment: str
    created_at: datetime
    added_to_github: bool = False
    github_key_id: Optional[int] = None

class GPGKeyCreate(BaseModel):
    """Criar nova GPG Key"""
    key_type: GPGKeyType = GPGKeyType.RSA
    name: str
    email: str
    comment: Optional[str] = "TSiJUKEBOX"
    passphrase: str
    expire_days: int = 365
    bits: int = 4096

class GPGKey(BaseModel):
    """GPG Key"""
    id: str
    key_id: str
    fingerprint: str
    name: str
    email: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    added_to_github: bool = False
    github_key_id: Optional[int] = None

class GitHubToken(BaseModel):
    """Token GitHub"""
    token: str
    name: str = "TSiJUKEBOX"
    scopes: List[str] = ["repo", "read:user", "user:email", "read:gpg_key", "write:gpg_key"]

class GitHubUser(BaseModel):
    """Usuário GitHub"""
    id: int
    login: str
    name: Optional[str]
    email: Optional[str]
    avatar_url: str
    html_url: str
    public_repos: int
    private_repos: int
    followers: int
    following: int

class GitHubRepository(BaseModel):
    """Repositório GitHub"""
    id: int
    name: str
    full_name: str
    description: Optional[str]
    private: bool
    html_url: str
    clone_url: str
    ssh_url: str
    default_branch: str
    created_at: datetime
    updated_at: datetime
    pushed_at: Optional[datetime]
    size: int
    stargazers_count: int
    forks_count: int

class SyncConfig(BaseModel):
    """Configuração de sincronização"""
    repository: str  # Ex: "user/repo"
    branch: str = "main"
    auto_sync: bool = True
    sync_interval_minutes: int = 30
    sync_playlists: bool = True
    sync_settings: bool = True
    sync_themes: bool = True
    sign_commits: bool = False
    gpg_key_id: Optional[str] = None

class CommitInfo(BaseModel):
    """Informações de commit"""
    sha: str
    message: str
    author: str
    date: datetime
    signed: bool = False

# ═══════════════════════════════════════════════════════════════════════════════
# 🔑 ENDPOINTS - SSH KEYS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/ssh-keys")
async def list_ssh_keys():
    """Lista todas as SSH Keys locais"""
    ssh_dir = os.path.expanduser("~/.ssh")
    keys = []
    
    if os.path.exists(ssh_dir):
        for filename in os.listdir(ssh_dir):
            if filename.endswith(".pub"):
                key_path = os.path.join(ssh_dir, filename)
                with open(key_path, "r") as f:
                    public_key = f.read().strip()
                
                # Extrair fingerprint
                try:
                    result = subprocess.run(
                        ["ssh-keygen", "-lf", key_path],
                        capture_output=True, text=True
                    )
                    fingerprint = result.stdout.split()[1] if result.returncode == 0 else "unknown"
                except:
                    fingerprint = "unknown"
                
                keys.append({
                    "id": filename.replace(".pub", ""),
                    "filename": filename,
                    "public_key": public_key,
                    "fingerprint": fingerprint,
                    "path": key_path
                })
    
    return {"keys": keys, "total": len(keys)}

@router.post("/ssh-keys/generate")
async def generate_ssh_key(config: SSHKeyCreate):
    """Gera uma nova SSH Key"""
    ssh_dir = os.path.expanduser("~/.ssh")
    os.makedirs(ssh_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    key_name = f"tsijukebox_{timestamp}"
    key_path = os.path.join(ssh_dir, key_name)
    
    # Comando ssh-keygen
    cmd = ["ssh-keygen", "-t", config.key_type.value, "-C", config.comment, "-f", key_path, "-N", config.passphrase or ""]
    
    if config.key_type == SSHKeyType.RSA:
        cmd.extend(["-b", str(config.bits)])
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Erro ao gerar chave: {result.stderr}")
        
        # Ler chave pública
        with open(f"{key_path}.pub", "r") as f:
            public_key = f.read().strip()
        
        # Obter fingerprint
        fp_result = subprocess.run(
            ["ssh-keygen", "-lf", f"{key_path}.pub"],
            capture_output=True, text=True
        )
        fingerprint = fp_result.stdout.split()[1] if fp_result.returncode == 0 else "unknown"
        
        return {
            "status": "generated",
            "key_name": key_name,
            "public_key": public_key,
            "fingerprint": fingerprint,
            "path": key_path,
            "instructions": "Adicione esta chave pública ao GitHub em Settings > SSH and GPG keys"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ssh-keys/{key_id}/add-to-github")
async def add_ssh_key_to_github(key_id: str, title: str = "TSiJUKEBOX"):
    """Adiciona SSH Key ao GitHub via API"""
    # TODO: Implementar com PyGithub
    return {
        "status": "added",
        "key_id": key_id,
        "github_key_id": 12345,
        "title": title
    }

@router.delete("/ssh-keys/{key_id}")
async def delete_ssh_key(key_id: str, remove_from_github: bool = False):
    """Remove uma SSH Key"""
    ssh_dir = os.path.expanduser("~/.ssh")
    key_path = os.path.join(ssh_dir, key_id)
    pub_path = f"{key_path}.pub"
    
    try:
        if os.path.exists(key_path):
            os.remove(key_path)
        if os.path.exists(pub_path):
            os.remove(pub_path)
        
        return {"status": "deleted", "key_id": key_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ═══════════════════════════════════════════════════════════════════════════════
# 🔐 ENDPOINTS - GPG KEYS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/gpg-keys")
async def list_gpg_keys():
    """Lista todas as GPG Keys"""
    try:
        result = subprocess.run(
            ["gpg", "--list-secret-keys", "--keyid-format=long"],
            capture_output=True, text=True
        )
        
        keys = []
        # Parse output
        lines = result.stdout.split("\n")
        current_key = {}
        
        for line in lines:
            if line.startswith("sec"):
                if current_key:
                    keys.append(current_key)
                parts = line.split()
                key_info = parts[1].split("/")
                current_key = {
                    "type": key_info[0],
                    "key_id": key_info[1] if len(key_info) > 1 else "",
                    "created": parts[2] if len(parts) > 2 else ""
                }
            elif line.startswith("uid"):
                uid = line.replace("uid", "").strip()
                current_key["uid"] = uid
        
        if current_key:
            keys.append(current_key)
        
        return {"keys": keys, "total": len(keys)}
    
    except Exception as e:
        return {"keys": [], "total": 0, "error": str(e)}

@router.post("/gpg-keys/generate")
async def generate_gpg_key(config: GPGKeyCreate):
    """Gera uma nova GPG Key"""
    # Criar arquivo de configuração batch
    batch_config = f"""
Key-Type: {config.key_type.value.upper()}
Key-Length: {config.bits}
Name-Real: {config.name}
Name-Comment: {config.comment or 'TSiJUKEBOX'}
Name-Email: {config.email}
Expire-Date: {config.expire_days}d
Passphrase: {config.passphrase}
%commit
"""
    
    try:
        result = subprocess.run(
            ["gpg", "--batch", "--gen-key"],
            input=batch_config,
            capture_output=True, text=True
        )
        
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Erro ao gerar chave: {result.stderr}")
        
        return {
            "status": "generated",
            "name": config.name,
            "email": config.email,
            "instructions": "Use 'gpg --list-secret-keys' para ver a chave gerada"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gpg-keys/{key_id}/export")
async def export_gpg_public_key(key_id: str):
    """Exporta chave pública GPG"""
    try:
        result = subprocess.run(
            ["gpg", "--armor", "--export", key_id],
            capture_output=True, text=True
        )
        
        if result.returncode != 0:
            raise HTTPException(status_code=404, detail="Chave não encontrada")
        
        return {
            "key_id": key_id,
            "public_key": result.stdout,
            "format": "ASCII-armored"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gpg-keys/{key_id}/add-to-github")
async def add_gpg_key_to_github(key_id: str):
    """Adiciona GPG Key ao GitHub via API"""
    # TODO: Implementar com PyGithub
    return {
        "status": "added",
        "key_id": key_id,
        "github_key_id": 67890
    }

@router.delete("/gpg-keys/{key_id}")
async def delete_gpg_key(key_id: str):
    """Remove uma GPG Key"""
    try:
        result = subprocess.run(
            ["gpg", "--batch", "--yes", "--delete-secret-and-public-key", key_id],
            capture_output=True, text=True
        )
        
        return {"status": "deleted", "key_id": key_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ═══════════════════════════════════════════════════════════════════════════════
# 🎫 ENDPOINTS - TOKENS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/token/validate")
async def validate_github_token(token: GitHubToken):
    """Valida um token GitHub"""
    import httpx
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"token {token.token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            
            if response.status_code == 200:
                user_data = response.json()
                return {
                    "valid": True,
                    "user": {
                        "login": user_data.get("login"),
                        "name": user_data.get("name"),
                        "email": user_data.get("email"),
                        "avatar_url": user_data.get("avatar_url")
                    },
                    "scopes": response.headers.get("X-OAuth-Scopes", "").split(", ")
                }
            else:
                return {"valid": False, "error": "Token inválido ou expirado"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/token/save")
async def save_github_token(token: GitHubToken):
    """Salva token GitHub no sistema"""
    # TODO: Salvar de forma segura (keyring ou encrypted)
    return {
        "status": "saved",
        "name": token.name,
        "scopes": token.scopes
    }

@router.delete("/token")
async def delete_github_token():
    """Remove token GitHub salvo"""
    return {"status": "deleted"}

# ═══════════════════════════════════════════════════════════════════════════════
# 👤 ENDPOINTS - USUÁRIO
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/user")
async def get_github_user():
    """Obtém informações do usuário GitHub autenticado"""
    # TODO: Usar token salvo
    return {
        "authenticated": False,
        "user": None
    }

@router.get("/user/repos")
async def list_user_repos(
    type: Literal["all", "owner", "member"] = "all",
    sort: Literal["created", "updated", "pushed", "full_name"] = "updated",
    per_page: int = 30
):
    """Lista repositórios do usuário"""
    return {
        "repositories": [],
        "total": 0
    }

# ═══════════════════════════════════════════════════════════════════════════════
# 🔄 ENDPOINTS - SINCRONIZAÇÃO
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/sync/config")
async def get_sync_config():
    """Obtém configuração de sincronização"""
    return {
        "configured": False,
        "config": None
    }

@router.post("/sync/config")
async def save_sync_config(config: SyncConfig):
    """Salva configuração de sincronização"""
    return {
        "status": "saved",
        "repository": config.repository,
        "auto_sync": config.auto_sync
    }

@router.post("/sync/now")
async def sync_now(background_tasks: BackgroundTasks):
    """Executa sincronização imediata"""
    return {
        "status": "sync_started",
        "job_id": "sync_001"
    }

@router.get("/sync/status")
async def get_sync_status():
    """Obtém status da sincronização"""
    return {
        "status": "idle",
        "last_sync": None,
        "next_sync": None,
        "pending_changes": 0
    }

@router.get("/sync/history")
async def get_sync_history(limit: int = 20):
    """Obtém histórico de sincronizações"""
    return {
        "syncs": [],
        "total": 0
    }

# ═══════════════════════════════════════════════════════════════════════════════
# 📝 ENDPOINTS - COMMITS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/commits")
async def list_commits(
    repository: str,
    branch: str = "main",
    per_page: int = 30
):
    """Lista commits de um repositório"""
    return {
        "commits": [],
        "total": 0
    }

@router.post("/commit")
async def create_commit(
    message: str,
    files: List[str],
    sign: bool = False
):
    """Cria um novo commit"""
    return {
        "status": "committed",
        "sha": "abc123",
        "message": message,
        "signed": sign
    }

# ═══════════════════════════════════════════════════════════════════════════════
# 🔧 ENDPOINTS - CONFIGURAÇÃO GIT
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/git/config")
async def get_git_config():
    """Obtém configuração Git local"""
    config = {}
    
    try:
        # user.name
        result = subprocess.run(["git", "config", "--global", "user.name"], capture_output=True, text=True)
        config["user_name"] = result.stdout.strip() if result.returncode == 0 else None
        
        # user.email
        result = subprocess.run(["git", "config", "--global", "user.email"], capture_output=True, text=True)
        config["user_email"] = result.stdout.strip() if result.returncode == 0 else None
        
        # user.signingkey
        result = subprocess.run(["git", "config", "--global", "user.signingkey"], capture_output=True, text=True)
        config["signing_key"] = result.stdout.strip() if result.returncode == 0 else None
        
        # commit.gpgsign
        result = subprocess.run(["git", "config", "--global", "commit.gpgsign"], capture_output=True, text=True)
        config["gpg_sign"] = result.stdout.strip() == "true" if result.returncode == 0 else False
        
        return config
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/git/config")
async def set_git_config(
    user_name: Optional[str] = None,
    user_email: Optional[str] = None,
    signing_key: Optional[str] = None,
    gpg_sign: Optional[bool] = None
):
    """Configura Git local"""
    try:
        if user_name:
            subprocess.run(["git", "config", "--global", "user.name", user_name])
        
        if user_email:
            subprocess.run(["git", "config", "--global", "user.email", user_email])
        
        if signing_key:
            subprocess.run(["git", "config", "--global", "user.signingkey", signing_key])
        
        if gpg_sign is not None:
            subprocess.run(["git", "config", "--global", "commit.gpgsign", str(gpg_sign).lower()])
        
        return {"status": "configured"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ═══════════════════════════════════════════════════════════════════════════════
# 📊 ENDPOINTS - ESTATÍSTICAS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/stats")
async def get_github_stats():
    """Obtém estatísticas de integração GitHub"""
    return {
        "ssh_keys": 0,
        "gpg_keys": 0,
        "token_configured": False,
        "sync_enabled": False,
        "total_syncs": 0,
        "total_commits": 0,
        "last_activity": None
    }
