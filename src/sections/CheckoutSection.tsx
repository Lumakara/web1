import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, QrCode, Clock, Check, Copy, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/store/appStore';
import { usePayment } from '@/hooks/usePayment';
import { PakasirPayment } from '@/lib/pakasir';
import { Link } from 'react-router-dom';

export function CheckoutSection() {
  const { getSelectedItems, clearCart } = useAppStore();
  const selectedItems = getSelectedItems();
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const { 
    isProcessing, 
    paymentData, 
    paymentStatus, 
    formatCountdown,
    createPayment, 
    cancelPayment,
    formatRupiah 
  } = usePayment();
  
  const [showQRIS, setShowQRIS] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    if (selectedItems.length === 0 && !paymentData) {
      // Redirect to cart if no items
      window.location.href = '/cart';
    }
  }, [selectedItems.length, paymentData]);

  const handleCreatePayment = async () => {
    try {
      const response = await createPayment();
      setShowQRIS(true);
      
      // Generate payment URL for redirect method
      const url = PakasirPayment.getPaymentURL(response.order_id, response.amount);
      setPaymentUrl(url);
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handleCopyQR = () => {
    if (paymentData?.qr_string) {
      navigator.clipboard.writeText(paymentData.qr_string);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancel = async () => {
    if (paymentData) {
      await cancelPayment(paymentData.order_id);
      setShowQRIS(false);
    }
  };

  const openPaymentPage = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  };

  if (paymentStatus === 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Pembayaran Berhasil!</h2>
          <p className="text-gray-600 mb-6">
            Terima kasih telah berbelanja. Pesanan Anda sedang diproses.
          </p>
          <div className="space-y-2 mb-6">
            <p className="text-sm text-gray-500">ID Transaksi</p>
            <p className="font-mono font-medium">{paymentData?.order_id}</p>
          </div>
          <Link to="/">
            <Button className="w-full bg-blue-600" onClick={clearCart}>
              Kembali ke Beranda
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (showQRIS && paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={handleCancel} className="p-2 hover:bg-gray-200 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Pembayaran QRIS</h1>
          </div>

          <Card className="overflow-hidden">
            {/* Timer */}
            <div className="bg-blue-600 text-white p-4 text-center">
              <p className="text-sm text-blue-100 mb-1">Selesaikan pembayaran dalam</p>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-2xl font-bold font-mono">{formatCountdown()}</span>
              </div>
            </div>

            <CardContent className="p-6">
              {/* QR Code */}
              {paymentData.qr_code_url && (
                <div className="text-center mb-6">
                  <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 inline-block">
                    <img 
                      src={paymentData.qr_code_url} 
                      alt="QRIS Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Scan kode QR dengan aplikasi e-wallet Anda
                  </p>
                </div>
              )}

              {/* Amount */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500">Total Pembayaran</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatRupiah(subtotal)}
                </p>
              </div>

              {/* Open Payment Page Button */}
              <Button
                onClick={openPaymentPage}
                className="w-full mb-4 bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Buka Halaman Pembayaran
              </Button>

              {/* Copy QR String */}
              {paymentData.qr_string && (
                <button
                  onClick={handleCopyQR}
                  className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50 mb-4"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Salin Kode QR</span>
                    </>
                  )}
                </button>
              )}

              {/* Instructions */}
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium">Cara Pembayaran:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Buka aplikasi e-wallet (GoPay, OVO, DANA, dll)</li>
                  <li>Pilih menu Scan QR</li>
                  <li>Scan kode QR di atas</li>
                  <li>Konfirmasi pembayaran</li>
                </ol>
              </div>

              <div className="border-t my-4" />

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Batalkan Pembayaran
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/cart" className="p-2 hover:bg-gray-200 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>

        {/* Order Summary */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Ringkasan Pesanan</h2>
            <div className="space-y-3">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.tier} x{item.quantity}</p>
                  </div>
                  <p className="text-sm">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t my-3" />
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-blue-600 text-lg">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Metode Pembayaran</h2>
            <div className="flex items-center gap-3 p-3 border-2 border-blue-500 rounded-lg bg-blue-50">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">QRIS</p>
                <p className="text-xs text-gray-500">Scan dengan e-wallet</p>
              </div>
              <Check className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 py-6"
          onClick={handleCreatePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Bayar Sekarang
            </>
          )}
        </Button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Dengan melanjutkan, Anda menyetujui Syarat dan Ketentuan kami
        </p>
      </div>
    </div>
  );
}
