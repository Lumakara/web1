import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  Send,
  Loader2,
  Search,
  X,
  Bot,
  User,
  PhoneCall,
  Clock,
  Star,
  Shield,
  ChevronRight,
  FileText,
  Sparkles,
  Zap,
  Headphones,
  RotateCcw,
  ShoppingCart,
  CheckCircle2,
  Info,
  Paperclip,
  HelpCircle,
  Terminal,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/appStore';
import { useSupport, type TicketFormData } from '@/hooks/useSupport';
import {
  OpenAIService,
  type ChatMessage,
  type ProductCardData,
  type ChatResponse,
  getTimeBasedGreeting,
  formatPrice,
} from '@/lib/openai';
import type { Product } from '@/lib/supabase';

// ============================================================================
// FAQ Data
// ============================================================================
const faqs = [
  {
    id: 'faq-1',
    question: 'Berapa lama waktu instalasi Wi-Fi?',
    answer: 'Waktu instalasi Wi-Fi biasanya memakan waktu 1-2 jam tergantung ukuran rumah dan kompleksitas jaringan. Tim kami akan memberikan estimasi waktu yang lebih akurat setelah survey lokasi.',
    category: 'Instalasi',
  },
  {
    id: 'faq-2',
    question: 'Apa yang termasuk dalam paket instalasi CCTV?',
    answer: 'Paket instalasi CCTV kami mencakup pemasangan kamera, setup DVR, konfigurasi aplikasi mobile, dan training dasar penggunaan. Garansi perangkat juga disertakan sesuai tier yang dipilih.',
    category: 'Produk',
  },
  {
    id: 'faq-3',
    question: 'Apakah ada garansi untuk layanan yang diberikan?',
    answer: 'Ya, semua layanan kami dilengkapi dengan garansi. Periode garansi bervariasi tergantung jenis layanan dan tier yang dipilih, mulai dari 1 tahun hingga 3 tahun.',
    category: 'Garansi',
  },
  {
    id: 'faq-4',
    question: 'Bagaimana cara melacak status pesanan saya?',
    answer: 'Anda dapat melacak status pesanan melalui menu Profil > Riwayat Pesanan. Status pesanan akan diupdate secara real-time dan Anda juga akan menerima notifikasi email untuk setiap perubahan status.',
    category: 'Pesanan',
  },
  {
    id: 'faq-5',
    question: 'Bisakah saya membatalkan atau mengubah pesanan?',
    answer: 'Pesanan dapat dibatalkan atau diubah selama status masih "pending". Setelah pembayaran dikonfirmasi, perubahan dapat dilakukan dengan menghubungi tim support kami.',
    category: 'Pesanan',
  },
  {
    id: 'faq-6',
    question: 'Metode pembayaran apa saja yang diterima?',
    answer: 'Kami menerima berbagai metode pembayaran: Transfer Bank (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, OVO, DANA, LinkAja), QRIS, dan Kartu Kredit/Debit.',
    category: 'Pembayaran',
  },
  {
    id: 'faq-7',
    question: 'Apakah layanan tersedia di seluruh Indonesia?',
    answer: 'Untuk layanan digital seperti VPS dan Code Repair, kami melayani seluruh Indonesia. Untuk layanan instalasi fisik (WiFi, CCTV), saat ini tersedia di Jabodetabek dan kota besar lainnya.',
    category: 'Layanan',
  },
  {
    id: 'faq-8',
    question: 'Bagaimana kebijakan refund?',
    answer: 'Refund tersedia untuk: Belum diproses (100%), Dalam proses <50% (50%), Dalam proses >50% atau selesai (tidak bisa refund). Pengajuan dalam 7 hari melalui menu Support.',
    category: 'Refund',
  },
];

const ticketCategories = [
  'Masalah Teknis',
  'Pertanyaan Billing',
  'Dukungan Instalasi',
  'Status Pesanan',
  'Lainnya',
];

const priorityLevels = [
  { value: 'low', label: 'Rendah', color: 'bg-blue-100 text-blue-700' },
  { value: 'medium', label: 'Normal', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'Tinggi', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Darurat', color: 'bg-red-100 text-red-700' },
];

// ============================================================================
// Types
// ============================================================================
interface ChatMessageUI extends ChatMessage {
  id: string;
  timestamp: number;
  productCards?: ProductCardData[];
  suggestions?: string[];
  isTyping?: boolean;
  attachments?: { name: string; type: string; size: string }[];
  errorLogs?: string; // Error logs to display
}

// ============================================================================
// Animation Variants
// ============================================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 17,
    },
  },
} as const;

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

// ============================================================================
// Animated Header Component
// ============================================================================
function AnimatedHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 p-4 sm:p-6 text-white shadow-xl"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-white/10"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [0, -180, -360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/10"
        />
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm"
        >
          <Sparkles className="h-3 w-3" />
          <span>Dukungan 24/7 dengan AI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-2 text-xl sm:text-3xl font-bold"
        >
          Pusat Bantuan
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-4 sm:mb-6 text-sm sm:text-base text-white/80"
        >
          Kami siap membantu Anda kapan saja
        </motion.p>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-2 sm:gap-3"
        >
          <div className="rounded-xl bg-white/10 p-2 sm:p-3 text-center backdrop-blur-sm">
            <Clock className="mx-auto mb-1 h-4 sm:h-5 w-4 sm:w-5" />
            <div className="text-sm sm:text-lg font-bold">&lt;2m</div>
            <div className="text-[10px] sm:text-xs text-white/70">Response</div>
          </div>
          <div className="rounded-xl bg-white/10 p-2 sm:p-3 text-center backdrop-blur-sm">
            <Star className="mx-auto mb-1 h-4 sm:h-5 w-4 sm:w-5" />
            <div className="text-sm sm:text-lg font-bold">4.9</div>
            <div className="text-[10px] sm:text-xs text-white/70">Rating</div>
          </div>
          <div className="rounded-xl bg-white/10 p-2 sm:p-3 text-center backdrop-blur-sm">
            <Shield className="mx-auto mb-1 h-4 sm:h-5 w-4 sm:w-5" />
            <div className="text-sm sm:text-lg font-bold">99%</div>
            <div className="text-[10px] sm:text-xs text-white/70">Resolved</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Contact Options Component
// ============================================================================
interface ContactOptionsProps {
  onChatClick: () => void;
  onTicketClick: () => void;
}

function ContactOptions({ onChatClick, onTicketClick }: ContactOptionsProps) {
  const options = [
    {
      id: 'chat',
      icon: Bot,
      title: 'AI Assistant',
      subtitle: 'Online 24/7',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      onClick: onChatClick,
      badge: 'GPT-4o',
      pulse: true,
    },
    {
      id: 'email',
      icon: Mail,
      title: 'Email Ticket',
      subtitle: '2-4 jam response',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      onClick: onTicketClick,
      badge: null,
      pulse: false,
    },
    {
      id: 'phone',
      icon: Phone,
      title: 'Telepon',
      subtitle: 'Senin-Sabtu',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      onClick: () => window.open('tel:+6281234567890'),
      badge: null,
      pulse: false,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 gap-2 sm:gap-3"
    >
      {options.map((option) => (
        <motion.button
          key={option.id}
          variants={itemVariants}
          whileHover="hover"
          initial="rest"
          animate="rest"
          onClick={option.onClick}
          className={`group relative overflow-hidden rounded-xl sm:rounded-2xl ${option.bgColor} p-2 sm:p-4 transition-all`}
        >
          <motion.div variants={cardHoverVariants} className="relative z-10 flex flex-col items-center">
            <div
              className={`relative mb-2 sm:mb-3 flex h-10 sm:h-14 w-10 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br ${option.color} text-white shadow-lg`}
            >
              <option.icon className="h-4 sm:h-6 w-4 sm:w-6" />
              {option.pulse && (
                <motion.span
                  animate={pulseAnimation}
                  className="absolute inset-0 rounded-full bg-green-400/30"
                />
              )}
            </div>
            <span className="text-xs sm:text-base font-semibold text-gray-900 dark:text-white text-center">
              {option.title}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center">
              {option.subtitle}
            </span>
          </motion.div>

          {option.badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute right-1 top-1 sm:right-2 sm:top-2 rounded-full bg-gradient-to-r ${option.color} px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-medium text-white`}
            >
              {option.badge}
            </motion.div>
          )}

          <div
            className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
          />
        </motion.button>
      ))}
    </motion.div>
  );
}

// ============================================================================
// AI Chat Interface - Mobile Responsive
// ============================================================================
interface AIChatInterfaceProps {
  products: Product[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function AIChatInterface({ products, isOpen, onOpen, onClose }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageUI[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `${getTimeBasedGreeting()}! 👋 Saya AI Assistant powered by GPT-4o.\n\nSaya bisa bantu:\n• Info produk & harga\n• Rekomendasi layanan\n• Jawaban cepat\n• Troubleshooting\n\nAda yang bisa saya bantu?`,
      timestamp: Date.now(),
      suggestions: ['Lihat produk', 'Paket WiFi', 'CCTV'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [showErrorLogs, setShowErrorLogs] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNotification, addToCart } = useAppStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages, streamingText, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessageUI = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      await OpenAIService.streamMessage(
        [{ role: 'user', content: input }],
        (_chunk, full) => setStreamingText(full),
        { context: { products }, temperature: 0.7 }
      );

      setStreamingText('');

      const response: ChatResponse = await OpenAIService.sendMessageWithContext(
        [{ role: 'user', content: input }],
        products,
        undefined,
        { temperature: 0.7 }
      );

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        productCards: response.productCards,
        suggestions: response.suggestions?.slice(0, 3),
        errorLogs: response.errorLogs,
      }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage = error?.message || 'Maaf, terjadi kesalahan. Silakan coba lagi.';
      const errorLogs = error?.details || error?.stack || JSON.stringify(error, null, 2);
      
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now(),
        errorLogs: errorLogs,
        suggestions: ['Coba lagi'],
      }]);
    } finally {
      setIsTyping(false);
      setStreamingText('');
    }
  }, [input, isTyping, products]);

  const handleQuickReply = useCallback((suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  }, [handleSend]);

  const handleAddToCart = useCallback((product: ProductCardData) => {
    const fullProduct = products.find((p) => p.id === product.id);
    if (fullProduct) {
      const tier = product.tiers?.[0]?.name || fullProduct.tiers[0]?.name || 'Basic';
      addToCart(fullProduct, tier);
      setNotification({
        message: `${product.title} ditambahkan ke keranjang!`,
        type: 'success',
      });
    }
  }, [products, addToCart, setNotification]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `${getTimeBasedGreeting()}! 👋 Ada yang bisa saya bantu?`,
      timestamp: Date.now(),
      suggestions: ['Lihat produk', 'Paket WiFi', 'CCTV'],
    }]);
    OpenAIService.clearHistory();
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpen}
            className="fixed bottom-4 right-4 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
          >
            <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-4 sm:w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-full w-full rounded-full bg-green-500" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window - Mobile Responsive */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-0 bottom-0 top-0 z-50 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[calc(100vw-2rem)] sm:max-w-[420px] flex flex-col overflow-hidden rounded-none sm:rounded-2xl border-0 sm:border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            style={{ 
              maxHeight: '100vh',
              height: '100%',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-green-500 to-emerald-600 px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/20 text-white">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-white">AI Assistant</h3>
                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-white/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                    Online • GPT-4o
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-7 w-7 sm:h-8 sm:w-8 text-white/80 hover:bg-white/20 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-7 w-7 sm:h-8 sm:w-8 text-white/80 hover:bg-white/20 hover:text-white"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-2 sm:px-3 py-2 sm:py-3 min-h-0">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[92%] sm:max-w-[90%] gap-1.5 sm:gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-full text-[9px] sm:text-[10px] ${
                        message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                      }`}>
                        {message.role === 'user' ? <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                      </div>
                      <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                        <div className={`rounded-2xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : message.errorLogs 
                              ? 'bg-red-50 text-red-800 rounded-bl-md dark:bg-red-900/20 dark:text-red-200 border border-red-200 dark:border-red-800'
                              : 'bg-gray-100 text-gray-800 rounded-bl-md dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          
                          {/* Error Logs Toggle */}
                          {message.errorLogs && (
                            <button
                              onClick={() => setShowErrorLogs(showErrorLogs === message.id ? null : message.id)}
                              className="mt-2 flex items-center gap-1 text-[9px] sm:text-[10px] text-red-600 dark:text-red-400 hover:underline"
                            >
                              <Terminal className="h-3 w-3" />
                              {showErrorLogs === message.id ? 'Sembunyikan logs' : 'Lihat error logs'}
                            </button>
                          )}
                          
                          {/* Error Logs Content */}
                          {showErrorLogs === message.id && message.errorLogs && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 p-2 bg-black/90 rounded text-[9px] font-mono text-green-400 overflow-x-auto"
                            >
                              <pre className="whitespace-pre-wrap break-all">{message.errorLogs}</pre>
                            </motion.div>
                          )}
                        </div>

                        {/* Product Cards */}
                        {message.productCards && message.productCards.length > 0 && (
                          <div className="grid gap-1.5 sm:gap-2">
                            {message.productCards.slice(0, 2).map((product) => (
                              <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="overflow-hidden rounded-lg border border-gray-200 bg-white text-[10px] sm:text-xs dark:border-gray-700 dark:bg-gray-800"
                              >
                                <div className="relative h-16 sm:h-20 overflow-hidden">
                                  <img src={product.image} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
                                  {product.originalPrice && (
                                    <span className="absolute left-1 top-1 sm:left-1.5 sm:top-1.5 rounded-full bg-red-500 px-1 py-0.5 text-[8px] sm:text-[9px] text-white">Promo</span>
                                  )}
                                </div>
                                <div className="p-1.5 sm:p-2">
                                  <h4 className="mb-0.5 font-medium line-clamp-1 text-xs sm:text-sm">{product.title}</h4>
                                  <p className="mb-1 text-[9px] sm:text-[10px] text-gray-500 line-clamp-1">{product.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-blue-600 text-xs sm:text-sm">{formatPrice(product.price)}</span>
                                    <Button
                                      size="sm"
                                      className="h-5 sm:h-6 bg-gradient-to-r from-blue-600 to-orange-500 px-1.5 sm:px-2 text-[9px] sm:text-[10px]"
                                      onClick={() => handleAddToCart(product)}
                                    >
                                      <ShoppingCart className="mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                      Beli
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1 sm:gap-1.5">
                            {message.suggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => handleQuickReply(suggestion)}
                                className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] text-blue-600 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        <span className="block text-[8px] sm:text-[9px] text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Streaming */}
                {streamingText && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[92%] sm:max-w-[90%] gap-1.5 sm:gap-2">
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md bg-gray-100 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs dark:bg-gray-800">
                        {streamingText}
                        <span className="ml-0.5 inline-block h-3 sm:h-3.5 w-0.5 animate-pulse bg-gray-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Typing */}
                {isTyping && !streamingText && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[92%] sm:max-w-[90%] gap-1.5 sm:gap-2">
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md bg-gray-100 px-2.5 sm:px-3 py-1.5 sm:py-2 dark:bg-gray-800">
                        <div className="flex gap-1">
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.4, repeat: Infinity }} className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-gray-400" />
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }} className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-gray-400" />
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }} className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-gray-100 bg-gray-50 p-2 sm:p-3 dark:border-gray-800 dark:bg-gray-900 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan..."
                  disabled={isTyping}
                  className="h-8 sm:h-9 flex-1 bg-white text-[11px] sm:text-xs dark:bg-gray-800"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  {isTyping ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// FAQ Section with Search
// ============================================================================
function FAQSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(faqs.map((f) => f.category))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === null || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Pertanyaan Umum
        </h2>
        <Badge variant="secondary" className="text-xs">
          {filteredFaqs.length} FAQ
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Cari pertanyaan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Semua
        </motion.button>
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <Accordion type="single" collapsible className="space-y-2">
        {filteredFaqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AccordionItem
              value={faq.id}
              className="rounded-xl border border-gray-200 bg-white px-3 sm:px-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <AccordionTrigger className="text-left text-sm hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 flex-shrink-0 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600 dark:text-gray-400">
                <div className="border-l-2 border-blue-200 pl-4 dark:border-blue-800">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>

      {filteredFaqs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8 text-center"
        >
          <Info className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            Tidak menemukan pertanyaan yang cocok
          </p>
          <p className="text-xs text-gray-400">
            Coba kata kunci lain atau hubungi kami langsung
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Ticket Form Modal
// ============================================================================
interface TicketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function TicketFormModal({ isOpen, onClose }: TicketFormModalProps) {
  const { submitTicket, isSubmitting } = useSupport();
  const { profile, setNotification } = useAppStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState<TicketFormData & { priority: string }>({
    subject: '',
    category: '',
    email: profile?.email || '',
    description: '',
    priority: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitTicket({
        subject: formData.subject,
        category: formData.category,
        email: formData.email,
        description: `[Priority: ${formData.priority.toUpperCase()}]\n\n${formData.description}`,
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          subject: '',
          category: '',
          email: profile?.email || '',
          description: '',
          priority: 'medium',
        });
        setAttachments([]);
      }, 2500);
    } catch (error) {
      setNotification({
        message: 'Gagal mengirim tiket. Silakan coba lagi.',
        type: 'error',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Buat Tiket Dukungan
          </DialogTitle>
          <DialogDescription className="sr-only">
            Laporkan masalah atau dapatkan bantuan detail dari tim kami
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </motion.div>
            <h3 className="mb-2 text-xl font-semibold text-green-600">
              Tiket Berhasil Dibuat!
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Tim support kami akan segera menghubungi Anda dalam 2-4 jam.
            </p>
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                📧 Konfirmasi telah dikirim ke email Anda
              </p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subjek</label>
              <Input
                placeholder="Ringkasan masalah Anda"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prioritas</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${p.color.split(' ')[0].replace('bg-', 'bg-').replace('100', '500')}`}
                          />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="email@anda.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Textarea
                placeholder="Jelaskan masalah Anda secara detail..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                maxLength={1000}
              />
              <p className="text-right text-xs text-gray-400">
                {formData.description.length}/1000
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Lampiran (Opsional)</label>
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer flex-col items-center gap-2"
                >
                  <Paperclip className="h-6 w-6 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Klik untuk upload file
                  </span>
                  <span className="text-xs text-gray-400">
                    Maks 5MB (Image, PDF, DOC)
                  </span>
                </label>
              </div>

              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="max-w-[200px] truncate text-xs">
                          {file.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Kirim Tiket
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Support Section Ultra Component
// ============================================================================
export function SupportSectionUltra() {
  const [chatOpen, setChatOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const { products, isDarkMode } = useAppStore();

  return (
    <div
      className={`min-h-screen pb-24 pt-4 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6 px-3 sm:px-4">
        {/* Animated Header */}
        <AnimatedHeader />

        {/* Contact Options */}
        <ContactOptions
          onChatClick={() => setChatOpen(true)}
          onTicketClick={() => setTicketModalOpen(true)}
        />

        {/* Quick Actions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Zap className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-500" />
                Aksi Cepat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setChatOpen(true)}
                  className="flex items-center gap-2 sm:gap-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-2.5 sm:p-3 text-left transition-colors hover:from-green-100 hover:to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20"
                >
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-500 text-white flex-shrink-0">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                      Chat dengan AI
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Jawaban instan</div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTicketModalOpen(true)}
                  className="flex items-center gap-2 sm:gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-2.5 sm:p-3 text-left transition-colors hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20"
                >
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                      Buat Tiket
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Support detail</div>
                  </div>
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <FAQSection />

        {/* Contact Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Headphones className="h-4 sm:h-5 w-4 sm:w-5 text-purple-500" />
                Hubungi Kami Langsung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <a
                href="tel:+6281234567890"
                className="flex items-center gap-2 sm:gap-3 rounded-lg border border-gray-200 p-2.5 sm:p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">+62 812-3456-7890</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    Senin-Sabtu, 09:00-21:00 WIB
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              </a>

              <a
                href="mailto:support@lumakara.com"
                className="flex items-center gap-2 sm:gap-3 rounded-lg border border-gray-200 p-2.5 sm:p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">support@lumakara.com</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    Response dalam 2-4 jam
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              </a>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-[10px] sm:text-xs text-gray-400">
            Ditenagai oleh GPT-4o • Selalu siap membantu Anda 24/7
          </p>
        </motion.div>
      </div>

      {/* AI Chat Interface - Floating Widget */}
      <AIChatInterface
        products={products}
        isOpen={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
      />

      {/* Ticket Form Modal */}
      <TicketFormModal isOpen={ticketModalOpen} onClose={() => setTicketModalOpen(false)} />
    </div>
  );
}

export default SupportSectionUltra;
