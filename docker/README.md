# TSiJUKEBOX Enterprise - Docker Deployment

<div align="center">
  <img src="../public/logo/tsijukebox-logo.svg" alt="TSiJUKEBOX Logo" width="300">
  
  **Containerized Music System for Kiosk**
</div>

---

## Quick Start

### Production

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Development

```bash
# Start with hot-reload
docker-compose -f docker-compose.dev.yml up app-dev

# With Storybook
docker-compose -f docker-compose.dev.yml --profile storybook up

# Run tests
docker-compose -f docker-compose.dev.yml --profile test up
```

---

## Environment Variables

Create a `.env` file in the `docker/` directory:

```env
# Application
APP_PORT=80
TZ=America/Sao_Paulo

# Supabase (Lovable Cloud)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Optional: API
VITE_API_BASE_URL=http://localhost:3000

# Brand Configuration (NEW)
VITE_SPLASH_ENABLED=true
VITE_SPLASH_VARIANT=default    # default, minimal, cyberpunk, elegant
VITE_SPLASH_DURATION=3000      # milliseconds
VITE_LOGO_VARIANT=metal        # default, ultra, metal, hologram, mirror, silver
VITE_LOGO_ANIMATION=splash     # none, fade, slide-up, scale, cascade, splash, glitch

# Monitoring (optional)
GRAFANA_USER=admin
GRAFANA_PASSWORD=secure-password
```

### Brand Configuration (NEW)

| Variable | Default | Options | Description |
|----------|---------|---------|-------------|
| `VITE_SPLASH_ENABLED` | `true` | `true`, `false` | Enable splash screen |
| `VITE_SPLASH_VARIANT` | `default` | `default`, `minimal`, `cyberpunk`, `elegant` | Splash visual theme |
| `VITE_SPLASH_DURATION` | `3000` | Number (ms) | Splash duration |
| `VITE_LOGO_VARIANT` | `metal` | `default`, `metal`, `hologram`, `ultra`, `mirror`, `silver` | Logo style |
| `VITE_LOGO_ANIMATION` | `splash` | `none`, `fade`, `slide-up`, `scale`, `cascade`, `splash`, `glitch` | Logo animation |

### Example with Cyberpunk Theme

```bash
docker run -d \
  -e VITE_SPLASH_VARIANT=cyberpunk \
  -e VITE_LOGO_ANIMATION=glitch \
  -e VITE_LOGO_VARIANT=metal \
  tsijukebox/app:latest
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Host                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   nginx     │  │    app      │  │  Optional Services  │  │
│  │  (proxy)    │──│  (static)   │  │  - redis            │  │
│  │   :443      │  │   :80       │  │  - prometheus       │  │
│  └─────────────┘  └─────────────┘  │  - grafana          │  │
│                                     └─────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   tsijukebox-network                   │  │
│  │                     172.28.0.0/16                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Services

### Core Services

| Service | Port | Description |
|---------|------|-------------|
| `app` | 80 | Main application (nginx + static files) |
| `nginx-proxy` | 443 | SSL termination (profile: ssl) |

### Optional Services

| Service | Port | Profile | Description |
|---------|------|---------|-------------|
| `redis` | 6379 | cache | Session storage |
| `prometheus` | 9090 | monitoring | Metrics collection |
| `grafana` | 3000 | monitoring | Metrics dashboard |
| `watchtower` | - | autoupdate | Auto-update containers |

### Activate Optional Services

```bash
# With caching
docker-compose --profile cache up -d

# With monitoring
docker-compose --profile monitoring up -d

# With SSL proxy
docker-compose --profile ssl up -d

# All optional services
docker-compose --profile cache --profile monitoring --profile ssl up -d
```

---

## Build Commands

### Build Images

```bash
# Production build
docker-compose build

# Development build
docker-compose -f docker-compose.dev.yml build

# No cache rebuild
docker-compose build --no-cache
```

### Multi-stage Targets

```bash
# Builder stage only
docker build --target builder -t tsijukebox:builder .

# Production stage
docker build --target production -t tsijukebox:prod .

# Development stage
docker build --target development -t tsijukebox:dev .
```

---

## Useful Commands

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Shell Access

```bash
# Production container
docker-compose exec app sh

# Development container
docker-compose -f docker-compose.dev.yml exec app-dev sh
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes too
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Full cleanup
docker system prune -af
```

---

## Health Checks

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `/health` | Returns "healthy" if nginx is running |
| `/metrics` | Nginx stub status (internal only) |

### Check Status

```bash
# Check container health
docker-compose ps

# Check endpoint
curl http://localhost/health
```

---

## SSL Configuration

1. Place SSL certificates:
   ```bash
   mkdir -p ssl-certs
   cp your-cert.pem ssl-certs/fullchain.pem
   cp your-key.pem ssl-certs/privkey.pem
   ```

2. Create `nginx/proxy.conf`:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /etc/nginx/ssl/fullchain.pem;
       ssl_certificate_key /etc/nginx/ssl/privkey.pem;
       
       location / {
           proxy_pass http://app:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. Start with SSL profile:
   ```bash
   docker-compose --profile ssl up -d
   ```

---

## Kiosk Mode

For kiosk deployments, add to your host system:

```bash
# /etc/systemd/system/tsijukebox-kiosk.service
[Unit]
Description=TSiJUKEBOX Kiosk
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/tsijukebox/docker
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable tsijukebox-kiosk
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Verify build
docker-compose build --no-cache
```

### Port conflict

```bash
# Change port in .env
APP_PORT=8080

# Or use different port
docker-compose up -d --scale app=0
docker run -p 8080:80 tsijukebox-app
```

### Permission issues

```bash
# Fix volume permissions
sudo chown -R 1001:1001 ./volumes/
```

---

## License

Public Domain - Use freely for any purpose.

---

<div align="center">
  <sub>Developed with 💙 by B0.y_Z4kr14</sub>
</div>
