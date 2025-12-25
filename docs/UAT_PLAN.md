# 🧪 Plano de Testes de Aceitação do Usuário (UAT) - TSiJUKEBOX

**Data:** 2025-12-25
**Autor:** Manus AI
**Versão do Projeto:** 4.2.1

---

## 🎯 Objetivo

Este plano de testes de aceitação do usuário (UAT) tem como objetivo validar se o sistema TSiJUKEBOX atende aos requisitos de negócio e às expectativas dos usuários finais. O foco está na validação do **frontend** e da **instalação autônoma**.

## 👥 Perfis de Usuário

| Perfil | Descrição |
|---|---|
| **Usuário Final** | Interage com o player de música em modo kiosk ou web. |
| **Administrador** | Configura o sistema, gerencia usuários e integrações. |
| **Instalador** | Responsável pela instalação e manutenção do sistema em produção. |

## 📋 Escopo dos Testes

| Módulo | Escopo |
|---|---|
| **Instalação Autônoma** | Validar o script `unified-installer.py` em diferentes modos. |
| **Primeiro Uso (Onboarding)** | Validar o assistente de configuração inicial. |
| **Frontend - Player** | Validar as funcionalidades do player de música. |
| **Frontend - Configurações** | Validar o painel de configurações para administradores. |
| **Acessibilidade** | Validar a conformidade com os requisitos de acessibilidade. |

---

## 🧪 Cenários de Teste

### 1. Instalação Autônoma

| ID do Teste | Cenário | Passos de Execução | Resultado Esperado | Status (P/F) |
|---|---|---|---|---|
| **UAT-INST-01** | Instalação completa (modo `full`) | 1. Executar `curl ... | sudo python3 -- --mode full`. <br> 2. Acompanhar as 26 fases. | O script deve ser concluído com sucesso. O sistema deve estar totalmente funcional. | |
| **UAT-INST-02** | Instalação em modo kiosk | 1. Executar `curl ... | sudo python3 -- --mode kiosk`. | O sistema deve iniciar em modo kiosk após a reinicialização. | |
| **UAT-INST-03** | Simulação (dry-run) | 1. Executar `curl ... | sudo python3 -- --dry-run`. | O script deve simular todas as fases sem aplicar alterações. | |
| **UAT-INST-04** | Instalação com SSL | 1. Executar com `--ssl-mode letsencrypt`. | O Nginx deve ser configurado com SSL e o site deve ser acessível via HTTPS. | |

### 2. Primeiro Uso (Onboarding)

| ID do Teste | Cenário | Passos de Execução | Resultado Esperado | Status (P/F) |
|---|---|---|---|---|
| **UAT-ONB-01** | Configuração inicial | 1. Acessar o sistema pela primeira vez. <br> 2. Seguir o assistente de configuração. | O assistente deve guiar o usuário na configuração de Spotify, Supabase e conta de admin. | |
| **UAT-ONB-02** | Pular configuração | 1. Clicar em "Pular Configuração". | O sistema deve carregar com funcionalidades limitadas. | |

### 3. Frontend - Player de Música

| ID do Teste | Cenário | Passos de Execução | Resultado Esperado | Status (P/F) |
|---|---|---|---|---|
| **UAT-PLAY-01** | Autenticação Spotify | 1. Clicar em "Conectar com Spotify". | O usuário deve ser redirecionado para o Spotify, autenticar e retornar ao app. | |
| **UAT-PLAY-02** | Reproduzir música | 1. Buscar uma música. <br> 2. Clicar em "Reproduzir". | A música deve começar a tocar. O visualizador de áudio deve funcionar. | |
| **UAT-PLAY-03** | Controles de reprodução | 1. Usar os botões de play, pause, próximo, anterior. | Os controles devem funcionar como esperado. | |
| **UAT-PLAY-04** | Fila de reprodução | 1. Adicionar músicas à fila. <br> 2. Reordenar a fila. | A fila deve ser atualizada e as músicas devem tocar na ordem correta. | |
| **UAT-PLAY-05** | Modo Karaoke | 1. Ativar o modo karaoke. | As letras devem ser exibidas e sincronizadas com a música. | |

### 4. Frontend - Configurações (Admin)

| ID do Teste | Cenário | Passos de Execução | Resultado Esperado | Status (P/F) |
|---|---|---|---|---|
| **UAT-CONF-01** | Mudar tema | 1. Acessar Configurações > Aparência. <br> 2. Selecionar um novo tema. | O tema da aplicação deve ser alterado instantaneamente. | |
| **UAT-CONF-02** | Configurar backup | 1. Acessar Configurações > Backup. <br> 2. Configurar o backup na nuvem. | As configurações devem ser salvas. Um backup de teste deve ser concluído com sucesso. | |
| **UAT-CONF-03** | Gerenciar usuários | 1. Acessar Admin > Usuários. <br> 2. Adicionar um novo usuário. | O novo usuário deve ser criado e conseguir fazer login. | |

### 5. Acessibilidade

| ID do Teste | Cenário | Passos de Execução | Resultado Esperado | Status (P/F) |
|---|---|---|---|---|
| **UAT-A11Y-01** | Navegação por teclado | 1. Navegar por toda a aplicação usando apenas a tecla `Tab`. | Todos os elementos interativos devem ser alcançáveis e operáveis. O foco deve ser visível. | |
| **UAT-A11Y-02** | Leitor de tela | 1. Usar um leitor de tela (NVDA, VoiceOver) para navegar. | A navegação deve ser lógica. Botões, links e imagens devem ter descrições adequadas. | |
| **UAT-A11Y-03** | Alto contraste | 1. Ativar o modo de alto contraste do sistema operacional. | O texto deve permanecer legível e a interface utilizável. | |

---

## 📝 Procedimento de Teste

1.  **Preparação:**
    - Configurar um ambiente de teste limpo (VM com Ubuntu 22.04).
    - Garantir que todos os pré-requisitos de instalação estejam atendidos.
    - Designar testadores para cada perfil de usuário.

2.  **Execução:**
    - Executar cada cenário de teste conforme descrito.
    - Registrar o resultado (Passou/Falhou) na coluna "Status".
    - Para testes que falharam, documentar o problema em detalhes, incluindo screenshots e passos para reprodução.

3.  **Relatório de Bugs:**
    - Abrir uma *issue* no GitHub para cada teste que falhou.
    - Usar a tag `UAT` para identificar os bugs encontrados nesta fase.

4.  **Revisão:**
    - A equipe de desenvolvimento revisa os bugs e prioriza as correções.
    - Após a correção, o teste é re-executado para validação.

## ✅ Critérios de Aceitação

O UAT será considerado concluído com sucesso quando:

- **95%** dos casos de teste passarem.
- **100%** dos casos de teste críticos (instalação, login, reprodução de música) passarem.
- Nenhum bug bloqueador (`blocker`) ou crítico (`critical`) permanecer aberto.
