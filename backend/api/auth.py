"""
TSiJUKEBOX - Auth Router
========================
Autenticação e gerenciamento de sessões

@author B0.y_Z4kr14
@license Public Domain
"""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import jwt
import bcrypt
import os

from models.database import get_db, User, UserSettings

router = APIRouter()

# Configurações
SECRET_KEY = os.getenv("SECRET_KEY", "tsijukebox-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ═══════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: dict

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# ═══════════════════════════════════════════════════════════════════════════
# FUNÇÕES AUXILIARES
# ═══════════════════════════════════════════════════════════════════════════

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha está correta"""
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def get_password_hash(password: str) -> str:
    """Gera hash da senha"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria token JWT"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Obtém usuário atual a partir do token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Verifica se usuário está ativo"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    return current_user

def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """Requer role admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Requer permissão de administrador.")
    return current_user

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login do usuário
    
    - **username**: Nome de usuário
    - **password**: Senha
    
    Retorna token JWT para autenticação
    """
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registro de novo usuário
    
    - **username**: Nome de usuário único
    - **email**: Email único
    - **password**: Senha (mínimo 6 caracteres)
    """
    # Verificar se username já existe
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username já existe")
    
    # Verificar se email já existe
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Criar usuário
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role="user",  # Novos usuários sempre começam como "user"
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Criar configurações padrão
    settings = UserSettings(
        user_id=user.id,
        theme="stage-neon-metallic",
        language="pt-BR"
    )
    db.add(settings)
    db.commit()
    
    return user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout do usuário (invalida token no cliente)"""
    return {"message": "Logout realizado com sucesso", "username": current_user.username}

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_active_user)):
    """Renova o token de acesso"""
    access_token = create_access_token(
        data={"sub": current_user.username, "role": current_user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Retorna dados do usuário autenticado"""
    return current_user

@router.put("/password")
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Altera a senha do usuário"""
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    
    return {"message": "Senha alterada com sucesso"}

@router.get("/permissions")
async def get_permissions(current_user: User = Depends(get_current_active_user)):
    """Retorna permissões do usuário baseado no role"""
    permissions = {
        "admin": {
            "canAccessSettings": True,
            "canManageUsers": True,
            "canAccessSystemControls": True,
            "canManageBackups": True,
            "canManageDatabase": True,
            "canViewLogs": True
        },
        "user": {
            "canAccessSettings": True,
            "canManageUsers": False,
            "canAccessSystemControls": True,
            "canManageBackups": False,
            "canManageDatabase": False,
            "canViewLogs": False
        },
        "newbie": {
            "canAccessSettings": False,
            "canManageUsers": False,
            "canAccessSystemControls": False,
            "canManageBackups": False,
            "canManageDatabase": False,
            "canViewLogs": False
        }
    }
    
    return {
        "role": current_user.role,
        "permissions": permissions.get(current_user.role, permissions["newbie"])
    }
