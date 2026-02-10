# Panduan Setup EmailJS untuk Notifikasi Email

Panduan lengkap untuk setup EmailJS sebagai layanan pengiriman email untuk aplikasi Layanan Digital.

## Table of Contents

- [Overview](#overview)
- [Step 1: Create EmailJS Account](#step-1-create-emailjs-account)
- [Step 2: Add Email Service](#step-2-add-email-service)
- [Step 3: Create Email Templates](#step-3-create-email-templates)
- [Step 4: Get Public Key](#step-4-get-public-key)
- [Step 5: Environment Variables](#step-5-environment-variables)
- [Step 6: Test Email](#step-6-test-email)
- [Template Variables](#template-variables)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

EmailJS memungkinkan pengiriman email langsung dari client-side tanpa perlu backend server. Digunakan untuk:
- **Welcome Email** - Email selamat datang untuk user baru
- **Order Confirmation** - Konfirmasi pesanan
- **Admin Notifications** - Notifikasi ke admin untuk event penting
- **Payment Notifications** - Notifikasi status pembayaran

---

## Step 1: Create EmailJS Account

1. Kunjungi [https://www.emailjs.com](https://www.emailjs.com)
2. Klik **"Get Started For Free"**
3. Buat akun dengan:
   - Email dan password, atau
   - Sign up with Google, atau
   - Sign up with GitHub
4. Verifikasi email Anda
5. Complete profil (nama, company - bisa di-skip)

---

## Step 2: Add Email Service

1. Di EmailJS Dashboard, klik **"Email Services"** di sidebar
2. Klik **"Add New Service"**
3. Pilih email provider yang Anda gunakan:
   - **Gmail** (paling populer)
   - **Outlook**
   - **Yahoo**
   - **Private Email**
   - **SendGrid**
   - **Mailgun**
   - Dll.

### Untuk Gmail:

1. Pilih **Gmail**
2. Klik **"Connect Account"**
3. Login dengan akun Gmail yang akan digunakan
4. Beri izin EmailJS untuk mengirim email
5. Beri nama service: `layanan_digital_service`
6. Klik **"Create Service"**
7. **COPY Service ID** (contoh: `service_abc123`)

### Tips:

- Gunakan Gmail khusus untuk bisnis (contoh: `noreply@yourdomain.com`)
- Aktifkan **2-Step Verification** di Gmail
- Generate **App Password** untuk keamanan lebih baik

---

## Step 3: Create Email Templates

### 3.1 Welcome Email Template

1. Di Dashboard, klik **"Email Templates"**
2. Klik **"Create New Template"**
3. Beri nama: `welcome_template`
4. Klik **"Design"** tab untuk HTML editor

**HTML Template:**

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selamat Datang di {{site_name}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      padding: 50px 30px; 
      text-align: center; 
    }
    .header h1 { 
      color: white; 
      font-size: 32px; 
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .header p { 
      color: rgba(255,255,255,0.9); 
      font-size: 16px; 
    }
    .content { 
      padding: 40px 30px; 
    }
    .welcome-icon { 
      width: 100px; 
      height: 100px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      border-radius: 50%; 
      margin: 0 auto 30px; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }
    .welcome-icon svg { 
      width: 50px; 
      height: 50px; 
      fill: white; 
    }
    .content h2 { 
      color: #333; 
      font-size: 28px; 
      margin-bottom: 20px; 
      text-align: center; 
    }
    .content p { 
      color: #666; 
      line-height: 1.8; 
      margin-bottom: 15px; 
      font-size: 16px;
    }
    .features { 
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
      border-radius: 12px; 
      padding: 30px; 
      margin: 30px 0; 
    }
    .features h3 { 
      color: #333; 
      margin-bottom: 20px;
      font-size: 20px;
    }
    .features ul { 
      list-style: none; 
    }
    .features li { 
      padding: 12px 0; 
      color: #555; 
      border-bottom: 1px solid rgba(0,0,0,0.1);
      font-size: 15px;
    }
    .features li:last-child { 
      border-bottom: none; 
    }
    .features li:before { 
      content: "✓"; 
      color: #667eea; 
      font-weight: bold; 
      margin-right: 12px;
      font-size: 18px;
    }
    .user-info {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .user-info p {
      margin: 8px 0;
      color: #555;
    }
    .user-info strong {
      color: #333;
    }
    .cta-button { 
      display: inline-block; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      text-decoration: none; 
      padding: 18px 50px; 
      border-radius: 30px; 
      text-align: center; 
      font-weight: bold; 
      font-size: 16px;
      margin: 30px auto;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
      transition: transform 0.3s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .footer { 
      background: #f8f9fa; 
      padding: 30px; 
      text-align: center; 
    }
    .footer p { 
      color: #999; 
      font-size: 14px;
      margin: 5px 0;
    }
    .social-links { 
      margin-top: 20px; 
    }
    .social-links a { 
      display: inline-block; 
      margin: 0 15px; 
      color: #667eea; 
      text-decoration: none;
      font-weight: 500;
    }
    @media (max-width: 600px) {
      .header { padding: 40px 20px; }
      .header h1 { font-size: 24px; }
      .content { padding: 30px 20px; }
      .content h2 { font-size: 22px; }
      .features { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{site_name}}</h1>
      <p>Solusi Digital Terbaik untuk Anda</p>
    </div>
    
    <div class="content">
      <div class="welcome-icon">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
      </div>
      
      <h2>Selamat Datang, {{user_name}}! 🎉</h2>
      
      <p>Terima kasih telah bergabung dengan {{site_name}}. Akun Anda telah berhasil dibuat dan siap digunakan.</p>
      
      <p>Dengan akun ini, Anda dapat:</p>
      
      <div class="features">
        <ul>
          <li>Memesan berbagai layanan digital profesional</li>
          <li>Melacak status pesanan secara real-time</li>
          <li>Mengakses riwayat transaksi lengkap</li>
          <li>Mendapatkan penawaran eksklusif</li>
          <li>Chat support 24/7 dengan tim kami</li>
        </ul>
      </div>
      
      <div class="user-info">
        <p><strong>Email terdaftar:</strong> {{user_email}}</p>
        <p><strong>Tanggal registrasi:</strong> {{registration_date}}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="{{site_url}}" class="cta-button">Mulai Berbelanja</a>
      </div>
      
      <p style="text-align: center; font-size: 14px; color: #999; margin-top: 20px;">
        Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi tim support kami.
      </p>
    </div>
    
    <div class="footer">
      <p>&copy; {{current_year}} {{site_name}}. All rights reserved.</p>
      <p style="margin-top: 10px;">{{owner_name}} | {{owner_phone}}</p>
      <div class="social-links">
        <a href="{{site_url}}">Website</a>
        <a href="{{whatsapp_url}}">WhatsApp</a>
        <a href="{{instagram_url}}">Instagram</a>
      </div>
    </div>
  </div>
</body>
</html>
```

5. **Template Settings**:
   - **Template ID**: `welcome_template`
   - **Subject**: `Selamat Datang di {{site_name}}! 🎉`
   - **From Name**: `{{site_name}}`
   - **From Email**: `{{owner_email}}`

6. Klik **"Save"**

### 3.2 Order Confirmation Template

1. Klik **"Create New Template"**
2. Beri nama: `order_confirmation_template`

**HTML Template:**

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Pesanan #{{order_id}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: #f5f5f5;
      padding: 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 { 
      color: white; 
      font-size: 28px; 
      margin-bottom: 10px;
    }
    .header p { 
      color: rgba(255,255,255,0.9); 
      font-size: 16px; 
    }
    .content { 
      padding: 40px 30px; 
    }
    .order-status {
      text-align: center;
      margin-bottom: 30px;
    }
    .status-badge {
      display: inline-block;
      background: #e8f5e9;
      color: #2e7d32;
      padding: 10px 25px;
      border-radius: 25px;
      font-weight: bold;
      font-size: 14px;
    }
    .order-details { 
      background: #f8f9fa; 
      border-radius: 12px; 
      padding: 25px; 
      margin: 25px 0; 
    }
    .order-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 12px 0; 
      border-bottom: 1px solid #e0e0e0;
      font-size: 15px;
    }
    .order-row:last-child { 
      border-bottom: none; 
      font-weight: bold; 
      font-size: 18px; 
      color: #11998e;
      padding-top: 15px;
      margin-top: 10px;
      border-top: 2px solid #11998e;
    }
    .order-row span:first-child {
      color: #666;
    }
    .order-row span:last-child {
      color: #333;
      font-weight: 500;
    }
    .items-list {
      margin: 20px 0;
    }
    .item {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      background: white;
      border-radius: 8px;
      margin-bottom: 10px;
      border: 1px solid #e0e0e0;
    }
    .item-name {
      font-weight: 500;
      color: #333;
    }
    .item-price {
      color: #11998e;
      font-weight: bold;
    }
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .info-box p {
      color: #1565c0;
      line-height: 1.6;
    }
    .cta-button { 
      display: block; 
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); 
      color: white; 
      text-decoration: none; 
      padding: 16px 40px; 
      border-radius: 30px; 
      text-align: center; 
      font-weight: bold; 
      margin: 30px auto;
      max-width: 250px;
    }
    .footer { 
      background: #f8f9fa; 
      padding: 30px; 
      text-align: center; 
    }
    .footer p { 
      color: #999; 
      font-size: 14px;
      margin: 5px 0;
    }
    @media (max-width: 600px) {
      .content { padding: 25px 20px; }
      .item { flex-direction: column; gap: 5px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 Pesanan Diterima!</h1>
      <p>Terima kasih telah berbelanja di {{site_name}}</p>
    </div>
    
    <div class="content">
      <div class="order-status">
        <span class="status-badge">{{status}}</span>
      </div>
      
      <p style="text-align: center; color: #666; margin-bottom: 25px;">
        Halo <strong>{{customer_name}}</strong>, pesanan Anda telah kami terima dan sedang diproses.
      </p>
      
      <div class="order-details">
        <div class="order-row">
          <span>Nomor Pesanan:</span>
          <span>#{{order_id}}</span>
        </div>
        <div class="order-row">
          <span>Tanggal:</span>
          <span>{{order_date}}</span>
        </div>
        <div class="order-row">
          <span>Metode Pembayaran:</span>
          <span>{{payment_method}}</span>
        </div>
        <div class="order-row">
          <span>Total Pembayaran:</span>
          <span>Rp {{total_amount}}</span>
        </div>
      </div>
      
      <h3 style="color: #333; margin-bottom: 15px;">Detail Produk:</h3>
      <div class="items-list">
        {{#each items}}
        <div class="item">
          <span class="item-name">{{name}} (x{{quantity}})</span>
          <span class="item-price">Rp {{price}}</span>
        </div>
        {{/each}}
      </div>
      
      <div class="info-box">
        <p><strong>💡 Informasi Penting:</strong><br>
        {{status_message}}</p>
      </div>
      
      <a href="{{order_url}}" class="cta-button">Lihat Detail Pesanan</a>
    </div>
    
    <div class="footer">
      <p>Butuh bantuan? Hubungi kami di {{support_email}} atau {{support_phone}}</p>
      <p style="margin-top: 15px;">&copy; {{current_year}} {{site_name}}</p>
    </div>
  </div>
</body>
</html>
```

3. **Template Settings**:
   - **Template ID**: `order_confirmation_template`
   - **Subject**: `Konfirmasi Pesanan #{{order_id}} - {{site_name}}`

### 3.3 Admin Notification Template

1. Klik **"Create New Template"**
2. Beri nama: `admin_notification_template`

**HTML Template:**

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔔 Notifikasi Admin - {{site_name}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: #f5f5f5;
      padding: 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      padding: 30px; 
      text-align: center; 
    }
    .header h1 { 
      color: white; 
      font-size: 24px; 
    }
    .content { 
      padding: 30px; 
    }
    .notification-type {
      text-align: center;
      margin-bottom: 25px;
    }
    .type-badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .type-order { background: #e8f5e9; color: #2e7d32; }
    .type-user { background: #e3f2fd; color: #1565c0; }
    .type-payment { background: #fff3e0; color: #ef6c00; }
    .type-system { background: #fce4ec; color: #c2185b; }
    .info-box { 
      background: #f8f9fa; 
      border-left: 4px solid #667eea; 
      padding: 20px; 
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .info-box p {
      margin: 8px 0;
      color: #555;
      font-size: 15px;
    }
    .info-box strong {
      color: #333;
      display: inline-block;
      width: 120px;
    }
    .status-success { 
      color: #2e7d32; 
      font-weight: bold;
      background: #e8f5e9;
      padding: 2px 10px;
      border-radius: 12px;
    }
    .status-error { 
      color: #c62828; 
      font-weight: bold;
      background: #ffebee;
      padding: 2px 10px;
      border-radius: 12px;
    }
    .status-warning {
      color: #ef6c00;
      font-weight: bold;
      background: #fff3e0;
      padding: 2px 10px;
      border-radius: 12px;
    }
    .cta-button { 
      display: block; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      text-decoration: none; 
      padding: 14px 30px; 
      border-radius: 25px; 
      text-align: center; 
      font-weight: bold; 
      margin: 25px auto;
      max-width: 200px;
    }
    .footer { 
      background: #f8f9fa; 
      padding: 25px; 
      text-align: center; 
    }
    .footer p { 
      color: #999; 
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Notifikasi {{site_name}}</h1>
    </div>
    
    <div class="content">
      <div class="notification-type">
        <span class="type-badge type-{{notification_type_class}}">{{notification_type}}</span>
      </div>
      
      <div class="info-box">
        <p><strong>Event:</strong> {{event_name}}</p>
        <p><strong>Waktu:</strong> {{timestamp}}</p>
        <p><strong>Status:</strong> <span class="status-{{status}}">{{status_text}}</span></p>
        {{#if user_email}}
        <p><strong>User:</strong> {{user_email}}</p>
        {{/if}}
        {{#if ip_address}}
        <p><strong>IP Address:</strong> {{ip_address}}</p>
        {{/if}}
        {{#if amount}}
        <p><strong>Amount:</strong> Rp {{amount}}</p>
        {{/if}}
      </div>
      
      {{#if details}}
      <div class="info-box" style="border-left-color: #999;">
        <p><strong>Detail:</strong></p>
        <p style="margin-top: 10px; white-space: pre-line;">{{details}}</p>
      </div>
      {{/if}}
      
      {{#if action_url}}
      <a href="{{action_url}}" class="cta-button">Lihat Detail</a>
      {{/if}}
    </div>
    
    <div class="footer">
      <p>Email notifikasi otomatis dari {{site_name}}</p>
      <p style="margin-top: 10px;">{{current_year}}</p>
    </div>
  </div>
</body>
</html>
```

3. **Template Settings**:
   - **Template ID**: `admin_notification_template`
   - **Subject**: `[{{site_name}}] {{notification_type}} - {{event_name}}`

---

## Step 4: Get Public Key

1. Klik **"Account"** di sidebar
2. Pilih **"General"**
3. Copy **Public Key** (contoh: `user_xxxxxxxxxxxxxxxx`)
4. Ini akan digunakan sebagai `VITE_EMAILJS_PUBLIC_KEY`

---

## Step 5: Environment Variables

Tambahkan ke file `.env`:

```env
# ============================================
# EMAILJS CONFIGURATION
# ============================================

# EmailJS Service ID dari step 2
VITE_EMAILJS_SERVICE_ID=service_abc123

# Template IDs dari step 3
VITE_EMAILJS_WELCOME_TEMPLATE_ID=welcome_template
VITE_EMAILJS_ORDER_TEMPLATE_ID=order_confirmation_template
VITE_EMAILJS_ADMIN_TEMPLATE_ID=admin_notification_template

# Public Key dari step 4
VITE_EMAILJS_PUBLIC_KEY=user_xxxxxxxxxxxxxxxx

# Owner email untuk notifikasi admin
VITE_OWNER_EMAIL=admin@yourdomain.com
```

---

## Step 6: Test Email

### Test via Code

```typescript
import emailjs from '@emailjs/browser';

// Initialize dengan public key
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

// Test welcome email
async function testWelcomeEmail() {
  try {
    const result = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID,
      {
        site_name: 'Layanan Digital',
        user_name: 'Test User',
        user_email: 'test@example.com',
        registration_date: new Date().toLocaleDateString('id-ID'),
        site_url: 'https://yourdomain.com',
        current_year: new Date().getFullYear(),
        owner_name: 'Admin',
        owner_phone: '08123456789',
        whatsapp_url: 'https://wa.me/628123456789',
        instagram_url: 'https://instagram.com/youraccount'
      }
    );
    console.log('Email sent!', result.text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testWelcomeEmail();
```

### Test via Dashboard

1. Buka template yang ingin di-test
2. Klik **"Preview"** tab
3. Isi template variables
4. Klik **"Send Test Email"**

---

## Template Variables

### Welcome Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{site_name}}` | Nama website | "Layanan Digital" |
| `{{user_name}}` | Nama user | "John Doe" |
| `{{user_email}}` | Email user | "john@example.com" |
| `{{registration_date}}` | Tanggal registrasi | "10 Februari 2026" |
| `{{site_url}}` | URL website | "https://yourdomain.com" |
| `{{current_year}}` | Tahun saat ini | "2026" |
| `{{owner_name}}` | Nama owner | "Admin" |
| `{{owner_phone}}` | Telepon owner | "08123456789" |
| `{{whatsapp_url}}` | URL WhatsApp | "https://wa.me/628123456789" |
| `{{instagram_url}}` | URL Instagram | "https://instagram.com/..." |

### Order Confirmation Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{site_name}}` | Nama website | "Layanan Digital" |
| `{{order_id}}` | ID pesanan | "ORD-123456" |
| `{{customer_name}}` | Nama customer | "John Doe" |
| `{{status}}` | Status pesanan | "Menunggu Pembayaran" |
| `{{order_date}}` | Tanggal order | "10 Februari 2026" |
| `{{payment_method}}` | Metode pembayaran | "QRIS" |
| `{{total_amount}}` | Total pembayaran | "150.000" |
| `{{items}}` | Daftar item | Array of items |
| `{{status_message}}` | Pesan status | "Silakan lakukan pembayaran..." |
| `{{order_url}}` | URL detail order | "https://.../order/123" |

### Admin Notification Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{site_name}}` | Nama website | "Layanan Digital" |
| `{{notification_type}}` | Tipe notifikasi | "New Order" |
| `{{notification_type_class}}` | Class CSS | "order" |
| `{{event_name}}` | Nama event | "Order Created" |
| `{{timestamp}}` | Waktu | "10 Feb 2026, 14:30" |
| `{{status}}` | Status | "success" / "error" |
| `{{status_text}}` | Text status | "Sukses" / "Gagal" |
| `{{user_email}}` | Email user | "john@example.com" |
| `{{ip_address}}` | IP address | "192.168.1.1" |
| `{{amount}}` | Jumlah | "150.000" |
| `{{details}}` | Detail tambahan | "User melakukan order..." |
| `{{action_url}}` | URL aksi | "https://.../admin/orders" |

---

## API Integration

### Setup EmailJS Service

```typescript
// src/lib/emailjs.ts
import emailjs from '@emailjs/browser';

// Initialize
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

// Send welcome email
export async function sendWelcomeEmail(userData: {
  user_name: string;
  user_email: string;
}) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID,
    {
      site_name: import.meta.env.VITE_SITE_NAME,
      user_name: userData.user_name,
      user_email: userData.user_email,
      registration_date: new Date().toLocaleDateString('id-ID'),
      site_url: import.meta.env.VITE_SITE_URL,
      current_year: new Date().getFullYear(),
      owner_name: import.meta.env.VITE_OWNER_NAME,
      owner_phone: import.meta.env.VITE_OWNER_PHONE,
      whatsapp_url: import.meta.env.VITE_OWNER_WHATSAPP,
      instagram_url: import.meta.env.VITE_INSTAGRAM_URL,
    }
  );
}

// Send order confirmation
export async function sendOrderConfirmation(orderData: {
  customer_name: string;
  customer_email: string;
  order_id: string;
  total_amount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID,
    {
      site_name: import.meta.env.VITE_SITE_NAME,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      order_id: orderData.order_id,
      order_date: new Date().toLocaleDateString('id-ID'),
      status: 'Menunggu Pembayaran',
      payment_method: 'QRIS',
      total_amount: orderData.total_amount.toLocaleString('id-ID'),
      items: orderData.items,
      status_message: 'Silakan lakukan pembayaran dalam 24 jam',
      order_url: `${import.meta.env.VITE_SITE_URL}/orders/${orderData.order_id}`,
      current_year: new Date().getFullYear(),
      support_email: import.meta.env.VITE_OWNER_EMAIL,
      support_phone: import.meta.env.VITE_OWNER_PHONE,
    }
  );
}

// Send admin notification
export async function sendAdminNotification(data: {
  notification_type: string;
  event_name: string;
  status: 'success' | 'error' | 'warning';
  user_email?: string;
  details?: string;
}) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID,
    {
      site_name: import.meta.env.VITE_SITE_NAME,
      notification_type: data.notification_type,
      notification_type_class: data.notification_type.toLowerCase().replace(/\s+/g, '-'),
      event_name: data.event_name,
      timestamp: new Date().toLocaleString('id-ID'),
      status: data.status,
      status_text: data.status === 'success' ? 'Sukses' : data.status === 'error' ? 'Gagal' : 'Peringatan',
      user_email: data.user_email || '-',
      details: data.details || '',
      current_year: new Date().getFullYear(),
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
}
```

---

## Troubleshooting

### Email Not Sending

**Error**: `Error: The public key is required`

**Solution**:
```typescript
// Pastikan init dipanggil
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

// Atau pass public key di send()
emailjs.send(serviceId, templateId, templateParams, publicKey);
```

### Template Variables Not Working

**Problem**: Variable muncul sebagai text kosong

**Solutions**:
1. Cek nama variable sesuai (case-sensitive)
2. Pastikan tidak ada typo
3. Verify variable di-delimit dengan `{{}}`
4. Cek template sudah di-save

### CORS Error

**Error**: `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution**: EmailJS tidak memerlukan CORS configuration karena menggunakan JSONP.
Jika ada masalah, cek:
1. Adblocker tidak memblokir request
2. Browser extension tidak mengganggu

### Rate Limit

**Error**: `Too many requests`

**Limits**:
- **Free**: 200 emails/month
- **Personal**: 5,000 emails/month ($5)
- **Business**: 50,000 emails/month ($15)

**Solutions**:
1. Upgrade plan jika perlu
2. Implement rate limiting di aplikasi
3. Cache email yang sering dikirim

---

## Pricing

| Plan | Emails/Month | Price | Features |
|------|--------------|-------|----------|
| **Free** | 200 | Free | Basic features |
| **Personal** | 5,000 | $5 | Priority support |
| **Business** | 50,000 | $15 | Advanced features |

---

## Additional Resources

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS React Integration](https://www.emailjs.com/docs/examples/reactjs/)
- [EmailJS SDK Reference](https://www.emailjs.com/docs/sdk/send/)
