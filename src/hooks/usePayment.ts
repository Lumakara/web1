import { useState, useEffect } from 'react';
import { PakasirPayment, type PaymentResponse } from '@/lib/pakasir';
import { OrderService } from '@/lib/supabase';
import { TelegramBot } from '@/lib/telegram';
import { useAppStore } from '@/store/appStore';

export const usePayment = () => {
  const { user, profile, getSelectedItems } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired' | 'cancelled' | null>(null);
  const [countdown, setCountdown] = useState(1800); // 30 minutes in seconds

  // Countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (paymentData && !paymentStatus) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paymentData, paymentStatus]);

  const createPayment = async (): Promise<PaymentResponse> => {
    setIsProcessing(true);
    try {
      const selectedItems = getSelectedItems();
      if (selectedItems.length === 0) {
        throw new Error('No items selected');
      }

      const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderId = `ORDER-${Date.now()}`;
      
      const request = {
        orderId,
        amount: subtotal,
        customerName: profile?.full_name || user?.displayName || 'Guest',
        customerEmail: profile?.email || user?.email || '',
        description: `Pembelian ${selectedItems.length} layanan`,
      };

      const response = await PakasirPayment.createQRISPayment(request);
      setPaymentData(response);
      
      // Create order in database
      try {
        const order = await OrderService.create({
          user_id: user?.uid || 'guest',
          items: selectedItems.map(item => ({
            product_id: item.productId,
            title: item.title,
            tier: item.tier,
            price: item.price,
            quantity: item.quantity,
          })),
          total_amount: subtotal,
          status: 'pending',
          payment_method: 'QRIS',
          payment_reference: response.order_id,
        });

        // Send notification to Telegram
        await TelegramBot.sendOrderNotification({
          orderId: order.id,
          customerName: request.customerName,
          customerEmail: request.customerEmail,
          totalAmount: subtotal,
          items: selectedItems.map(item => ({
            title: item.title,
            tier: item.tier,
            quantity: item.quantity,
            price: item.price,
          })),
          timestamp: new Date().toLocaleString('id-ID'),
        });
      } catch (error) {
        console.error('Error creating order or sending notifications:', error);
        // Continue even if order creation fails
      }

      return response;
    } catch (error: any) {
      console.error('Payment creation error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (orderId: string): Promise<void> => {
    // For Pakasir, we need to check via webhook or callback
    // This is a simplified version - in production, you'd check via API
    console.log('Checking payment status for:', orderId);
  };

  const cancelPayment = async (orderId: string): Promise<boolean> => {
    try {
      const selectedItems = getSelectedItems();
      const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const result = await PakasirPayment.cancelPayment(orderId, subtotal);
      if (result) {
        setPaymentData(null);
        setPaymentStatus(null);
        setCountdown(1800);
      }
      return result;
    } catch (error: any) {
      console.error('Cancel payment error:', error);
      return false;
    }
  };

  const formatCountdown = (): string => {
    return PakasirPayment.formatExpiryTime(countdown);
  };

  return {
    isProcessing,
    paymentData,
    paymentStatus,
    countdown,
    formatCountdown,
    createPayment,
    checkPaymentStatus,
    cancelPayment,
    formatRupiah: PakasirPayment.formatRupiah,
  };
};
