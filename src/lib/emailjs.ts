import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_5cy0pte';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_nf642dj';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'Y50IKgvUerHPeqTwt';
const EMAILJS_OWNER_EMAIL = import.meta.env.VITE_EMAILJS_OWNER_EMAIL || '';

// ============================================
// Email Data Interfaces
// ============================================

export interface WelcomeEmailData {
  to_email: string;
  to_name: string;
  user_email: string;
  registration_date: string;
}

export interface OrderEmailData {
  to_email: string;
  to_name: string;
  order_id: string;
  order_date: string;
  total_amount: string;
  items: string;
  plan_name?: string;
  server_details?: string;
}

export interface PaymentEmailData {
  to_email: string;
  to_name: string;
  order_id: string;
  payment_id: string;
  amount: string;
  payment_method: string;
  payment_date: string;
  plan_name?: string;
  failure_reason?: string;
  retry_link?: string;
}

export interface PasswordResetData {
  to_email: string;
  to_name: string;
  reset_token: string;
  reset_link: string;
  expiry_time: string;
}

export interface LoginNotificationData {
  to_email: string;
  to_name: string;
  login_time: string;
  ip_address: string;
  device_info: string;
  browser?: string;
  location?: string;
}

export interface AdminNotificationData {
  type: AdminNotificationType;
  user_email?: string;
  user_name?: string;
  order_id?: string;
  amount?: string;
  ip_address?: string;
  device_info?: string;
  failure_reason?: string;
  timestamp?: string;
  additional_data?: Record<string, unknown>;
}

export interface PterodactylCredentialsData {
  to_email: string;
  to_name: string;
  panel_url: string;
  username: string;
  password: string;
  server_name: string;
  plan_name: string;
  login_link: string;
}

// ============================================
// Admin Notification Types
// ============================================

export type AdminNotificationType =
  | 'new_registration'
  | 'user_login'
  | 'failed_login'
  | 'new_order'
  | 'payment_success'
  | 'payment_failed';

// ============================================
// Helper Functions
// ============================================

/**
 * Fallback console logging when emailjs fails
 */
const logEmailFallback = (templateName: string, params: Record<string, unknown>): void => {
  console.log('========================================');
  console.log(`[EMAIL FALLBACK] ${templateName}`);
  console.log('----------------------------------------');
  console.log('Parameters:', JSON.stringify(params, null, 2));
  console.log('========================================');
};

/**
 * Get admin notification subject based on type
 */
const getAdminNotificationSubject = (type: AdminNotificationType): string => {
  const subjects: Record<AdminNotificationType, string> = {
    new_registration: 'Pendaftaran Pengguna Baru',
    user_login: 'Pengguna Login',
    failed_login: 'Percobaan Login Gagal',
    new_order: 'Pesanan Baru Diterima',
    payment_success: 'Pembayaran Berhasil',
    payment_failed: 'Pembayaran Gagal',
  };
  return subjects[type] || 'Notifikasi Admin';
};

/**
 * Get admin notification message based on type
 */
const getAdminNotificationMessage = (data: AdminNotificationData): string => {
  const timestamp = data.timestamp || new Date().toLocaleString('id-ID');
  
  switch (data.type) {
    case 'new_registration':
      return `Pengguna baru telah mendaftar:
Nama: ${data.user_name || 'N/A'}
Email: ${data.user_email || 'N/A'}
Waktu: ${timestamp}`;

    case 'user_login':
      return `Pengguna telah login:
Nama: ${data.user_name || 'N/A'}
Email: ${data.user_email || 'N/A'}
IP: ${data.ip_address || 'N/A'}
Perangkat: ${data.device_info || 'N/A'}
Waktu: ${timestamp}`;

    case 'failed_login':
      return `Percobaan login gagal:
Email: ${data.user_email || 'N/A'}
IP: ${data.ip_address || 'N/A'}
Alasan: ${data.failure_reason || 'Kredensial salah'}
Waktu: ${timestamp}`;

    case 'new_order':
      return `Pesanan baru telah diterima:
ID Pesanan: ${data.order_id || 'N/A'}
Nama: ${data.user_name || 'N/A'}
Email: ${data.user_email || 'N/A'}
Jumlah: ${data.amount || 'N/A'}
Waktu: ${timestamp}`;

    case 'payment_success':
      return `Pembayaran berhasil:
ID Pesanan: ${data.order_id || 'N/A'}
Nama: ${data.user_name || 'N/A'}
Email: ${data.user_email || 'N/A'}
Jumlah: ${data.amount || 'N/A'}
Waktu: ${timestamp}`;

    case 'payment_failed':
      return `Pembayaran gagal:
ID Pesanan: ${data.order_id || 'N/A'}
Nama: ${data.user_name || 'N/A'}
Email: ${data.user_email || 'N/A'}
Jumlah: ${data.amount || 'N/A'}
Alasan: ${data.failure_reason || 'Tidak diketahui'}
Waktu: ${timestamp}`;

    default:
      return `Notifikasi admin - ${data.type}
Waktu: ${timestamp}`;
  }
};

// ============================================
// Email Service
// ============================================

export const EmailService = {
  /**
   * Initialize EmailJS
   */
  init(): void {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  },

  /**
   * Send email using EmailJS with fallback logging
   */
  async sendEmail(
    templateParams: Record<string, unknown>,
    templateName: string
  ): Promise<boolean> {
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );
      console.log(`[EmailJS] ${templateName} sent successfully`);
      return true;
    } catch (error: any) {
      console.error(`[EmailJS Error] ${templateName}:`, error);
      logEmailFallback(templateName, templateParams);
      return false;
    }
  },

  // ============================================
  // User Email Templates
  // ============================================

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const templateParams = {
      to_email: data.to_email,
      to_name: data.to_name,
      user_email: data.user_email,
      registration_date: data.registration_date,
      subject: 'Selamat Datang di Layanan Digital!',
      message: `Halo ${data.to_name},

Selamat! Akun Anda telah berhasil dibuat di Layanan Digital.

Detail Akun:
Email: ${data.user_email}
Tanggal Registrasi: ${data.registration_date}

Anda sekarang dapat login dan mulai menggunakan layanan kami.

Terima kasih,
Tim Layanan Digital`,
    };

    return await this.sendEmail(templateParams, 'Welcome Email');
  },

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    const templateParams = {
      to_email: data.to_email,
      to_name: data.to_name,
      order_id: data.order_id,
      order_date: data.order_date,
      total_amount: data.total_amount,
      items: data.items,
      plan_name: data.plan_name || '',
      server_details: data.server_details || '',
      subject: 'Konfirmasi Pesanan - Layanan Digital',
      message: `Halo ${data.to_name},

Pesanan Anda telah berhasil dibuat!

Detail Pesanan:
ID Pesanan: ${data.order_id}
Tanggal: ${data.order_date}
Total: ${data.total_amount}
${data.plan_name ? `Paket: ${data.plan_name}\n` : ''}
Item:
${data.items}
${data.server_details ? `\nDetail Server:\n${data.server_details}` : ''}

Terima kasih telah berbelanja dengan kami!

Tim Layanan Digital`,
    };

    return await this.sendEmail(templateParams, 'Order Confirmation');
  },

  /**
   * Send payment success notification
   */
  async sendPaymentSuccess(data: PaymentEmailData): Promise<boolean> {
    const templateParams = {
      to_email: data.to_email,
      to_name: data.to_name,
      order_id: data.order_id,
      payment_id: data.payment_id,
      amount: data.amount,
      payment_method: data.payment_method,
      payment_date: data.payment_date,
      plan_name: data.plan_name || '',
      subject: 'Pembayaran Berhasil - Layanan Digital',
      message: `Halo ${data.to_name},

Pembayaran Anda telah berhasil dikonfirmasi!

Detail Pembayaran:
ID Pesanan: ${data.order_id}
ID Pembayaran: ${data.payment_id}
${data.plan_name ? `Paket: ${data.plan_name}\n` : ''}Jumlah: ${data.amount}
Metode: ${data.payment_method}
Tanggal: ${data.payment_date}

Layanan Anda akan segera diproses dan aktif dalam waktu 1-5 menit.

Terima kasih,
Tim Layanan Digital`,
    };

    return await this.sendEmail(templateParams, 'Payment Success');
  },

  /**
   * Send payment failed notification
   */
  async sendPaymentFailed(data: PaymentEmailData): Promise<boolean> {
    const templateParams = {
      to_email: data.to_email,
      to_name: data.to_name,
      order_id: data.order_id,
      payment_id: data.payment_id,
      amount: data.amount,
      payment_method: data.payment_method,
      payment_date: data.payment_date,
      failure_reason: data.failure_reason || 'Tidak diketahui',
      retry_link: data.retry_link || '',
      subject: 'Pembayaran Gagal - Layanan Digital',
      message: `Halo ${data.to_name},

Maaf, pembayaran Anda tidak dapat diproses.

Detail Pembayaran:
ID Pesanan: ${data.order_id}
ID Pembayaran: ${data.payment_id}
Jumlah: ${data.amount}
Metode: ${data.payment_method}
Tanggal: ${data.payment_date}
Alasan Gagal: ${data.failure_reason || 'Tidak diketahui'}

${data.retry_link ? `Silakan coba lagi dengan mengklik link berikut:\n${data.retry_link}\n\n` : ''}Jika Anda membutuhkan bantuan, silakan hubungi tim support kami.

Terima kasih,
Tim Layanan Digital`,
    };

    return await this.sendEmail(templateParams, 'Payment Failed');
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(data: PasswordResetData): Promise<boolean> {
    const templateParams = {
      to_email: data.to_email,
      to_name: data.to_name,
      reset_token: data.reset_token,
      reset_link: data.reset_link,
      expiry_time: data.expiry_time,
      subject: 'Reset Password - Layanan Digital',
      message: `Halo ${data.to_name},

Kami menerima permintaan reset password untuk akun Anda.

Silakan klik link berikut untuk mereset password Anda:
${data.reset_link}

Token: ${data.reset_token}
Link ini akan kadaluarsa pada: ${data.expiry_time}

Jika Anda tidak meminta reset password, silakan abaikan email ini atau hubungi tim support kami.

Terima kasih,
Tim Layanan Digital`,
    };

    return await this.sendEmail(templateParams, 'Password Reset');
  },

  /**
   * Send new login notification
   */
  async sendLoginNotification(
    userData: { email: string; name: string },
    ip: string,
    device: string
  ): Promise<boolean> {
    const loginTime = new Date().toLocaleString('id-ID');
    const templateParams = {
      to_email: userData.email,
      to_name: userData.name,
      login_time: loginTime,
      ip_address: ip,
      device_info: device,
      subject: 'Notifikasi Login Baru - Layanan Digital',
      message: `Halo ${userData.name},

Kami mendeteksi login baru ke akun Anda.

Detail Login:
Waktu: ${loginTime}
IP Address: ${ip}
Perangkat: ${device}

Jika ini bukan Anda, segera ubah password Anda dan hubungi tim support kami.

Terima kasih,
Tim Layanan Digital`,
    };

    return await this.sendEmail(templateParams, 'Login Notification');
  },

  /**
   * Send Pterodactyl panel credentials
   */
  async sendPterodactylCredentials(data: PterodactylCredentialsData): Promise<boolean> {
    const templateParams = {
      to_email: data.to_email,
      to_name: data.to_name,
      panel_url: data.panel_url,
      username: data.username,
      password: data.password,
      server_name: data.server_name,
      plan_name: data.plan_name,
      login_link: data.login_link,
      subject: 'Kredensial Panel Server - Layanan Digital',
      message: `Halo ${data.to_name},

Server Anda telah berhasil dibuat!

Detail Server:
Nama Server: ${data.server_name}
Paket: ${data.plan_name}

Kredensial Panel:
URL Panel: ${data.panel_url}
Username: ${data.username}
Password: ${data.password}
Link Login: ${data.login_link}

Simpan informasi ini dengan baik dan jangan bagikan kepada siapapun.

Terima kasih,
Tim Layanan Digital`,
    };

    return await this.sendEmail(templateParams, 'Pterodactyl Credentials');
  },

  // ============================================
  // Admin Email Templates
  // ============================================

  /**
   * Send admin notification for various events
   */
  async sendAdminNotification(type: AdminNotificationType, data: AdminNotificationData): Promise<boolean> {
    // Add timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date().toLocaleString('id-ID');
    }

    const subject = getAdminNotificationSubject(type);
    const message = getAdminNotificationMessage(data);

    const templateParams = {
      to_email: EMAILJS_OWNER_EMAIL,
      to_name: 'Admin',
      notification_type: type,
      subject: `[ADMIN] ${subject} - Layanan Digital`,
      message: message,
      ...data.additional_data,
    };

    // If no owner email is configured, just log to console
    if (!EMAILJS_OWNER_EMAIL) {
      console.log('[EmailService] No owner email configured, logging to console:');
      logEmailFallback('Admin Notification', templateParams);
      return false;
    }

    return await this.sendEmail(templateParams, `Admin Notification (${type})`);
  },

  // ============================================
  // Legacy Methods (for backward compatibility)
  // ============================================

  /**
   * Send registration confirmation email (legacy)
   * @deprecated Use sendWelcomeEmail instead
   */
  async sendRegistrationEmail(data: WelcomeEmailData): Promise<void> {
    await this.sendWelcomeEmail(data);
  },

  /**
   * Send order confirmation email (legacy)
   * @deprecated Use sendOrderConfirmation instead
   */
  async sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
    await this.sendOrderConfirmation(data);
  },

  /**
   * Send generic notification email
   */
  async sendNotificationEmail(
    toEmail: string,
    toName: string,
    subject: string,
    message: string
  ): Promise<boolean> {
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      subject: subject,
      message: message,
    };

    return await this.sendEmail(templateParams, 'Generic Notification');
  },
};

// Initialize on module load
EmailService.init();

export default EmailService;
