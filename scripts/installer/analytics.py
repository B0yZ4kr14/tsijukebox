#!/usr/bin/env python3
"""
TSiJUKEBOX Installation Analytics Module
=========================================
Coleta métricas de instalação anonimizadas para melhorias do instalador.

Características:
- Totalmente opt-in (desabilitado por padrão)
- Dados anonimizados (sem PII)
- Conformidade LGPD/GDPR
- Modo offline disponível

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import json
import hashlib
import platform
import time
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field, asdict
from enum import Enum
import urllib.request
import urllib.error


class StepStatus(Enum):
    """Status de uma etapa de instalação"""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class InstallationStep:
    """Representa uma etapa de instalação"""
    name: str
    status: StepStatus = StepStatus.PENDING
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    duration_ms: int = 0
    error_type: Optional[str] = None


@dataclass
class InstallationMetrics:
    """Métricas completas de uma sessão de instalação"""
    session_id: str
    started_at: str
    completed_at: Optional[str] = None
    total_duration_ms: int = 0
    status: str = "running"
    
    # Sistema (anonimizado)
    system_hash: str = ""
    os_family: str = ""
    distro_family: str = ""
    arch: str = ""
    
    # Configurações escolhidas (sem dados sensíveis)
    install_mode: str = ""  # "wizard", "auto", "docker"
    database_type: str = ""
    cloud_providers: List[str] = field(default_factory=list)
    features_enabled: List[str] = field(default_factory=list)
    
    # Etapas
    steps: List[Dict[str, Any]] = field(default_factory=list)
    
    # Erros (tipo apenas, sem mensagem completa)
    errors: List[Dict[str, str]] = field(default_factory=list)
    
    # Versão do instalador
    installer_version: str = "1.0.0"


class InstallationAnalytics:
    """
    Sistema de analytics para instalação do TSiJUKEBOX.
    
    Coleta métricas anonimizadas para melhorar o instalador.
    Totalmente opt-in e em conformidade com LGPD/GDPR.
    """
    
    OFFLINE_CACHE_FILE = "/tmp/tsijukebox_analytics_cache.json"
    
    def __init__(
        self, 
        endpoint_url: Optional[str] = None, 
        enabled: bool = False,
        verbose: bool = False
    ):
        """
        Inicializa o sistema de analytics.
        
        Args:
            endpoint_url: URL do endpoint para envio (opcional)
            enabled: Se True, analytics está habilitado (opt-in)
            verbose: Se True, exibe logs detalhados
        """
        self.enabled = enabled
        self.endpoint = endpoint_url
        self.verbose = verbose
        
        self._session_start = time.time()
        self._current_step: Optional[str] = None
        self._step_start: float = 0
        
        # Gerar session ID anônimo
        session_id = self._generate_anonymous_id()
        
        # Inicializar métricas
        self.metrics = InstallationMetrics(
            session_id=session_id,
            started_at=datetime.utcnow().isoformat() + "Z",
            system_hash=self._hash_system_info(),
            os_family=platform.system(),
            distro_family=self._detect_distro_family(),
            arch=platform.machine(),
        )
        
        if self.verbose and self.enabled:
            print(f"[ANALYTICS] Sessão iniciada: {session_id[:8]}...")
    
    def _generate_anonymous_id(self) -> str:
        """Gera um ID de sessão anônimo baseado em timestamp + random"""
        import secrets
        random_bytes = secrets.token_bytes(16)
        timestamp = str(time.time()).encode()
        return hashlib.sha256(random_bytes + timestamp).hexdigest()[:32]
    
    def _hash_system_info(self) -> str:
        """
        Gera hash anônimo das informações do sistema.
        Não permite identificar a máquina específica.
        """
        # Combina informações genéricas (não identificáveis)
        info = f"{platform.system()}:{platform.machine()}:{platform.release()}"
        return hashlib.sha256(info.encode()).hexdigest()[:16]
    
    def _detect_distro_family(self) -> str:
        """Detecta família da distribuição Linux"""
        if platform.system() != "Linux":
            return platform.system()
        
        try:
            with open("/etc/os-release", "r") as f:
                content = f.read().lower()
                
            if "arch" in content or "cachyos" in content or "manjaro" in content:
                return "arch"
            elif "debian" in content or "ubuntu" in content:
                return "debian"
            elif "fedora" in content or "rhel" in content or "centos" in content:
                return "rhel"
            else:
                return "other"
        except:
            return "unknown"
    
    def set_install_mode(self, mode: str) -> None:
        """Define o modo de instalação"""
        if not self.enabled:
            return
        self.metrics.install_mode = mode
    
    def track_config_choice(self, option: str, value: str) -> None:
        """
        Registra uma escolha de configuração (sem dados sensíveis).
        
        Args:
            option: Nome da opção (ex: "database_type")
            value: Valor escolhido (ex: "postgresql")
        """
        if not self.enabled:
            return
        
        # Mapear para campos específicos
        if option == "database":
            self.metrics.database_type = value
        elif option == "cloud_provider":
            if value not in self.metrics.cloud_providers:
                self.metrics.cloud_providers.append(value)
        elif option == "feature":
            if value not in self.metrics.features_enabled:
                self.metrics.features_enabled.append(value)
        
        if self.verbose:
            print(f"[ANALYTICS] Config: {option} = {value}")
    
    def start_step(self, step_name: str) -> None:
        """
        Inicia rastreamento de uma etapa de instalação.
        
        Args:
            step_name: Nome da etapa (ex: "install_packages")
        """
        if not self.enabled:
            return
        
        self._current_step = step_name
        self._step_start = time.time()
        
        step = InstallationStep(
            name=step_name,
            status=StepStatus.RUNNING,
            started_at=datetime.utcnow().isoformat() + "Z"
        )
        
        self.metrics.steps.append(asdict(step))
        
        if self.verbose:
            print(f"[ANALYTICS] Etapa iniciada: {step_name}")
    
    def complete_step(self, step_name: str, success: bool = True, error_type: Optional[str] = None) -> None:
        """
        Finaliza rastreamento de uma etapa.
        
        Args:
            step_name: Nome da etapa
            success: Se a etapa foi bem-sucedida
            error_type: Tipo de erro (se houver) - sem mensagem completa
        """
        if not self.enabled:
            return
        
        duration_ms = int((time.time() - self._step_start) * 1000) if self._step_start else 0
        
        # Atualizar etapa existente
        for step in self.metrics.steps:
            if step["name"] == step_name:
                step["status"] = StepStatus.SUCCESS.value if success else StepStatus.FAILED.value
                step["completed_at"] = datetime.utcnow().isoformat() + "Z"
                step["duration_ms"] = duration_ms
                if error_type:
                    step["error_type"] = error_type
                break
        
        self._current_step = None
        self._step_start = 0
        
        if self.verbose:
            status = "✓" if success else "✗"
            print(f"[ANALYTICS] Etapa finalizada: {step_name} {status} ({duration_ms}ms)")
    
    def skip_step(self, step_name: str, reason: str = "user_choice") -> None:
        """
        Marca uma etapa como pulada.
        
        Args:
            step_name: Nome da etapa
            reason: Motivo (ex: "user_choice", "not_applicable")
        """
        if not self.enabled:
            return
        
        step = InstallationStep(
            name=step_name,
            status=StepStatus.SKIPPED,
            completed_at=datetime.utcnow().isoformat() + "Z"
        )
        step_dict = asdict(step)
        step_dict["skip_reason"] = reason
        
        self.metrics.steps.append(step_dict)
        
        if self.verbose:
            print(f"[ANALYTICS] Etapa pulada: {step_name} ({reason})")
    
    def track_error(self, error_type: str, step: Optional[str] = None) -> None:
        """
        Registra um erro (apenas tipo, sem mensagem completa).
        
        Args:
            error_type: Tipo/classe do erro (ex: "PackageNotFound", "NetworkError")
            step: Etapa onde ocorreu (opcional)
        """
        if not self.enabled:
            return
        
        error_entry = {
            "type": error_type,
            "step": step or self._current_step or "unknown",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        self.metrics.errors.append(error_entry)
        
        if self.verbose:
            print(f"[ANALYTICS] Erro registrado: {error_type} em {error_entry['step']}")
    
    def finalize(self, success: bool = True) -> Dict[str, Any]:
        """
        Finaliza a sessão e prepara dados para envio.
        
        Args:
            success: Se a instalação foi bem-sucedida
            
        Returns:
            Dict com as métricas finais
        """
        if not self.enabled:
            return {}
        
        self.metrics.completed_at = datetime.utcnow().isoformat() + "Z"
        self.metrics.total_duration_ms = int((time.time() - self._session_start) * 1000)
        self.metrics.status = "success" if success else "failed"
        
        if self.verbose:
            print(f"[ANALYTICS] Sessão finalizada: {self.metrics.status}")
            print(f"[ANALYTICS] Duração total: {self.metrics.total_duration_ms}ms")
        
        return asdict(self.metrics)
    
    def send(self) -> bool:
        """
        Envia métricas para o endpoint configurado.
        
        Returns:
            True se enviado com sucesso, False caso contrário
        """
        if not self.enabled or not self.endpoint:
            if self.verbose:
                print("[ANALYTICS] Envio desabilitado ou endpoint não configurado")
            return False
        
        data = asdict(self.metrics)
        
        try:
            json_data = json.dumps(data).encode('utf-8')
            
            req = urllib.request.Request(
                self.endpoint,
                data=json_data,
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': f'TSiJUKEBOX-Installer/{self.metrics.installer_version}'
                },
                method='POST'
            )
            
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200 or response.status == 201:
                    if self.verbose:
                        print("[ANALYTICS] Métricas enviadas com sucesso")
                    return True
                else:
                    if self.verbose:
                        print(f"[ANALYTICS] Resposta inesperada: {response.status}")
                    self._cache_offline(data)
                    return False
                    
        except urllib.error.URLError as e:
            if self.verbose:
                print(f"[ANALYTICS] Falha no envio: {e}")
            self._cache_offline(data)
            return False
        except Exception as e:
            if self.verbose:
                print(f"[ANALYTICS] Erro inesperado: {e}")
            self._cache_offline(data)
            return False
    
    def _cache_offline(self, data: Dict[str, Any]) -> None:
        """
        Salva métricas localmente para envio posterior.
        
        Args:
            data: Dados a serem salvos
        """
        try:
            cache_path = Path(self.OFFLINE_CACHE_FILE)
            
            # Carregar cache existente
            existing = []
            if cache_path.exists():
                try:
                    with open(cache_path, 'r') as f:
                        existing = json.load(f)
                except:
                    existing = []
            
            # Adicionar nova entrada
            existing.append(data)
            
            # Limitar a 10 entradas
            existing = existing[-10:]
            
            # Salvar
            with open(cache_path, 'w') as f:
                json.dump(existing, f)
            
            if self.verbose:
                print(f"[ANALYTICS] Dados salvos em cache offline: {cache_path}")
                
        except Exception as e:
            if self.verbose:
                print(f"[ANALYTICS] Falha ao salvar cache: {e}")
    
    def send_cached(self) -> int:
        """
        Envia métricas em cache (modo offline).
        
        Returns:
            Número de entradas enviadas com sucesso
        """
        if not self.enabled or not self.endpoint:
            return 0
        
        cache_path = Path(self.OFFLINE_CACHE_FILE)
        if not cache_path.exists():
            return 0
        
        try:
            with open(cache_path, 'r') as f:
                cached = json.load(f)
            
            sent_count = 0
            remaining = []
            
            for entry in cached:
                try:
                    json_data = json.dumps(entry).encode('utf-8')
                    req = urllib.request.Request(
                        self.endpoint,
                        data=json_data,
                        headers={'Content-Type': 'application/json'},
                        method='POST'
                    )
                    
                    with urllib.request.urlopen(req, timeout=10) as response:
                        if response.status in (200, 201):
                            sent_count += 1
                        else:
                            remaining.append(entry)
                except:
                    remaining.append(entry)
            
            # Atualizar cache com entradas restantes
            if remaining:
                with open(cache_path, 'w') as f:
                    json.dump(remaining, f)
            else:
                cache_path.unlink()
            
            if self.verbose:
                print(f"[ANALYTICS] Enviadas {sent_count} entradas em cache")
            
            return sent_count
            
        except Exception as e:
            if self.verbose:
                print(f"[ANALYTICS] Erro ao enviar cache: {e}")
            return 0
    
    def get_summary(self) -> str:
        """
        Retorna um resumo legível das métricas coletadas.
        
        Returns:
            String formatada com o resumo
        """
        if not self.enabled:
            return "Analytics desabilitado"
        
        m = self.metrics
        steps_ok = sum(1 for s in m.steps if s.get("status") == "success")
        steps_fail = sum(1 for s in m.steps if s.get("status") == "failed")
        
        return f"""
=== Resumo de Analytics ===
Session ID: {m.session_id[:8]}...
Modo: {m.install_mode or 'N/A'}
Status: {m.status}
Duração: {m.total_duration_ms}ms
Etapas: {steps_ok} OK, {steps_fail} falhas
Erros: {len(m.errors)}
Database: {m.database_type or 'N/A'}
Cloud: {', '.join(m.cloud_providers) or 'N/A'}
"""


def create_analytics(
    endpoint: Optional[str] = None,
    enabled: bool = False,
    verbose: bool = False
) -> InstallationAnalytics:
    """
    Factory function para criar instância de analytics.
    
    Args:
        endpoint: URL do endpoint (pode vir de env var)
        enabled: Se analytics está habilitado
        verbose: Modo verboso
        
    Returns:
        Instância configurada de InstallationAnalytics
    """
    # Permitir configuração via variável de ambiente
    if endpoint is None:
        endpoint = os.environ.get("TSIJUKEBOX_ANALYTICS_ENDPOINT")
    
    if not enabled:
        enabled = os.environ.get("TSIJUKEBOX_ANALYTICS_ENABLED", "").lower() in ("true", "1", "yes")
    
    return InstallationAnalytics(
        endpoint_url=endpoint,
        enabled=enabled,
        verbose=verbose
    )
