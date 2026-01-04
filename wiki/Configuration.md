# ⚙️ Configuração

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# Spotify
VITE_SPOTIFY_CLIENT_ID=seu-client-id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback

# YouTube (opcional)
VITE_YOUTUBE_API_KEY=sua-api-key

# GitHub (opcional)
VITE_GITHUB_TOKEN=seu-token
VITE_GITHUB_REPO=usuario/repositorio
```

## Configuração do Spotify

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crie um novo aplicativo
3. Adicione `http://localhost:5173/callback` às Redirect URIs
4. Copie o Client ID para o `.env`

## Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrações em `supabase/migrations/`
3. Configure as Edge Functions
4. Copie URL e chave anônima para o `.env`

## Configuração do Nginx

```nginx
server {
    listen 80;
    server_name tsijukebox.local;
    root /opt/tsijukebox/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }
}
```

## Configuração SSL

### Let's Encrypt

```bash
sudo certbot --nginx -d tsijukebox.seu-dominio.com
```

### Self-Signed

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/tsijukebox.key \
    -out /etc/ssl/certs/tsijukebox.crt
```
