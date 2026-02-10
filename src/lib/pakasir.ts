import axios from 'axios';

// Pakasir Payment Gateway Configuration
const PAKASIR_API_URL = 'https://app.pakasir.com/api';
const PAKASIR_PROJECT_SLUG = 'lumakara-store';
const PAKASIR_API_KEY = import.meta.env.VITE_PAKASIR_API_KEY || 'vv887w32RJ4tTn28xDcmRaop0YYZjKA4';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  project: string;
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  payment_number: string;
  expired_at: string;
  qr_string?: string;
  qr_code_url?: string;
}

export interface PaymentStatus {
  project: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  payment_method?: string;
  paid_at?: string;
}

export const PakasirPayment = {
  // Create QRIS payment using API
  async createQRISPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${PAKASIR_API_URL}/transactioncreate/qris`,
        {
          project: PAKASIR_PROJECT_SLUG,
          order_id: request.orderId,
          amount: request.amount,
          api_key: PAKASIR_API_KEY,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      
      return {
        success: true,
        project: data.payment.project,
        order_id: data.payment.order_id,
        amount: data.payment.amount,
        fee: data.payment.fee,
        total_payment: data.payment.total_payment,
        payment_method: data.payment.payment_method,
        payment_number: data.payment.payment_number,
        expired_at: data.payment.expired_at,
        qr_string: data.payment.payment_number,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.payment.payment_number)}`,
      };
    } catch (error: any) {
      console.error('Pakasir Payment Error:', error);
      
      // Fallback to URL redirect method if API fails
      return this.createQRISPaymentViaURL(request);
    }
  },

  // Alternative: Create payment via URL redirect
  createQRISPaymentViaURL(request: PaymentRequest): PaymentResponse {
    const amount = Math.round(request.amount);
    const paymentUrl = `https://app.pakasir.com/pay/${PAKASIR_PROJECT_SLUG}/${amount}?order_id=${request.orderId}&qris_only=1`;
    
    // Open payment in new window
    window.open(paymentUrl, '_blank');
    
    return {
      success: true,
      project: PAKASIR_PROJECT_SLUG,
      order_id: request.orderId,
      amount: request.amount,
      fee: 0,
      total_payment: request.amount,
      payment_method: 'qris',
      payment_number: '',
      expired_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      qr_string: '',
      qr_code_url: '',
    };
  },

  // Simulate payment (for testing in sandbox mode)
  async simulatePayment(orderId: string, amount: number): Promise<boolean> {
    try {
      const response = await axios.post(
        `${PAKASIR_API_URL}/paymentsimulation`,
        {
          project: PAKASIR_PROJECT_SLUG,
          order_id: orderId,
          amount: amount,
          api_key: PAKASIR_API_KEY,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.success || true;
    } catch (error: any) {
      console.error('Payment simulation error:', error);
      return false;
    }
  },

  // Cancel payment
  async cancelPayment(orderId: string, amount: number): Promise<boolean> {
    try {
      const response = await axios.post(
        `${PAKASIR_API_URL}/transactioncancel`,
        {
          project: PAKASIR_PROJECT_SLUG,
          order_id: orderId,
          amount: amount,
          api_key: PAKASIR_API_KEY,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.success || true;
    } catch (error: any) {
      console.error('Cancel payment error:', error);
      return false;
    }
  },

  // Generate QR code URL for display
  generateQRCodeURL(qrString: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;
  },

  // Format amount to Rupiah
  formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Calculate expiry time remaining in seconds
  getExpiryTimeRemaining(expiryTime: string): number {
    const expiry = new Date(expiryTime).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  },

  // Format expiry time as MM:SS
  formatExpiryTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // Get payment URL for redirect method
  getPaymentURL(orderId: string, amount: number): string {
    return `https://app.pakasir.com/pay/${PAKASIR_PROJECT_SLUG}/${amount}?order_id=${orderId}&qris_only=1`;
  },
};
