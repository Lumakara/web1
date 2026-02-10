# Panduan Setup Pakasir Payment Gateway

Panduan lengkap untuk mengintegrasikan Pakasir Payment Gateway dengan aplikasi Layanan Digital untuk pembayaran QRIS.

## Table of Contents

- [Overview](#overview)
- [Step 1: Create Pakasir Account](#step-1-create-pakasir-account)
- [Step 2: Create Project](#step-2-create-project)
- [Step 3: Get API Key](#step-3-get-api-key)
- [Step 4: Configure QRIS Only](#step-4-configure-qr-only)
- [Step 5: Setup Webhook](#step-5-setup-webhook)
- [Step 6: Environment Variables](#step-6-environment-variables)
- [QRIS Integration](#qris-integration)
- [Webhook Implementation](#webhook-implementation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

Pakasir adalah payment gateway Indonesia yang mendukung:
- **QRIS** - Scan QR dengan semua e-wallet (GoPay, OVO, DANA, LinkAja, dll)
- **Virtual Account** - Transfer bank (BNI, BRI, CIMB, Permata, Maybank)
- **PayPal** - Pembayaran internasional

Aplikasi ini dikonfigurasi untuk **QRIS Only** sebagai metode pembayaran utama.

---

## Step 1: Create Pakasir Account

1. Kunjungi [https://pakasir.com](https://pakasir.com)
2. Klik **"Daftar"** atau **"Get Started"**
3. Pilih metode registrasi:
   - Email dan password
   - Google account
   - WhatsApp
4. Verifikasi email/nomor telepon
5. Login ke dashboard

---

## Step 2: Create Project

1. Di Dashboard, klik **"Buat Proyek Baru"**
2. Isi informasi proyek:

| Field | Value | Contoh |
|-------|-------|--------|
| **Nama Proyek** | Nama bisnis Anda | "Layanan Digital" |
| **Slug** | Identifier unik (lowercase, no space) | `layanandigital` |
| **Deskripsi** | Deskripsi singkat | "Penyedia layanan VPS, WiFi, dan jasa digital" |
| **Kategori** | Kategori bisnis | "Teknologi" |
| **Website** | URL website (opsional) | `https://yourdomain.com` |

3. Klik **"Simpan"**
4. Project akan dibuat dengan status **"Sandbox"** (development mode)

---

## Step 3: Get API Key

1. Masuk ke detail project yang baru dibuat
2. Klik tab **"Pengaturan"** atau **"API Keys"**
3. Copy nilai berikut:

| Key | Description | Format |
|-----|-------------|--------|
| **Project Slug** | Unique identifier | `layanandigital` |
| **API Key** | Secret key untuk API calls | `pak_xxxxxxxxxxxxxxxx` |
| **Webhook Secret** | Untuk verify webhook (opsional) | `whsec_xxxxxxxxxxxxx` |

4. Untuk production, toggle **"Mode Live"** dan konfirmasi
5. **PENTING**: API key Sandbox berbeda dengan Live

---

## Step 4: Configure QRIS Only

### 4.1 Enable QRIS Payment

1. Di project settings, pilih **"Metode Pembayaran"**
2. Enable **QRIS**
3. Disable metode lain (VA, PayPal) jika tidak digunakan
4. Atur konfigurasi QRIS:

| Setting | Value | Description |
|---------|-------|-------------|
| **Status** | Aktif | Enable/disable QRIS |
| **Fee Type** | Merchant/Customer | Siapa yang bayar fee |
| **Min Amount** | 10000 | Minimum transaksi (Rp 10.000) |
| **Max Amount** | 10000000 | Maximum transaksi (Rp 10.000.000) |

### 4.2 QRIS Fee Structure

| Provider | Fee | Processing Time |
|----------|-----|-----------------|
| GoPay | 0.7% | Instant |
| OVO | 0.7% | Instant |
| DANA | 0.7% | Instant |
| LinkAja | 0.7% | Instant |
| ShopeePay | 0.7% | Instant |

---

## Step 5: Setup Webhook

Webhook digunakan untuk menerima notifikasi real-time saat pembayaran berhasil.

### 5.1 Configure Webhook URL

1. Di project settings, cari **"Webhook URL"**
2. Masukkan URL endpoint Anda:

```
Production: https://yourdomain.com/api/webhook/pakasir
Development: https://ngrok-url.ngrok.io/api/webhook/pakasir
```

3. Pilih event yang di-subscribe:
   - ☑️ `payment.completed` - Pembayaran berhasil
   - ☑️ `payment.failed` - Pembayaran gagal
   - ☐ `payment.pending` - Menunggu pembayaran (opsional)
   - ☐ `payment.expired` - Pembayaran expired (opsional)

4. Simpan konfigurasi

### 5.2 Webhook Secret (Optional)

Untuk keamanan tambahan:
1. Generate **Webhook Secret** di dashboard
2. Gunakan untuk verify signature di server Anda
3. Simpan di environment variable

---

## Step 6: Environment Variables

Tambahkan ke file `.env`:

```env
# ============================================
# PAKASIR PAYMENT GATEWAY
# ============================================

# Project slug dari step 3
VITE_PAKASIR_SLUG=layanandigital

# API Key dari step 3 (Sandbox untuk development)
VITE_PAKASIR_API_KEY=pak_your_api_key_here

# Webhook secret untuk verify webhook (optional)
VITE_PAKASIR_WEBHOOK_SECRET=whsec_your_webhook_secret

# Mode: 'sandbox' atau 'live'
VITE_PAKASIR_MODE=sandbox
```

**Catatan**: Untuk production, ganti ke API key Live dan ubah mode ke `live`.

---

## QRIS Integration

### Method 1: Redirect Method (Simplest)

User di-redirect ke halaman pembayaran Pakasir:

```typescript
// src/lib/pakasir.ts

const PAKASIR_BASE_URL = 'https://app.pakasir.com';

/**
 * Generate payment URL dengan redirect
 */
export function generatePaymentUrl(
  amount: number,
  orderId: string,
  customerName?: string,
  customerEmail?: string
): string {
  const params = new URLSearchParams({
    order_id: orderId,
    qris_only: '1', // Force QRIS only
    redirect: `${window.location.origin}/payment/success`,
    cancel_redirect: `${window.location.origin}/payment/cancel`,
  });

  if (customerName) params.append('customer_name', customerName);
  if (customerEmail) params.append('customer_email', customerEmail);

  return `${PAKASIR_BASE_URL}/pay/${import.meta.env.VITE_PAKASIR_SLUG}/${amount}?${params}`;
}

// Usage
function handleCheckout() {
  const amount = 150000; // Rp 150.000
  const orderId = `ORDER-${Date.now()}`;
  
  const paymentUrl = generatePaymentUrl(
    amount,
    orderId,
    'John Doe',
    'john@example.com'
  );
  
  // Redirect ke halaman pembayaran
  window.location.href = paymentUrl;
}
```

### Method 2: API Integration (Advanced)

Dapatkan QRIS code untuk ditampilkan inline:

```typescript
/**
 * Create QRIS transaction via API
 */
export async function createQrisTransaction(
  amount: number,
  orderId: string,
  description?: string
): Promise<QrisTransactionResponse> {
  const response = await fetch(`${PAKASIR_BASE_URL}/api/transactioncreate/qris`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project: import.meta.env.VITE_PAKASIR_SLUG,
      order_id: orderId,
      amount: amount,
      api_key: import.meta.env.VITE_PAKASIR_API_KEY,
      description: description || `Pembayaran #${orderId}`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create transaction');
  }

  return response.json();
}

// Response type
interface QrisTransactionResponse {
  success: boolean;
  payment: {
    project: string;
    order_id: string;
    amount: number;
    fee: number;
    total_payment: number;
    payment_method: 'qris';
    payment_number: string; // QRIS string ( untuk generate QR code)
    expired_at: string; // ISO 8601 timestamp
  };
}

// Usage
async function displayQrisCode() {
  const transaction = await createQrisTransaction(
    150000,
    `ORDER-${Date.now()}`,
    'Pembayaran VPS Hosting'
  );
  
  // Generate QR code dari payment_number
  const qrisString = transaction.payment.payment_number;
  // Use library seperti qrcode.js untuk generate QR image
}
```

### Method 3: Check Payment Status

```typescript
/**
 * Check transaction status
 */
export async function checkTransactionStatus(
  orderId: string
): Promise<TransactionStatus> {
  const response = await fetch(`${PAKASIR_BASE_URL}/api/transactionstatus`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project: import.meta.env.VITE_PAKASIR_SLUG,
      order_id: orderId,
      api_key: import.meta.env.VITE_PAKASIR_API_KEY,
    }),
  });

  return response.json();
}

interface TransactionStatus {
  success: boolean;
  transaction?: {
    order_id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'expired' | 'cancelled';
    payment_method: string;
    completed_at?: string;
  };
}
```

---

## Webhook Implementation

### Webhook Handler (Server-side)

```typescript
// pages/api/webhook/pakasir.ts (Next.js example)
// atau express route

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;

    // Verify webhook secret (optional but recommended)
    const signature = req.headers['x-pakasir-signature'];
    if (process.env.VITE_PAKASIR_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(
        payload,
        signature,
        process.env.VITE_PAKASIR_WEBHOOK_SECRET
      );
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Handle payment completed
    if (payload.status === 'completed') {
      const { order_id, amount, payment_method, completed_at } = payload;

      // Update order status in database
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_method: payment_method,
          payment_reference: payload.reference,
          payment_data: payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order_id);

      if (error) {
        console.error('Failed to update order:', error);
        return res.status(500).json({ error: 'Database error' });
      }

      // Trigger order fulfillment (create VPS, WiFi, etc.)
      await fulfillOrder(order_id);

      // Send confirmation email
      await sendPaymentConfirmationEmail(order_id);

      console.log(`✅ Payment completed for order ${order_id}`);
    }

    // Handle payment failed
    if (payload.status === 'failed') {
      const { order_id, error_message } = payload;

      await supabase
        .from('orders')
        .update({
          status: 'failed',
          metadata: { error: error_message },
        })
        .eq('id', order_id);

      console.log(`❌ Payment failed for order ${order_id}: ${error_message}`);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Verify webhook signature
function verifyWebhookSignature(
  payload: any,
  signature: string | string[] | undefined,
  secret: string
): boolean {
  // Implementasi tergantung format signature dari Pakasir
  // Biasanya menggunakan HMAC SHA256
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expected;
}

// Fulfill order after payment
async function fulfillOrder(orderId: string) {
  // Get order details
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (!order) return;

  // Process each item
  for (const item of order.items) {
    switch (item.category) {
      case 'vps':
        await createPterodactylServer(order.user_id, item);
        break;
      case 'wifi':
        await createWifiInstallation(order.user_id, item);
        break;
      // ... other categories
    }
  }
}
```

### Webhook Payload Structure

```typescript
interface PakasirWebhookPayload {
  // Transaction info
  order_id: string;
  project: string;
  amount: number;
  fee: number;
  total_payment: number;
  
  // Payment status
  status: 'pending' | 'completed' | 'failed' | 'expired' | 'cancelled';
  payment_method: 'qris' | 'bni_va' | 'bri_va' | 'cimb_niaga_va' | 'permata_va' | 'maybank_va' | 'paypal';
  
  // Timestamps
  created_at: string; // ISO 8601
  completed_at?: string;
  expired_at: string;
  
  // Optional fields
  reference?: string;
  error_message?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
}
```

---

## Testing

### Sandbox Testing

1. Pastikan mode di-dashboard adalah **Sandbox**
2. Gunakan API key Sandbox di environment
3. Buat transaksi test
4. Gunakan QRIS simulator untuk test pembayaran

### Simulate Payment (cURL)

```bash
# Simulate successful payment
curl -X POST 'https://app.pakasir.com/api/paymentsimulation' \
  -H 'Content-Type: application/json' \
  -d '{
    "project": "your_slug",
    "order_id": "TEST123",
    "amount": 100000,
    "api_key": "your_api_key"
  }'

# Cancel transaction
curl -X POST 'https://app.pakasir.com/api/transactioncancel' \
  -H 'Content-Type: application/json' \
  -d '{
    "project": "your_slug",
    "order_id": "TEST123",
    "api_key": "your_api_key"
  }'
```

### Test Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| QRIS Scanned & Paid | Webhook `completed` received |
| QRIS Expired | Webhook `expired` received |
| Cancel Transaction | Webhook `cancelled` received |
| Invalid API Key | Error 401 Unauthorized |
| Duplicate Order ID | Error 409 Conflict |

---

## Troubleshooting

### Invalid API Key

**Error**: `{"error": "Invalid API key"}`

**Solutions**:
1. Cek API key sudah benar (Sandbox vs Live)
2. Pastikan tidak ada whitespace
3. Regenerate API key jika perlu

### Order ID Duplicate

**Error**: `{"error": "Order ID already exists"}`

**Solutions**:
```typescript
// Generate unique order ID
const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

### Webhook Not Received

**Problem**: Webhook tidak ter-trigger

**Solutions**:
1. Cek URL webhook publicly accessible
2. Pastikan menggunakan HTTPS untuk production
3. Cek firewall tidak memblokir request
4. Test dengan ngrok untuk development

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Copy https URL ke webhook settings
# https://xxxx.ngrok.io/api/webhook/pakasir
```

### QRIS Not Showing

**Problem**: QRIS tidak muncul

**Solutions**:
1. Pastikan `qris_only=1` di query params
2. Cek amount dalam range min-max
3. Verify QRIS enabled di project settings

---

## Payment Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User      │     │   Your App   │     │   Pakasir   │
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘
       │                   │                    │
       │  1. Checkout      │                    │
       │──────────────────>│                    │
       │                   │  2. Create Order   │
       │                   │  in Database       │
       │                   │────────┬───────────│
       │                   │        │           │
       │                   │<───────┘           │
       │                   │  3. Create Payment │
       │                   │───────────────────>│
       │                   │                    │
       │                   │  4. QRIS Response  │
       │                   │<───────────────────│
       │                   │                    │
       │  5. Show QR Code  │                    │
       │<──────────────────│                    │
       │                   │                    │
       │  6. Scan & Pay    │                    │
       │────────────────────────────────────────>│
       │                   │                    │
       │                   │  7. Webhook        │
       │                   │<───────────────────│
       │                   │                    │
       │                   │  8. Update Order   │
       │                   │  9. Fulfill Order  │
       │                   │────────┬───────────│
       │                   │        │           │
       │                   │<───────┘           │
       │                   │                    │
       │  10. Confirmation │                    │
       │<──────────────────│                    │
       │                   │                    │
```

---

## Additional Resources

- [Pakasir Documentation](https://pakasir.com/p/docs)
- [Pakasir API Reference](https://pakasir.com/p/docs/api)
- [Pakasir Discord Support](https://discord.gg/pakasir)
- Email Support: support@pakasir.com
