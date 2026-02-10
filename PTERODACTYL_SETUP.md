# Panduan Setup Pterodactyl Panel

Panduan lengkap untuk mengintegrasikan Pterodactyl Game Panel dengan aplikasi Layanan Digital.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step 1: Install Pterodactyl Panel](#step-1-install-pterodactyl-panel)
- [Step 2: Configure Panel URL](#step-2-configure-panel-url)
- [Step 3: Generate API Keys](#step-3-generate-api-keys)
- [Step 4: Setup Node and Location](#step-4-setup-node-and-location)
- [Step 5: Configure Eggs](#step-5-configure-eggs)
- [Step 6: Environment Variables](#step-6-environment-variables)
- [Package Configurations](#package-configurations)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

Pterodactyl adalah open-source game server management panel yang memungkinkan Anda untuk:
- Membuat dan mengelola game server secara otomatis
- Mengalokasikan resource (RAM, CPU, Disk) per server
- Menangani user management untuk panel
- Monitoring status dan resource usage server

## Prerequisites

Sebelum memulai, pastikan Anda memiliki:
- VPS/Server dengan minimal 2 CPU, 4GB RAM, 50GB SSD
- OS: Ubuntu 20.04/22.04 LTS atau Debian 11/12
- Domain/subdomain yang pointing ke server
- SSL Certificate (Let's Encrypt)

---

## Step 1: Install Pterodactyl Panel

### 1.1 Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git zip unzip nginx certbot python3-certbot-nginx

# Add PHP repository
add-apt-repository -y ppa:ondrej/php
apt update

# Install PHP 8.1 dan extensions
apt install -y php8.1 php8.1-cli php8.1-fpm php8.1-gd php8.1-mysql php8.1-mbstring \
    php8.1-bcmath php8.1-xml php8.1-curl php8.1-zip php8.1-intl php8.1-sqlite3

# Install Composer
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Redis
apt install -y redis-server

# Install MariaDB
apt install -y mariadb-server
```

### 1.2 Configure Database

```bash
# Secure MariaDB installation
mysql_secure_installation

# Create database and user
mysql -u root -p
```

```sql
CREATE DATABASE panel;
CREATE USER 'pterodactyl'@'127.0.0.1' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'127.0.0.1' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

### 1.3 Install Panel

```bash
# Create directory
mkdir -p /var/www/pterodactyl
cd /var/www/pterodactyl

# Download panel
curl -Lo panel.tar.gz https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz
tar -xzvf panel.tar.gz
chmod -R 755 storage/* bootstrap/cache/

# Install dependencies
composer install --no-dev --optimize-autoloader

# Create environment file
cp .env.example .env

# Generate application key
php artisan key:generate --force

# Konfigurasi database di .env
# Edit DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
nano .env
```

Contoh konfigurasi `.env`:
```env
APP_URL=https://panel.yourdomain.com
APP_TIMEZONE=Asia/Jakarta
APP_SERVICE_AUTHOR="your-email@example.com"

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=panel
DB_USERNAME=pterodactyl
DB_PASSWORD=your_strong_password

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_DRIVER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="Pterodactyl Panel"
```

```bash
# Setup database
php artisan migrate --seed --force

# Create first admin user
php artisan p:user:make

# Set permissions
chown -R www-data:www-data /var/www/pterodactyl/*

# Optimize
php artisan optimize
```

### 1.4 Configure Nginx

```bash
# Create nginx config
nano /etc/nginx/sites-available/pterodactyl
```

```nginx
server {
    listen 80;
    server_name panel.yourdomain.com;
    
    root /var/www/pterodactyl/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/pterodactyl /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Setup SSL
certbot --nginx -d panel.yourdomain.com
```

### 1.5 Setup Queue Workers

```bash
# Create systemd service
nano /etc/systemd/system/pteroq.service
```

```ini
[Unit]
Description=Pterodactyl Queue Worker
After=redis-server.service

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/pterodactyl/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable --now pteroq.service
systemctl enable --now redis-server
```

---

## Step 2: Configure Panel URL

Setelah instalasi selesai, panel Anda dapat diakses di:

```
https://panel.yourdomain.com
```

### Environment Variable

```env
VITE_PTERODACTYL_PANEL_URL=https://panel.yourdomain.com
```

---

## Step 3: Generate API Keys

Pterodactyl menggunakan dua jenis API key:

### 3.1 Application API Key (PTLA) - Admin Level

Digunakan untuk:
- Membuat/menghapus server
- Membuat/menghapus user
- Melihat semua server dan nodes
- Mengelola allocations

**Cara Generate:**
1. Login ke Panel Admin
2. Klik **Admin** di pojok kanan atas
3. Pilih **Application API** di sidebar
4. Klik **Create New**
5. Isi:
   - **Name**: `Layanan Digital API`
   - **Description**: `API untuk integrasi toko digital`
   - **Allowed IPs**: (kosongkan untuk allow all)
6. Klik **Create**
7. **COPY API KEY** (hanya ditampilkan sekali!)

Format: `ptla_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3.2 Client API Key (PTLC) - User Level

Digunakan untuk:
- Mengontrol server (start/stop/restart)
- Melihat resource usage
- Mengakses file manager
- Melihat console

**Cara Generate:**
1. Login ke Panel
2. Klik **Account** di pojok kanan atas
3. Pilih **API Credentials**
4. Klik **Create New**
5. Isi:
   - **Name**: `Layanan Digital Client`
   - **Description**: `Client API untuk monitoring`
6. Klik **Create**
7. **COPY API KEY** (hanya ditampilkan sekali!)

Format: `ptlc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Environment Variables

```env
# Application API Key (PTLA)
VITE_PTERODACTYL_API_KEY=ptla_your_application_api_key

# Client API Key (PTLC)
VITE_PTERODACTYL_CLIENT_API_KEY=ptlc_your_client_api_key
```

---

## Step 4: Setup Node and Location

### 4.1 Create Location

1. Masuk ke **Admin Panel**
2. Pilih **Locations** di sidebar
3. Klik **Create New**
4. Isi:
   - **Short Code**: `id-jkt` (contoh untuk Jakarta)
   - **Description**: `Indonesia - Jakarta Datacenter`
5. Klik **Create**

Note ID Location (contoh: `1`)

### 4.2 Create Node

1. Pilih **Nodes** di sidebar
2. Klik **Create New**
3. Isi konfigurasi:

| Field | Value |
|-------|-------|
| Name | `Node-01` |
| Description | `Primary Node` |
| Location | Pilih location yang dibuat |
| FQDN | `node1.yourdomain.com` |
| Scheme | `https` |
| Behind Proxy | `No` (kecuali pakai Cloudflare) |
| Memory | `32768` (32GB in MB) |
| Memory Overallocate | `0` |
| Disk | `500000` (500GB in MB) |
| Disk Overallocate | `0` |
| Daemon Port | `8080` |
| SFTP Port | `2022` |

4. Klik **Create Node**
5. Setelah dibuat, Anda akan mendapatkan **Configuration** untuk Wings

Note ID Node (contoh: `1`)

### 4.3 Configure Allocations

1. Klik node yang baru dibuat
2. Pilih tab **Allocation**
3. Klik **Create Allocations**
4. Isi:
   - **IP Address**: `192.168.1.100` (IP public node Anda)
   - **IP Alias**: (kosongkan atau isi domain)
   - **Ports**: `25565-25575, 8080-8090, 30000-30010`
5. Klik **Submit**

### Environment Variables

```env
VITE_PTERODACTYL_NODE_ID=1
VITE_PTERODACTYL_LOCATION_ID=1
```

---

## Step 5: Configure Eggs

Eggs adalah template untuk membuat game server.

### 5.1 Import Eggs

1. Download eggs dari [parker02311/eggs](https://github.com/parker02311/eggs) atau [parkervcp/eggs](https://github.com/parkervcp/eggs)
2. Masuk ke **Admin Panel**
3. Pilih **Nests** di sidebar
4. Klik **Import Egg**
5. Upload file `.json` egg
6. Pilih **Nest** yang sesuai (atau buat baru)

### 5.2 Common Eggs untuk Layanan Digital

| Service | Egg Name | Nest |
|---------|----------|------|
| Minecraft Java | Minecraft | Minecraft |
| Minecraft Bedrock | Bedrock | Minecraft |
| Discord Bot | Discord.js / Python | Voice Servers |
| Web Server | Nginx/Apache | Website |
| Database | MySQL/PostgreSQL | Databases |
| Custom VPS | Ubuntu/Debian | Operating Systems |

### 5.3 Get Egg ID and Nest ID

1. Pilih **Nests** di sidebar
2. Klik nest yang berisi egg yang ingin digunakan
3. Klik egg tersebut
4. Lihat URL: `/admin/nests/1/egg/2`
   - Nest ID: `1`
   - Egg ID: `2`

### Environment Variables

```env
VITE_PTERODACTYL_EGG_ID=2
VITE_PTERODACTYL_NEST_ID=1
```

---

## Step 6: Environment Variables

Tambahkan semua variabel ke file `.env`:

```env
# ============================================
# PTERODACTYL PANEL CONFIGURATION
# ============================================

# Panel URL (tanpa trailing slash)
VITE_PTERODACTYL_PANEL_URL=https://panel.yourdomain.com

# Application API Key (PTLA) - untuk admin operations
VITE_PTERODACTYL_API_KEY=ptla_your_application_api_key_here

# Client API Key (PTLC) - untuk user operations
VITE_PTERODACTYL_CLIENT_API_KEY=ptlc_your_client_api_key_here

# Default Node ID untuk create server
VITE_PTERODACTYL_NODE_ID=1

# Default Location ID
VITE_PTERODACTYL_LOCATION_ID=1

# Default Egg ID
VITE_PTERODACTYL_EGG_ID=2

# Default Nest ID
VITE_PTERODACTYL_NEST_ID=1
```

---

## Package Configurations

Aplikasi ini mendukung 3 paket server yang dapat dikonfigurasi di `src/lib/pterodactyl.ts`:

```typescript
export const PACKAGE_CONFIGS = {
  '5gb': {
    memory: 5120,    // 5GB RAM in MB
    disk: 5120,      // 5GB Disk in MB
    cpu: 100,        // 100% = 1 CPU core
    swap: 0,
    io: 500,
    databases: 1,
    backups: 1,
    allocations: 1
  },
  '10gb': {
    memory: 10240,   // 10GB RAM
    disk: 10240,     // 10GB Disk
    cpu: 200,        // 200% = 2 CPU cores
    swap: 0,
    io: 500,
    databases: 2,
    backups: 2,
    allocations: 1
  },
  'unlimited': {
    memory: 0,       // 0 = unlimited
    disk: 0,         // 0 = unlimited
    cpu: 0,          // 0 = unlimited
    swap: 0,
    io: 500,
    databases: 5,
    backups: 5,
    allocations: 2
  }
};
```

---

## API Integration

### Basic Usage

```typescript
import { PterodactylService, PACKAGE_CONFIGS } from '@/lib/pterodactyl';

// Create server
const server = await PterodactylService.createServer({
  name: 'My Minecraft Server',
  userId: '123',
  package: '10gb',
  eggId: 2,
  nodeId: 1,
  nestId: 1,
  description: 'Premium Minecraft Server'
});

// Get server details
const details = await PterodactylService.getServerDetails(server.id);

// Suspend/unsuspend server
await PterodactylService.suspendServer(server.id);
await PterodactylService.unsuspendServer(server.id);

// Delete server
await PterodactylService.deleteServer(server.id);
```

### Available Methods

| Method | Description |
|--------|-------------|
| `getNodes()` | Get list of nodes |
| `getNests()` | Get list of nests |
| `getEggs(nestId)` | Get eggs for a nest |
| `createServer(config)` | Create new server |
| `getServerDetails(id)` | Get server info |
| `deleteServer(id, force?)` | Delete server |
| `suspendServer(id)` | Suspend server |
| `unsuspendServer(id)` | Unsuspend server |
| `reinstallServer(id)` | Reinstall server |

---

## Troubleshooting

### Connection Issues

**Problem**: `Failed to connect to Pterodactyl API`

**Solutions**:
1. Cek URL panel: `VITE_PTERODACTYL_PANEL_URL`
2. Verifikasi API key valid dan belum expired
3. Cek firewall tidak memblokir koneksi
4. Pastikan SSL certificate valid

### API Key Issues

**Problem**: `401 Unauthorized`

**Solutions**:
1. Regenerate API key di panel
2. Pastikan menggunakan key yang benar (PTLA vs PTLC)
3. Cek IP whitelist di panel

### Server Creation Fails

**Problem**: Server tidak bisa dibuat

**Solutions**:
1. Cek allocations tersedia di node
2. Verifikasi egg ID valid
3. Pastikan user ID valid di panel
4. Cek resource limits node tidak exceeded

### Wings Issues

**Problem**: Node offline

**Solutions**:
```bash
# Check wings status
systemctl status wings

# Restart wings
systemctl restart wings

# View logs
journalctl -u wings -f
```

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 403 | Forbidden | Check API permissions |
| 404 | Not Found | Verify resource ID exists |
| 422 | Validation Error | Check request payload |
| 429 | Rate Limited | Reduce request frequency |
| 500 | Server Error | Check panel logs |

---

## Additional Resources

- [Pterodactyl Documentation](https://pterodactyl.io/project/introduction.html)
- [Pterodactyl API Reference](https://pterodactyl.io/api/reference.html)
- [Community Discord](https://discord.gg/pterodactyl)
- [GitHub Repository](https://github.com/pterodactyl/panel)

---

## Security Best Practices

1. **Always use HTTPS** untuk panel URL
2. **Rotate API keys** secara berkala
3. **IP Whitelist** untuk API keys jika memungkinkan
4. **Use strong passwords** untuk database dan admin
5. **Keep panel updated** ke versi terbaru
6. **Enable 2FA** untuk semua admin accounts
7. **Backup database** secara teratur
