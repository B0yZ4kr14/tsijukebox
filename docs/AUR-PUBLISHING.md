# TSiJUKEBOX - Guia de Publicação no AUR

Este documento descreve o processo completo para publicar e manter o pacote TSiJUKEBOX no Arch User Repository (AUR).

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Configuração Inicial](#configuração-inicial)
- [Publicação](#publicação)
- [Atualizações](#atualizações)
- [CI/CD Automatizado](#cicd-automatizado)
- [Troubleshooting](#troubleshooting)

## Pré-requisitos

### Conta AUR

1. Crie uma conta em https://aur.archlinux.org/register
2. Configure sua chave SSH no perfil

### Chave SSH

```bash
# Gerar chave Ed25519 (recomendado)
ssh-keygen -t ed25519 -C "seu-email@exemplo.com" -f ~/.ssh/aur

# Adicionar ao ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/aur

# Copiar chave pública
cat ~/.ssh/aur.pub
```

Cole a chave pública em: https://aur.archlinux.org/account/ → SSH Public Key

### Ferramentas Necessárias

```bash
# Arch Linux / CachyOS
sudo pacman -S base-devel git namcap

# Opcional: devtools para builds isolados
sudo pacman -S devtools
```

## Estrutura de Arquivos

```
packaging/arch/
├── PKGBUILD                    # Receita de construção
├── .SRCINFO                    # Metadados (gerado automaticamente)
├── tsijukebox.install          # Hooks de instalação
├── tsijukebox.service          # Serviço systemd básico
├── tsijukebox-kiosk.service    # Serviço systemd modo kiosk
├── tsijukebox-update.timer     # Timer para atualizações
├── tsijukebox-update.service   # Serviço de atualização
├── tsijukebox.desktop          # Entrada desktop
├── tsijukebox                   # Script launcher
├── config.json                 # Configuração padrão
├── aur-publish.sh              # Script de publicação
└── generate-srcinfo.sh         # Gerador de .SRCINFO
```

## Configuração Inicial

### 1. Clonar Repositório AUR (Primeira Vez)

```bash
# Se o pacote não existe no AUR
ssh aur@aur.archlinux.org setup-repo tsijukebox

# Clonar
git clone ssh://aur@aur.archlinux.org/tsijukebox.git aur-repo
```

### 2. Configurar Git

```bash
cd aur-repo

# Configurar autor
git config user.name "Seu Nome"
git config user.email "seu-email@exemplo.com"
```

### 3. Copiar Arquivos

```bash
cp ../PKGBUILD .
cp ../tsijukebox.install .
# ... outros arquivos necessários
```

### 4. Gerar .SRCINFO

```bash
makepkg --printsrcinfo > .SRCINFO
```

### 5. Commit Inicial

```bash
git add PKGBUILD .SRCINFO tsijukebox.install
git commit -m "Initial commit: tsijukebox v4.0.0"
git push -u origin master
```

## Publicação

### Usando o Script Automatizado

```bash
cd packaging/arch

# Primeira publicação
./aur-publish.sh --init

# Atualizações
./aur-publish.sh --update

# Apenas testar (sem publicar)
./aur-publish.sh --test
```

### Manualmente

```bash
# 1. Atualizar versão no PKGBUILD
vim PKGBUILD  # Alterar pkgver e pkgrel

# 2. Regenerar .SRCINFO
makepkg --printsrcinfo > .SRCINFO

# 3. Validar com namcap
namcap PKGBUILD
namcap *.pkg.tar.zst  # Após build

# 4. Commit e push
git add PKGBUILD .SRCINFO
git commit -m "Update to v4.1.0"
git push origin master
```

## Atualizações

### Versionamento

- **pkgver**: Versão do software (ex: 4.0.0)
- **pkgrel**: Release do pacote para mesma versão (ex: 1, 2, 3...)

```bash
# Nova versão do software
pkgver=4.1.0
pkgrel=1

# Correção no PKGBUILD (mesma versão)
pkgver=4.1.0
pkgrel=2
```

### Changelog

Inclua um resumo das mudanças na mensagem de commit:

```bash
git commit -m "Update to v4.1.0

- Added PipeWire support
- Improved kiosk mode stability
- Fixed memory leak in audio visualizer"
```

## CI/CD Automatizado

### GitHub Actions

O workflow `.github/workflows/tsijukebox-cicd.yml` automatiza:

1. **Build do pacote** em container Arch Linux
2. **Validação** com namcap
3. **Publicação** no AUR (em tags `v*`)

### Configurar Secrets

No GitHub, adicione:

- `AUR_SSH_PRIVATE_KEY`: Chave SSH privada para AUR

```bash
# Gerar chave específica para CI
ssh-keygen -t ed25519 -C "ci@tsijukebox" -f aur-ci-key -N ""

# Adicionar chave pública ao AUR
cat aur-ci-key.pub  # Copiar para AUR

# Adicionar chave privada ao GitHub Secrets
cat aur-ci-key  # Copiar para AUR_SSH_PRIVATE_KEY
```

### Trigger de Deploy

```bash
# Criar tag para trigger automático
git tag -a v4.1.0 -m "Release v4.1.0"
git push origin v4.1.0
```

## Serviços Systemd

### Instalação dos Serviços

```bash
# Modo básico
sudo systemctl enable --now tsijukebox.service

# Modo kiosk (CachyOS/Openbox)
sudo systemctl enable --now tsijukebox-kiosk.service

# Atualizações automáticas
sudo systemctl enable --now tsijukebox-update.timer
```

### Verificar Status

```bash
# Status do serviço
systemctl status tsijukebox-kiosk.service

# Logs
journalctl -u tsijukebox-kiosk.service -f

# Timer de atualização
systemctl list-timers tsijukebox-update.timer
```

## Troubleshooting

### Erro de SSH

```bash
# Testar conexão
ssh -T aur@aur.archlinux.org

# Verificar chave
ssh-add -l

# Debug
ssh -vT aur@aur.archlinux.org
```

### Erro de Build

```bash
# Build limpo
rm -rf src/ pkg/ *.pkg.tar.zst
makepkg -s

# Build em chroot isolado
extra-x86_64-build

# Verificar dependências
namcap PKGBUILD
```

### Erro de Push

```bash
# Verificar remote
git remote -v

# Forçar push (CUIDADO!)
git push -f origin master

# Resolver conflitos
git fetch origin
git rebase origin/master
git push origin master
```

### Pacote Não Aparece

Após o push, aguarde alguns minutos. O AUR pode levar até 5 minutos para indexar.

Verifique em: https://aur.archlinux.org/packages/tsijukebox

## Referências

- [Arch Wiki - PKGBUILD](https://wiki.archlinux.org/title/PKGBUILD)
- [Arch Wiki - AUR Submission Guidelines](https://wiki.archlinux.org/title/AUR_submission_guidelines)
- [Arch Wiki - Creating Packages](https://wiki.archlinux.org/title/Creating_packages)
- [AUR Web Interface](https://aur.archlinux.org/)

## Contato

- **Maintainer**: B0.y_Z4kr14 <b0yz4kr14@proton.me>
- **Repository**: https://github.com/B0yZ4kr14/TSiJUKEBOX
- **AUR Package**: https://aur.archlinux.org/packages/tsijukebox
