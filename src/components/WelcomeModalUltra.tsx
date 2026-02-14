import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ShoppingCart,
  Headphones,
  User,
  ArrowRight,
  X,
  Volume2,
  VolumeX,
  ChevronLeft,
  Zap,
  Shield,
  Clock,
  Star,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { audioService } from '@/lib/audio';
import { cn } from '@/lib/utils';

// Welcome steps data
const welcomeSteps = [
  {
    icon: Sparkles,
    title: 'Selamat Datang!',
    subtitle: 'Layanan Digital Profesional',
    description:
      'Temukan berbagai layanan digital untuk kebutuhan Anda. Dari instalasi Wi-Fi, CCTV, editing kreatif, hingga support teknis.',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgGradient: 'from-violet-500/20 via-purple-500/10 to-fuchsia-500/20',
    accent: 'text-purple-500',
    features: ['Layanan Berkualitas', 'Harga Terjangkau', 'Proses Cepat'],
  },
  {
    icon: ShoppingCart,
    title: 'Belanja Mudah',
    subtitle: 'Pemesanan dalam Hitungan Detik',
    description:
      'Pilih layanan yang Anda butuhkan, tambahkan ke keranjang, dan lakukan pembayaran dengan QRIS. Cepat dan aman!',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/20',
    accent: 'text-emerald-500',
    features: ['Pembayaran QRIS', 'Keranjang Pintar', 'Konfirmasi Instan'],
  },
  {
    icon: Headphones,
    title: 'Support 24/7',
    subtitle: 'Tim Siap Membantu Kapan Saja',
    description:
      'Tim kami siap membantu kapan saja. Gunakan fitur live chat atau kirim tiket dukungan untuk bantuan lebih lanjut.',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    bgGradient: 'from-orange-500/20 via-amber-500/10 to-yellow-500/20',
    accent: 'text-orange-500',
    features: ['Live Chat', 'Respons Cepat', 'Garansi Layanan'],
  },
  {
    icon: User,
    title: 'Akun Pribadi',
    subtitle: 'Pengalaman yang Dipersonalisasi',
    description:
      'Daftar atau login untuk melihat riwayat pesanan, menyimpan favorit, dan mendapatkan penawaran eksklusif.',
    gradient: 'from-rose-500 via-pink-500 to-rose-400',
    bgGradient: 'from-rose-500/20 via-pink-500/10 to-rose-400/20',
    accent: 'text-rose-500',
    features: ['Riwayat Pesanan', 'Favorit Tersimpan', 'Promo Eksklusif'],
  },
];

// Particle component for background effects
function Particle({
  isDarkMode,
}: {
  isDarkMode: boolean;
}) {
  const size = Math.random() * 4 + 2;
  const left = Math.random() * 100;
  const delay = Math.random() * 5;
  const duration = Math.random() * 10 + 10;

  return (
    <div
      className={cn(
        'absolute rounded-full pointer-events-none',
        isDarkMode ? 'bg-white/20' : 'bg-white/40'
      )}
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        bottom: '-10px',
        animation: `float-up ${duration}s ease-in-out ${delay}s infinite`,
        opacity: Math.random() * 0.5 + 0.2,
      }}
    />
  );
}

// Confetti piece component
function ConfettiPiece({
  index,
  active,
}: {
  index: number;
  active: boolean;
}) {
  const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
  const color = colors[index % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = Math.random() * 1 + 1;
  const rotation = Math.random() * 360;

  if (!active) return null;

  return (
    <div
      className="absolute w-2 h-2 pointer-events-none"
      style={{
        backgroundColor: color,
        left: `${left}%`,
        top: '50%',
        transform: `rotate(${rotation}deg)`,
        animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
    />
  );
}

// Feature badge component
function FeatureBadge({
  icon: Icon,
  text,
  delay,
}: {
  icon: React.ElementType;
  text: string;
  delay: number;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 text-xs font-medium text-white/90 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="w-3 h-3" />
      <span>{text}</span>
    </div>
  );
}

export function WelcomeModalUltra() {
  const {
    hasSeenWelcome,
    setHasSeenWelcome,
    soundEnabled,
    musicEnabled,
    isDarkMode,
  } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const cardRef = useRef<HTMLDivElement>(null);

  // Open modal after delay if not seen
  useEffect(() => {
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        if (musicEnabled) {
          audioService.playWelcomeMusic();
          setIsPlayingMusic(true);
        }
        if (soundEnabled) {
          audioService.playPop();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome, musicEnabled, soundEnabled]);

  // Handle close modal
  const handleClose = useCallback(() => {
    setShowConfetti(true);
    if (soundEnabled) {
      audioService.playSuccess();
    }

    setTimeout(() => {
      setIsOpen(false);
      setHasSeenWelcome(true);
      audioService.stopWelcomeMusic();
    }, 500);
  }, [setHasSeenWelcome, soundEnabled]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (soundEnabled) {
      audioService.playClick();
    }
    handleClose();
  }, [handleClose, soundEnabled]);

  // Handle next step with 3D flip animation
  const handleNext = useCallback(() => {
    if (soundEnabled) {
      audioService.playSwipe();
    }

    if (currentStep < welcomeSteps.length - 1) {
      setDirection('next');
      setIsFlipping(true);

      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setTimeout(() => {
          setIsFlipping(false);
        }, 50);
      }, 300);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose, soundEnabled]);

  // Handle previous step with 3D flip animation
  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      if (soundEnabled) {
        audioService.playSwipe();
      }
      setDirection('prev');
      setIsFlipping(true);

      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setTimeout(() => {
          setIsFlipping(false);
        }, 50);
      }, 300);
    }
  }, [currentStep, soundEnabled]);

  // Toggle music
  const toggleMusic = useCallback(() => {
    if (soundEnabled) {
      audioService.playToggle();
    }
    if (isPlayingMusic) {
      audioService.stopWelcomeMusic();
      setIsPlayingMusic(false);
    } else {
      audioService.playWelcomeMusic();
      setIsPlayingMusic(true);
    }
  }, [isPlayingMusic, soundEnabled]);

  // Go to specific step
  const goToStep = useCallback(
    (index: number) => {
      if (index !== currentStep && !isFlipping) {
        if (soundEnabled) {
          audioService.playClick();
        }
        setDirection(index > currentStep ? 'next' : 'prev');
        setIsFlipping(true);

        setTimeout(() => {
          setCurrentStep(index);
          setTimeout(() => {
            setIsFlipping(false);
          }, 50);
        }, 300);
      }
    },
    [currentStep, isFlipping, soundEnabled]
  );

  const currentStepData = welcomeSteps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / welcomeSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn(
          'max-w-lg p-0 overflow-hidden border-0 shadow-2xl',
          'bg-gradient-to-br',
          currentStepData.bgGradient,
          isDarkMode ? 'dark' : ''
        )}
        style={{
          backdropFilter: 'blur(20px)',
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Selamat Datang di Layanan Digital</DialogTitle>
          <DialogDescription>
            Tutorial interaktif untuk mengenal fitur-fitur aplikasi kami
          </DialogDescription>
        </DialogHeader>
        {/* CSS Animations */}
        <style>{`
          @keyframes float-up {
            0% {
              transform: translateY(0) scale(1);
              opacity: 0;
            }
            10% {
              opacity: 0.6;
            }
            90% {
              opacity: 0.6;
            }
            100% {
              transform: translateY(-400px) scale(0.5);
              opacity: 0;
            }
          }

          @keyframes confetti-fall {
            0% {
              transform: translateY(0) rotate(0deg) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateY(200px) rotate(720deg) scale(0.5);
              opacity: 0;
            }
          }

          @keyframes gradient-shift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1);
            }
            50% {
              box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2);
            }
          }

          @keyframes icon-bounce {
            0%, 100% {
              transform: scale(1) rotate(0deg);
            }
            25% {
              transform: scale(1.1) rotate(-5deg);
            }
            75% {
              transform: scale(1.1) rotate(5deg);
            }
          }

          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slide-in-right {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slide-in-left {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
          }

          .animate-slide-in-right {
            animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .animate-slide-in-left {
            animation: slide-in-left 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .animate-scale-in {
            animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .animate-icon-bounce {
            animation: icon-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }

          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient-shift 8s ease infinite;
          }

          .animate-shimmer {
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.2) 50%,
              transparent 100%
            );
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }

          .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .dark .glass-card {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .perspective-1000 {
            perspective: 1000px;
          }

          .preserve-3d {
            transform-style: preserve-3d;
          }

          .backface-hidden {
            backface-visibility: hidden;
          }

          .flip-next {
            transform: rotateY(-90deg);
          }

          .flip-prev {
            transform: rotateY(90deg);
          }

          .transition-transform-600 {
            transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }

          .transition-transform-300 {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .hover-lift:hover {
            transform: translateY(-2px);
          }

          .hover-scale:hover {
            transform: scale(1.05);
          }

          .btn-glow:hover {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
          }
        `}</style>

        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div
            className={cn(
              'absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-30 animate-gradient',
              'bg-gradient-to-br',
              currentStepData.gradient
            )}
          />
          <div
            className={cn(
              'absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-30 animate-gradient',
              'bg-gradient-to-tr',
              currentStepData.gradient
            )}
            style={{ animationDelay: '-4s' }}
          />

          {/* Floating particles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <Particle key={i} isDarkMode={isDarkMode} />
          ))}

          {/* Confetti */}
          {showConfetti &&
            Array.from({ length: 30 }).map((_, i) => (
              <ConfettiPiece key={`confetti-${i}`} index={i} active={showConfetti} />
            ))}
        </div>

        {/* Progress Bar */}
        <div className="relative h-1.5 bg-white/10 overflow-hidden">
          <div
            className={cn(
              'absolute inset-y-0 left-0 transition-all duration-700 ease-out bg-gradient-to-r',
              currentStepData.gradient
            )}
            style={{
              width: `${progress}%`,
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          {/* Shimmer effect on progress */}
          <div className="absolute inset-0 animate-shimmer" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/60 tracking-wider uppercase">
              Langkah
            </span>
            <span className="text-sm font-bold text-white">
              {currentStep + 1} / {welcomeSteps.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Music toggle */}
            <button
              onClick={toggleMusic}
              onMouseEnter={() => soundEnabled && audioService.playHover()}
              className="p-2 rounded-full transition-all duration-300 hover:bg-white/10 hover:scale-110 active:scale-95"
            >
              {isPlayingMusic ? (
                <Volume2 className="w-4 h-4 text-white/80" />
              ) : (
                <VolumeX className="w-4 h-4 text-white/50" />
              )}
            </button>

            {/* Skip button */}
            <button
              onClick={handleSkip}
              onMouseEnter={() => soundEnabled && audioService.playHover()}
              className="p-2 rounded-full transition-all duration-300 hover:bg-white/10 hover:scale-110 active:scale-95"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* Main Content with 3D Card Flip */}
        <div className="relative px-6 pb-6 perspective-1000">
          <div
            ref={cardRef}
            className={cn(
              'relative preserve-3d transition-transform-600',
              isFlipping && direction === 'next' && 'flip-next',
              isFlipping && direction === 'prev' && 'flip-prev'
            )}
          >
            {/* Card Content */}
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              {/* Icon Container */}
              <div className="relative flex justify-center mb-6">
                {/* Glow effect */}
                <div
                  className={cn(
                    'absolute inset-0 w-24 h-24 mx-auto rounded-2xl blur-xl opacity-50 animate-gradient',
                    'bg-gradient-to-br',
                    currentStepData.gradient
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    'relative w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl',
                    'bg-gradient-to-br',
                    currentStepData.gradient,
                    !isFlipping && 'animate-icon-bounce'
                  )}
                  style={{
                    animationDelay: `${currentStep * 0.1}s`,
                    boxShadow: `0 20px 40px -10px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset`,
                  }}
                >
                  <Icon className="w-12 h-12 text-white drop-shadow-lg" />

                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="text-center space-y-3">
                <h2
                  className={cn(
                    'text-2xl sm:text-3xl font-bold text-white animate-fade-in-up',
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  )}
                  style={{ animationDelay: '100ms' }}
                >
                  {currentStepData.title}
                </h2>

                <p
                  className={cn(
                    'text-sm font-medium animate-fade-in-up',
                    currentStepData.accent
                  )}
                  style={{ animationDelay: '200ms' }}
                >
                  {currentStepData.subtitle}
                </p>

                <p
                  className={cn(
                    'text-sm leading-relaxed animate-fade-in-up',
                    isDarkMode ? 'text-white/70' : 'text-gray-600'
                  )}
                  style={{ animationDelay: '300ms' }}
                >
                  {currentStepData.description}
                </p>
              </div>

              {/* Feature Badges */}
              <div
                className="flex flex-wrap justify-center gap-2 mt-6"
                style={{ animationDelay: '400ms' }}
              >
                {currentStepData.features.map((feature, index) => (
                  <FeatureBadge
                    key={feature}
                    icon={[Zap, Shield, Clock, Star][index]}
                    text={feature}
                    delay={400 + index * 100}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {welcomeSteps.map((_, _index) => (
              <button
                key={_index}
                onClick={() => goToStep(_index)}
                onMouseEnter={() => soundEnabled && audioService.playHover()}
                className={cn(
                  'h-2 rounded-full transition-all duration-500',
                  _index === currentStep
                    ? 'w-8 bg-white'
                    : _index < currentStep
                      ? 'w-2 bg-white/60'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                )}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                }}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {/* Previous Button */}
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0 || isFlipping}
              onMouseEnter={() => soundEnabled && audioService.playHover()}
              className={cn(
                'flex-1 h-12 rounded-xl border-white/20 bg-white/5 text-white',
                'hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]',
                'active:scale-95 transition-all duration-300',
                'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100',
                currentStep === 0 && 'opacity-0 pointer-events-none'
              )}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>

            {/* Next/Start Button */}
            <Button
              onClick={handleNext}
              disabled={isFlipping}
              onMouseEnter={() => soundEnabled && audioService.playHover()}
              className={cn(
                'flex-1 h-12 rounded-xl text-white font-semibold',
                'bg-gradient-to-r hover:scale-[1.02] active:scale-95',
                'transition-all duration-300 btn-glow',
                currentStepData.gradient
              )}
            >
              {currentStep === welcomeSteps.length - 1 ? (
                <>
                  Mulai Sekarang
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Lanjut
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Text Link */}
          {currentStep < welcomeSteps.length - 1 && (
            <button
              onClick={handleSkip}
              onMouseEnter={() => soundEnabled && audioService.playHover()}
              className={cn(
                'w-full mt-4 text-sm transition-all duration-300',
                'hover:scale-105 active:scale-95',
                isDarkMode
                  ? 'text-white/50 hover:text-white/80'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Lewati tutorial
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WelcomeModalUltra;
