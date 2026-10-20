# 🚀 Zap Footwear — Complete VPS Hosting & Docker Guide

This guide walks you through hosting the **Zap Footwear** e-commerce storefront, admin panel, REST API, and PostgreSQL database on any Linux VPS (DigitalOcean, Hetzner, AWS EC2, Linode, Contabo, Vultr, etc.) using Docker and Nginx.

---

## 🏗️ Architecture Overview

```
                          Internet (Clients & Admin)
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │       Port 80 / Port 443        │
                    │   Nginx Reverse Proxy & SSL     │
                    │           (zap_nginx)           │
                    └────────┬───────────────┬────────┘
                             │               │
                 Traffic (/*)│               │API Requests (/api/*)
                             ▼               ▼
                   ┌─────────────────┐  ┌─────────────────┐
                   │   Zap Frontend  │  │    Zap API      │
                   │ (Next.js 16/19) │  │  (Next/Prisma)  │
                   │    (zap_web)    │  │    (zap_api)    │
                   │    Port 3000    │  │    Port 3001    │
                   └─────────────────┘  └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │   PostgreSQL    │
                                        │  (zap_postgres) │
                                        │   (Internal)    │
                                        └─────────────────┘
```

---

## 💻 Recommended VPS Specifications

- **OS**: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS (recommended) / Debian 11 or 12
- **CPU**: 1 vCPU (2 vCPUs recommended for builds)
- **RAM**: Minimum 1GB + 2GB Swap (2GB RAM recommended)
- **Disk**: 20GB+ SSD

---

## ⚡ Option A: 1-Click Fast Deployment (Automated)

### 1. SSH into your VPS
```bash
ssh root@YOUR_VPS_IP
```

### 2. Clone or Copy the Repository
```bash
git clone https://github.com/YOUR_USERNAME/zap.git /opt/zap
cd /opt/zap
```
*(If transferring via SFTP or SCP, copy both `Zap` and `shoe-shop-api` folders to `/opt/zap`).*

### 3. Run the Automated Deployment Script
```bash
sudo bash deploy.sh
```
The script automatically:
1. Installs Docker and Docker Compose.
2. Configures the UFW firewall (opening ports 22, 80, and 443).
3. Generates secure database passwords and JWT secrets.
4. Builds the lightweight Next.js standalone container (~120MB).
5. Runs Prisma migrations and seeds the catalog.
6. Starts all containers with automatic restart policies.

Visit `http://YOUR_VPS_IP` in your browser!

---

## 🛠️ Option B: Manual Step-by-Step Deployment

If you prefer to run each step manually:

### Step 1: Install Docker on your VPS
```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl ca-certificates gnupg

# Add Docker GPG key & repository
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Step 2: Configure Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Step 3: Configure Environment
Copy `.env.production` and adjust variables:
```bash
cp .env.production.example .env.production
nano .env.production
```

Make sure to set strong values for:
- `POSTGRES_PASSWORD`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

### Step 4: Build and Start Containers
```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Step 5: Verify Everything is Running
```bash
docker compose -f docker-compose.prod.yml ps
```
You should see all 4 services healthy:
- `zap_postgres` (healthy)
- `zap_api` (healthy)
- `zap_web` (healthy)
- `zap_nginx` (running on 0.0.0.0:80 and 0.0.0.0:443)

---

## 🔒 Setting Up Custom Domain & Free SSL (HTTPS)

### 1. Point DNS Records to your VPS IP
In your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.), add:
- **A Record**: `@` → `YOUR_VPS_IP`
- **A Record**: `www` → `YOUR_VPS_IP`

### 2. Request Free Let's Encrypt SSL Certificate
Once the DNS has propagated (test with `ping yourdomain.com`):

```bash
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com \
  --email your-email@gmail.com \
  --agree-tos --no-eff-email
```

### 3. Activate SSL in Nginx
1. Open `nginx/nginx.conf`:
```bash
nano nginx/nginx.conf
```
2. Replace or append the SSL server block using `nginx/ssl.conf.template` replacing `${DOMAIN_NAME}` with `yourdomain.com`.
3. Reload Nginx without downtime:
```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## 📊 Useful Day-to-Day Maintenance Commands

| Action | Command |
|---|---|
| **View Live Logs** | `docker compose -f docker-compose.prod.yml logs -f` |
| **View Frontend Logs** | `docker compose -f docker-compose.prod.yml logs -f zap-web` |
| **View Backend Logs** | `docker compose -f docker-compose.prod.yml logs -f zap-api` |
| **Restart Stack** | `docker compose -f docker-compose.prod.yml restart` |
| **Stop All Containers** | `docker compose -f docker-compose.prod.yml down` |
| **Update Code & Rebuild** | `git pull && docker compose -f docker-compose.prod.yml up -d --build` |

---

## 💾 Database Backup & Restore

### Backup PostgreSQL Database
```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U shoeshop shoeshop_db > backup_$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
cat backup_20261017.sql | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U shoeshop shoeshop_db
```

---

## ❓ Frequently Asked Questions & Troubleshooting

### Q: Port 80 is already in use
If an existing Apache or Nginx service is running on the host:
```bash
sudo systemctl stop apache2 2>/dev/null || true
sudo systemctl disable apache2 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl disable nginx 2>/dev/null || true
```

### Q: Container ran out of memory during build
If your VPS has only 1GB RAM, create a 2GB swap file:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
