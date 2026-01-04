# 🔧 Troubleshooting

## Problemas Comuns

### Build Falha

**Sintoma:** `pnpm build` falha com erros

**Solução:**
```bash
# Limpe o cache e reinstale
rm -rf node_modules
pnpm store prune
pnpm install
pnpm build
```

### Spotify Não Conecta

**Sintoma:** Erro de autenticação com Spotify

**Solução:**
1. Verifique se `VITE_SPOTIFY_CLIENT_ID` está correto
2. Confirme que a Redirect URI está configurada no Spotify Dashboard
3. Limpe cookies e tente novamente

### Erro de CORS

**Sintoma:** Requisições bloqueadas por CORS

**Solução:**
```bash
# Em desenvolvimento, use o proxy do Vite
# Em produção, configure o Nginx corretamente
```

### Página em Branco

**Sintoma:** Aplicação carrega mas mostra tela branca

**Solução:**
1. Verifique o console do navegador
2. Confirme que todas as variáveis de ambiente estão definidas
3. Verifique se o Supabase está acessível

### Erros de TypeScript

**Sintoma:** Muitos erros de tipo

**Solução:**
```bash
# Execute o script de correção
python3 scripts/master-fix.py --typescript
```

## Logs e Diagnóstico

### Verificar Logs do Sistema

```bash
# Logs do serviço
sudo journalctl -u tsijukebox -f

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Verificar Status

```bash
# Status do serviço
sudo systemctl status tsijukebox

# Verificar portas
sudo netstat -tlnp | grep -E '80|443|5173'
```

## Contato

Se o problema persistir:
- [Abra uma Issue](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues)
- [Discussões](https://github.com/B0yZ4kr14/TSiJUKEBOX/discussions)
