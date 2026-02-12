import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Chrome, Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Facebook icon component (not available in lucide-react)
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function AuthSection() {
  const { signInWithGoogle, signInWithGitHub, signInWithFacebook, signInWithEmail, registerWithEmail, isLoading } = useAuth();
  const { isDarkMode } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan Google');
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setError(null);
      await signInWithGitHub();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan GitHub');
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setError(null);
      await signInWithFacebook();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan Facebook');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await signInWithEmail(loginEmail, loginPassword);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Email atau password salah');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Anda harus menyetujui syarat dan ketentuan');
      return;
    }
    try {
      setError(null);
      await registerWithEmail(regEmail, regPassword, regName, regPhone);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar');
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 transition-colors duration-300",
      isDarkMode 
        ? "bg-gray-900" 
        : "bg-gradient-to-br from-blue-50 to-orange-50"
    )}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-3xl font-bold">L</span>
          </div>
          <h1 className={cn(
            "text-2xl font-bold transition-colors duration-300",
            isDarkMode ? "text-white" : "text-gray-800"
          )}>Selamat Datang</h1>
          <p className={cn(
            "mt-1 transition-colors duration-300",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>Masuk untuk melanjutkan</p>
        </div>

        <Card className={cn(
          "shadow-xl transition-colors duration-300 border-0",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={cn(
                "grid w-full grid-cols-2 mb-6",
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              )}>
                <TabsTrigger 
                  value="login"
                  className={cn(
                    isDarkMode && "data-[state=active]:bg-gray-600 data-[state=active]:text-white"
                  )}
                >Masuk</TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className={cn(
                    isDarkMode && "data-[state=active]:bg-gray-600 data-[state=active]:text-white"
                  )}
                >Daftar</TabsTrigger>
              </TabsList>

              {error && (
                <div className={cn(
                  "mb-4 p-3 text-sm rounded-lg border",
                  isDarkMode 
                    ? "bg-red-900/30 text-red-400 border-red-800" 
                    : "bg-red-50 text-red-600 border-red-200"
                )}>
                  {error}
                </div>
              )}

              {/* OAuth Sign In Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full transition-colors",
                    isDarkMode && "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  )}
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  title="Google"
                >
                  <Chrome className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full hover:bg-gray-900 hover:text-white"
                  onClick={handleGitHubSignIn}
                  disabled={isLoading}
                  title="GitHub"
                >
                  <Github className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-[#1877F2] text-white border-[#1877F2] hover:bg-[#166fe5] hover:border-[#166fe5]"
                  onClick={handleFacebookSignIn}
                  disabled={isLoading}
                  title="Facebook"
                >
                  <FacebookIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className={cn(
                    "w-full border-t",
                    isDarkMode ? "border-gray-600" : "border-gray-200"
                  )} />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={cn(
                    "px-2 transition-colors duration-300",
                    isDarkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"
                  )}>atau</span>
                </div>
              </div>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className={cn(
                      isDarkMode && "text-gray-200"
                    )}>Email</Label>
                    <div className="relative">
                      <Mail className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="email@anda.com"
                        className={cn(
                          "pl-10 transition-colors",
                          isDarkMode && "bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        )}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className={cn(
                      isDarkMode && "text-gray-200"
                    )}>Password</Label>
                    <div className="relative">
                      <Lock className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={cn(
                          "pl-10 pr-10 transition-colors",
                          isDarkMode && "bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        )}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2",
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        )}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>
                        Masuk
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className={cn(
                      isDarkMode && "text-gray-200"
                    )}>Nama Lengkap</Label>
                    <div className="relative">
                      <User className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Nama lengkap Anda"
                        className={cn(
                          "pl-10 transition-colors",
                          isDarkMode && "bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        )}
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className={cn(
                      isDarkMode && "text-gray-200"
                    )}>Email</Label>
                    <div className="relative">
                      <Mail className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="email@anda.com"
                        className={cn(
                          "pl-10 transition-colors",
                          isDarkMode && "bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        )}
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className={cn(
                      isDarkMode && "text-gray-200"
                    )}>Password</Label>
                    <div className="relative">
                      <Lock className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimal 8 karakter"
                        className={cn(
                          "pl-10 pr-10 transition-colors",
                          isDarkMode && "bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        )}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2",
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        )}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-phone" className={cn(
                      isDarkMode && "text-gray-200"
                    )}>Nomor Telepon (Opsional)</Label>
                    <div className="relative">
                      <Phone className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder="+62 8xx-xxxx-xxxx"
                        className={cn(
                          "pl-10 transition-colors",
                          isDarkMode && "bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        )}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="agree-terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="agree-terms" className={cn(
                      "text-sm",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      Saya menyetujui{' '}
                      <a href="#" className="text-blue-600 hover:underline">Syarat dan Ketentuan</a>
                      {' '}serta{' '}
                      <a href="#" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>
                        Daftar
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Guest Access */}
        <p className={cn(
          "text-center mt-6 text-sm transition-colors duration-300",
          isDarkMode ? "text-gray-400" : "text-gray-600"
        )}>
          Atau{' '}
          <Link to="/" className="text-blue-600 hover:underline font-medium">
            lanjutkan sebagai tamu
          </Link>
        </p>
      </div>
    </div>
  );
}
