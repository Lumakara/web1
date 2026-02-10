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
  Paperclip,
  Smile,
  PhoneCall,
  Clock,
  Star,
  Shield,
  ChevronRight,
  FileText,
  Sparkles,
  Zap,
  Headphones,
  Image as ImageIcon,
  RotateCcw,
  ShoppingCart,
  ExternalLink,
  CheckCircle2,
  Info
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
  KimiAIService,
  type ChatMessage,
  type ProductCardData,
  type ChatResponse,
  getTimeBasedGreeting,
  formatPrice,
} from '@/lib/kimi-ai';
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
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 p-6 text-white shadow-xl"
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
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm"
        >
          <Sparkles className="h-3 w-3" />
          <span>Dukungan 24/7 dengan AI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-2 text-3xl font-bold"
        >
          Pusat Bantuan
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 text-white/80"
        >
          Kami siap membantu Anda kapan saja
        </motion.p>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
            <Clock className="mx-auto mb-1 h-5 w-5" />
            <div className="text-lg font-bold">&lt;2m</div>
            <div className="text-xs text-white/70">Response</div>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
            <Star className="mx-auto mb-1 h-5 w-5" />
            <div className="text-lg font-bold">4.9</div>
            <div className="text-xs text-white/70">Rating</div>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
            <Shield className="mx-auto mb-1 h-5 w-5" />
            <div className="text-lg font-bold">99%</div>
            <div className="text-xs text-white/70">Resolved</div>
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
      title: 'Kimi AI',
      subtitle: 'Online 24/7',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      onClick: onChatClick,
      badge: 'Ultra Pintar',
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
      className="grid grid-cols-3 gap-3"
    >
      {options.map((option) => (
        <motion.button
          key={option.id}
          variants={itemVariants}
          whileHover="hover"
          initial="rest"
          animate="rest"
          onClick={option.onClick}
          className={`group relative overflow-hidden rounded-2xl ${option.bgColor} p-4 transition-all`}
        >
          <motion.div variants={cardHoverVariants} className="relative z-10 flex flex-col items-center">
            <div
              className={`relative mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${option.color} text-white shadow-lg`}
            >
              <option.icon className="h-6 w-6" />
              {option.pulse && (
                <motion.span
                  animate={pulseAnimation}
                  className="absolute inset-0 rounded-full bg-green-400/30"
                />
              )}
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {option.title}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {option.subtitle}
            </span>
          </motion.div>

          {option.badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute right-2 top-2 rounded-full bg-gradient-to-r ${option.color} px-2 py-0.5 text-[10px] font-medium text-white`}
            >
              {option.badge}
            </motion.div>
          )}

          {/* Hover gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
          />
        </motion.button>
      ))}
    </motion.div>
  );
}

// ============================================================================
// Product Card in Chat
// ============================================================================
interface ProductCardChatProps {
  product: ProductCardData;
  onView: () => void;
  onAddToCart: () => void;
}

function ProductCardChat({ product, onView, onAddToCart }: ProductCardChatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover"
        />
        {product.originalPrice && (
          <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
            Promo
          </div>
        )}
        <div className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium dark:bg-gray-900/90">
          ⭐ {product.rating}
        </div>
      </div>

      <div className="p-3">
        <h4 className="mb-1 font-semibold text-gray-900 dark:text-white line-clamp-1">
          {product.title}
        </h4>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {product.description}
        </p>

        <div className="mb-3 flex items-center gap-2">
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {product.tiers && product.tiers.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {product.tiers.slice(0, 2).map((tier) => (
              <span
                key={tier.name}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                {tier.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={onView}
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            Lihat
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 text-xs"
            onClick={onAddToCart}
          >
            <ShoppingCart className="mr-1 h-3 w-3" />
            Beli
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Typing Indicator
// ============================================================================
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
        className="h-2 w-2 rounded-full bg-gray-400"
      />
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
        className="h-2 w-2 rounded-full bg-gray-400"
      />
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
        className="h-2 w-2 rounded-full bg-gray-400"
      />
    </div>
  );
}

// ============================================================================
// Kimi AI Chat Interface
// ============================================================================
interface KimiChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

function KimiChatInterface({ isOpen, onClose, products }: KimiChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageUI[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `${getTimeBasedGreeting()}! 👋 Saya Kimi Assistant, AI Customer Service yang **ULTRA SUPER PINTAR**! \n\nSaya bisa membantu Anda dengan:\n• 📦 Informasi produk & harga\n• 🔍 Rekomendasi layanan\n• 📊 Cek status pesanan\n• 💬 Jawaban cepat FAQ\n• 🎫 Buat tiket support\n\nAda yang bisa saya bantu?`,
      timestamp: Date.now(),
      suggestions: ['Lihat produk', 'Cek pesanan', 'Buat tiket'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNotification, addToCart } = useAppStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

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
      // Stream the response
      await KimiAIService.streamMessage(
        [{ role: 'user', content: input }],
        (_chunk, full) => {
          setStreamingText(full);
        },
        {
          context: { products },
          temperature: 0.7,
        }
      );

      setStreamingText('');

      // Get full response
      const response: ChatResponse = await KimiAIService.sendMessageWithContext(
        [{ role: 'user', content: input }],
        products,
        undefined,
        { temperature: 0.7 }
      );

      const assistantMessage: ChatMessageUI = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        productCards: response.productCards,
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi tim support kami.',
          timestamp: Date.now(),
          suggestions: ['Coba lagi', 'Hubungi support'],
        },
      ]);
    } finally {
      setIsTyping(false);
      setStreamingText('');
    }
  }, [input, isTyping, products]);

  const handleQuickReply = useCallback((suggestion: string) => {
    setInput(suggestion);
    // Auto send after short delay
    setTimeout(() => {
      handleSend();
    }, 100);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900"
        >
          {/* Chat Header */}
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  <Bot className="h-6 w-6" />
                </div>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-gray-900"
                />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Kimi AI Assistant
                </h2>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  <span>Online - Ultra Super Pintar</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setMessages([
                    {
                      id: 'welcome',
                      role: 'assistant',
                      content: `${getTimeBasedGreeting()}! 👋 Saya Kimi Assistant! Ada yang bisa saya bantu?`,
                      timestamp: Date.now(),
                      suggestions: ['Lihat produk', 'Cek pesanan', 'Buat tiket'],
                    },
                  ]);
                  KimiAIService.clearHistory();
                }}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-6 w-6" />
              </Button>
            </div>
          </motion.div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex max-w-[85%] gap-2 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="space-y-2">
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>

                      {/* Product Cards */}
                      {message.productCards && message.productCards.length > 0 && (
                        <div className="grid gap-2">
                          {message.productCards.map((product) => (
                            <ProductCardChat
                              key={product.id}
                              product={product}
                              onView={() => {
                                setNotification({
                                  message: `Melihat detail ${product.title}`,
                                  type: 'info',
                                });
                              }}
                              onAddToCart={() => handleAddToCart(product)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Quick Reply Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion) => (
                            <motion.button
                              key={suggestion}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleQuickReply(suggestion)}
                              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-600 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            >
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div
                        className={`text-[10px] text-gray-400 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Streaming Text */}
              {streamingText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex max-w-[85%] gap-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {streamingText}
                      <span className="inline-block h-4 w-1 animate-pulse bg-gray-400" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Typing Indicator */}
              {isTyping && !streamingText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex max-w-[85%] gap-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-bl-md bg-gray-100 dark:bg-gray-800">
                      <TypingIndicator />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Paperclip className="h-5 w-5 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <ImageIcon className="h-5 w-5 text-gray-500" />
              </Button>
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan Anda..."
                  className="pr-10"
                  disabled={isTyping}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  <Smile className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-600"
              >
                {isTyping ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-gray-400">
              Powered by Kimi AI • Response otomatis dalam detik
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
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
          className="pl-9"
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
              className="rounded-xl border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <AccordionTrigger className="text-left text-sm hover:no-underline">
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
          <DialogDescription>
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

// Missing import for HelpCircle
function HelpCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
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
      <div className="mx-auto max-w-2xl space-y-6 px-4">
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
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-5 w-5 text-yellow-500" />
                Aksi Cepat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setChatOpen(true)}
                  className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-3 text-left transition-colors hover:from-green-100 hover:to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Chat dengan AI
                    </div>
                    <div className="text-xs text-gray-500">Jawaban instan</div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTicketModalOpen(true)}
                  className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-3 text-left transition-colors hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Buat Tiket
                    </div>
                    <div className="text-xs text-gray-500">Support detail</div>
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
              <CardTitle className="flex items-center gap-2 text-base">
                <Headphones className="h-5 w-5 text-purple-500" />
                Hubungi Kami Langsung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="tel:+6281234567890"
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <PhoneCall className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <div className="font-medium">+62 812-3456-7890</div>
                  <div className="text-xs text-gray-500">
                    Senin-Sabtu, 09:00-21:00 WIB
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </a>

              <a
                href="mailto:support@lumakara.com"
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <Mail className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium">support@lumakara.com</div>
                  <div className="text-xs text-gray-500">
                    Response dalam 2-4 jam
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
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
          <p className="text-xs text-gray-400">
            Ditenagai oleh Kimi AI • Selalu siap membantu Anda 24/7
          </p>
        </motion.div>
      </div>

      {/* Kimi AI Chat Interface */}
      <KimiChatInterface
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        products={products}
      />

      {/* Ticket Form Modal */}
      <TicketFormModal isOpen={ticketModalOpen} onClose={() => setTicketModalOpen(false)} />
    </div>
  );
}

export default SupportSectionUltra;
