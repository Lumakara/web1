import { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Chrome, 
  ArrowRight,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { isFirebaseConfigured } from '@/lib/firebase';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  },
  exit: { opacity: 0, y: 20 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
  }
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

export function AuthSection() {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    registerWithEmail, 
    isLoading 
  } = useAuth();
  
  const { isDarkMode } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [direction, setDirection] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check password strength
  useEffect(() => {
    const password = registerForm.password;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [registerForm.password]);

  const switchTab = (tab: 'login' | 'register') => {
    setDirection(tab === 'login' ? -1 : 1);
    setActiveTab(tab);
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      console.error('Google sign in error:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setError('Email dan password wajib diisi');
      return;
    }
    try {
      setError(null);
      await signInWithEmail(loginForm.email, loginForm.password);
      navigate('/');
    } catch (err) {
      // Error handled by useAuth toast
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setError('Semua field wajib diisi');
      return;
    }
    if (registerForm.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }
    if (!agreeTerms) {
      setError('Anda harus menyetujui syarat dan ketentuan');
      return;
    }

    try {
      setError(null);
      await registerWithEmail(registerForm.email, registerForm.password, registerForm.name);
      navigate('/');
    } catch (err) {
      // Error handled by useAuth toast
    }
  };

  const firebaseReady = isFirebaseConfigured();

  if (!mounted) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-orange-50"
      )}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  // Config not ready state
  if (!firebaseReady) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center p-4",
        isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-orange-50"
      )}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className={cn(
            "shadow-2xl border-0 overflow-hidden",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}>
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center"
              >
                <Shield className="w-10 h-10 text-yellow-600" />
              </motion.div>
              <h2 className={cn(
                "text-2xl font-bold mb-3",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                Konfigurasi Diperlukan
              </h2>
              <p className={cn(
                "mb-6",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Firebase Auth belum dikonfigurasi. Silakan tambahkan konfigurasi di file .env
              </p>
              <div className={cn(
                "p-4 rounded-xl text-left text-sm font-mono mb-6 overflow-x-auto",
                isDarkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-700"
              )}>
                <p className="text-red-500 mb-2"># Tambahkan di .env:</p>
                <p>VITE_FIREBASE_API_KEY=xxx</p>
                <p>VITE_FIREBASE_AUTH_DOMAIN=xxx</p>
                <p>VITE_FIREBASE_PROJECT_ID=xxx</p>
              </div>
              <Link to="/">
                <Button className="w-full" size="lg">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Lemah';
    if (passwordStrength <= 3) return 'Sedang';
    if (passwordStrength <= 4) return 'Kuat';
    return 'Sangat Kuat';
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col lg:flex-row overflow-hidden",
      isDarkMode ? "bg-gray-950" : "bg-white"
    )}>
      {/* Left Side - Hero Image/Illustration */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className={cn(
          "hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden",
          "items-center justify-center"
        )}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500">
          {/* Floating shapes */}
          <motion.div
            animate={{ 
              x: [0, 100, 0], 
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, -80, 0], 
              y: [0, 100, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-white text-center px-12">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl xl:text-6xl font-bold mb-6 leading-tight"
          >
            Layanan Digital
            <br />
            <span className="text-white/80">Profesional</span>
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-white/70 max-w-lg mx-auto"
          >
            Solusi lengkap untuk kebutuhan teknologi Anda. VPS, WiFi, CCTV, dan layanan kreatif lainnya.
          </motion.p>

          {/* Feature list */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-4"
          >
            {['VPS Hosting', 'WiFi Installasi', 'CCTV Security', 'Code Repair'].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Auth Form */}
      <div className={cn(
        "flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20",
        isDarkMode ? "bg-gray-950" : "bg-white"
      )}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Logo */}
          <motion.div variants={itemVariants} className="lg:hidden text-center mb-8">
            <div className={cn(
              "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4",
              "bg-gradient-to-br from-blue-600 to-orange-500"
            )}>
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className={cn(
              "text-2xl font-bold",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              Selamat Datang
            </h1>
            <p className={cn(
              "mt-1",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              Masuk untuk melanjutkan
            </p>
          </motion.div>

          {/* Desktop Header */}
          <motion.div variants={itemVariants} className="hidden lg:block mb-8">
            <h2 className={cn(
              "text-3xl font-bold",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              {activeTab === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'}
            </h2>
            <p className={cn(
              "mt-2",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              {activeTab === 'login' 
                ? 'Masuk untuk mengakses pesanan dan profil Anda' 
                : 'Daftar untuk mulai menggunakan layanan kami'}
            </p>
          </motion.div>

          {/* Tab Switcher */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className={cn(
              "flex p-1 rounded-xl",
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                    activeTab === tab
                      ? isDarkMode
                        ? "bg-gray-700 text-white shadow-lg"
                        : "bg-white text-gray-900 shadow-md"
                      : isDarkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {tab === 'login' ? 'Masuk' : 'Daftar'}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className={cn(
                  "mb-4 p-4 rounded-xl flex items-center gap-3",
                  isDarkMode 
                    ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                    : "bg-red-50 text-red-600 border border-red-200"
                )}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign In */}
          <motion.div variants={itemVariants}>
            <Button
              variant="outline"
              className={cn(
                "w-full mb-4 h-12 rounded-xl font-medium transition-all",
                isDarkMode 
                  ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700" 
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Chrome className="w-5 h-5 mr-3" />
                  Lanjutkan dengan Google
                </>
              )}
            </Button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={cn(
                "w-full border-t",
                isDarkMode ? "border-gray-800" : "border-gray-200"
              )} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={cn(
                "px-4 uppercase tracking-wider",
                isDarkMode ? "bg-gray-950 text-gray-500" : "bg-white text-gray-400"
              )}>
                Atau dengan email
              </span>
            </div>
          </motion.div>

          {/* Form Content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        type="email"
                        placeholder="nama@email.com"
                        className={cn(
                          "h-12 pl-12 rounded-xl transition-all",
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500" 
                            : "bg-gray-50 border-gray-200 focus:border-blue-500"
                        )}
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                        Password
                      </Label>
                      <Link 
                        to="#" 
                        className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        Lupa password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={cn(
                          "h-12 pl-12 pr-12 rounded-xl transition-all",
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500" 
                            : "bg-gray-50 border-gray-200 focus:border-blue-500"
                        )}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          "absolute right-4 top-1/2 -translate-y-1/2 transition-colors",
                          isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                        )}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-medium shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Masuk
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                      Nama Lengkap
                    </Label>
                    <div className="relative">
                      <User className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        type="text"
                        placeholder="John Doe"
                        className={cn(
                          "h-12 pl-12 rounded-xl transition-all",
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500" 
                            : "bg-gray-50 border-gray-200 focus:border-blue-500"
                        )}
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        type="email"
                        placeholder="nama@email.com"
                        className={cn(
                          "h-12 pl-12 rounded-xl transition-all",
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500" 
                            : "bg-gray-50 border-gray-200 focus:border-blue-500"
                        )}
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        className={cn(
                          "h-12 pl-12 pr-12 rounded-xl transition-all",
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500" 
                            : "bg-gray-50 border-gray-200 focus:border-blue-500"
                        )}
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          "absolute right-4 top-1/2 -translate-y-1/2 transition-colors",
                          isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                        )}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength */}
                    {registerForm.password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1"
                      >
                        <div className={cn(
                          "h-1.5 rounded-full overflow-hidden",
                          isDarkMode ? "bg-gray-700" : "bg-gray-200"
                        )}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                            className={cn("h-full rounded-full transition-colors", getPasswordStrengthColor())}
                          />
                        </div>
                        <p className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Kekuatan: <span className={cn(
                            "font-medium",
                            passwordStrength <= 2 ? "text-red-500" : 
                            passwordStrength <= 3 ? "text-yellow-500" : "text-green-500"
                          )}>{getPasswordStrengthText()}</span>
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                      Konfirmasi Password
                    </Label>
                    <div className="relative">
                      <Lock className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Ulangi password"
                        className={cn(
                          "h-12 pl-12 rounded-xl transition-all",
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500" 
                            : "bg-gray-50 border-gray-200 focus:border-blue-500",
                          registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && "border-red-500 focus:border-red-500"
                        )}
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                    {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-red-500"
                      >
                        Password tidak cocok
                      </motion.p>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agree-terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor="agree-terms" 
                      className={cn(
                        "text-sm leading-relaxed",
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Saya menyetujui{' '}
                      <Link to="#" className="text-blue-500 hover:text-blue-600 font-medium">
                        Syarat dan Ketentuan
                      </Link>
                      {' '}serta{' '}
                      <Link to="#" className="text-blue-500 hover:text-blue-600 font-medium">
                        Kebijakan Privasi
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-medium shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Buat Akun
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Guest Access */}
          <motion.p 
            variants={itemVariants}
            className={cn(
              "text-center mt-8 text-sm",
              isDarkMode ? "text-gray-500" : "text-gray-500"
            )}
          >
            Atau{' '}
            <Link 
              to="/" 
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
            >
              lanjutkan sebagai tamu
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthSection;
