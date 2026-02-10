import axios from 'axios';

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8010136953:AAHnKUy_0jgJN5grZIgSDzbtTJznfqq5was';
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '1841202339';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TicketNotification {
  ticketId: string;
  subject: string;
  category: string;
  email: string;
  description: string;
  timestamp: string;
}

export interface OrderNotification {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: { title: string; tier: string; quantity: number; price: number }[];
  timestamp: string;
}

export const TelegramBot = {
  // Send support ticket notification to Telegram
  async sendTicketNotification(ticket: TicketNotification): Promise<void> {
    try {
      const message = `
🎫 *TICKET BARU DITERIMA*

📋 *ID:* #${ticket.ticketId}
📌 *Subjek:* ${ticket.subject}
🏷️ *Kategori:* ${ticket.category}
📧 *Email:* ${ticket.email}
🕐 *Waktu:* ${ticket.timestamp}

📝 *Deskripsi:*
${ticket.description}

━━━━━━━━━━━━━━━━━━━━
Silakan segera ditindaklanjuti.
      `.trim();

      const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

      if (response.data.ok) {
        console.log('Ticket notification sent to Telegram');
      }
    } catch (error: any) {
      console.error('Telegram Bot Error:', error.response?.data || error.message);
      // Don't throw error, just log it
    }
  },

  // Send order notification to Telegram
  async sendOrderNotification(order: OrderNotification): Promise<void> {
    try {
      const itemsList = order.items.map(item => 
        `• ${item.title} (${item.tier}) x${item.quantity} - Rp ${item.price.toLocaleString('id-ID')}`
      ).join('\n');

      const message = `
🛒 *PESANAN BARU MASUK*

📋 *ID Pesanan:* #${order.orderId}
👤 *Pelanggan:* ${order.customerName}
📧 *Email:* ${order.customerEmail}
💰 *Total:* Rp ${order.totalAmount.toLocaleString('id-ID')}
🕐 *Waktu:* ${order.timestamp}

📦 *Item Pesanan:*
${itemsList}

━━━━━━━━━━━━━━━━━━━━
Segera proses pesanan ini.
      `.trim();

      const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

      if (response.data.ok) {
        console.log('Order notification sent to Telegram');
      }
    } catch (error: any) {
      console.error('Telegram Bot Error:', error.response?.data || error.message);
    }
  },

  // Send payment notification to Telegram
  async sendPaymentNotification(orderId: string, amount: number, paymentMethod: string, status: string): Promise<void> {
    try {
      const statusEmoji = status === 'success' ? '✅' : '❌';
      const message = `
${statusEmoji} *NOTIFIKASI PEMBAYARAN*

📋 *ID Pesanan:* #${orderId}
💰 *Jumlah:* Rp ${amount.toLocaleString('id-ID')}
💳 *Metode:* ${paymentMethod}
📊 *Status:* ${status.toUpperCase()}
🕐 *Waktu:* ${new Date().toLocaleString('id-ID')}

━━━━━━━━━━━━━━━━━━━━
      `.trim();

      const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

      if (response.data.ok) {
        console.log('Payment notification sent to Telegram');
      }
    } catch (error: any) {
      console.error('Telegram Bot Error:', error.response?.data || error.message);
    }
  },

  // Send custom message to Telegram
  async sendCustomMessage(message: string): Promise<void> {
    try {
      const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

      if (response.data.ok) {
        console.log('Custom message sent to Telegram');
      }
    } catch (error: any) {
      console.error('Telegram Bot Error:', error.response?.data || error.message);
    }
  },

  // Test bot connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${TELEGRAM_API_URL}/getMe`);
      return response.data.ok;
    } catch (error) {
      console.error('Telegram bot connection test failed');
      return false;
    }
  }
};
