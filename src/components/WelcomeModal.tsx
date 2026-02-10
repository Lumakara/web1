import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ShoppingCart, Headphones, User, ArrowRight, X, Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { audioService } from '@/lib/audio';

const welcomeSteps = [
  {
    icon: Sparkles,
    title: 'Selamat Datang!',
    description: 'Temukan berbagai layanan digital profesional untuk kebutuhan Anda. Dari instalasi Wi-Fi, CCTV, editing kreatif, hingga support teknis.',
    color: 'from-blue-500 to-purple-500',
  },
  {
    icon: ShoppingCart,
    title: 'Belanja Mudah',
    description: 'Pilih layanan yang Anda butuhkan, tambahkan ke keranjang, dan lakukan pembayaran dengan QRIS. Cepat dan aman!',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Headphones,
    title: 'Support 24/7',
    description: 'Tim kami siap membantu kapan saja. Gunakan fitur live chat atau kirim tiket dukungan untuk bantuan lebih lanjut.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: User,
    title: 'Akun Pribadi',
    description: 'Daftar atau login untuk melihat riwayat pesanan, menyimpan favorit, dan mendapatkan penawaran eksklusif.',
    color: 'from-purple-500 to-pink-500',
  },
];

export function WelcomeModal() {
  const { hasSeenWelcome, setHasSeenWelcome, soundEnabled, musicEnabled } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [playMusic, setPlayMusic] = useState(false);

  useEffect(() => {
    // Show welcome modal after a short delay if not seen before
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        if (musicEnabled) {
          audioService.playWelcomeMusic();
          setPlayMusic(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome, musicEnabled]);

  const handleClose = () => {
    setIsOpen(false);
    setHasSeenWelcome(true);
    audioService.stopWelcomeMusic();
    if (soundEnabled) audioService.playClick();
  };

  const handleNext = () => {
    if (soundEnabled) audioService.playClick();
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    if (soundEnabled) audioService.playClick();
    handleClose();
  };

  const toggleWelcomeMusic = () => {
    if (playMusic) {
      audioService.stopWelcomeMusic();
      setPlayMusic(false);
    } else {
      audioService.playWelcomeMusic();
      setPlayMusic(true);
    }
  };

  const currentStepData = welcomeSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Progress Bar */}
        <div className="flex h-1">
          {welcomeSteps.map((_, index) => (
            <div
              key={index}
              className={`flex-1 transition-all duration-300 ${
                index <= currentStep ? 'bg-gradient-to-r from-blue-600 to-orange-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Header with close and music toggle */}
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-gray-500">
            Langkah {currentStep + 1} dari {welcomeSteps.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleWelcomeMusic}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {playMusic ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          {/* Animated Icon */}
          <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${currentStepData.color} flex items-center justify-center shadow-lg animate-bounce`}>
            <Icon className="h-12 w-12 text-white" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{currentStepData.title}</DialogTitle>
          </DialogHeader>

          <p className="text-gray-600 mt-4 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep > 0 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (soundEnabled) audioService.playClick();
                  setCurrentStep(currentStep - 1);
                }}
              >
                Kembali
              </Button>
            )}
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
              onClick={handleNext}
            >
              {currentStep === welcomeSteps.length - 1 ? 'Mulai' : 'Lanjut'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Skip Link */}
          {currentStep < welcomeSteps.length - 1 && (
            <button
              onClick={handleSkip}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Lewati tutorial
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
