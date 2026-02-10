import { useState } from 'react';
import { MessageCircle, Mail, Phone, Send, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSupport, type TicketFormData } from '@/hooks/useSupport';

const faqs = [
  {
    question: 'Berapa lama waktu instalasi Wi-Fi?',
    answer: 'Waktu instalasi Wi-Fi biasanya memakan waktu 1-2 jam tergantung ukuran rumah dan kompleksitas jaringan. Tim kami akan memberikan estimasi waktu yang lebih akurat setelah survey lokasi.'
  },
  {
    question: 'Apa yang termasuk dalam paket instalasi CCTV?',
    answer: 'Paket instalasi CCTV kami mencakup pemasangan kamera, setup DVR, konfigurasi aplikasi mobile, dan training dasar penggunaan. Garansi perangkat juga disertakan sesuai tier yang dipilih.'
  },
  {
    question: 'Apakah ada garansi untuk layanan yang diberikan?',
    answer: 'Ya, semua layanan kami dilengkapi dengan garansi. Periode garansi bervariasi tergantung jenis layanan dan tier yang dipilih, mulai dari 1 tahun hingga 3 tahun.'
  },
  {
    question: 'Bagaimana cara melacak status pesanan saya?',
    answer: 'Anda dapat melacak status pesanan melalui menu Profil > Riwayat Pesanan. Status pesanan akan diupdate secara real-time dan Anda juga akan menerima notifikasi email untuk setiap perubahan status.'
  },
  {
    question: 'Bisakah saya membatalkan atau mengubah pesanan?',
    answer: 'Pesanan dapat dibatalkan atau diubah selama status masih "pending". Setelah pembayaran dikonfirmasi, perubahan dapat dilakukan dengan menghubungi tim support kami.'
  }
];

const categories = [
  'Masalah Teknis',
  'Pertanyaan Billing',
  'Dukungan Instalasi',
  'Status Pesanan',
  'Lainnya'
];

export function SupportSection() {
  const { submitTicket, isSubmitting } = useSupport();
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: 'Halo! Ada yang bisa kami bantu?', isUser: false }
  ]);
  const [chatInput, setChatInput] = useState('');

  const [formData, setFormData] = useState<TicketFormData>({
    subject: '',
    category: '',
    email: '',
    description: ''
  });

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitTicket(formData);
      setTicketSubmitted(true);
      setTimeout(() => {
        setShowTicketForm(false);
        setTicketSubmitted(false);
        setFormData({ subject: '', category: '', email: '', description: '' });
      }, 2000);
    } catch (error) {
      console.error('Error submitting ticket:', error);
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages([...chatMessages, { text: chatInput, isUser: true }]);
    setChatInput('');
    
    // Simulate response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        text: 'Terima kasih! Tim support kami akan segera membantu Anda.', 
        isUser: false 
      }]);
    }, 1000);
  };

  return (
    <div className="pb-20 px-4 pt-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Pusat Bantuan</h1>
        <p className="text-gray-600">Kami siap membantu Anda 24/7</p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => setChatOpen(true)}
          className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
        >
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-medium text-green-700">Live Chat</span>
          <span className="text-xs text-green-600">Online</span>
        </button>

        <button
          onClick={() => setShowTicketForm(true)}
          className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-medium text-blue-700">Email</span>
          <span className="text-xs text-blue-600">2-4 jam</span>
        </button>

        <a
          href="tel:+6281234567890"
          className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
        >
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-medium text-orange-700">Telepon</span>
          <span className="text-xs text-orange-600">24 jam</span>
        </a>
      </div>

      {/* FAQ Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Pertanyaan Umum</h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <span className="font-medium text-sm pr-4">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Submit Ticket Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Kirim Tiket Dukungan</h3>
              <p className="text-sm text-gray-600">Laporkan masalah atau dapatkan bantuan detail</p>
            </div>
            <Button 
              onClick={() => setShowTicketForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Buat Tiket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Form Dialog */}
      <Dialog open={showTicketForm} onOpenChange={setShowTicketForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Kirim Tiket Dukungan</DialogTitle>
          </DialogHeader>

          {ticketSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-green-600">Tiket Terkirim!</h3>
              <p className="text-gray-600 mt-2">Kami akan segera menghubungi Anda.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subjek</Label>
                <Input
                  id="subject"
                  placeholder="Ringkasan masalah Anda"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@anda.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan masalah Anda secara detail..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500 text-right">
                  {formData.description.length}/500 karakter
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Tiket
                  </>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Live Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="bg-green-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Live Support</p>
                <p className="text-xs text-green-100">Online</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white">
              ×
            </button>
          </div>
          
          <div className="h-64 overflow-auto p-4 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.isUser 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder="Ketik pesan..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSendChat} className="bg-green-500 hover:bg-green-600">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
