import { useState, useCallback } from 'react';
import { Music, Moon, Volume2, Play, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type AnimationType, type EffectType } from '@/store/appStore';
import { audioService } from '@/lib/audio';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SettingItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  isDarkMode: boolean;
  delay?: number;
}

const SettingItem = ({ icon: Icon, title, description, children, isDarkMode, delay = 0 }: SettingItemProps) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-200',
        isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5',
        isPressed && 'scale-[0.98]'
      )}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {/* Icon Container */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
          isDarkMode
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10'
            : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-black/5'
        )}
      >
        <Icon className={cn(
          'w-5 h-5',
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        )} />
      </motion.div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          'text-sm font-semibold tracking-tight',
          isDarkMode ? 'text-white' : 'text-gray-900'
        )}>
          {title}
        </h3>
        <p className={cn(
          'text-xs mt-0.5 leading-relaxed',
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        )}>
          {description}
        </p>
      </div>

      {/* Control */}
      <div className="flex-shrink-0">
        {children}
      </div>
    </motion.div>
  );
};

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
  soundEnabled: boolean;
}

const SegmentedControl = ({ options, value, onChange, isDarkMode, soundEnabled }: SegmentedControlProps) => {
  return (
    <div className={cn(
      'relative flex p-1 rounded-xl',
      isDarkMode ? 'bg-white/10' : 'bg-gray-100'
    )}>
      <AnimatePresence mode="popLayout">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <motion.button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                if (soundEnabled) {
                  audioService.playClick(soundEnabled);
                }
              }}
              className={cn(
                'relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 z-10',
                isActive
                  ? isDarkMode
                    ? 'text-white'
                    : 'text-gray-900'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              )}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="segmented-active"
                  className={cn(
                    'absolute inset-0 rounded-lg shadow-sm',
                    isDarkMode
                      ? 'bg-gradient-to-b from-white/20 to-white/10 border border-white/20'
                      : 'bg-white border border-black/5'
                  )}
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export function SettingsTab() {
  const {
    isDarkMode,
    toggleDarkMode,
    musicEnabled,
    toggleMusic,
    soundEnabled,
    toggleSound,
    animationLevel,
    setAnimationLevel,
    effectLevel,
    setEffectLevel,
  } = useAppStore();

  const [animatingItems, setAnimatingItems] = useState<Record<string, boolean>>({});

  const triggerAnimation = useCallback((key: string) => {
    setAnimatingItems((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAnimatingItems((prev) => ({ ...prev, [key]: false }));
    }, 300);
  }, []);

  const handleToggle = useCallback((toggleFn: () => void, key: string) => {
    toggleFn();
    triggerAnimation(key);
    if (soundEnabled) {
      audioService.playToggle(soundEnabled);
    }
  }, [soundEnabled, triggerAnimation]);

  const handleAnimationChange = useCallback((value: string) => {
    setAnimationLevel(value as AnimationType);
    if (soundEnabled) {
      audioService.playClick(soundEnabled);
    }
  }, [setAnimationLevel, soundEnabled]);

  const handleEffectChange = useCallback((value: string) => {
    setEffectLevel(value as EffectType);
    if (soundEnabled) {
      audioService.playClick(soundEnabled);
    }
  }, [setEffectLevel, soundEnabled]);

  const animationOptions = [
    { value: 'off', label: 'Mati' },
    { value: 'v1', label: 'V1' },
    { value: 'v2', label: 'V2' },
    { value: 'v3', label: 'V3' },
  ];

  const effectOptions = [
    { value: 'off', label: 'Mati' },
    { value: 'v1', label: 'V1' },
    { value: 'v2', label: 'V2' },
    { value: 'v3', label: 'V3' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-2xl mx-auto p-4 space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className={cn(
          'text-2xl font-bold tracking-tight mb-2',
          isDarkMode ? 'text-white' : 'text-gray-900'
        )}>
          Pengaturan
        </h1>
        <p className={cn(
          'text-sm',
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        )}>
          Sesuaikan pengalaman aplikasi sesuai preferensi Anda
        </p>
      </motion.div>

      {/* Audio Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className={cn(
          'overflow-hidden border-0 shadow-lg backdrop-blur-xl',
          isDarkMode
            ? 'bg-gray-900/80 border border-white/10'
            : 'bg-white/80 border border-black/5'
        )}>
          <CardHeader className="pb-2">
            <CardTitle className={cn(
              'text-base font-semibold',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}>
              Audio & Suara
            </CardTitle>
            <CardDescription className={cn(
              'text-xs',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              Kelola pengaturan musik dan efek suara
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingItem
              icon={Music}
              title="Musik Background"
              description="Putar musik latar saat menggunakan aplikasi"
              isDarkMode={isDarkMode}
              delay={0.15}
            >
              <motion.div
                animate={animatingItems.music ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Switch
                  checked={musicEnabled}
                  onCheckedChange={() => handleToggle(toggleMusic, 'music')}
                  className={cn(
                    musicEnabled && 'data-[state=checked]:bg-blue-500'
                  )}
                />
              </motion.div>
            </SettingItem>

            <div className={cn(
              'h-px mx-4',
              isDarkMode ? 'bg-white/10' : 'bg-black/5'
            )} />

            <SettingItem
              icon={Volume2}
              title="Effect Suara"
              description="Aktifkan efek suara pada interaksi tombol"
              isDarkMode={isDarkMode}
              delay={0.2}
            >
              <motion.div
                animate={animatingItems.sound ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={() => handleToggle(toggleSound, 'sound')}
                  className={cn(
                    soundEnabled && 'data-[state=checked]:bg-blue-500'
                  )}
                />
              </motion.div>
            </SettingItem>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <Card className={cn(
          'overflow-hidden border-0 shadow-lg backdrop-blur-xl',
          isDarkMode
            ? 'bg-gray-900/80 border border-white/10'
            : 'bg-white/80 border border-black/5'
        )}>
          <CardHeader className="pb-2">
            <CardTitle className={cn(
              'text-base font-semibold',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}>
              Tampilan
            </CardTitle>
            <CardDescription className={cn(
              'text-xs',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              Sesuaikan tema dan mode tampilan aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingItem
              icon={Moon}
              title="Mode Gelap"
              description="Gunakan tema gelap untuk kenyamanan mata"
              isDarkMode={isDarkMode}
              delay={0.3}
            >
              <motion.div
                animate={animatingItems.darkMode ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={() => handleToggle(toggleDarkMode, 'darkMode')}
                  className={cn(
                    isDarkMode && 'data-[state=checked]:bg-purple-500'
                  )}
                />
              </motion.div>
            </SettingItem>
          </CardContent>
        </Card>
      </motion.div>

      {/* Animation & Effects Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <Card className={cn(
          'overflow-hidden border-0 shadow-lg backdrop-blur-xl',
          isDarkMode
            ? 'bg-gray-900/80 border border-white/10'
            : 'bg-white/80 border border-black/5'
        )}>
          <CardHeader className="pb-2">
            <CardTitle className={cn(
              'text-base font-semibold',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}>
              Animasi & Effect
            </CardTitle>
            <CardDescription className={cn(
              'text-xs',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              Pilih level animasi dan efek visual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingItem
              icon={Play}
              title="Animasi"
              description="Tingkat kehalusan animasi transisi"
              isDarkMode={isDarkMode}
              delay={0.4}
            >
              <SegmentedControl
                options={animationOptions}
                value={animationLevel}
                onChange={handleAnimationChange}
                isDarkMode={isDarkMode}
                soundEnabled={soundEnabled}
              />
            </SettingItem>

            <div className={cn(
              'h-px mx-4',
              isDarkMode ? 'bg-white/10' : 'bg-black/5'
            )} />

            <SettingItem
              icon={Sparkles}
              title="Effect"
              description="Intensitas efek visual dan partikel"
              isDarkMode={isDarkMode}
              delay={0.45}
            >
              <SegmentedControl
                options={effectOptions}
                value={effectLevel}
                onChange={handleEffectChange}
                isDarkMode={isDarkMode}
                soundEnabled={soundEnabled}
              />
            </SettingItem>
          </CardContent>
        </Card>
      </motion.div>

      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-center pt-4"
      >
        <p className={cn(
          'text-xs',
          isDarkMode ? 'text-gray-500' : 'text-gray-400'
        )}>
          Versi 1.0.0 • Layanan Digital
        </p>
      </motion.div>
    </motion.div>
  );
}

export default SettingsTab;
